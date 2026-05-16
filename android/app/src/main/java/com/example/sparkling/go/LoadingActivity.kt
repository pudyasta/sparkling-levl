// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.example.sparkling.go

import android.net.Uri
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.tiktok.sparkling.Sparkling
import com.tiktok.sparkling.SparklingContext

class LoadingActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_loading)

        val scheme = intent.getStringExtra(EXTRA_SCHEME) ?: run {
            finish()
            return
        }

        val bundleName = Uri.parse(scheme).getQueryParameter("bundle")
        if (bundleName == null) {
            navigateAndFinish(scheme)
            return
        }

        BuiltinTemplateProvider.preload(this, bundleName) {
            runOnUiThread { navigateAndFinish(scheme) }
        }
    }

    private fun navigateAndFinish(scheme: String) {
        val sparklingContext = SparklingContext()
        sparklingContext.scheme = scheme
        Sparkling.build(this, sparklingContext).navigate()
        finish()
    }

    companion object {
        const val EXTRA_SCHEME = "scheme"
    }
}
