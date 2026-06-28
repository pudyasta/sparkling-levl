// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SparklingMethod
import Sparkling
import Sparkling_Router

// MARK: - Models

@objc(GoBackParamsModel)
class GoBackParamsModel: SPKMethodModel {
    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return [:]
    }
}

@objc(GoBackResultModel)
class GoBackResultModel: SPKMethodModel {
    @objc var success: NSNumber = false
    @objc var error: String?

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return [
            "success": "success",
            "error": "error"
        ]
    }
}

// MARK: - Method

@objc(GoBackMethod)
final class GoBackMethod: PipeMethod {

    override var methodName: String { "navigation.goBack" }
    override class func methodName() -> String { "navigation.goBack" }

    @objc override var paramsModelClass: AnyClass { GoBackParamsModel.self }
    @objc override var resultModelClass: AnyClass { GoBackResultModel.self }

    @objc override func call(withParamModel paramModel: Any, completionHandler: CompletionHandlerProtocol) {
        // Disable intercept so the close is not re-intercepted
        BackInterceptorMethod.isInterceptEnabled = false

        DispatchQueue.main.async {
            // Try SPKRouter.close first (Sparkling container), fall back to UIKit pop/dismiss
            let closed = SPKRouter.close(container: nil)
            if !closed {
                self.fallbackNavigateBack()
            }
        }

        let result = GoBackResultModel()
        result.success = true
        completionHandler.handleCompletion(status: .succeeded(), result: result)
    }

    private func fallbackNavigateBack() {
        var scene: UIWindowScene?
        for ws in UIApplication.shared.connectedScenes {
            if let ws = ws as? UIWindowScene, ws.activationState == .foregroundActive {
                scene = ws
                break
            }
        }
        guard let rootVC = scene?.windows.first(where: { $0.isKeyWindow })?.rootViewController else {
            return
        }

        var topVC = rootVC
        while let presented = topVC.presentedViewController {
            topVC = presented
        }

        // In a SwiftUI app the UINavigationController is a child of UIHostingController,
        // not the window root, so we must search the child VC tree.
        if let navVC = findNavigationController(in: topVC), navVC.viewControllers.count > 1 {
            navVC.popViewController(animated: true)
        } else {
            topVC.dismiss(animated: true)
        }
    }

    private func findNavigationController(in vc: UIViewController) -> UINavigationController? {
        if let navVC = vc as? UINavigationController { return navVC }
        for child in vc.children {
            if let found = findNavigationController(in: child) { return found }
        }
        return nil
    }
}
