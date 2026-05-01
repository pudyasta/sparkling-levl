package com.example.sparkling.go.modules

import com.tiktok.sparkling.method.registry.core.BridgePlatformType
import com.tiktok.sparkling.method.registry.core.model.idl.CompletionBlock
import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContract
import androidx.activity.result.contract.ActivityResultContracts
import com.example.sparkling.go.SplashActivity
import com.lynx.tasm.behavior.LynxContext
import com.tiktok.sparkling.SparklingActivity
import com.tiktok.sparkling.method.media.utils.MediaProvider
import com.tiktok.sparkling.method.registry.core.IDLBridgeMethod
import com.tiktok.sparkling.method.registry.core.utils.IDLMethodHelper
import com.tiktok.sparkling.method.registry.core.utils.createXModel
import org.json.JSONObject

class NativeFilePicker : AbsPickFileMethodIDL() {

    companion object {
        private const val TAG = "NativeFilePicker"
    }

    private var launcher: ActivityResultLauncher<Array<String>>? = null
    private var pendingCallback: CompletionBlock<PickFileResultModel>? = null

    override fun handle(
        params: PickFileInputModel,
        callback: CompletionBlock<PickFileResultModel>,
        type: BridgePlatformType
    ) {
        val context = getSDKContext()?.context
            ?: return callback.onFailure(IDLBridgeMethod.FAIL, "Context null")

        val activity = IDLMethodHelper.getActivity(context) as? SparklingActivity
            ?: return callback.onFailure(IDLBridgeMethod.FAIL, "Activity is not AppCompatActivity")

        // Clean up any previous pending callback
        pendingCallback?.onFailure(IDLBridgeMethod.FAIL, "Superseded by new request")
        pendingCallback = callback

        // Register the launcher fresh each time against the live activity
        launcher = activity.activityResultRegistry.register(
            "NativeFilePicker_pick",
            ActivityResultContracts.OpenMultipleDocuments()
        ) { uris: List<Uri> ->
            handleResult(uris)
        }

        val mimeTypes = params.type.toTypedArray().ifEmpty { arrayOf("*/*") }
        launcher?.launch(mimeTypes)
    }

    private fun handleResult(uris: List<Uri>) {
        val cb = pendingCallback ?: return
        pendingCallback = null
        launcher = null

        if (uris.isEmpty()) {
            cb.onFailure(IDLBridgeMethod.FAIL, "User cancelled")
            return
        }

        val context = getSDKContext()?.context
            ?: return cb.onFailure(IDLBridgeMethod.FAIL, "Context null")

        val fileBeans = uris.mapNotNull { uri ->
            runCatching {
                val (name, mimeType, size) = queryFileMetadata(context, uri)
                Log.d(TAG, "Picked: name=$name, type=$mimeType, size=$size bytes")

                BridgeBeanFileDetails::class.java.createXModel().apply {
                    tempFilePath = uri.toString()
                    this.name = name
                    this.size = size
                }
            }.onFailure {
                Log.e(TAG, "Failed to query metadata for $uri", it)
            }.getOrNull()
        }

        if (fileBeans.isEmpty()) {
            cb.onFailure(IDLBridgeMethod.FAIL, "Failed to read any selected file")
            return
        }

        val result = PickFileResultModel::class.java.createXModel().apply {
            tempFiles = fileBeans
        }

        cb.onSuccess(result)
    }

    private data class FileMetadata(val name: String, val mimeType: String, val size: Long)

    private fun queryFileMetadata(context: Context, uri: Uri): FileMetadata {
        var name = "unknown"
        var mimeType = "*/*"
        var size = 0L

        context.contentResolver.query(
            uri,
            arrayOf(
                OpenableColumns.DISPLAY_NAME,
                OpenableColumns.SIZE,
            ),
            null,
            null,
            null
        )?.use { cursor ->
            if (cursor.moveToFirst()) {
                name = cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME))
                size = cursor.getLong(cursor.getColumnIndexOrThrow(OpenableColumns.SIZE))
            }
        }

        // getType is more reliable than the MIME column for typed URIs
        mimeType = context.contentResolver.getType(uri) ?: "*/*"

        return FileMetadata(name, mimeType, size)
    }
}
