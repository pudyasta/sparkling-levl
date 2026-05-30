#!/usr/bin/env python3
"""
Android performance profiler for sparkling-levl.
Supports both the Lynx app and the React Native (Expo) app.

Usage
─────
  # Lynx app (default)
  python profiling/run_profiling.py
  python profiling/run_profiling.py --app lynx --scenario scroll_courses

  # React Native app
  python profiling/run_profiling.py --app rn
  python profiling/run_profiling.py --app rn --scenario cold_start

  # Specific device
  python profiling/run_profiling.py --app rn --serial emulator-5554

Available scenarios (same for both apps)
─────────────────────────────────────────
  cold_start      Cold launch → first stable frame
  tab_navigation  Cycle through Home / Courses / Ranking / Profile tabs
  scroll_courses  Scroll the Courses list
  course_detail   Open a course detail page
  memory_stress   Navigate all screens 3× (leak detection)
  idle_baseline   15 s idle (CPU/memory baseline)

Requirements
────────────
  - Python 3.10+
  - adb in PATH (Android Platform Tools)
  - Device/emulator connected and unlocked
  - Target app installed on device
"""

import argparse
import importlib
import os
import sys
import time
from datetime import datetime
from typing import Optional

sys.path.insert(0, os.path.dirname(__file__))

import adb
import reporter
from scenarios import ALL_SCENARIOS, ScenarioResult, set_app_config

# ── ANSI colours ──────────────────────────────────────────────────────────────
try:
    import ctypes
    ctypes.windll.kernel32.SetConsoleMode(
        ctypes.windll.kernel32.GetStdHandle(-11), 7)
except Exception:
    pass

GREEN  = "\033[32m"; YELLOW = "\033[33m"; RED  = "\033[31m"
CYAN   = "\033[36m"; BOLD   = "\033[1m";  RESET = "\033[0m"

def _c(color: str, text: str) -> str:
    return f"{color}{text}{RESET}"


# ── Config loader ─────────────────────────────────────────────────────────────

APP_LABELS = {"lynx": "Lynx (Sparkling)", "rn": "React Native (Expo)"}

def load_app_config(app: str) -> dict:
    """Import the right config module and return it as a dict."""
    mod = importlib.import_module("rn_config" if app == "rn" else "config")
    return {k: getattr(mod, k) for k in dir(mod) if not k.startswith("_")}


# ── Pre-flight ────────────────────────────────────────────────────────────────

def preflight(serial: Optional[str], cfg: dict) -> bool:
    package = cfg["PACKAGE"]
    print(_c(CYAN, f"\n── Pre-flight  [{APP_LABELS[cfg.get('_APP', 'lynx')]}] ──"))

    try:
        devices = adb.devices()
    except FileNotFoundError:
        print(_c(RED, "  ✗ adb not found in PATH"))
        return False

    if not devices:
        print(_c(RED, "  ✗ No devices connected"))
        return False
    if serial and serial not in devices:
        print(_c(RED, f"  ✗ Device {serial!r} not found. Available: {devices}"))
        return False

    target = serial or devices[0]
    print(_c(GREEN, f"  ✓ Device: {target}"))

    out = adb.shell(f"pm list packages {package}", target)
    if package not in out:
        print(_c(RED, f"  ✗ Package {package} not installed"))
        return False
    print(_c(GREEN, f"  ✓ Package: {package}"))

    adb.prevent_screen_off(target)
    print(_c(YELLOW, "  ↑ Waking screen..."))
    adb.wake_screen(target)

    if not adb.is_screen_on(target):
        print(_c(RED, "  ✗ Screen still off — unlock manually (PIN?) then retry"))
        return False

    print(_c(GREEN, "  ✓ Screen on"))
    return True


# ── Runner ────────────────────────────────────────────────────────────────────

