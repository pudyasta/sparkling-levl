//// Copyright (c) 2025 TikTok Pte. Ltd.
//// Licensed under the Apache License Version 2.0 that can be found in the
//// LICENSE file in the root directory of this source tree.
//package com.example.sparkling.go
//
//import android.content.Context
//import android.util.Log
//import com.lynx.tasm.provider.AbsTemplateProvider
//import java.io.ByteArrayOutputStream
//import java.io.IOException
//import java.net.HttpURLConnection
//import java.net.URL
//
//class BuiltinTemplateProvider(context: Context) : AbsTemplateProvider() {
//
//    private var mContext: Context = context.applicationContext
//
//    override fun loadTemplate(uri: String, callback: Callback) {
//        Log.d(TAG, "loadTemplate called with uri=$uri")
//        Thread {
//            try {
//                if (uri.startsWith("http://") || uri.startsWith("https://")) {
//                    loadRemote(uri, callback)
//                } else {
//                    loadAsset(uri, callback)
//                }
//            } catch (e: IOException) {
//                Log.e(TAG, "loadTemplate IOException: ${e.message}")
//                callback.onFailed(e.message)
//            }
//        }.start()
//    }
//
//    private fun loadAsset(uri: String, callback: Callback) {
//        Log.d(TAG, "loadAsset: $uri")
//        try {
//            mContext.assets.open(uri).use { inputStream ->
//                callback.onSuccess(inputStream.readBytes())
//            }
//        } catch (e: IOException) {
//            // Not in local assets — fetch from remote
//            val remoteUrl = "$REMOTE_BASE_URL/$uri"
//            Log.d(TAG, "Asset not found locally, falling back to remote: $remoteUrl")
//            loadRemote(uri, callback)
//        }
//    }
//
//    private fun loadRemote(uri: String, callback: Callback) {
//        Log.d(TAG, "loadRemote: $uri")
//        val connection = URL(uri).openConnection() as HttpURLConnection
//        connection.connectTimeout = 15_000
//        connection.readTimeout = 15_000
//        try {
//            connection.connect()
//            val code = connection.responseCode
//            Log.d(TAG, "loadRemote response: HTTP $code for $uri")
//            if (code == HttpURLConnection.HTTP_OK) {
//                ByteArrayOutputStream().use { out ->
//                    connection.inputStream.use { it.copyTo(out) }
//                    Log.d(TAG, "loadRemote success: ${out.size()} bytes")
//                    callback.onSuccess(out.toByteArray())
//                }
//            } else {
//                Log.e(TAG, "loadRemote failed: HTTP $code")
//                callback.onFailed("HTTP $code loading $uri")
//            }
//        } finally {
//            connection.disconnect()
//        }
//    }
//
//    companion object {
//        private const val TAG = "BuiltinTemplateProvider"
//        private const val REMOTE_BASE_URL = "https://ta-trpl.web.app"
//    }
//}
// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.example.sparkling.go

import android.content.Context
import com.lynx.tasm.provider.AbsTemplateProvider
import java.io.ByteArrayOutputStream
import java.io.IOException

class BuiltinTemplateProvider(context: Context) : AbsTemplateProvider() {

    private var mContext: Context = context.applicationContext

    override fun loadTemplate(uri: String, callback: Callback) {
        Thread {
            try {
                mContext.assets.open(uri).use { inputStream ->
                    ByteArrayOutputStream().use { byteArrayOutputStream ->
                        val buffer = ByteArray(1024)
                        var length: Int
                        while ((inputStream.read(buffer).also { length = it }) != -1) {
                            byteArrayOutputStream.write(buffer, 0, length)
                        }
                        callback.onSuccess(byteArrayOutputStream.toByteArray())
                    }
                }
            } catch (e: IOException) {
                callback.onFailed(e.message)
            }
        }.start()
    }
}
