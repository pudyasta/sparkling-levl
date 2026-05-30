"""
Profiling configuration for com.example.sparkling.go (Lynx / Sparkling app).
Adjust COORDS if screen resolution differs from 1080x2400.
"""

# ── App identity ──────────────────────────────────────────────────────────────
PACKAGE = "com.example.sparkling.go"
LAUNCH_ACTIVITY = f"{PACKAGE}/.SplashActivity"

# ── Sampling ──────────────────────────────────────────────────────────────────
CPU_SAMPLE_INTERVAL_S  = 0.5   # seconds between CPU samples
MEM_SAMPLE_INTERVAL_S  = 2.0   # seconds between memory samples
SCENARIO_WARMUP_S      = 2.0   # wait after launching before sampling starts
SCENARIO_SETTLE_S      = 1.5   # wait after each interaction before capturing
STARTUP_TIMEOUT_S      = 15.0  # max time to wait for app to appear after launch

# ── Thresholds (used in report pass/fail) ────────────────────────────────────
THRESHOLDS = {
    "cold_start_ms":        3000,   # ms – cold start budget
    "janky_frame_pct":      5.0,    # % – acceptable janky-frame ratio
    "p99_frame_ms":         50,     # ms – 99th-pct frame budget
    "peak_pss_mb":          250,    # MB – peak PSS budget
    "avg_cpu_pct":          40.0,   # % – average CPU during scroll
}
