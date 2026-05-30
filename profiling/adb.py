"""
Thin ADB wrapper — all subprocess calls live here.
"""

import subprocess
import time
import re
from typing import Optional


def _run_list(args: list[str], timeout: int = 10) -> str:
    """Run a command as a list (no shell interpretation). Returns stdout stripped."""
    result = subprocess.run(args, capture_output=True, text=True, timeout=timeout)
    return result.stdout.strip()


def devices() -> list[str]:
    """Return list of connected device serials."""
    out = _run_list(["adb", "devices"])
    lines = [l.split("\t")[0] for l in out.splitlines()[1:] if "\tdevice" in l]
    return lines


def shell(cmd: str, serial: Optional[str] = None, timeout: int = 10) -> str:
    """
    Run `cmd` on the Android device shell.
    The command string (including any pipes) is passed as a single argument
    to `adb shell`, so the *Android* shell interprets pipes — not Windows cmd.
    """
    args = ["adb"]
    if serial:
        args += ["-s", serial]
    args += ["shell", cmd]
    return _run_list(args, timeout=timeout)


def get_screen_size(serial: Optional[str] = None) -> tuple[int, int, int]:
    """
    Return (width, height, nav_bar_height) in pixels.
    height is the PHYSICAL screen height; subtract nav_bar_height to get
    the usable content area where the Lynx app is rendered.
    """
    out = shell("wm size", serial)
    # Prefer "Physical size: WxH", fall back to bare match
    m = re.search(r"Physical size:\s*(\d+)x(\d+)", out) or re.search(r"(\d+)x(\d+)", out)
    w, h = (int(m.group(1)), int(m.group(2))) if m else (1080, 2400)

    nav_h = 0
    nav_out = shell("dumpsys window displays | grep NavigationBar", serial)
    nm = re.search(r"frame=\[.*?\]\[(\d+),(\d+)\]\[(\d+),(\d+)\]", nav_out)
    if nm:
        nav_h = int(nm.group(4)) - int(nm.group(2))

    return w, h, nav_h


def is_screen_on(serial: Optional[str] = None) -> bool:
    """Return True if the display is awake (works across Android versions)."""
    out = shell("dumpsys power", serial)
    # Android 5–14: mWakefulness=Awake  (most reliable)
    # Some older ROMs: Display Power: state=ON
    return "mWakefulness=Awake" in out or "Display Power: state=ON" in out


def wake_screen(serial: Optional[str] = None) -> None:
    """
    Wake the device and dismiss the lock screen (swipe/no-PIN only).
    Tries three escalating methods so it works on most Android versions.
    """
    # 1. KEYCODE_WAKEUP — works on API 20+ when screen is truly off
    shell("input keyevent 224", serial)
    time.sleep(0.5)

    # 2. Fallback: KEYCODE_POWER toggle if still asleep
    if not is_screen_on(serial):
        shell("input keyevent 26", serial)
        time.sleep(0.6)

    # 3. Dismiss keyguard (swipe lock / no-PIN)
    #    wm dismiss-keyguard works on API 23+ without a PIN/pattern
    shell("wm dismiss-keyguard", serial)
    time.sleep(0.4)

    # 4. Swipe-up gesture as last resort for swipe-lock screens
    shell("input swipe 540 1600 540 800 300", serial)
    time.sleep(0.4)


def prevent_screen_off(serial: Optional[str] = None) -> None:
    """Set screen timeout to 30 minutes so it stays on during the full profiling run."""
    shell("settings put system screen_off_timeout 1800000", serial)


def get_pid(package: str, serial: Optional[str] = None) -> Optional[int]:
    out = shell(f"pidof {package}", serial)
    nums = [t for t in out.split() if t.isdigit()]
    return int(nums[0]) if nums else None


def force_stop(package: str, serial: Optional[str] = None) -> None:
    shell(f"am force-stop {package}", serial)
    time.sleep(0.5)


def launch(activity: str, serial: Optional[str] = None) -> None:
    shell(f"am start -n {activity}", serial)


def tap(x: int, y: int, serial: Optional[str] = None) -> None:
    shell(f"input tap {x} {y}", serial)


def swipe(x1: int, y1: int, x2: int, y2: int, duration_ms: int = 600,
          serial: Optional[str] = None) -> None:
    shell(f"input swipe {x1} {y1} {x2} {y2} {duration_ms}", serial)


def keyevent(code: int, serial: Optional[str] = None) -> None:
    shell(f"input keyevent {code}", serial)


# ── CPU sampling via /proc ─────────────────────────────────────────────────────

