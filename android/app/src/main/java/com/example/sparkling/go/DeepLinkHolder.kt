package com.example.sparkling.go

// DeepLinkHolder.kt
object DeepLinkHolder {
    var userId: String = ""
    var email:  String = ""
    var uuid:   String = ""
    var token:  String = ""
    var hasPendingVerify: Boolean = false

    fun set(userId: String, email: String, uuid: String, token: String) {
        this.userId  = userId
        this.email   = email
        this.uuid    = uuid
        this.token   = token
        this.hasPendingVerify = true
    }

    fun consume(): Map<String, String>? {
        if (!hasPendingVerify) return null
        val result = mapOf(
            "userId" to userId,
            "email"  to email,
            "uuid"   to uuid,
            "token"  to token,
        )
        hasPendingVerify = false
        return result
    }
}
