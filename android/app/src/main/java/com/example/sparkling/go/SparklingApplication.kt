// Copyright (c) 2025 TikTok Pte. Ltd.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
package com.example.sparkling.go

import android.app.Activity
import android.app.Application
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback

import com.facebook.drawee.backends.pipeline.Fresco
import com.facebook.imagepipeline.core.ImagePipelineConfig
import com.facebook.imagepipeline.memory.PoolConfig
import com.facebook.imagepipeline.memory.PoolFactory
import com.lynx.tasm.behavior.Behavior
import com.lynx.tasm.behavior.LynxContext
import com.lynx.tasm.behavior.ui.LynxUI
import com.tiktok.sparkling.hybridkit.HybridKit
import com.tiktok.sparkling.hybridkit.config.BaseInfoConfig
import com.tiktok.sparkling.hybridkit.config.SparklingHybridConfig
import com.tiktok.sparkling.hybridkit.config.SparklingLynxConfig
import com.tiktok.sparkling.method.registry.core.SparklingBridgeManager
import com.tiktok.sparkling.method.router.close.RouterCloseMethod
import com.tiktok.sparkling.method.router.open.RouterOpenMethod
import com.tiktok.sparkling.method.router.utils.RouterProvider
import com.example.sparkling.go.components.NativeSvgView
import com.example.sparkling.go.components.VideoPlayerView
import com.example.sparkling.go.modules.BackInterceptorMethod
import com.example.sparkling.go.modules.FileOpenMethod
import com.example.sparkling.go.modules.GoBackMethod
import com.example.sparkling.go.modules.NativeFileDownloader
import com.example.sparkling.go.modules.NativeFilePicker
import com.example.sparkling.go.modules.NativeFileUploader
import com.lynx.react.bridge.JavaOnlyArray
import com.lynx.react.bridge.JavaOnlyMap
import com.lynx.service.devtool.LynxDevToolService
import com.lynx.service.http.LynxHttpService
import com.lynx.service.image.LynxImageService
import com.lynx.tasm.LynxEnv
import com.lynx.tasm.LynxView
import com.lynx.tasm.service.LynxServiceCenter
import com.tiktok.sparkling.method.storage.getItem.StorageGetItemMethod
import com.tiktok.sparkling.method.storage.removeItem.StorageRemoveItemMethod
import com.tiktok.sparkling.method.storage.setItem.StorageSetItemMethod


class SparklingApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        initFresco()
        initSparkling()
        hookActivitiesForBack()
    }

    private fun initFresco() {
        val factory = PoolFactory(PoolConfig.newBuilder().build())
        val builder = ImagePipelineConfig.newBuilder(applicationContext).setPoolFactory(factory)
        Fresco.initialize(applicationContext, builder.build())
        LynxServiceCenter.inst().registerService(LynxImageService.getInstance())
        // LynxServiceCenter.inst().registerService(LynxLogService)
        LynxServiceCenter.inst().registerService(LynxHttpService)
        // register devtool service
        LynxServiceCenter.inst().registerService(LynxDevToolService())
    }

    private fun initSparkling() {
        initHybridKit()
        initSparklingMethods()
    }

    private fun initHybridKit() {
        HybridKit.init(this)
        val baseInfoConfig = BaseInfoConfig(isDebug = false)
        val lynxConfig = SparklingLynxConfig.build(this) {
            addBehaviors(listOf(
                object : Behavior("input", false) {
                    override fun createUI(context: LynxContext?): LynxUI<*>? {
                        return LynxInputComponent(context)
                    }
                },
                object : Behavior("native-svg") {
                    override fun createUI(context: LynxContext): LynxUI<*> {
                        return NativeSvgView(context)
                    }
                },
                object : Behavior("video-player") {
                    override fun createUI(context: LynxContext): LynxUI<*> {
                        return VideoPlayerView(context)
                    }
                }
            ))
            setTemplateProvider(BuiltinTemplateProvider(this@SparklingApplication))
        }
        val hybridConfig = SparklingHybridConfig.build(baseInfoConfig) {
            setLynxConfig(lynxConfig)
        }
        HybridKit.setHybridConfig(hybridConfig, this)
        HybridKit.initLynxKit()
        LynxEnv.inst().enableLynxDebug(true)
        LynxEnv.inst().enableDevtool(true)
    }


    private fun initSparklingMethods() {
        SparklingBridgeManager.registerIDLMethod(RouterOpenMethod::class.java)
        SparklingBridgeManager.registerIDLMethod(RouterCloseMethod::class.java)
        RouterProvider.hostRouterDepend = SparklingHostRouterDepend()

        SparklingBridgeManager.registerIDLMethod(NativeFileUploader::class.java)
        SparklingBridgeManager.registerIDLMethod(NativeFilePicker::class.java)
        SparklingBridgeManager.registerIDLMethod(BackInterceptorMethod::class.java)
        SparklingBridgeManager.registerIDLMethod(GoBackMethod::class.java)
        SparklingBridgeManager.registerIDLMethod(NativeFileDownloader::class.java)
        SparklingBridgeManager.registerIDLMethod(FileOpenMethod::class.java)

        SparklingBridgeManager.registerIDLMethod(StorageSetItemMethod::class.java)
        SparklingBridgeManager.registerIDLMethod(StorageGetItemMethod::class.java)
        SparklingBridgeManager.registerIDLMethod(StorageRemoveItemMethod::class.java)
    }

    private fun hookActivitiesForBack() {
        registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
            override fun onActivityCreated(activity: Activity, state: Bundle?) {
                if (activity is ComponentActivity) {
                    activity.onBackPressedDispatcher.addCallback(
                        activity,
                        object : OnBackPressedCallback(true) {
                            override fun handleOnBackPressed() {
                                if (!BackInterceptorMethod.isInterceptEnabled) {
                                    isEnabled = false
                                    activity.onBackPressedDispatcher.onBackPressed()
                                    isEnabled = true  // re-arm for future presses
                                    return
                                }

                                val lynxView = activity.window.decorView.findLynxView()
                                if (lynxView == null) {
                                    Log.d("BackInterceptor", "LynxView not found, falling back")
                                    isEnabled = false
                                    activity.onBackPressedDispatcher.onBackPressed()
                                    isEnabled = true
                                    return
                                }

                                val params = JavaOnlyArray()
                                val data = JavaOnlyMap()
                                data.putString("source", "android_back")
                                params.pushMap(data)
                                lynxView.sendGlobalEvent("nativeBackPressed", params)
                            }
                        }
                    )
                }
            }

            override fun onActivityResumed(activity: Activity) {
                val lynxView = activity.window.decorView.findLynxView() ?: return

                val pending = DeepLinkHolder.consume() ?: return

                Log.d("DeepLink", "Dispatching to LynxView: $pending")

                val params = JavaOnlyArray()
                val data   = JavaOnlyMap().apply {
                    putString("userId", pending["userId"] ?: "")
                    putString("email",  pending["email"]  ?: "")
                    putString("uuid",   pending["uuid"]   ?: "")
                    putString("token",  pending["token"]  ?: "")
                }
                params.pushMap(data)

                lynxView.updateGlobalProps(data)
            }
            override fun onActivityStarted(a: Activity) {

            }
            override fun onActivityPaused(a: Activity) {}
            override fun onActivityStopped(a: Activity) {}
            override fun onActivitySaveInstanceState(a: Activity, b: Bundle) {}
            override fun onActivityDestroyed(a: Activity) {}
        })
    }
    private fun View.findLynxView(): LynxView? {
        if (this is LynxView) return this

        if (this is ViewGroup) {
            for (i in 0 until childCount) {
                val found = getChildAt(i).findLynxView()
                if (found != null) return found
            }
        }

        return null
    }

}
