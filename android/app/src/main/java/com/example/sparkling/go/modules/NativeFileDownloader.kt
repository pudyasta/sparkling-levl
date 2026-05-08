package com.example.sparkling.go.modules


import android.content.ContentValues
import android.content.Context
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import com.tiktok.sparkling.method.registry.core.BridgePlatformType
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodName
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodParamField
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodParamModel
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodResultModel
import com.tiktok.sparkling.method.registry.core.base.AbsSparklingIDLMethod
import com.tiktok.sparkling.method.registry.core.model.idl.CompletionBlock
import com.tiktok.sparkling.method.registry.core.model.idl.IDLMethodBaseParamModel
import com.tiktok.sparkling.method.registry.core.model.idl.IDLMethodBaseResultModel
import com.tiktok.sparkling.method.registry.core.utils.IDLMethodHelper
import com.tiktok.sparkling.method.registry.core.utils.createXModel
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import kotlin.concurrent.thread

// ─── IDL ──────────────────────────────────────────────────────────────────────

abstract class AbsFileDownloaderMethodIDL : AbsSparklingIDLMethod<
    AbsFileDownloaderMethodIDL.FileDownloadInputModel,
    AbsFileDownloaderMethodIDL.FileDownloadResultModel
    >() {

    @IDLMethodName(
        name = "file.download",
        params = ["url", "filename"],
        results = ["success", "localPath", "error"]
    )
    final override val name: String = "file.download"

    @IDLMethodParamModel
    interface FileDownloadInputModel : IDLMethodBaseParamModel {
        @get:IDLMethodParamField(required = true, isGetter = true, keyPath = "url")
        val url: String

        @get:IDLMethodParamField(required = false, isGetter = true, keyPath = "filename")
        val filename: String?
    }

    @IDLMethodResultModel
    interface FileDownloadResultModel : IDLMethodBaseResultModel {
        @get:IDLMethodParamField(required = true, isGetter = true, keyPath = "success")
        @set:IDLMethodParamField(required = true, isGetter = false, keyPath = "success")
        var success: Boolean?

        @get:IDLMethodParamField(required = false, isGetter = true, keyPath = "localPath")
        @set:IDLMethodParamField(required = false, isGetter = false, keyPath = "localPath")
        var localPath: String?

        @get:IDLMethodParamField(required = false, isGetter = true, keyPath = "error")
        @set:IDLMethodParamField(required = false, isGetter = false, keyPath = "error")
        var error: String?
    }
}

// ─── Implementation ───────────────────────────────────────────────────────────

class NativeFileDownloader : AbsFileDownloaderMethodIDL() {

    companion object {
        private const val TAG = "NativeFileDownloader"
        private const val BUFFER_SIZE = 8192
    }

    override fun handle(
        params: FileDownloadInputModel,
        callback: CompletionBlock<FileDownloadResultModel>,
        type: BridgePlatformType
    ) {
        val rawUrl = params.url
        val filename = params.filename ?: extractFilename(rawUrl)
        val context = IDLMethodHelper.getActivity(getSDKContext()?.context)?.applicationContext
            ?: return callback.fail("Context not available")

        Log.d(TAG, "Downloading: $rawUrl → $filename")

        thread(name = "file-download-$filename") {
            try {
                val localPath = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    // API 29+ — write via MediaStore, no storage permission needed
                    downloadViaMediaStore(context, rawUrl, filename)
                } else {
                    // API 28 and below — write directly to public Downloads folder
                    downloadLegacy(rawUrl, filename)
                }
                Log.d(TAG, "Saved to: $localPath")
                callback.success(localPath)
            } catch (e: Exception) {
                Log.e(TAG, "Download failed", e)
                callback.fail(e.message ?: "Download failed")
            }
        }
    }

    // ── API 29+ : MediaStore (no WRITE_EXTERNAL_STORAGE needed) ──────────────

    private fun downloadViaMediaStore(context: Context, url: String, filename: String): String {
        val mimeType = resolveMimeType(filename)

        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, filename)
            put(MediaStore.Downloads.MIME_TYPE, mimeType)
            put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
            put(MediaStore.Downloads.IS_PENDING, 1) // lock the row while writing
        }

        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
            ?: throw Exception("MediaStore insert failed")

        try {
            resolver.openOutputStream(uri)?.use { outputStream ->
                streamDownload(url, outputStream)
            } ?: throw Exception("Could not open MediaStore output stream")

            // Mark as complete
            values.clear()
            values.put(MediaStore.Downloads.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
        } catch (e: Exception) {
            // Clean up the pending row on failure
            resolver.delete(uri, null, null)
            throw e
        }

        // Return the content URI string — FileOpenMethod will handle it
        return uri.toString()
    }

    // ── API 28 and below : direct file write ──────────────────────────────────

    private fun downloadLegacy(url: String, filename: String): String {
        val dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
        if (!dir.exists()) dir.mkdirs()
        val dest = File(dir, filename)
        FileOutputStream(dest).use { streamDownload(url, it) }
        return dest.absolutePath
    }

    // ── Shared HTTP stream logic ───────────────────────────────────────────────

    private fun streamDownload(url: String, output: OutputStream) {
        val connection = (URL(url).openConnection() as HttpURLConnection).apply {
            requestMethod = "GET"
            connectTimeout = 15_000
            readTimeout = 30_000
            instanceFollowRedirects = true
            connect()
        }

        if (connection.responseCode !in 200..299) {
            throw Exception("HTTP ${connection.responseCode}")
        }

        connection.inputStream.use { input ->
            val buffer = ByteArray(BUFFER_SIZE)
            var bytesRead: Int
            while (input.read(buffer).also { bytesRead = it } != -1) {
                output.write(buffer, 0, bytesRead)
            }
            output.flush()
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun extractFilename(url: String): String =
        url.substringBefore("?").substringAfterLast("/").ifBlank { "download" }

    private fun resolveMimeType(filename: String): String {
        val name = filename.lowercase()
        return when {
            name.endsWith(".xlsx") || name.endsWith(".xls") ->
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            name.endsWith(".docx") || name.endsWith(".doc") ->
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            name.endsWith(".pptx") || name.endsWith(".ppt") ->
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            name.endsWith(".pdf") -> "application/pdf"
            else -> "application/octet-stream"
        }
    }

    // ── Callback helpers ──────────────────────────────────────────────────────

    private fun CompletionBlock<FileDownloadResultModel>.success(localPath: String) {
        val result = FileDownloadResultModel::class.java.createXModel().apply {
            this.success = true
            this.localPath = localPath
            this.error = null
        }
        onSuccess(result)
    }

    private fun CompletionBlock<FileDownloadResultModel>.fail(message: String) {
        val result = FileDownloadResultModel::class.java.createXModel().apply {
            this.success = false
            this.localPath = null
            this.error = message
        }
        onSuccess(result)
    }
}
