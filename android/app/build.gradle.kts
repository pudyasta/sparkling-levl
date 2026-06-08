plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.kapt)
}

android {
    namespace = "com.example.sparkling.go"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.sparkling.go"
        minSdk = 29
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        ndk {
            abiFilters.addAll(listOf("armeabi-v7a", "arm64-v8a"))
        }
    }
    // ✅ moved out of defaultConfig
    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )

        }
        debug {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )

        }

    }

    // ✅ moved out of defaultConfig
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // ✅ moved out of defaultConfig
    kotlinOptions {
        jvmTarget = "17"
    }

    // ✅ moved out of defaultConfig
    val useNativeAssets =
        System.getenv("SPARKLING_USE_NATIVE_ASSETS")?.equals("true", ignoreCase = true) ?: false
    sourceSets {
        getByName("main").apply {
            if (useNativeAssets) {
                assets.setSrcDirs(listOf("src/main/assets"))
            } else {
                assets.setSrcDirs(listOf("../../dist"))
            }
        }
    }
}

// ✅ moved out of android block
dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.appcompat)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)

    implementation("com.tiktok.sparkling:sparkling:2.0.1")
    implementation("com.tiktok.sparkling:sparkling-method:2.0.1")
    implementation("com.squareup.okhttp3:okhttp:4.9.0")

    // SVG Package
    implementation("com.caverock:androidsvg-aar:1.4")
    implementation("io.coil-kt:coil-svg:2.6.0")
    implementation("io.coil-kt:coil:2.6.0")

    implementation(libs.fresco)
    implementation(libs.fresco.animated.gif)
    implementation(libs.fresco.animated.webp)
    implementation(libs.fresco.webp.support)
    implementation(libs.fresco.animated.base)

    // Media3 ExoPlayer
    implementation("androidx.media3:media3-exoplayer:1.3.1")
    implementation("androidx.media3:media3-ui:1.3.1")
    implementation("androidx.media3:media3-common:1.3.1")

    kapt(libs.lynx.processor)

    // BEGIN SPARKLING AUTOLINK
    listOf(
        project(":sparkling-navigation"),
        project(":sparkling-debug-tool"),
        project(":sparkling-storage")
    ).forEach { dep -> add("implementation", dep) }
    // END SPARKLING AUTOLINK
}
