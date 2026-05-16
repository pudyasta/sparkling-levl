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

class SplashActivity : AppCompatActivity() {
    private lateinit var lynxView: LynxView
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
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
        val context = SparklingContext()
        context.scheme = "hybrid://lynxview_page?bundle=main.lynx.bundle&hide_nav_bar=1&screen_orientation=portrait"
        context.withInitData(initialData)

        Sparkling.build(this, context).navigate()
        finish()
    }
}
