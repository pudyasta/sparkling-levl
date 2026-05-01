// Copyright 2025 The Sparkling Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.

import Foundation
import SparklingMethod

// Auto-generated temporary model types
// Parameter model
@objc(SPKPickFileMethodParamModel)
public class SPKPickFileMethodParamModel: SPKMethodModel {
    @objc public var : 

    @objc public override class func requiredKeyPaths() -> Set<String>? {
        return nil
    }

    @objc public override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return {
            "": "",
        }()
    }
}

// Result model
@objc(SPKPickFileMethodResultModel)
public class SPKPickFileMethodResultModel: SPKMethodModel {
    @objc public var : 

    @objc public override class func jsonKeyPathsByPropertyKey() -> [AnyHashable: Any] {
        return {
            "": "",
        }()
    }
}

// Main method class
@objc(SPKPickFileMethod)
public class SPKPickFileMethod: PipeMethod {
    @objc public override var paramsModelClass: AnyClass {
        return SPKPickFileMethodParamModel.self
    }

    @objc public override var resultModelClass: AnyClass {
        return SPKPickFileMethodResultModel.self
    }

    public override var methodName: String {
        return "Filepicker.pickFile"
    }

    public override class func methodName() -> String {
        return "Filepicker.pickFile"
    }
}