def read_cpu_stat(pid: int, serial: Optional[str] = None) -> Optional[tuple[int, int]]:
    """
    Read (process_ticks, total_ticks) from /proc.
    Returns None if the process no longer exists.
    """
    proc = shell(f"cat /proc/{pid}/stat 2>/dev/null", serial)
    sys_stat_raw = shell("cat /proc/stat", serial)
    # Take only the first line (overall CPU) — avoids a pipe which cmd.exe would intercept
    sys_stat = sys_stat_raw.splitlines()[0] if sys_stat_raw else ""
    if not proc or not sys_stat:
        return None
    fields = proc.split()
    if len(fields) < 15:
        return None
    proc_ticks = sum(int(fields[i]) for i in (13, 14, 15, 16))  # utime+stime+cutime+cstime
    cpu_fields = sys_stat.split()[1:]
    total_ticks = sum(int(f) for f in cpu_fields if f.isdigit())
    return proc_ticks, total_ticks


def cpu_percent(prev: tuple[int, int], curr: tuple[int, int]) -> float:
    """Compute CPU% between two snapshots."""
    d_proc  = curr[0] - prev[0]
    d_total = curr[1] - prev[1]
    if d_total == 0:
        return 0.0
    return round(100.0 * d_proc / d_total, 2)


# ── Memory ─────────────────────────────────────────────────────────────────────

def read_meminfo(package: str, serial: Optional[str] = None) -> dict[str, int]:
    """
    Parse `dumpsys meminfo <package>` and return a dict of KB values:
      java_heap, native_heap, code, stack, graphics, private_other, system, total_pss
    """
    out = shell(f"dumpsys meminfo {package}", serial, timeout=15)
    metrics: dict[str, int] = {}

    patterns = {
        "java_heap":     r"Java Heap:\s+(\d+)",
        "native_heap":   r"Native Heap:\s+(\d+)",
        "code":          r"Code:\s+(\d+)",
        "stack":         r"Stack:\s+(\d+)",
        "graphics":      r"Graphics:\s+(\d+)",
        "private_other": r"Private Other:\s+(\d+)",
        "system":        r"System:\s+(\d+)",
        "total_pss":     r"TOTAL PSS:\s+(\d+)",
    }
    for key, pat in patterns.items():
        m = re.search(pat, out)
        metrics[key] = int(m.group(1)) if m else 0
    return metrics


# ── GFX info (frame rate) ──────────────────────────────────────────────────────

def reset_gfxinfo(package: str, serial: Optional[str] = None) -> None:
    shell(f"dumpsys gfxinfo {package} reset", serial)


def read_gfxinfo(package: str, serial: Optional[str] = None) -> dict:
    """
    Parse `dumpsys gfxinfo <package>` summary section.
    Returns dict with: total_frames, janky_frames, janky_pct,
                        p50_ms, p90_ms, p95_ms, p99_ms
    """
    out = shell(f"dumpsys gfxinfo {package}", serial, timeout=15)
    result: dict = {}

    m = re.search(r"Total frames rendered:\s+(\d+)", out)
    result["total_frames"] = int(m.group(1)) if m else 0

    m = re.search(r"Janky frames:\s+(\d+)\s+\(([\d.]+)%\)", out)
    if m:
        result["janky_frames"] = int(m.group(1))
        result["janky_pct"]    = float(m.group(2))
    else:
        result["janky_frames"] = 0
        result["janky_pct"]    = 0.0

    for pct, key in [(50, "p50_ms"), (90, "p90_ms"), (95, "p95_ms"), (99, "p99_ms")]:
        m = re.search(rf"{pct}th percentile:\s+(\d+)ms", out)
        result[key] = int(m.group(1)) if m else 0

    return result


def read_framestats(package: str, serial: Optional[str] = None) -> list[float]:
    """
    Return list of frame durations (ms) from framestats PROFILEDATA block.
    Uses VSYNC_TIMESTAMP and FRAME_COMPLETED columns (indices 1 and last usable).
    """
    out = shell(f"dumpsys gfxinfo {package} framestats", serial, timeout=20)
    durations: list[float] = []
    in_block = False
    for line in out.splitlines():
        if "---PROFILEDATA---" in line:
            in_block = True
            continue
        if "---END---" in line:
            break
        if not in_block:
            continue
        parts = line.split(",")
        # columns: Flags, IntendedVsync, Vsync, OldestInputEvent, NewestInputEvent,
        #          HandleInputStart, AnimationStart, PerformTraversalsStart, DrawStart,
        #          SyncQueued, SyncStart, IssueDrawCommandsStart,
        #          SwapBuffers, FrameCompleted, DequeueBufferDuration, QueueBufferDuration
        if len(parts) < 14 or not parts[0].strip().isdigit():
            continue
        try:
            intended = int(parts[1])
            completed = int(parts[13])
            ms = (completed - intended) / 1_000_000.0
            if 0 < ms < 2000:  # sanity filter
                durations.append(ms)
        except (ValueError, IndexError):
            continue
    return durations
