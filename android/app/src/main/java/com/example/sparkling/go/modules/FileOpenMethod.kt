package com.example.sparkling.go.modules

import android.content.Intent
import android.net.Uri
import android.util.Log
import androidx.core.content.FileProvider
import com.tiktok.sparkling.SparklingActivity
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

// ─── IDL ──────────────────────────────────────────────────────────────────────

abstract class AbsFileOpenMethodIDL : AbsSparklingIDLMethod<
    AbsFileOpenMethodIDL.FileOpenInputModel,
    AbsFileOpenMethodIDL.FileOpenResultModel
    >() {

    @IDLMethodName(
        name = "file.open",
        params = ["localPath"],
        results = ["success", "error"]
    )
    final override val name: String = "file.open"

    @IDLMethodParamModel
    interface FileOpenInputModel : IDLMethodBaseParamModel {
        /** Either a content:// URI string (API 29+) or an absolute file path (API 28-) */
        @get:IDLMethodParamField(required = true, isGetter = true, keyPath = "localPath")
        val localPath: String
    }

    @IDLMethodResultModel
    interface FileOpenResultModel : IDLMethodBaseResultModel {
        @get:IDLMethodParamField(required = true, isGetter = true, keyPath = "success")
        @set:IDLMethodParamField(required = true, isGetter = false, keyPath = "success")
        var success: Boolean?

        @get:IDLMethodParamField(required = false, isGetter = true, keyPath = "error")
        @set:IDLMethodParamField(required = false, isGetter = false, keyPath = "error")
        var error: String?
    }
}

// ─── Implementation ───────────────────────────────────────────────────────────

class FileOpenMethod : AbsFileOpenMethodIDL() {

    companion object {
        private const val TAG = "FileOpenMethod"
        private const val FILE_PROVIDER_AUTHORITY = "com.example.sparkling.go.fileprovider"
    }

    override fun handle(
        params: FileOpenInputModel,
        callback: CompletionBlock<FileOpenResultModel>,
        type: BridgePlatformType
    ) {
        val activity = IDLMethodHelper.getActivity(getSDKContext()?.context) as? SparklingActivity
            ?: return callback.fail("Activity not available")

        val localPath = params.localPath

        activity.runOnUiThread {
            try {
                val uri: Uri = resolveUri(activity, localPath)
                val mime = resolveMimeType(localPath)

                val intent = Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(uri, mime)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }

                activity.startActivity(Intent.createChooser(intent, "Open with"))
                Log.d(TAG, "Opened $localPath mime=$mime")
                callback.success()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to open file", e)
                callback.fail(e.message ?: "Could not open file")
            }
        }
    }

    /**
     * Resolves the correct Uri for ACTION_VIEW depending on what localPath contains:
     * - "content://..." → already a MediaStore URI, use directly (API 29+)
     * - "/storage/..."  → legacy file path, wrap via FileProvider (API 28-)
     */
    private fun resolveUri(activity: SparklingActivity, localPath: String): Uri {
        return if (localPath.startsWith("content://")) {
            Uri.parse(localPath)
        } else {
            val file = File(localPath)
            if (!file.exists()) throw Exception("File not found: $localPath")
            FileProvider.getUriForFile(activity, FILE_PROVIDER_AUTHORITY, file)
        }
    }

    private fun resolveMimeType(path: String): String {
        val name = path.substringAfterLast("/").substringBefore("?").lowercase()
        return when {
            name.endsWith(".xlsx") || name.endsWith(".xls") ->
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            name.endsWith(".docx") || name.endsWith(".doc") ->
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            name.endsWith(".pptx") || name.endsWith(".ppt") ->
                "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            name.endsWith(".pdf") -> "application/pdf"
            else -> "*/*"
        }
    }

    private fun CompletionBlock<FileOpenResultModel>.success() {
        val result = FileOpenResultModel::class.java.createXModel().apply {
            this.success = true; this.error = null
        }
        onSuccess(result)
    }

    private fun CompletionBlock<FileOpenResultModel>.fail(message: String) {
        val result = FileOpenResultModel::class.java.createXModel().apply {
            this.success = false; this.error = message
        }
        onSuccess(result)
    }
}
