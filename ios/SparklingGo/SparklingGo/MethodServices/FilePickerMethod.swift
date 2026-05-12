// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SparklingMethod
import UIKit
import UniformTypeIdentifiers

// MARK: - Models

@objc(FilePickerParamsModel)
class FilePickerParamsModel: SPKMethodModel {
    @objc var type: NSArray = []

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return ["type": "type"]
    }
}

@objc(FilePickerResultModel)
class FilePickerResultModel: SPKMethodModel {
    @objc var tempFiles: NSArray = []

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return ["tempFiles": "tempFiles"]
    }
}

// MARK: - Method

@objc(FilePickerMethod)
final class FilePickerMethod: PipeMethod {

    private static var retainedSelf: FilePickerMethod?
    private var pendingCompletion: CompletionHandlerProtocol?

    override var methodName: String { "Filepicker.pickFile" }
    override class func methodName() -> String { "Filepicker.pickFile" }

    @objc override var paramsModelClass: AnyClass { FilePickerParamsModel.self }
    @objc override var resultModelClass: AnyClass { FilePickerResultModel.self }

    @objc override func call(withParamModel paramModel: Any, completionHandler: CompletionHandlerProtocol) {
        guard let params = paramModel as? FilePickerParamsModel else {
            completionHandler.handleCompletion(
                status: .invalidParameter(message: "Invalid parameter type"),
                result: nil
            )
            return
        }

        let mimeTypes = params.type as? [String] ?? ["*/*"]
        let utTypes = resolveUTTypes(from: mimeTypes)

        DispatchQueue.main.async {
            guard let topVC = self.topViewController() else {
                completionHandler.handleCompletion(
                    status: .failed(message: "No view controller available"),
                    result: nil
                )
                return
            }

            self.pendingCompletion = completionHandler
            FilePickerMethod.retainedSelf = self

            let picker = UIDocumentPickerViewController(forOpeningContentTypes: utTypes, asCopy: true)
            picker.allowsMultipleSelection = true
            picker.delegate = self
            topVC.present(picker, animated: true)
        }
    }

    private func resolveUTTypes(from mimeTypes: [String]) -> [UTType] {
        var types: [UTType] = []
        for mime in mimeTypes {
            if mime == "*/*" {
                types.append(.item)
            } else if let utType = UTType(mimeType: mime) {
                types.append(utType)
            }
        }
        return types.isEmpty ? [.item] : types
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

// MARK: - UIDocumentPickerDelegate

extension FilePickerMethod: UIDocumentPickerDelegate {

    func documentPicker(_ controller: UIDocumentPickerViewController, didPickDocumentsAt urls: [URL]) {
        defer { FilePickerMethod.retainedSelf = nil }
        guard let completion = pendingCompletion else { return }
        pendingCompletion = nil

        var fileInfos: [[String: Any]] = []
        for url in urls {
            let resources = try? url.resourceValues(forKeys: [.fileSizeKey, .nameKey])
            let name = resources?.name ?? url.lastPathComponent
            let size = resources?.fileSize ?? 0

            fileInfos.append([
                "tempFilePath": url.path,
                "name": name,
                "size": size
            ])
        }

        let result = FilePickerResultModel()
        result.tempFiles = fileInfos as NSArray
        completion.handleCompletion(status: .succeeded(), result: result)
    }

    func documentPickerWasCancelled(_ controller: UIDocumentPickerViewController) {
        defer { FilePickerMethod.retainedSelf = nil }
        guard let completion = pendingCompletion else { return }
        pendingCompletion = nil
        completion.handleCompletion(status: .failed(message: "User cancelled"), result: nil)
    }
}
