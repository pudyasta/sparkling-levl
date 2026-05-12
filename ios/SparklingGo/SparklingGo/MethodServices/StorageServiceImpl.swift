// Storage bridge intentionally omitted in this minimal template.
import Foundation
import SparklingMethod
import Sparkling_Storage

let sampleSuiteName = "com.SPK.custom.userdefault"

class StorageServiceImpl: StorageService {
    
    private let userDefaults = UserDefaults(suiteName: sampleSuiteName) ?? UserDefaults.standard
    
    func setObject(key: String, value: NSDictionary) {
        userDefaults.set(value, forKey: key)
    }
    
    func object(forKey key: String) -> Any? {
        return userDefaults.object(forKey: key)
    }
    
    func removeObject(forKey key: String) {
        userDefaults.removeObject(forKey: key)
    }
}
