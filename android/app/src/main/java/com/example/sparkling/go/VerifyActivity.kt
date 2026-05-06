// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.example.sparkling.go

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

class VerifyActivity : AppCompatActivity() {
    private lateinit var lynxView: LynxView


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        gotoSparklingPage()
    }
    private fun gotoSparklingPage() {
        // Parse deep link params from intent
        val data = intent?.data
        Log.d("PUNTEN1",data.toString())

        val userId  = data?.getQueryParameter("userId") ?: ""
        val email   = data?.getQueryParameter("email") ?: ""
        val uuid    = data?.getQueryParameter("uuid") ?: ""
        val token   = data?.getQueryParameter("token") ?: ""

        // Pass as globalProps so lynx.__globalProps is populated on the JS side
        val globalProps = mapOf(
            "userId" to userId,
            "email"  to email,
            "uuid"   to uuid,
            "token"  to token,
        )
        DeepLinkHolder.set(userId, email, uuid, token)

        val initData    = mapOf<Any, Any>(
        )
        val initialData = JsonUtils.toJson(initData)

        val context = SparklingContext()
        context.scheme = "hybrid://lynxview_page?bundle=verify.lynx.bundle&hide_nav_bar=1&screen_orientation=portrait"
        context.withInitData("{ \"initial_data\":$initialData}")

        Sparkling.build(this, context).navigate()
        finishAffinity()
    }
}
