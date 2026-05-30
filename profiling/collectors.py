"""
Background metric collectors — run in threads during a scenario.
"""

import threading
import time
from dataclasses import dataclass, field
from typing import Optional

import adb
from config import CPU_SAMPLE_INTERVAL_S, MEM_SAMPLE_INTERVAL_S, PACKAGE


@dataclass
class CpuSample:
    timestamp: float
    cpu_pct: float


@dataclass
class MemSample:
    timestamp: float
    total_pss_kb: int
    java_heap_kb: int
    native_heap_kb: int
    graphics_kb: int


@dataclass
class CollectionResult:
    cpu_samples: list[CpuSample]  = field(default_factory=list)
    mem_samples: list[MemSample]  = field(default_factory=list)
    gfx_summary: dict             = field(default_factory=dict)
    frame_durations: list[float]  = field(default_factory=list)

    # Derived stats (computed by finalize())
    cpu_avg: float  = 0.0
    cpu_max: float  = 0.0
    mem_peak_mb: float = 0.0
    mem_avg_mb: float  = 0.0


    def finalize(self) -> None:
        if self.cpu_samples:
            vals = [s.cpu_pct for s in self.cpu_samples]
            self.cpu_avg = round(sum(vals) / len(vals), 2)
            self.cpu_max = round(max(vals), 2)

        if self.mem_samples:
            pss = [s.total_pss_kb for s in self.mem_samples]
            self.mem_peak_mb = round(max(pss) / 1024, 2)
            self.mem_avg_mb  = round((sum(pss) / len(pss)) / 1024, 2)


class MetricCollector:
    """
    Starts CPU and memory sampling threads.  Call start() / stop().
    """

    def __init__(self, serial: Optional[str] = None, package: str = PACKAGE):
        self.serial  = serial
        self.package = package
        self._stop_event = threading.Event()
        self._result = CollectionResult()
        self._cpu_thread: Optional[threading.Thread] = None
        self._mem_thread: Optional[threading.Thread] = None

    # ── public API ─────────────────────────────────────────────────────────────

    def start(self) -> None:
        self._stop_event.clear()
        self._cpu_thread = threading.Thread(target=self._cpu_loop, daemon=True)
        self._mem_thread = threading.Thread(target=self._mem_loop, daemon=True)
        self._cpu_thread.start()
        self._mem_thread.start()

    def stop(self) -> CollectionResult:
        self._stop_event.set()
        if self._cpu_thread:
            self._cpu_thread.join(timeout=5)
        if self._mem_thread:
            self._mem_thread.join(timeout=5)
        self._result.finalize()
        return self._result

    def capture_gfx(self) -> None:
        """Snapshot gfxinfo summary and framestats into the result."""
        self._result.gfx_summary     = adb.read_gfxinfo(self.package, self.serial)
        self._result.frame_durations = adb.read_framestats(self.package, self.serial)

    # ── background loops ───────────────────────────────────────────────────────

    def _cpu_loop(self) -> None:
        prev: Optional[tuple[int, int]] = None
        while not self._stop_event.is_set():
            pid = adb.get_pid(self.package, self.serial)
            if pid:
                snap = adb.read_cpu_stat(pid, self.serial)
                if snap and prev:
                    pct = adb.cpu_percent(prev, snap)
                    self._result.cpu_samples.append(
                        CpuSample(timestamp=time.time(), cpu_pct=pct)
                    )
                prev = snap
            self._stop_event.wait(CPU_SAMPLE_INTERVAL_S)

    def _mem_loop(self) -> None:
        while not self._stop_event.is_set():
            info = adb.read_meminfo(self.package, self.serial)
            if info.get("total_pss"):
                self._result.mem_samples.append(
                    MemSample(
                        timestamp=time.time(),
                        total_pss_kb=info["total_pss"],
                        java_heap_kb=info["java_heap"],
                        native_heap_kb=info["native_heap"],
                        graphics_kb=info["graphics"],
                    )
                )
            self._stop_event.wait(MEM_SAMPLE_INTERVAL_S)
