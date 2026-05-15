// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.example.sparkling.go

import android.app.Activity
import android.app.Application
import android.content.Context
import android.net.Uri
import android.os.Bundle
import android.util.Log
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import com.lynx.react.bridge.JavaOnlyArray
import com.lynx.react.bridge.JavaOnlyMap
import com.lynx.tasm.LynxView
import com.tiktok.sparkling.Sparkling
import com.tiktok.sparkling.SparklingContext
import com.tiktok.sparkling.method.registry.core.utils.JsonUtils
import java.net.URLEncoder

object SparklingDebugBridge {
    private const val DEBUG_TOOL_CLASS = "com.tiktok.sparkling.debugtool.SparklingDebugTool"

    fun init(application: Application) {
        runCatching {
            val debugToolClass = Class.forName(DEBUG_TOOL_CLASS)
            val initMethod = debugToolClass.getMethod("init", Application::class.java)
            initMethod.invoke(null, application)
        }
    }

    fun getDevUrl(context: Context, fallback: String): String {
        return runCatching {
            val debugToolClass = Class.forName(DEBUG_TOOL_CLASS)
            val getDevUrlMethod = debugToolClass.getMethod(
                "getDevUrl",
                Context::class.java,
                String::class.java,
            )
            getDevUrlMethod.invoke(null, context, fallback) as? String ?: fallback
        }.getOrDefault(fallback)
    }

    fun showDevUrlDialog(
        activity: Activity,
        initialUrl: String?,
        onSaved: (String) -> Unit,
    ) {
        runCatching {
            val debugToolClass = Class.forName(DEBUG_TOOL_CLASS)
            val showDevUrlDialogMethod = debugToolClass.getMethod(
                "showDevUrlDialog",
                Activity::class.java,
                String::class.java,
                Function1::class.java,
            )
            val callback = object : Function1<String, Unit> {
                override fun invoke(updatedUrl: String) {
                    onSaved(updatedUrl)
                }
            }
            showDevUrlDialogMethod.invoke(null, activity, initialUrl, callback)
        }
    }
}

object DebugDevUrlSupport {
    fun buildMainPageSchemeWithSource(source: String): String {
        val normalized = source.trim()
        val encoded = Uri.encode(normalized)
        // Remote source -> url=..., local source -> bundle=...
        val isRemote = normalized.startsWith("http://") || normalized.startsWith("https://")
        return if (isRemote) {
            "hybrid://lynxview?url=$encoded&hide_nav_bar=1&screen_orientation=portrait"
        } else {
            "hybrid://lynxview?bundle=$encoded&hide_nav_bar=1&screen_orientation=portrait"
        }
    }

    fun networkBundleUrlFromScheme(scheme: String?): String? {
        if (scheme.isNullOrBlank()) {
            return null
        }
        val parsed = runCatching { Uri.parse(scheme) }.getOrNull() ?: return null
        val url = parsed.getQueryParameter("url")?.trim()
        if (url.isNullOrEmpty()) {
            return null
        }
        return if (url.startsWith("http://") || url.startsWith("https://")) url else null
    }
}
class SplashActivity : AppCompatActivity() {
    private lateinit var lynxView: LynxView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                Log.d("COBADEG","Cobs")

                val params = JavaOnlyArray()
                val data = JavaOnlyMap()
                data.putString("source", "android_back")
                params.pushMap(data)
                lynxView.sendGlobalEvent("nativeBackPressed", params)
            }
        })

        gotoSparklingPage()
    }
    private fun gotoSparklingPage() {
        val initData = mapOf<Any, Any>()
        val initialData = JsonUtils.toJson(initData)

        val remoteBundle = "https://ta-trpl.web.app/login.lynx.bundle"
        val encodedBundle =DebugDevUrlSupport.buildMainPageSchemeWithSource(remoteBundle)


        val context = SparklingContext().apply {
            scheme ="hybrid://lynxview_page?bundle=main.lynx.bundle&hide_nav_bar=1&screen_orientation=portrait"
            withInitData("""{ "initial_data": $initialData }""")
        }

        Sparkling.build(this, context).navigate()
        finish()
    }
}
