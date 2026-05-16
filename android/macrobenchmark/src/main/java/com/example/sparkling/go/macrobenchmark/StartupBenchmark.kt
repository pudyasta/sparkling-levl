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
 * Measures how quickly the app reaches the first Lynx-rendered frame of the
 * main bundle under cold, warm, and hot start conditions.
 *
 * Run via:
 *   ./gradlew :macrobenchmark:connectedBenchmarkAndroidTest
 */
@RunWith(AndroidJUnit4::class)
class StartupBenchmark {

    @get:Rule
    val benchmarkRule = MacrobenchmarkRule()

    /** Process is killed before every iteration — measures full startup including Lynx init. */
    @Test
    fun coldStart() = benchmarkRule.measureRepeated(
        packageName = PACKAGE_NAME,
        metrics = listOf(StartupTimingMetric()),
        compilationMode = CompilationMode.DEFAULT,
        startupMode = StartupMode.COLD,
        iterations = 5,
    ) {
        pressHome()
        startActivityAndWait()
    }

    /** Process survives; activity is killed — measures Lynx re-init without full process start. */
    @Test
    fun warmStart() = benchmarkRule.measureRepeated(
        packageName = PACKAGE_NAME,
        metrics = listOf(StartupTimingMetric()),
        compilationMode = CompilationMode.DEFAULT,
        startupMode = StartupMode.WARM,
        iterations = 5,
    ) {
        startActivityAndWait()
    }

    /** Activity brought back to foreground — measures resume / onStart overhead. */
    @Test
    fun hotStart() = benchmarkRule.measureRepeated(
        packageName = PACKAGE_NAME,
        metrics = listOf(StartupTimingMetric()),
        compilationMode = CompilationMode.DEFAULT,
        startupMode = StartupMode.HOT,
        iterations = 5,
    ) {
        startActivityAndWait()
    }

    private companion object {
        const val PACKAGE_NAME = "com.example.sparkling.go"
    }
}
