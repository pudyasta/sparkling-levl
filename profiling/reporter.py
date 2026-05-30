"""
Report generator — writes JSON (machine-readable) + HTML (human-readable).
"""

import json
import math
import os
import statistics
from datetime import datetime
from typing import Any

from config import THRESHOLDS
from scenarios import ScenarioResult


# ── Helpers ───────────────────────────────────────────────────────────────────

def _percentile(data: list[float], p: float) -> float:
    if not data:
        return 0.0
    sorted_data = sorted(data)
    idx = (p / 100) * (len(sorted_data) - 1)
    lo, hi = int(idx), min(int(idx) + 1, len(sorted_data) - 1)
    return round(sorted_data[lo] + (sorted_data[hi] - sorted_data[lo]) * (idx - lo), 2)


def _pass_fail(value: float, threshold: float, lower_is_better: bool = True) -> str:
    ok = value <= threshold if lower_is_better else value >= threshold
    return "PASS" if ok else "FAIL"


def _badge(status: str) -> str:
    color = "#22c55e" if status == "PASS" else "#ef4444"
    return f'<span style="background:{color};color:#fff;border-radius:4px;padding:2px 8px;font-size:12px">{status}</span>'


# ── JSON export ───────────────────────────────────────────────────────────────

def to_dict(results: list[ScenarioResult]) -> dict:
    out: dict[str, Any] = {
        "generated_at": datetime.now().isoformat(),
        "thresholds": THRESHOLDS,
        "scenarios": {},
    }
    for r in results:
        m = r.metrics
        frames = m.frame_durations
        out["scenarios"][r.name] = {
            "error": r.error,
            "extra": r.extra,
            "cpu": {
                "avg_pct": m.cpu_avg,
                "max_pct": m.cpu_max,
                "samples": [{"t": round(s.timestamp, 3), "cpu": s.cpu_pct}
                             for s in m.cpu_samples],
            },
            "memory": {
                "peak_mb": m.mem_peak_mb,
                "avg_mb":  m.mem_avg_mb,
                "samples": [{"t": round(s.timestamp, 3),
                              "pss_mb": round(s.total_pss_kb / 1024, 2),
                              "java_mb": round(s.java_heap_kb / 1024, 2),
                              "native_mb": round(s.native_heap_kb / 1024, 2),
                              "graphics_mb": round(s.graphics_kb / 1024, 2)}
                             for s in m.mem_samples],
            },
            "fps": {
                **m.gfx_summary,
                "frame_count": len(frames),
                "p50_raw_ms":  _percentile(frames, 50),
                "p90_raw_ms":  _percentile(frames, 90),
                "p95_raw_ms":  _percentile(frames, 95),
                "p99_raw_ms":  _percentile(frames, 99),
                "avg_ms":      round(statistics.mean(frames), 2) if frames else 0,
                "stddev_ms":   round(statistics.stdev(frames), 2) if len(frames) > 1 else 0,
            },
        }
    return out


def write_json(results: list[ScenarioResult], path: str) -> None:
    data = to_dict(results)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"  JSON → {path}")


# ── HTML report ───────────────────────────────────────────────────────────────

_HTML_TEMPLATE = """\
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Lynx Performance Report — {date}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<style>
  body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
         background: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }}
  h1   {{ font-size: 1.6rem; margin-bottom: 4px; }}
  h2   {{ font-size: 1.1rem; color: #475569; margin: 28px 0 12px; }}
  h3   {{ font-size: 0.95rem; color: #64748b; margin: 16px 0 6px; }}
  .meta {{ color: #64748b; font-size: 0.85rem; margin-bottom: 24px; }}
  .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }}
  .card {{ background: #fff; border-radius: 12px; padding: 16px;
           box-shadow: 0 1px 4px rgba(0,0,0,0.08); }}
  .stat-row {{ display: flex; justify-content: space-between; align-items: center;
               padding: 6px 0; border-bottom: 1px solid #f1f5f9; }}
  .stat-row:last-child {{ border-bottom: none; }}
  .stat-label {{ color: #64748b; font-size: 0.88rem; }}
  .stat-value {{ font-weight: 600; font-size: 0.95rem; }}
  .scenario-header {{ display: flex; align-items: center; gap: 10px; margin: 32px 0 16px; }}
  .scenario-name {{ font-size: 1.2rem; font-weight: 700; text-transform: capitalize;
                    background: #e0f2fe; color: #0369a1; border-radius: 6px;
                    padding: 4px 12px; }}
  .error {{ background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
            padding: 12px; color: #dc2626; }}
  .chart-wrap {{ position: relative; height: 200px; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 0.85rem; }}
  th, td {{ padding: 8px 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }}
  th {{ background: #f8fafc; font-weight: 600; color: #475569; }}
  .summary-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                   gap: 12px; margin-bottom: 24px; }}
  .kpi {{ background: #fff; border-radius: 12px; padding: 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08); text-align: center; }}
  .kpi-value {{ font-size: 2rem; font-weight: 700; color: #0ea5e9; }}
  .kpi-label {{ font-size: 0.8rem; color: #94a3b8; margin-top: 4px; }}
</style>
</head>
<body>
<h1>⚡ Lynx Performance Report</h1>
<p class="meta">Package: <strong>com.example.sparkling.go</strong> &nbsp;·&nbsp; Generated: {date}</p>
{body}
<script>
{scripts}
</script>
</body>
</html>
"""

