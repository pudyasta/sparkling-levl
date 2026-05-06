package com.example.sparkling.go.modules

import com.tiktok.sparkling.SparklingActivity
import com.tiktok.sparkling.method.registry.core.BridgePlatformType
import com.tiktok.sparkling.method.registry.core.model.idl.CompletionBlock
import com.tiktok.sparkling.method.registry.core.utils.IDLMethodHelper
import com.tiktok.sparkling.method.registry.core.utils.createXModel

class GoBackMethod : AbsGoBackMethodIDL() {

    override fun handle(
        params: GoBackInputModel,
        callback: CompletionBlock<GoBackResultModel>,
        type: BridgePlatformType
    ) {
        val context = getSDKContext()
        val activity = IDLMethodHelper.getActivity(context?.context) as? SparklingActivity

        if (activity == null) {
            val result = GoBackResultModel::class.java.createXModel().apply {
                this.success = false
                this.error = "Activity not available"
            }
            callback.onSuccess(result)
            return
        }

        activity.runOnUiThread {
            // Disable the interceptor first so the dispatcher doesn't loop back
            // into the nativeBackPressed event — mirrors what JS does before calling goBack.
            BackInterceptorMethod.isInterceptEnabled = false
            activity.onBackPressedDispatcher.onBackPressed()
        }

        val result = GoBackResultModel::class.java.createXModel().apply {
            this.success = true
            this.error = null
        }
        callback.onSuccess(result)
    }
}
