// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SparklingMethod
import UIKit
import QuickLook

// MARK: - Models

@objc(FileOpenParamsModel)
class FileOpenParamsModel: SPKMethodModel {
    @objc var localPath: String = ""

    override class func requiredKeyPaths() -> Set<String>? {
        return ["localPath"]
    }

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return ["localPath": "localPath"]
    }
}

@objc(FileOpenResultModel)
class FileOpenResultModel: SPKMethodModel {
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

@objc(FileOpenMethod)
final class FileOpenMethod: PipeMethod {

    private static var retainedSelf: FileOpenMethod?
    private var pendingCompletion: CompletionHandlerProtocol?
    private var previewURL: URL?

    override var methodName: String { "file.open" }
    override class func methodName() -> String { "file.open" }

    @objc override var paramsModelClass: AnyClass { FileOpenParamsModel.self }
    @objc override var resultModelClass: AnyClass { FileOpenResultModel.self }

    @objc override func call(withParamModel paramModel: Any, completionHandler: CompletionHandlerProtocol) {
        guard let params = paramModel as? FileOpenParamsModel else {
            completionHandler.handleCompletion(
                status: .invalidParameter(message: "Invalid parameter type"),
                result: nil
            )
            return
        }

        let path = params.localPath

        DispatchQueue.main.async {
            guard let fileURL = self.resolveFileURL(from: path) else {
                let result = FileOpenResultModel()
                result.success = false
                result.error = "Cannot resolve path: \(path)"
                completionHandler.handleCompletion(status: .succeeded(), result: result)
                return
            }

            guard FileManager.default.fileExists(atPath: fileURL.path) else {
                let result = FileOpenResultModel()
                result.success = false
                result.error = "File not found: \(fileURL.path)"
                completionHandler.handleCompletion(status: .succeeded(), result: result)
                return
            }

            guard let topVC = self.topViewController() else {
                let result = FileOpenResultModel()
                result.success = false
                result.error = "No view controller available"
                completionHandler.handleCompletion(status: .succeeded(), result: result)
                return
            }

            self.previewURL = fileURL
            self.pendingCompletion = completionHandler
            FileOpenMethod.retainedSelf = self

            let preview = QLPreviewController()
            preview.dataSource = self
            preview.delegate = self
            topVC.present(preview, animated: true)
        }
    }

    private func resolveFileURL(from path: String) -> URL? {
        if path.hasPrefix("/") {
            return URL(fileURLWithPath: path)
        }
        return URL(string: path)
    }

    private func topViewController() -> UIViewController? {
        var scene: UIWindowScene?
        for ws in UIApplication.shared.connectedScenes {
            if let ws = ws as? UIWindowScene, ws.activationState == .foregroundActive {
                scene = ws
                break
            }
        }
        var vc = scene?.windows.first(where: { $0.isKeyWindow })?.rootViewController
        while let presented = vc?.presentedViewController {
            vc = presented
        }
        return vc
    }
}

// MARK: - QLPreviewControllerDataSource & Delegate

extension FileOpenMethod: QLPreviewControllerDataSource, QLPreviewControllerDelegate {

    func numberOfPreviewItems(in controller: QLPreviewController) -> Int {
        return previewURL != nil ? 1 : 0
    }

    func previewController(_ controller: QLPreviewController, previewItemAt index: Int) -> QLPreviewItem {
        return previewURL! as QLPreviewItem
    }

    func previewControllerWillDismiss(_ controller: QLPreviewController) {
        defer { FileOpenMethod.retainedSelf = nil }
        guard let completion = pendingCompletion else { return }
        pendingCompletion = nil
        let result = FileOpenResultModel()
        result.success = true
        completion.handleCompletion(status: .succeeded(), result: result)
    }
}
