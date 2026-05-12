// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SparklingMethod

// MARK: - Models

@objc(FileUploadParamsModel)
class FileUploadParamsModel: SPKMethodModel {
    @objc var url: String = ""
    @objc var answerText: String?
    /// Each element is an NSDictionary with keys: uri, name, mimeType
    @objc var files: NSArray?
    /// Optional extra HTTP headers as NSDictionary<NSString, NSString>
    @objc var headers: NSDictionary?

    override class func requiredKeyPaths() -> Set<String>? {
        return ["url"]
    }

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return [
            "url": "url",
            "answerText": "answerText",
            "files": "files",
            "headers": "headers"
        ]
    }
}

@objc(FileUploadResultModel)
class FileUploadResultModel: SPKMethodModel {
    @objc var responseBody: String?

    override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return ["responseBody": "responseBody"]
    }
}

// MARK: - Method

@objc(FileUploadMethod)
final class FileUploadMethod: PipeMethod {

    private static let bufferSize = 65536

    override var methodName: String { "FileUploader.uploadFile" }
    override class func methodName() -> String { "FileUploader.uploadFile" }

    @objc override var paramsModelClass: AnyClass { FileUploadParamsModel.self }
    @objc override var resultModelClass: AnyClass { FileUploadResultModel.self }

    @objc override func call(withParamModel paramModel: Any, completionHandler: CompletionHandlerProtocol) {
        guard let params = paramModel as? FileUploadParamsModel else {
            completionHandler.handleCompletion(
                status: .invalidParameter(message: "Invalid parameter type"),
                result: nil
            )
            return
        }

        let hasText = !(params.answerText?.isEmpty ?? true)
        let files = params.files as? [[String: Any]] ?? []
        let hasFiles = !files.isEmpty

        guard hasText || hasFiles else {
            completionHandler.handleCompletion(
                status: .failed(message: "At least answerText or files must be provided"),
                result: nil
            )
            return
        }

        guard let uploadURL = URL(string: params.url) else {
            completionHandler.handleCompletion(
                status: .failed(message: "Invalid URL: \(params.url)"),
                result: nil
            )
            return
        }

        let answerText = params.answerText ?? ""
        let extraHeaders = params.headers as? [String: String] ?? [:]

        DispatchQueue.global(qos: .utility).async {
            do {
                let responseBody = try self.uploadMultipart(
                    url: uploadURL,
                    answerText: answerText,
                    files: files,
                    extraHeaders: extraHeaders
                )
                let result = FileUploadResultModel()
                result.responseBody = responseBody
                completionHandler.handleCompletion(status: .succeeded(), result: result)
            } catch {
                completionHandler.handleCompletion(
                    status: .failed(message: error.localizedDescription),
                    result: nil
                )
            }
        }
    }

    private func uploadMultipart(
        url: URL,
        answerText: String,
        files: [[String: Any]],
        extraHeaders: [String: String]
    ) throws -> String {
        let boundary = "----FormBoundary\(UUID().uuidString.replacingOccurrences(of: "-", with: ""))"
        let lineEnd = "\r\n"

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        for (k, v) in extraHeaders { request.setValue(v, forHTTPHeaderField: k) }

        var bodyData = Data()

        // answer_text field
        bodyData.append("--\(boundary)\(lineEnd)")
        bodyData.append("Content-Disposition: form-data; name=\"answer_text\"\(lineEnd)")
        bodyData.append(lineEnd)
        bodyData.append(answerText)
        bodyData.append(lineEnd)

        // File parts
        for file in files {
            let uriString = file["uri"] as? String ?? ""
            let name = file["name"] as? String ?? "file"
            let mimeType = file["mimeType"] as? String ?? "application/octet-stream"

            guard let fileURL = URL(string: uriString) ?? URL(string: "file://\(uriString)"),
                  let fileData = try? Data(contentsOf: fileURL) else {
                continue
            }

            bodyData.append("--\(boundary)\(lineEnd)")
            bodyData.append("Content-Disposition: form-data; name=\"files[]\"; filename=\"\(name)\"\(lineEnd)")
            bodyData.append("Content-Type: \(mimeType)\(lineEnd)")
            bodyData.append(lineEnd)
            bodyData.append(fileData)
            bodyData.append(lineEnd)
        }

        bodyData.append("--\(boundary)--\(lineEnd)")
        request.httpBody = bodyData

        let semaphore = DispatchSemaphore(value: 0)
        var responseBody: String?
        var responseError: Error?

        URLSession.shared.dataTask(with: request) { data, response, error in
            defer { semaphore.signal() }
            if let error = error {
                responseError = error
                return
            }
            let httpResponse = response as? HTTPURLResponse
            let code = httpResponse?.statusCode ?? 0
            let body = data.flatMap { String(data: $0, encoding: .utf8) } ?? ""
            if (200...299).contains(code) {
                responseBody = body
            } else {
                responseError = NSError(
                    domain: "FileUpload",
                    code: code,
                    userInfo: [NSLocalizedDescriptionKey: "HTTP \(code): \(body)"]
                )
            }
        }.resume()

        semaphore.wait()

        if let error = responseError { throw error }
        return responseBody ?? ""
    }
}

// MARK: - Data helpers

private extension Data {
    mutating func append(_ string: String) {
        if let data = string.data(using: .utf8) {
            append(data)
        }
    }
}
