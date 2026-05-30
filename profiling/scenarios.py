"""
Profiling scenarios.

Each scenario starts metric collection, prompts the user to perform
a specific action on the device, then captures all metrics when the
user presses Enter.  This is reliable regardless of UI layout because
it doesn't depend on guessed tap coordinates.

Automated taps are only used for cold-start (am start) and back-key
navigation — both of which are layout-independent ADB shell commands.
"""

import time
from dataclasses import dataclass, field
from typing import Optional

import adb
from collectors import CollectionResult, MetricCollector

# These are overridden at runtime by run_profiling.py via set_app_config()
PACKAGE         = "com.example.sparkling.go"
LAUNCH_ACTIVITY = f"{PACKAGE}/.SplashActivity"
SCENARIO_WARMUP_S   = 2.0
STARTUP_TIMEOUT_S   = 15.0

def set_app_config(package: str, launch_activity: str,
                   warmup: float = 2.0, startup_timeout: float = 15.0) -> None:
    """Call this before running any scenario to point at the correct app."""
    global PACKAGE, LAUNCH_ACTIVITY, SCENARIO_WARMUP_S, STARTUP_TIMEOUT_S
    PACKAGE           = package
    LAUNCH_ACTIVITY   = launch_activity
    SCENARIO_WARMUP_S = warmup
    STARTUP_TIMEOUT_S = startup_timeout


@dataclass
class ScenarioResult:
    name: str
    metrics: CollectionResult = field(default_factory=CollectionResult)
    extra: dict               = field(default_factory=dict)
    error: Optional[str]      = None


def _wait_for_pid(package: str, serial: Optional[str],
                  timeout: float = STARTUP_TIMEOUT_S) -> Optional[int]:
    deadline = time.time() + timeout
    while time.time() < deadline:
        pid = adb.get_pid(package, serial)
        if pid:
            return pid
        time.sleep(0.3)
    return None


def _prompt(instruction: str, detail: str = "") -> None:
    """Print a boxed instruction and wait for the user to press Enter."""
    width = 62
    print()
    print("  ┌" + "─" * width + "┐")
    for line in instruction.splitlines():
        print(f"  │  {line:<{width - 2}}│")
    if detail:
        print("  │" + " " * width + "│")
        for line in detail.splitlines():
            print(f"  │  \033[33m{line:<{width - 2}}\033[0m│")
    print("  └" + "─" * width + "┘")
    input("  ► Press Enter when ready to START collecting... ")
    print("  \033[32m● Recording\033[0m  (perform the action now)")


def _stop_prompt() -> None:
    input("  ► Press Enter when DONE with the action... ")
    print("  \033[33m■ Stopped\033[0m")


# ── Scenario 1: Cold Start ────────────────────────────────────────────────────

def scenario_cold_start(serial: Optional[str], w: int, h: int) -> ScenarioResult:
    result = ScenarioResult(name="cold_start")
    try:
        _prompt(
            "COLD START",
            "The app will be force-stopped and relaunched automatically.\n"
            "Watch the screen. Press Enter to begin.",
        )

        adb.force_stop(PACKAGE, serial)
        adb.reset_gfxinfo(PACKAGE, serial)
        time.sleep(1.0)

        collector = MetricCollector(serial)
        collector.start()

        t0 = time.time()
        adb.launch(LAUNCH_ACTIVITY, serial)

        pid = _wait_for_pid(PACKAGE, serial)
        if not pid:
            result.error = "App did not start within timeout"
            result.metrics = collector.stop()
            return result

        # Wait until first frames render
        deadline = time.time() + STARTUP_TIMEOUT_S
        while time.time() < deadline:
            gfx = adb.read_gfxinfo(PACKAGE, serial)
            if gfx.get("total_frames", 0) > 3:
                break
            time.sleep(0.3)

        t1 = time.time()
        result.extra["cold_start_ms"] = round((t1 - t0) * 1000)
        result.extra["pid"] = pid

        time.sleep(SCENARIO_WARMUP_S)
        collector.capture_gfx()
        result.metrics = collector.stop()

    except Exception as e:
        result.error = str(e)
    return result


# ── Scenario 2: Tab Navigation ────────────────────────────────────────────────

def scenario_tab_navigation(serial: Optional[str], w: int, h: int) -> ScenarioResult:
    result = ScenarioResult(name="tab_navigation")
    try:
        _prompt(
            "TAB NAVIGATION  — do this when recording starts:",
            "1. Tap  Courses  tab\n"
            "2. Tap  Ranking  tab\n"
            "3. Tap  Profile  tab\n"
            "4. Tap  Home     tab\n"
            "Repeat the cycle once more (8 taps total), then press Enter.",
        )

        adb.reset_gfxinfo(PACKAGE, serial)
        collector = MetricCollector(serial)
        collector.start()

        _stop_prompt()

        collector.capture_gfx()
        result.metrics = collector.stop()

    except Exception as e:
        result.error = str(e)
    return result