def run_scenario(name: str, serial: Optional[str], cfg: dict) -> ScenarioResult:
    fn = ALL_SCENARIOS[name]
    w, h, nav_h = adb.get_screen_size(serial)
    content_h = h - nav_h

    print(f"\n  {_c(CYAN, '►')} {name}  [{w}×{h}] content={content_h}px", flush=True)

    adb.wake_screen(serial)

    pid = adb.get_pid(cfg["PACKAGE"], serial)
    if not pid and name != "cold_start":
        adb.launch(cfg["LAUNCH_ACTIVITY"], serial)
        time.sleep(3.0)

    result = fn(serial, w, content_h)

    if result.error:
        print(f"    {_c(RED, '✗')} Error: {result.error}")
    else:
        m = result.metrics
        print(
            f"    CPU avg {_c(BOLD, f'{m.cpu_avg}%')}  peak {m.cpu_max}%  |  "
            f"PSS peak {_c(BOLD, f'{m.mem_peak_mb} MB')}  |  "
            f"Janky {m.gfx_summary.get('janky_pct', 0):.1f}%  "
            f"P99 {m.gfx_summary.get('p99_ms', '?')} ms"
        )
        extra_str = "  ".join(f"{k}={v}" for k, v in result.extra.items())
        if extra_str:
            print(f"    {_c(YELLOW, extra_str)}")

    return result


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="sparkling-levl Android performance profiler",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--app", default="lynx", choices=["lynx", "rn"],
        help="Which app to profile: lynx (Sparkling) or rn (React Native/Expo). Default: lynx",
    )
    parser.add_argument(
        "--scenario", default="all",
        choices=["all"] + list(ALL_SCENARIOS.keys()),
        help="Scenario to run (default: all)",
    )
    parser.add_argument("--serial", default=None, help="ADB device serial")
    parser.add_argument("--out",    default=None, help="Output directory")
    args = parser.parse_args()

    cfg = load_app_config(args.app)
    cfg["_APP"] = args.app

    # Inject the chosen app's constants into scenarios module
    set_app_config(
        package=cfg["PACKAGE"],
        launch_activity=cfg["LAUNCH_ACTIVITY"],
        warmup=cfg.get("SCENARIO_WARMUP_S", 2.0),
        startup_timeout=cfg.get("STARTUP_TIMEOUT_S", 15.0),
    )

    serial: Optional[str] = args.serial

    label = APP_LABELS[args.app]
    print(_c(BOLD, f"\n⚡ sparkling-levl Performance Profiler — {label}"))
    print("─" * 52)

    if not preflight(serial, cfg):
        sys.exit(1)

    if not serial:
        serial = adb.devices()[0]

    scenarios_to_run = (
        list(ALL_SCENARIOS.keys()) if args.scenario == "all"
        else [args.scenario]
    )
    print(f"\n{_c(BOLD, 'Scenarios:')} {', '.join(scenarios_to_run)}")

    results: list[ScenarioResult] = []
    t_total = time.time()

    for name in scenarios_to_run:
        results.append(run_scenario(name, serial, cfg))

    elapsed = round(time.time() - t_total, 1)
    print(f"\n{_c(GREEN, '✓')} Completed {len(results)} scenario(s) in {elapsed}s")

    # ── Output ────────────────────────────────────────────────────────────────
    stamp   = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = args.out or os.path.join(
        os.path.dirname(__file__), "results", f"{args.app}_{stamp}"
    )
    os.makedirs(out_dir, exist_ok=True)
    print(f"\n{_c(CYAN, '── Writing reports ──')}")

    json_path = os.path.join(out_dir, "profiling_data.json")
    html_path = os.path.join(out_dir, "profiling_report.html")
    reporter.write_json(results, json_path)
    reporter.write_html(results, html_path)

    # ── Threshold summary ─────────────────────────────────────────────────────
    thresholds = cfg.get("THRESHOLDS", {})
    print(f"\n{_c(BOLD, '── Threshold Summary ──')}")
    checks: list[str] = []
    for r in results:
        if r.error:
            continue
        m = r.metrics

        def chk(label: str, val: float, key: str) -> None:
            thresh = thresholds.get(key, float("inf"))
            ok     = val <= thresh
            color  = GREEN if ok else RED
            checks.append(
                f"  [{r.name}] {label}: {val} — {_c(color, 'PASS' if ok else 'FAIL')} (≤{thresh})"
            )

        chk("avg_cpu",   m.cpu_avg,   "avg_cpu_pct")
        chk("peak_pss",  m.mem_peak_mb, "peak_pss_mb")
        chk("janky_%",   m.gfx_summary.get("janky_pct", 0), "janky_frame_pct")
        if r.name == "cold_start" and r.extra.get("cold_start_ms"):
            chk("cold_start", r.extra["cold_start_ms"], "cold_start_ms")

    for c in checks:
        print(c)

    fails = [c for c in checks if "FAIL" in c]
    print(f"\n{'❌' if fails else '✅'}  {len(checks) - len(fails)}/{len(checks)} checks passed")
    print(f"\n📊 Open report: {os.path.abspath(html_path)}\n")


if __name__ == "__main__":
    main()
