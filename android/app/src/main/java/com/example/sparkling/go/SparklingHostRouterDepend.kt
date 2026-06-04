// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.example.sparkling.go
import android.app.Activity
import android.net.Uri

import android.content.Context
import android.util.Log
import com.tiktok.sparkling.Sparkling
import com.tiktok.sparkling.SparklingContext
import com.tiktok.sparkling.hybridkit.service.HybridActivityStackManager
import com.tiktok.sparkling.method.registry.core.BridgePlatformType
import com.tiktok.sparkling.method.registry.core.IBridgeContext
import com.tiktok.sparkling.method.router.utils.IHostRouterDepend

class SparklingHostRouterDepend: IHostRouterDepend {

    override fun openScheme(
        bridgeContext: IBridgeContext?,
        scheme: String,
        extraParams: Map<String, Any>,
        platformType: BridgePlatformType,
        context: Context?
    ): Boolean {
        val sparklingContext = SparklingContext()
        sparklingContext.scheme = scheme
        Log.d("coba navigate", bridgeContext.toString())
        Log.d("coba navigate", scheme)
        Log.d("coba navigate", context.toString())

        val shouldClearStack =  Uri.parse(scheme).getQueryParameter("hide_error")

        context?.let { ctx ->
            Sparkling.Companion.build(ctx, sparklingContext).navigate()
            if (shouldClearStack =="0" && ctx is Activity) {
                ctx.finishAffinity()
            }
        }
        return true
    }

    override fun closeView(
        bridgeContext: IBridgeContext?,
        type: BridgePlatformType,
        containerID: String?,
        animated: Boolean?
    ): Boolean {
        val ownerActivity = bridgeContext?.ownerActivity
        if (ownerActivity != null) {
            ownerActivity.finish()
        } else {
            HybridActivityStackManager.getTopActivity()?.finish()
        }
        return true
    }
}
