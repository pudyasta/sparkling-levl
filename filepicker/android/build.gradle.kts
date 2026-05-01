plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "org.sparkling.filepicker"
    compileSdk = 34

    defaultConfig {
        minSdk = 23
    }
}

// Add dependencies required by your module.
