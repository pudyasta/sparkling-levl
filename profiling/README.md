# Lynx Android Performance Profiler

Automated CPU, memory, and frame-rate profiling for the
`com.example.sparkling.go` (sparkling-levl) Lynx app.

## Requirements

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Android Platform Tools (`adb`) | any recent |
| Connected Android device or emulator | API 29+ |

The app must already be **installed** on the device.

## Quick Start

```bash
# Run all 6 scenarios
python profiling/run_profiling.py

# Run one scenario
python profiling/run_profiling.py --scenario scroll_courses

# Target a specific device
python profiling/run_profiling.py --serial emulator-5554

# Custom output folder
python profiling/run_profiling.py --out profiling/results/baseline
```

Reports are written to `profiling/results/<timestamp>/`:
- `profiling_data.json` — raw samples + derived stats (CI-friendly)
- `profiling_report.html` — self-contained dashboard with charts

## Scenarios

| Name | What it measures |
|------|-----------------|
| `cold_start` | Kill → launch → first stable frame. Reports `cold_start_ms`. |
| `tab_navigation` | Cycles Home → Courses → Leaderboard → Profile × 2. FPS per tab switch. |
| `scroll_courses` | 5 × up/down scroll on the Courses list. Jank rate and smoothness score. |
| `course_detail` | Tap first course card → detail load time + transition FPS. |
| `memory_stress` | Navigate all screens × 3. Compares initial vs final PSS to surface leaks. |
| `idle_baseline` | 10 s idle on Home tab. Baseline CPU and memory. |

## Collected Metrics

### CPU (`/proc/<pid>/stat` sampled every 500 ms)
- `avg_pct`, `max_pct` — average and peak CPU percentage
- Time-series samples for charting

### Memory (`dumpsys meminfo` sampled every 2 s)
- `total_pss` — RSS shared/private (most meaningful single number)
- `java_heap`, `native_heap`, `graphics` breakdown
- `peak_mb`, `avg_mb`, `growth_mb` (memory stress)

### Frame Rate (`dumpsys gfxinfo` + `framestats`)
- `total_frames`, `janky_frames`, `janky_pct`
- P50 / P90 / P95 / P99 frame durations (ms) from raw `framestats`
- Frame-time histogram in the HTML report

## Pass/Fail Thresholds

Thresholds are defined in `config.py` and printed in the console summary:

| Metric | Default budget |
|--------|---------------|
| Cold start | ≤ 3000 ms |
| Janky frames | ≤ 5 % |
| P99 frame time | ≤ 50 ms |
| Peak PSS | ≤ 250 MB |
| Average CPU | ≤ 40 % |

Edit `THRESHOLDS` in `config.py` to adjust for your target device.

## Screen Coordinates

The runner uses **fractional coordinates** (0.0–1.0 of screen W×H) so it
works on any resolution. Default layout assumes the Sparkling bottom-nav bar
is at ~95% screen height. If your app uses a different layout, edit `COORDS`
in `config.py`.

## File Layout

```
profiling/
  config.py         ← package name, coords, thresholds
  adb.py            ← ADB shell wrappers (CPU/mem/gfx reads)
  collectors.py     ← Background sampling threads
  scenarios.py      ← 6 interaction scenarios
  reporter.py       ← JSON + HTML report generation
  run_profiling.py  ← CLI entry point
  results/          ← Output (gitignored)
```
