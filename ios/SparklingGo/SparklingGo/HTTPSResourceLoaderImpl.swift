// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import Sparkling
import SDWebImage

/// Backports HTTPS image loading from Sparkling SDK v2.1.0-rc.12 to v2.0.1.
/// In v2.0.1, SPKResourceLoaderImpl.loadImage(withURL:) only loads from the
/// app bundle and returns nil for http/https URLs. This subclass adds the
/// missing URLSession fallback using SDWebImage.
class HTTPSResourceLoaderImpl: NSObject, SPKResourceLoaderProtocol {
    private let base = SPKResourceLoaderImpl()

    func loadResource(withURL url: URL?, completion: @escaping SPKResourceCompletionHandler) -> SPKResourceLoaderTaskProtocol? {
        return base.loadResource(withURL: url, completion: completion)
    }

    func loadImage(withURL url: URL?, completion: @escaping SPKResourceImageCompletionHandler) -> SPKResourceLoaderTaskProtocol? {
        guard let url = url else { return nil }

        if let scheme = url.scheme?.lowercased(), scheme == "http" || scheme == "https" {
            SDWebImageManager.shared.loadImage(with: url, options: [], progress: nil) { image, _, error, _, _, _ in
                completion(image, error)
            }
            return nil
        }

        return base.loadImage(withURL: url, completion: completion)
    }
}