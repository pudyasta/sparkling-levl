import { useRef, useState } from '@lynx-js/react';

export interface PTRScrollProps {
  bindscrolltoupper: () => void;
  bindscroll: (e: any) => void;
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: (scrollProps: PTRScrollProps) => React.ReactNode;
  threshold?: number;
}

type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing';

interface Visual {
  distance: number;
  state: PullState;
  transitioning: boolean;
}

const THRESHOLD          = 80;
const INDICATOR_HEIGHT   = 60;
const TRANSITION_MS      = 300;
const RESISTANCE         = 0.4;
const DIRECTION_DEADZONE = 8;   // px before we commit to a PTR gesture
const SPINNER_DOTS       = Array.from({ length: 8 });

export const PullToRefresh = ({
  onRefresh,
  children,
  threshold = THRESHOLD,
}: PullToRefreshProps) => {
  const [visual, setVisual] = useState<Visual>({
    distance: 0,
    state: 'idle',
    transitioning: false,
  });

  // ── Refs (never cause re-renders) ─────────────────────────────────────────
  const startY          = useRef(0);
  const isDragging      = useRef(false);  // true only once confirmed downward gesture
  const isRefreshing    = useRef(false);
  const scrollTopRef    = useRef(0);      // exact scrollTop from bindscroll
  const rafPending      = useRef(false);
  const nextDistance    = useRef(0);
  const nextState       = useRef<PullState>('idle');
  const refreshTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Visual commit (called by RAF, max once per frame) ─────────────────────
  const commitVisual = () => {
    rafPending.current = false;
    if (!isDragging.current) return;
    setVisual((prev) => {
      const d = nextDistance.current;
      const s = nextState.current;
      if (prev.distance === d && prev.state === s) return prev;
      return { distance: d, state: s, transitioning: false };
    });
  };

  const cancel = () => {
    isDragging.current    = false;
    nextDistance.current  = 0;
    nextState.current     = 'idle';
  };

  const snapBack = () => {
    isRefreshing.current = false;
    cancel();
    setVisual({ distance: 0, state: 'idle', transitioning: true });
    setTimeout(
      () => setVisual((p) => ({ ...p, transitioning: false })),
      TRANSITION_MS,
    );
  };

  // ── Scroll event handlers — passed to the inner scroll-view ───────────────
  const bindscrolltoupper = () => {
    // Lynx fires this when scrollTop < upper-threshold (default 50 px).
    // Do NOT use this to gate PTR — it fires too early.
    // Only use it to zero out scrollTopRef when we know we hit the absolute top.
    scrollTopRef.current = 0;
  };

  const bindscroll = (e: any) => {
    const top = e?.detail?.scrollTop ?? 0;
    scrollTopRef.current = top;

    // If the user scrolled away from the top mid-gesture, kill the PTR
    if (isDragging.current && top > 4) {
      cancel();
      setVisual({ distance: 0, state: 'idle', transitioning: false });
    }
  };

  // ── Touch handlers on the outer wrapper ───────────────────────────────────
  const handleTouchStart = (e: any) => {
    if (isRefreshing.current) return;
    // Record start Y but do NOT arm isDragging yet.
    // We only arm once we confirm a downward gesture while at scrollTop = 0
    // (see handleTouchMove). This prevents false-arms on upward scroll gestures
    // that momentarily report scrollTop = 0 via bindscrolltoupper.
    startY.current = e.touches?.[0]?.clientY ?? 0;
    isDragging.current = false;
  };

  const handleTouchMove = (e: any) => {
    if (isRefreshing.current) return;

    const touchY = e.touches?.[0]?.clientY ?? 0;
    const delta  = touchY - startY.current;

    // ── Lazy arm: decide PTR intent on first meaningful movement ──────────
    if (!isDragging.current) {
      if (scrollTopRef.current > 0) return;           // not at top — ignore
      if (delta > DIRECTION_DEADZONE) {
        // Clear downward pull at scrollTop=0 → arm PTR
        isDragging.current = true;
      } else {
        // Upward or ambiguous movement — this gesture belongs to the scroll-view
        return;
      }
    }

    // ── We are in a confirmed PTR drag ─────────────────────────────────────
    if (scrollTopRef.current > 4) {
      // Guard: the scroll-view somehow advanced while we were pulling
      cancel();
      return;
    }

    if (delta <= 0) {
      if (nextDistance.current === 0) return;
      nextDistance.current = 0;
      nextState.current    = 'idle';
    } else {
      const d = delta < threshold
        ? delta
        : threshold + (delta - threshold) * RESISTANCE;
      nextDistance.current = d;
      nextState.current    = d >= threshold ? 'ready' : 'pulling';
    }

    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(commitVisual);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    if (nextState.current !== 'ready') {
      snapBack();
      return;
    }

    isRefreshing.current = true;
    setVisual({ distance: threshold, state: 'refreshing', transitioning: true });
    setTimeout(
      () => setVisual((p) => ({ ...p, transitioning: false })),
      TRANSITION_MS,
    );

    const minDisplay = new Promise<void>((r) => {
      refreshTimeout.current = setTimeout(r, 600);
    });

    try {
      await Promise.all([onRefresh(), minDisplay]);
    } finally {
      if (refreshTimeout.current) clearTimeout(refreshTimeout.current);
      snapBack();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const { distance, state, transitioning } = visual;
  const indicatorTranslate =
    state === 'refreshing' ? 0 : Math.min(distance, threshold) - INDICATOR_HEIGHT;
  const pullProgress = Math.min(distance / threshold, 1);

  return (
    <view
      className="flex-1 overflow-hidden"
      style={{ position: 'relative' }}
      bindtouchstart={handleTouchStart}
      bindtouchmove={handleTouchMove}
      bindtouchend={handleTouchEnd}
    >
      {/* Indicator slides in from above */}
      <view
        className="items-center absolute left-0 right-0 justify-center"
        style={{
          height: `${INDICATOR_HEIGHT}px`,
          top: 0,
          zIndex: 100,
          transform: `translateY(${indicatorTranslate}px)`,
          transition: transitioning ? `transform ${TRANSITION_MS}ms ease-out` : 'none',
        }}
      >
        <view className="h-10 w-10 items-center rounded-full bg-white justify-center shadow-md">
          {state === 'refreshing' ? (
            <view className="h-6 w-6 items-center justify-center">
              {SPINNER_DOTS.map((_, i) => (
                <view
                  key={i}
                  className="h-1 w-1 rounded-full bg-blue-500 absolute"
                  style={{
                    opacity: (i + 1) / SPINNER_DOTS.length,
                    transform: `rotate(${i * 45}deg) translateY(-10px)`,
                  }}
                />
              ))}
            </view>
          ) : (
            <text
              style={{
                fontSize: '18px',
                transition: `transform 150ms ease-out, color 150ms ease-out`,
                transform: `rotate(${pullProgress * 180}deg)`,
                color: state === 'ready' ? '#3b82f6' : '#94a3b8',
              }}
            >
              ↓
            </text>
          )}
        </view>
      </view>

      {children({ bindscrolltoupper, bindscroll })}
    </view>
  );
};