# ── Scenario 3: Courses List Scroll ──────────────────────────────────────────

def scenario_scroll_courses(serial: Optional[str], w: int, h: int) -> ScenarioResult:
    result = ScenarioResult(name="scroll_courses")
    try:
        _prompt(
            "SCROLL COURSES  — do this when recording starts:",
            "1. Navigate to the Courses tab\n"
            "2. Scroll DOWN slowly to the bottom of the list\n"
            "3. Scroll UP back to the top\n"
            "Repeat 3×, then press Enter.",
        )

        adb.reset_gfxinfo(PACKAGE, serial)
        collector = MetricCollector(serial)
        collector.start()

        _stop_prompt()

        collector.capture_gfx()
        result.metrics = collector.stop()
        result.extra["smoothness_score"] = round(
            max(0, 100 - result.metrics.gfx_summary.get("janky_pct", 100) * 2), 1
        )

    except Exception as e:
        result.error = str(e)
    return result


# ── Scenario 4: Course Detail Load ───────────────────────────────────────────

def scenario_course_detail(serial: Optional[str], w: int, h: int) -> ScenarioResult:
    result = ScenarioResult(name="course_detail")
    try:
        _prompt(
            "COURSE DETAIL  — do this when recording starts:",
            "1. Go to Courses tab\n"
            "2. Tap any course card to open its detail page\n"
            "3. Wait for the page to fully load\n"
            "4. Press Back to return\n"
            "Repeat 3×, then press Enter.",
        )

        adb.reset_gfxinfo(PACKAGE, serial)
        t0 = time.time()
        collector = MetricCollector(serial)
        collector.start()

        _stop_prompt()

        t1 = time.time()
        collector.capture_gfx()
        result.metrics = collector.stop()
        result.extra["total_duration_ms"] = round((t1 - t0) * 1000)

    except Exception as e:
        result.error = str(e)
    return result


# ── Scenario 5: Memory Stress ─────────────────────────────────────────────────

def scenario_memory_stress(serial: Optional[str], w: int, h: int) -> ScenarioResult:
    result = ScenarioResult(name="memory_stress")
    try:
        initial_mem = adb.read_meminfo(PACKAGE, serial)

        _prompt(
            "MEMORY STRESS  — do this when recording starts:",
            "Navigate through ALL tabs 3 times:\n"
            "  Home → Courses → Ranking → Profile → Home  (×3)\n"
            "Then open 3 different course detail pages.\n"
            "Press Enter when done.",
        )

        collector = MetricCollector(serial)
        collector.start()

        _stop_prompt()

        final_mem = adb.read_meminfo(PACKAGE, serial)
        result.metrics = collector.stop()

        initial_mb = initial_mem.get("total_pss", 0) / 1024
        final_mb   = final_mem.get("total_pss",   0) / 1024
        result.extra["initial_pss_mb"] = round(initial_mb, 2)
        result.extra["final_pss_mb"]   = round(final_mb,   2)
        result.extra["growth_mb"]      = round(final_mb - initial_mb, 2)

    except Exception as e:
        result.error = str(e)
    return result


# ── Scenario 6: Idle Baseline ─────────────────────────────────────────────────

def scenario_idle(serial: Optional[str], w: int, h: int) -> ScenarioResult:
    result = ScenarioResult(name="idle_baseline")
    try:
        _prompt(
            "IDLE BASELINE",
            "Put the app on the Home tab.\n"
            "Do NOT touch the device for 15 seconds after pressing Enter.",
        )

        adb.reset_gfxinfo(PACKAGE, serial)
        collector = MetricCollector(serial)
        collector.start()

        # Countdown so the user can see progress
        for i in range(15, 0, -1):
            print(f"  \r  Idle... {i:2d}s remaining ", end="", flush=True)
            time.sleep(1)
        print()

        collector.capture_gfx()
        result.metrics = collector.stop()

    except Exception as e:
        result.error = str(e)
    return result


# ── Registry ──────────────────────────────────────────────────────────────────

ALL_SCENARIOS: dict = {
    "cold_start":     scenario_cold_start,
    "tab_navigation": scenario_tab_navigation,
    "scroll_courses": scenario_scroll_courses,
    "course_detail":  scenario_course_detail,
    "memory_stress":  scenario_memory_stress,
    "idle_baseline":  scenario_idle,
}
