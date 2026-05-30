"""
Profiling configuration for com.levl.app (React Native / Expo app).
"""

# ── App identity ──────────────────────────────────────────────────────────────
PACKAGE         = "com.levl.app"
LAUNCH_ACTIVITY = f"{PACKAGE}/.MainActivity"

# ── Sampling (same as Lynx) ───────────────────────────────────────────────────
CPU_SAMPLE_INTERVAL_S  = 0.5
MEM_SAMPLE_INTERVAL_S  = 2.0
SCENARIO_WARMUP_S      = 2.0
SCENARIO_SETTLE_S      = 1.5
STARTUP_TIMEOUT_S      = 15.0

# ── Thresholds ────────────────────────────────────────────────────────────────
THRESHOLDS = {
    "cold_start_ms":   3000,
    "janky_frame_pct": 5.0,
    "p99_frame_ms":    50,
    "peak_pss_mb":     300,   # RN apps typically use more memory than Lynx
    "avg_cpu_pct":     40.0,
}
