package com.example.sparkling.go.modules


import android.util.Log
import com.tiktok.sparkling.SparklingActivity
import com.tiktok.sparkling.method.registry.core.BridgePlatformType
import com.tiktok.sparkling.method.registry.core.IBridgeContext
import com.tiktok.sparkling.method.registry.core.IDLBridgeMethod
import com.tiktok.sparkling.method.registry.core.model.idl.CompletionBlock
import com.tiktok.sparkling.method.registry.core.utils.IDLMethodHelper
import com.tiktok.sparkling.method.registry.core.utils.createXModel

class BackInterceptorMethod : AbsBackInterceptorMethodIDL() {

    companion object {
        var isInterceptEnabled = false
        var waitingReturn = false
    }

    override fun handle(
        params: BackInterceptorInputModel,
        callback: CompletionBlock<BackInterceptorResultModel>,
        type: BridgePlatformType
    ) {
        // JS is declaring its intent for the NEXT back press, not responding to one.
        isInterceptEnabled = params.enabled
        Log.d("BackInterceptor", "intercept enabled = $isInterceptEnabled")

        val result = BackInterceptorResultModel::class.java.createXModel().apply {
            this.success = true
        }
        callback.onSuccess(result)
    }
}
