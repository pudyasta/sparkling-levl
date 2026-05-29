import Foundation

final class DeepLinkHolder {
    static let shared = DeepLinkHolder()
    private init() {}

    private(set) var userId: String = ""
    private(set) var email: String = ""
    private(set) var uuid: String = ""
    private(set) var token: String = ""
    private(set) var hasPendingVerify: Bool = false

    func set(userId: String, email: String, uuid: String, token: String) {
        self.userId = userId
        self.email = email
        self.uuid = uuid
        self.token = token
        self.hasPendingVerify = true
    }

    func consume() -> [String: String]? {
        guard hasPendingVerify else { return nil }
        let result = [
            "userId": userId,
            "email":  email,
            "uuid":   uuid,
            "token":  token,
        ]
        hasPendingVerify = false
        return result
    }
}
