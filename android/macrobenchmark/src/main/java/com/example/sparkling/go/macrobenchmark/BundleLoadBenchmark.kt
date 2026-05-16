package com.example.sparkling.go.macrobenchmark

import androidx.benchmark.macro.CompilationMode
import androidx.benchmark.macro.StartupMode
import androidx.benchmark.macro.StartupTimingMetric
import androidx.benchmark.macro.junit4.MacrobenchmarkRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Measures Lynx bundle load latency through [LoadingActivity].
 *
 * Two scenarios are covered:
 * - **cold**: process killed between iterations → no in-memory cache → exercises the
 *   full asset-lookup → remote-download → Lynx-render path.
 * - **warm**: process survives → [BuiltinTemplateProvider.cache] is populated after
 *   the setupBlock → exercises the cache-hit → Lynx-render path only.
 *
 * Change BUNDLE_SCHEME to target a different entry point (e.g. lessons, quiz).
 *
 * Run via:
 *   ./gradlew :macrobenchmark:connectedBenchmarkAndroidTest
 */
@RunWith(AndroidJUnit4::class)
class BundleLoadBenchmark {

    @get:Rule
    val benchmarkRule = MacrobenchmarkRule()

    /**
     * Cold load: fresh process, cache empty.
     * Measures asset lookup + optional remote download + first Lynx frame.
     */
    @Test
    fun bundleLoadCold() = benchmarkRule.measureRepeated(
        packageName = PACKAGE_NAME,
        metrics = listOf(StartupTimingMetric()),
        compilationMode = CompilationMode.DEFAULT,
        startupMode = StartupMode.COLD,
        iterations = 3,
    ) {
        pressHome()
        startActivityAndWait {
            setClassName(PACKAGE_NAME, "$PACKAGE_NAME.LoadingActivity")
            putExtra("scheme", BUNDLE_SCHEME)
        }
    }

    /**
     * Warm load: process alive, bundle already cached from setupBlock.
     * Isolates the Lynx render time from network/asset I/O.
     */
    @Test
    fun bundleLoadWarm() = benchmarkRule.measureRepeated(
        packageName = PACKAGE_NAME,
        metrics = listOf(StartupTimingMetric()),
        compilationMode = CompilationMode.DEFAULT,
        startupMode = StartupMode.WARM,
        iterations = 5,
        setupBlock = {
            // Pre-populate the in-memory cache so measureBlock only tests render time.
            startActivityAndWait {
                setClassName(PACKAGE_NAME, "$PACKAGE_NAME.LoadingActivity")
                putExtra("scheme", BUNDLE_SCHEME)
            }
            pressHome()
        },
    ) {
        startActivityAndWait {
            setClassName(PACKAGE_NAME, "$PACKAGE_NAME.LoadingActivity")
            putExtra("scheme", BUNDLE_SCHEME)
        }
    }

    private companion object {
        const val PACKAGE_NAME = "com.example.sparkling.go"
        const val BUNDLE_SCHEME =
            "hybrid://lynxview_page?bundle=courseDetail.lynx.bundle"
    }
}