def _mini_kpi(label: str, value: str) -> str:
    return f'<div class="kpi"><div class="kpi-value">{value}</div><div class="kpi-label">{label}</div></div>'


def _stat(label: str, value: str, pf: str = "") -> str:
    badge = f"&nbsp;{_badge(pf)}" if pf else ""
    return f'<div class="stat-row"><span class="stat-label">{label}</span><span class="stat-value">{value}{badge}</span></div>'


def _line_chart(chart_id: str, labels: list, datasets: list[dict], y_label: str) -> tuple[str, str]:
    """Return (html_div, js_script) for a Chart.js line chart."""
    html = f'<div class="chart-wrap"><canvas id="{chart_id}"></canvas></div>'
    ds_json = json.dumps(datasets)
    labels_json = json.dumps(labels)
    js = f"""
new Chart(document.getElementById("{chart_id}"), {{
  type: "line",
  data: {{ labels: {labels_json}, datasets: {ds_json} }},
  options: {{
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {{ legend: {{ position: "top" }} }},
    scales: {{
      y: {{ beginAtZero: true, title: {{ display: true, text: "{y_label}" }} }},
      x: {{ ticks: {{ maxTicksLimit: 8 }} }}
    }}
  }}
}});"""
    return html, js


def _render_scenario(r: ScenarioResult) -> tuple[str, str]:
    """Return (html_fragment, js_fragment) for one scenario."""
    m = r.metrics
    frames = m.frame_durations
    html_parts: list[str] = []
    js_parts:   list[str] = []

    # Header
    html_parts.append(f'<div class="scenario-header">'
                       f'<span class="scenario-name">{r.name.replace("_", " ")}</span></div>')

    if r.error:
        html_parts.append(f'<div class="error">❌ {r.error}</div>')
        return "\n".join(html_parts), ""

    # ── KPI row ──
    kpis_html = '<div class="summary-grid">'
    kpis_html += _mini_kpi("Avg CPU", f"{m.cpu_avg}%")
    kpis_html += _mini_kpi("Peak CPU", f"{m.cpu_max}%")
    kpis_html += _mini_kpi("Peak PSS", f"{m.mem_peak_mb} MB")
    kpis_html += _mini_kpi("Janky Frames", f"{m.gfx_summary.get('janky_pct', 0):.1f}%")
    kpis_html += _mini_kpi("P99 Frame", f"{_percentile(frames, 99):.0f} ms")
    if r.extra.get("cold_start_ms"):
        kpis_html += _mini_kpi("Cold Start", f"{r.extra['cold_start_ms']} ms")
    if r.extra.get("growth_mb") is not None:
        kpis_html += _mini_kpi("Mem Growth", f"{r.extra['growth_mb']} MB")
    kpis_html += "</div>"
    html_parts.append(kpis_html)

    # ── Cards grid ──
    html_parts.append('<div class="grid">')

    # CPU card
    cpu_pf = _pass_fail(m.cpu_avg, THRESHOLDS["avg_cpu_pct"])
    cpu_card = (
        '<div class="card"><h3>CPU</h3>'
        + _stat("Average", f"{m.cpu_avg}%", cpu_pf)
        + _stat("Peak",    f"{m.cpu_max}%")
        + _stat("Samples", str(len(m.cpu_samples)))
        + "</div>"
    )
    html_parts.append(cpu_card)

    # Memory card
    pss_pf = _pass_fail(m.mem_peak_mb, THRESHOLDS["peak_pss_mb"])
    mem_card = (
        '<div class="card"><h3>Memory</h3>'
        + _stat("Peak PSS",   f"{m.mem_peak_mb} MB", pss_pf)
        + _stat("Average PSS", f"{m.mem_avg_mb} MB")
        + "</div>"
    )
    html_parts.append(mem_card)

    # Frame rate card
    janky_pf = _pass_fail(m.gfx_summary.get("janky_pct", 100), THRESHOLDS["janky_frame_pct"])
    p99_pf   = _pass_fail(_percentile(frames, 99), THRESHOLDS["p99_frame_ms"])
    fps_card = (
        '<div class="card"><h3>Frame Rate</h3>'
        + _stat("Total Frames",  str(m.gfx_summary.get("total_frames", 0)))
        + _stat("Janky Frames",  f"{m.gfx_summary.get('janky_frames', 0)} ({m.gfx_summary.get('janky_pct', 0):.1f}%)", janky_pf)
        + _stat("P50",  f"{_percentile(frames, 50):.1f} ms")
        + _stat("P90",  f"{_percentile(frames, 90):.1f} ms")
        + _stat("P95",  f"{_percentile(frames, 95):.1f} ms")
        + _stat("P99",  f"{_percentile(frames, 99):.1f} ms", p99_pf)
        + "</div>"
    )
    html_parts.append(fps_card)

    # Scenario-specific extras
    if r.extra.get("tab_timings"):
        rows = "".join(
            f"<tr><td>{t['tab'].replace('tab_', '')}</td><td>{t['settle_ms']} ms</td></tr>"
            for t in r.extra["tab_timings"]
        )
        html_parts.append(
            '<div class="card"><h3>Tab Timings</h3>'
            '<table><thead><tr><th>Tab</th><th>Settle</th></tr></thead>'
            f"<tbody>{rows}</tbody></table></div>"
        )

    html_parts.append("</div>")  # close grid

    # ── Charts ──
    t0_cpu = m.cpu_samples[0].timestamp if m.cpu_samples else 0
    cpu_labels = [round(s.timestamp - t0_cpu, 1) for s in m.cpu_samples]
    cpu_data   = [s.cpu_pct for s in m.cpu_samples]
    chart_id = f"cpu_{r.name}"
    ch, js = _line_chart(chart_id, cpu_labels,
                         [{"label": "CPU %", "data": cpu_data,
                           "borderColor": "#0ea5e9", "backgroundColor": "rgba(14,165,233,0.1)",
                           "fill": True, "tension": 0.3, "pointRadius": 0}],
                         "CPU %")
    html_parts.append(f'<h3>CPU over time</h3>{ch}')
    js_parts.append(js)

    if m.mem_samples:
        t0_mem = m.mem_samples[0].timestamp
        mem_labels = [round(s.timestamp - t0_mem, 1) for s in m.mem_samples]
        mem_pss     = [round(s.total_pss_kb / 1024, 2) for s in m.mem_samples]
        mem_java    = [round(s.java_heap_kb / 1024, 2) for s in m.mem_samples]
        mem_native  = [round(s.native_heap_kb / 1024, 2) for s in m.mem_samples]
        ch, js = _line_chart(f"mem_{r.name}", mem_labels, [
            {"label": "Total PSS", "data": mem_pss,
             "borderColor": "#8b5cf6", "fill": False, "tension": 0.3, "pointRadius": 0},
            {"label": "Java Heap", "data": mem_java,
             "borderColor": "#f59e0b", "fill": False, "tension": 0.3, "pointRadius": 0},
            {"label": "Native",    "data": mem_native,
             "borderColor": "#10b981", "fill": False, "tension": 0.3, "pointRadius": 0},
        ], "MB")
        html_parts.append(f'<h3>Memory over time</h3>{ch}')
        js_parts.append(js)

    if frames:
        buckets = list(range(0, 51, 5)) + [100]
        hist = [0] * len(buckets)
        for f in frames:
            for i, b in enumerate(buckets):
                if f <= b:
                    hist[i] += 1
                    break
        ch_id = f"hist_{r.name}"
        ch = f'<div class="chart-wrap"><canvas id="{ch_id}"></canvas></div>'
        js = f"""
new Chart(document.getElementById("{ch_id}"), {{
  type: "bar",
  data: {{
    labels: {json.dumps([f"≤{b}ms" for b in buckets])},
    datasets: [{{ label: "Frames", data: {json.dumps(hist)},
                  backgroundColor: "rgba(14,165,233,0.7)" }}]
  }},
  options: {{ responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {{ legend: {{ display: false }} }},
    scales: {{ y: {{ beginAtZero: true, title: {{ display: true, text: "Count" }} }} }}
  }}
}});"""
        html_parts.append(f'<h3>Frame time distribution</h3>{ch}')
        js_parts.append(js)

    return "\n".join(html_parts), "\n".join(js_parts)


def write_html(results: list[ScenarioResult], path: str) -> None:
    body_parts, script_parts = [], []
    for r in results:
        h, j = _render_scenario(r)
        body_parts.append(h)
        script_parts.append(j)

    html = _HTML_TEMPLATE.format(
        date=datetime.now().strftime("%Y-%m-%d %H:%M"),
        body="\n".join(body_parts),
        scripts="\n".join(script_parts),
    )
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"  HTML → {path}")
