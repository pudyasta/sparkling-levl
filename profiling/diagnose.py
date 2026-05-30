#!/usr/bin/env python3
"""
Pre-flight diagnostic — run this before run_profiling.py.

Checks:
  1. Device connected
  2. Screen on and unlocked
  3. App installed and in the foreground
  4. Takes a baseline screenshot so you can confirm the app state

Usage:
    python profiling/diagnose.py
    python profiling/diagnose.py --serial emulator-5554
"""

import os, sys, re, subprocess
sys.path.insert(0, os.path.dirname(__file__))

import importlib
import adb

GREEN  = "\033[32m"; YELLOW = "\033[33m"; RED = "\033[31m"
BOLD   = "\033[1m";  RESET  = "\033[0m"

SCREENSHOT_DIR = os.path.join(os.path.dirname(__file__), "screenshots")


def screenshot(serial: str, name: str) -> str:
    os.makedirs(SCREENSHOT_DIR, exist_ok=True)
    remote = "/sdcard/_profiling_diag.png"
    local  = os.path.join(SCREENSHOT_DIR, f"{name}.png")
    adb.shell(f"screencap -p {remote}", serial)
    subprocess.run(["adb", "-s", serial, "pull", remote, local], capture_output=True)
    return local


def check(label: str, ok: bool, detail: str = "") -> bool:
    icon = f"{GREEN}✓{RESET}" if ok else f"{RED}✗{RESET}"
    print(f"  {icon}  {label}" + (f"  → {detail}" if detail else ""))
    return ok


def main() -> None:
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--serial", default=None)
    parser.add_argument(
        "--app", default="lynx", choices=["lynx", "rn"],
        help="Which app to check: lynx (default) or rn",
    )
    args = parser.parse_args()

    cfg_mod = importlib.import_module("rn_config" if args.app == "rn" else "config")
    PACKAGE         = cfg_mod.PACKAGE
    LAUNCH_ACTIVITY = cfg_mod.LAUNCH_ACTIVITY

    print(f"\n{BOLD}⚡ Lynx Profiler — Pre-flight check{RESET}\n")

    # ── Device ───────────────────────────────────────────────────────────────
    devs = adb.devices()
    if not check("ADB device connected", bool(devs),
                 f"found: {devs}" if devs else "run `adb devices`"):
        sys.exit(1)

    serial = args.serial or devs[0]
    print(f"     Using: {serial}\n")

    # ── Screen size ───────────────────────────────────────────────────────────
    w, h, nav_h = adb.get_screen_size(serial)
    print(f"  ℹ  Screen {w}×{h}  nav_bar={nav_h}px  content={h - nav_h}px\n")

    # ── Screen on ─────────────────────────────────────────────────────────────
    screen_on = adb.is_screen_on(serial)
    if not screen_on:
        print(f"  {YELLOW}⚠  Screen off — attempting wake...{RESET}")
        adb.prevent_screen_off(serial)
        adb.wake_screen(serial)
        screen_on = adb.is_screen_on(serial)

    if not check("Screen is on", screen_on,
                 "" if screen_on else "unlock manually if PIN-protected"):
        print(f"\n  {YELLOW}Tip: disable lock screen in Settings → Security for profiling.{RESET}")

    # ── App installed ─────────────────────────────────────────────────────────
    pm_out = adb.shell(f"pm list packages {PACKAGE}", serial)
    installed = PACKAGE in pm_out
    check("App installed", installed,
          PACKAGE if installed else f"install with: npm run run:android")

    if not installed:
        sys.exit(1)

    # ── App in foreground ─────────────────────────────────────────────────────
    top = adb.shell("dumpsys activity activities | grep mResumedActivity", serial)
    in_app = PACKAGE in top
    if not in_app:
        print(f"  {YELLOW}⚠  App not in foreground — launching...{RESET}")
        adb.launch(LAUNCH_ACTIVITY, serial)
        import time; time.sleep(3)
        top = adb.shell("dumpsys activity activities | grep mResumedActivity", serial)
        in_app = PACKAGE in top

    check("App is in foreground", in_app,
          "" if in_app else f"launch: adb shell am start -n {LAUNCH_ACTIVITY}")

    # ── Screenshot ────────────────────────────────────────────────────────────
    print(f"\n  Taking screenshot to verify app state...")
    path = screenshot(serial, "preflight")
    print(f"  {GREEN}✓{RESET}  Saved: {path}")
    print(f"     Open it to confirm the app is on the HOME screen, not login.\n")

    # ── Summary ───────────────────────────────────────────────────────────────
    if screen_on and installed and in_app:
        print(f"{GREEN}{BOLD}  All checks passed. Ready to run:{RESET}")
        print(f"  python profiling/run_profiling.py\n")
    else:
        print(f"{YELLOW}  Fix the issues above, then re-run diagnose.py{RESET}\n")


if __name__ == "__main__":
    main()
