package com.example.sparkling.go.modules

import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodName
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodParamField
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodParamModel
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodResultModel

import com.tiktok.sparkling.method.registry.core.base.AbsSparklingIDLMethod
import com.tiktok.sparkling.method.registry.core.model.idl.IDLMethodBaseParamModel
import com.tiktok.sparkling.method.registry.core.model.idl.IDLMethodBaseResultModel

abstract class AbsBackInterceptorMethodIDL : AbsSparklingIDLMethod<AbsBackInterceptorMethodIDL.BackInterceptorInputModel, AbsBackInterceptorMethodIDL.BackInterceptorResultModel>() {

    @IDLMethodName(name = "navigation.setBackInterceptor", params = ["enabled"], results = ["success"])
    final override val name: String = "navigation.setBackInterceptor"

    @IDLMethodParamModel
    interface BackInterceptorInputModel : IDLMethodBaseParamModel {
        @get:IDLMethodParamField(required = true, isGetter = true, keyPath = "enabled")
        val enabled: Boolean
    }

    @IDLMethodResultModel
    interface BackInterceptorResultModel : IDLMethodBaseResultModel {
        @get:IDLMethodParamField(required = true, isGetter = true, keyPath = "success")
        @set:IDLMethodParamField(required = true, isGetter = false, keyPath = "success")
        var success: Boolean?
    }
}
