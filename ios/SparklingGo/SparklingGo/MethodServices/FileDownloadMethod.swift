// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SparklingMethod

// MARK: - Models

@objc(FileDownloadParamsModel)
class FileDownloadParamsModel: SPKMethodModel {
    @objc var url: String = ""
    @objc var filename: String?

    override class func requiredKeyPaths() -> Set<String>? {
        return ["url"]
    }

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return [
            "url": "url",
            "filename": "filename"
        ]
    }
}

@objc(FileDownloadResultModel)
class FileDownloadResultModel: SPKMethodModel {
    @objc var success: NSNumber = false
    @objc var localPath: String?
    @objc var error: String?

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return [
            "success": "success",
            "localPath": "localPath",
            "error": "error"
        ]
    }
}

// MARK: - Method

@objc(FileDownloadMethod)
final class FileDownloadMethod: PipeMethod {

    override var methodName: String { "file.download" }
    override class func methodName() -> String { "file.download" }

    @objc override var paramsModelClass: AnyClass { FileDownloadParamsModel.self }
    @objc override var resultModelClass: AnyClass { FileDownloadResultModel.self }

    @objc override func call(withParamModel paramModel: Any, completionHandler: CompletionHandlerProtocol) {
        guard let params = paramModel as? FileDownloadParamsModel else {
            completionHandler.handleCompletion(
                status: .invalidParameter(message: "Invalid parameter type"),
                result: nil
            )
            return
        }

        let rawURL = params.url
        let filename = params.filename ?? extractFilename(from: rawURL)

        guard let sourceURL = URL(string: rawURL) else {
            completionHandler.handleCompletion(
                status: .failed(message: "Invalid URL: \(rawURL)"),
                result: nil
            )
            return
        }

        DispatchQueue.global(qos: .utility).async {
            do {
                let localPath = try self.download(from: sourceURL, filename: filename)
                let result = FileDownloadResultModel()
                result.success = true
                result.localPath = localPath
                completionHandler.handleCompletion(status: .succeeded(), result: result)
            } catch {
                let result = FileDownloadResultModel()
                result.success = false
                result.error = error.localizedDescription
                completionHandler.handleCompletion(status: .succeeded(), result: result)
            }
        }
    }

    private func download(from url: URL, filename: String) throws -> String {
        let data = try Data(contentsOf: url)

        let downloadsDir = try FileManager.default.url(
            for: .downloadsDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )

        var destURL = downloadsDir.appendingPathComponent(filename)
// Avoid overwriting — append a suffix if needed
        var counter = 1
        let base = (filename as NSString).deletingPathExtension
        let ext = (filename as NSString).pathExtension
        while FileManager.default.fileExists(atPath: destURL.path) {
            let newName = ext.isEmpty ? "\(base)_\(counter)" : "\(base)_\(counter).\(ext)"
            destURL = downloadsDir.appendingPathComponent(newName)
            counter += 1
        }

        try data.write(to: destURL, options: .atomic)
        return destURL.path
    }

    private func extractFilename(from urlString: String) -> String {
        let withoutQuery = urlString.components(separatedBy: "?").first ?? urlString
        let lastComponent = withoutQuery.components(separatedBy: "/").last ?? ""
        return lastComponent.isEmpty ? "download" : lastComponent
    }
}
