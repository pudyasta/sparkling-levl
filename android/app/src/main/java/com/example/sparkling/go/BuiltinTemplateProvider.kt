// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.example.sparkling.go

import android.content.Context
import android.util.Log
import com.lynx.tasm.provider.AbsTemplateProvider
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.ConcurrentHashMap

class BuiltinTemplateProvider(context: Context) : AbsTemplateProvider() {

    private var mContext: Context = context.applicationContext

    override fun loadTemplate(uri: String, callback: Callback) {
        Log.d(TAG, "loadTemplate called with uri=$uri")
        cache[uri]?.let {
            Log.d(TAG, "loadTemplate cache hit: $uri")
            callback.onSuccess(it)
            return
        }
        Thread {
            try {
                if (uri.startsWith("http://") || uri.startsWith("https://")) {
                    fetchRemote(uri, uri, callback)
                } else {
                    loadAsset(uri, callback)
                }
            } catch (e: IOException) {
                Log.e(TAG, "loadTemplate IOException: ${e.message}")
                callback.onFailed(e.message)
            }
        }.start()
    }

    private fun loadAsset(uri: String, callback: Callback) {
        Log.d(TAG, "loadAsset: $uri")
        try {
            mContext.assets.open(uri).use { inputStream ->
                val bytes = inputStream.readBytes()
                cache[uri] = bytes
                callback.onSuccess(bytes)
            }
        } catch (e: IOException) {
            val remoteUrl = "$REMOTE_BASE_URL/$uri"
            Log.d(TAG, "Asset not found locally, falling back to remote: $remoteUrl")
            fetchRemote(uri, remoteUrl, callback)
        }
    }

    private fun fetchRemote(cacheKey: String, url: String, callback: Callback) {
        Log.d(TAG, "fetchRemote: $url")
        cache[cacheKey]?.let {
            Log.d(TAG, "fetchRemote cache hit: $cacheKey")
            callback.onSuccess(it)
            return
        }
        val connection = URL(url).openConnection() as HttpURLConnection
        connection.connectTimeout = 15_000
        connection.readTimeout = 15_000
        try {
            connection.connect()
            val code = connection.responseCode
            Log.d(TAG, "fetchRemote response: HTTP $code for $url")
            if (code == HttpURLConnection.HTTP_OK) {
                ByteArrayOutputStream().use { out ->
                    connection.inputStream.use { it.copyTo(out) }
                    val bytes = out.toByteArray()
                    Log.d(TAG, "fetchRemote success: ${bytes.size} bytes")
                    cache[cacheKey] = bytes
                    callback.onSuccess(bytes)
                }
            } else {
                Log.e(TAG, "fetchRemote failed: HTTP $code")
                callback.onFailed("HTTP $code loading $url")
            }
        } finally {
            connection.disconnect()
        }
    }

    companion object {
        private const val TAG = "BuiltinTemplateProvider"
        private const val REMOTE_BASE_URL = "https://ta-trpl.web.app"
        internal val cache = ConcurrentHashMap<String, ByteArray>()

        fun preload(context: Context, bundleUri: String, onDone: () -> Unit) {
            if (cache.containsKey(bundleUri)) {
                Log.d(TAG, "preload: already cached: $bundleUri")
                onDone()
                return
            }
            Thread {
                try {
                    context.applicationContext.assets.open(bundleUri).use { stream ->
                        cache[bundleUri] = stream.readBytes()
                        Log.d(TAG, "preload: loaded from assets: $bundleUri")
                    }
                } catch (e: IOException) {
                    try {
                        val remoteUrl = "$REMOTE_BASE_URL/$bundleUri"
                        Log.d(TAG, "preload: fetching remote: $remoteUrl")
                        val conn = URL(remoteUrl).openConnection() as HttpURLConnection
                        conn.connectTimeout = 15_000
                        conn.readTimeout = 15_000
                        conn.connect()
                        if (conn.responseCode == HttpURLConnection.HTTP_OK) {
                            ByteArrayOutputStream().use { out ->
                                conn.inputStream.use { it.copyTo(out) }
                                cache[bundleUri] = out.toByteArray()
                            }
                            Log.d(TAG, "preload: remote loaded: $bundleUri")
                        }
                        conn.disconnect()
                    } catch (ex: Exception) {
                        Log.e(TAG, "preload: failed for $bundleUri: ${ex.message}")
                    }
                }
                onDone()
            }.start()
        }
    }
}
