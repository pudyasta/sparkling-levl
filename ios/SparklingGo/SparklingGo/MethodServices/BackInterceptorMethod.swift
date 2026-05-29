// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import UIKit
import Lynx
import SparklingMethod

// MARK: - Shared notification posted when the intercept state changes.
// SparklingSwiftVC (or any hosting VC) observes this to disable/enable
// the interactive edge-swipe gesture when intercept is active.

extension Notification.Name {
    static let backInterceptorStateChanged = Notification.Name("SparklingBackInterceptorStateChanged")
}

// MARK: - Models

@objc(BackInterceptorParamsModel)
class BackInterceptorParamsModel: SPKMethodModel {
    @objc var enabled: NSNumber = false

    override class func requiredKeyPaths() -> Set<String>? {
        return ["enabled"]
    }

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return ["enabled": "enabled"]
    }
}

@objc(BackInterceptorResultModel)
class BackInterceptorResultModel: SPKMethodModel {
    @objc var success: NSNumber = false

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return ["success": "success"]
    }
}

// MARK: - Method

@objc(BackInterceptorMethod)
final class BackInterceptorMethod: PipeMethod {

    /// Global flag shared with GoBackMethod to prevent re-interception.
    static var isInterceptEnabled: Bool = false

    override var methodName: String { "navigation.setBackInterceptor" }
    override class func methodName() -> String { "navigation.setBackInterceptor" }

    @objc override var paramsModelClass: AnyClass { BackInterceptorParamsModel.self }
    @objc override var resultModelClass: AnyClass { BackInterceptorResultModel.self }

    @objc override func call(withParamModel paramModel: Any, completionHandler: CompletionHandlerProtocol) {
        guard let params = paramModel as? BackInterceptorParamsModel else {
            completionHandler.handleCompletion(
                status: .invalidParameter(message: "Invalid parameter type"),
                result: nil
            )
            return
        }

        let enabled = params.enabled.boolValue
        BackInterceptorMethod.isInterceptEnabled = enabled

        // Notify the hosting view controller on the main thread
        DispatchQueue.main.async {
            NotificationCenter.default.post(
                name: .backInterceptorStateChanged,
                object: nil,
                userInfo: ["enabled": enabled]
            )
        }

        let result = BackInterceptorResultModel()
        result.success = true
        completionHandler.handleCompletion(status: .succeeded(), result: result)
    }

    // MARK: - Called by the hosting VC when iOS back navigation is intercepted

    static func dispatchNativeBackEvent() {
        guard isInterceptEnabled else { return }
        guard let lynxView = findActiveLynxView() else { return }
        lynxView.sendGlobalEvent("nativeBackPressed", withParams: [["source": "ios_back"]])
    }

    private static func findActiveLynxView() -> LynxView? {
        var activeScene: UIWindowScene?
        for scene in UIApplication.shared.connectedScenes {
            if let ws = scene as? UIWindowScene, ws.activationState == .foregroundActive {
                activeScene = ws
                break
            }
        }
        guard let window = activeScene?.windows.first(where: { $0.isKeyWindow }) else { return nil }
        return findLynxView(in: window)
    }

    private static func findLynxView(in view: UIView) -> LynxView? {
        if let lynxView = view as? LynxView { return lynxView }
        for subview in view.subviews {
            if let found = findLynxView(in: subview) { return found }
        }
        return nil
    }
}
