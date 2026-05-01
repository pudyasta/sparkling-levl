package com.example.sparkling.go.modules
import android.content.Context
import android.net.Uri
import android.util.Log
import com.lynx.tasm.behavior.LynxContext
import com.tiktok.sparkling.method.registry.core.BridgePlatformType
import com.tiktok.sparkling.method.registry.core.IDLBridgeMethod
import com.tiktok.sparkling.method.registry.core.model.idl.CompletionBlock
import com.tiktok.sparkling.method.registry.core.utils.createXModel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.InputStreamReader
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.UUID

class NativeFileUploader : AbsUploadFileMethodIDL() {

    companion object {
        private const val TAG = "NativeFileUploader"
        private const val BUFFER_SIZE = 8192
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    override fun handle(
        params: UploadFileInputModel,
        callback: CompletionBlock<UploadFileResultModel>,
        type: BridgePlatformType
    ) {
        val context = getSDKContext()?.context
            ?: return callback.onFailure(IDLBridgeMethod.FAIL, "Context null")

        // Validate based on what's present
        val hasText = !params.answerText.isNullOrBlank()
        val hasFiles = !params.files.isNullOrEmpty()

        if (!hasText && !hasFiles) {
            return callback.onFailure(IDLBridgeMethod.FAIL, "At least answerText or files must be provided")
        }

        scope.launch {
            runCatching {
                val response = uploadMultipart(
                    context = context,
                    files = params.files ?: emptyList(),
                    uploadUrl = params.url,
                    answerText = params.answerText ?: "",
                    extraHeaders = params.headers ?: emptyMap()
                )
                val result = UploadFileResultModel::class.java.createXModel().apply {
                    responseBody = response
                }
                callback.onSuccess(result)
            }.onFailure { e ->
                Log.e(TAG, "Upload failed", e)
                callback.onFailure(IDLBridgeMethod.FAIL, e.message ?: "Unknown error")
            }
        }
    }

    private fun uploadMultipart(
        context: Context,
        files: List<AbsUploadFileMethodIDL.BridgeBeanUploadFile>,
        uploadUrl: String,
        answerText: String,
        extraHeaders: Map<String, String>
    ): String {
        val boundary = "----FormBoundary${UUID.randomUUID().toString().replace("-", "")}"
        val lineEnd = "\r\n"

        val connection = (URL(uploadUrl).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            doOutput = true
            doInput = true
            useCaches = false
            setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            setRequestProperty("Accept", "application/json")
            extraHeaders.forEach { (k, v) -> setRequestProperty(k, v) }
            setChunkedStreamingMode(BUFFER_SIZE)
        }

        connection.outputStream.buffered(BUFFER_SIZE).use { out ->

            // 1. answer_text text field
            out.writeText("--$boundary$lineEnd")
            out.writeText("Content-Disposition: form-data; name=\"answer_text\"$lineEnd")
            out.writeText(lineEnd)
            out.writeText(answerText)
            out.writeText(lineEnd)

            // 2. files[] — one part per file, all using the same key "files[]"
            files.forEachIndexed { index, file ->
                val uri = Uri.parse(file.uri)
                val totalBytes = resolveSize(context, uri)

                out.writeText("--$boundary$lineEnd")
                out.writeText(
                    "Content-Disposition: form-data; " +
                        "name=\"files[]\"; " +
                        "filename=\"${file.name}\"$lineEnd"
                )
                out.writeText("Content-Type: ${file.mimeType}$lineEnd")
                out.writeText(lineEnd)

                context.contentResolver.openInputStream(uri)?.use { input ->
                    val buffer = ByteArray(BUFFER_SIZE)
                    var bytesSent = 0L
                    var read: Int
                    while (input.read(buffer).also { read = it } != -1) {
                        out.write(buffer, 0, read)
                        bytesSent += read
                    }
                } ?: throw IllegalStateException("Cannot open stream for URI: ${file.uri}")

                out.writeText(lineEnd)
            }

            out.writeText("--$boundary--$lineEnd")
            out.flush()
        }

        val responseCode = connection.responseCode
        val stream = if (responseCode in 200..299) connection.inputStream else connection.errorStream
        val body = stream.bufferedReader().use(BufferedReader::readText)
        connection.disconnect()

        if (responseCode !in 200..299) {
            throw IllegalStateException("HTTP $responseCode: $body")
        }

        return body
    }

    private fun resolveSize(context: Context, uri: Uri): Long {
        return context.contentResolver.query(
            uri, arrayOf(android.provider.OpenableColumns.SIZE),
            null, null, null
        )?.use { cursor ->
            if (cursor.moveToFirst())
                cursor.getLong(cursor.getColumnIndexOrThrow(android.provider.OpenableColumns.SIZE))
            else 0L
        } ?: 0L
    }

    // Extension to write strings without creating intermediate byte arrays constantly
    private fun OutputStream.writeText(text: String) = write(text.toByteArray(Charsets.UTF_8))

//    override fun on() {
//        scope.cancel()
//        super.onDestroy()
//    }
}
