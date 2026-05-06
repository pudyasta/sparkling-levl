package com.example.sparkling.go.modules

import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodName
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodParamField
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodParamModel
import com.tiktok.sparkling.method.registry.core.annotation.IDLMethodResultModel
import com.tiktok.sparkling.method.registry.core.base.AbsSparklingIDLMethod
import com.tiktok.sparkling.method.registry.core.model.idl.IDLMethodBaseParamModel
import com.tiktok.sparkling.method.registry.core.model.idl.IDLMethodBaseResultModel

abstract class AbsGoBackMethodIDL : AbsSparklingIDLMethod<AbsGoBackMethodIDL.GoBackInputModel, AbsGoBackMethodIDL.GoBackResultModel>() {

    @IDLMethodName(name = " ", params = [], results = ["success", "error"])
    final override val name: String = "navigation.goBack"

    @IDLMethodParamModel
    interface GoBackInputModel : IDLMethodBaseParamModel
    // No input params required — JS calls navigation.goBack({})

    @IDLMethodResultModel
    interface GoBackResultModel : IDLMethodBaseResultModel {
        @get:IDLMethodParamField(required = true, isGetter = true, keyPath = "success")
        @set:IDLMethodParamField(required = true, isGetter = false, keyPath = "success")
        var success: Boolean?

        @get:IDLMethodParamField(required = false, isGetter = true, keyPath = "error")
        @set:IDLMethodParamField(required = false, isGetter = false, keyPath = "error")
        var error: String?
    }
}
