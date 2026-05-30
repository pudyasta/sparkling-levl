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

const THRESHOLD        = 80;
const INDICATOR_HEIGHT = 60;
const TRANSITION_MS    = 300;
const RESISTANCE       = 0.4;
const DEADZONE         = 8;   // px of movement before intent is decided
const SPINNER_DOTS     = Array.from({ length: 8 });

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

  const startY          = useRef(0);
  const isDragging      = useRef(false);
  const isRefreshing    = useRef(false);
  // Exact scrollTop, updated ONLY from bindscroll — never from bindscrolltoupper.
  // bindscrolltoupper fires at Lynx's default upper-threshold (~50 px), which is
  // far too early; trusting it zeroes scrollTopRef while the user is still mid-page.
  const scrollTopRef    = useRef(0);
  // Once set true for a gesture, PTR will NOT arm for the remainder of that gesture.
  const gestureLocked   = useRef(false);
  const rafPending      = useRef(false);
  const nextDistance    = useRef(0);
  const nextState       = useRef<PullState>('idle');
  const refreshTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const resetDrag = () => {
    isDragging.current   = false;
    nextDistance.current = 0;
    nextState.current    = 'idle';
  };

  const snapBack = () => {
    isRefreshing.current = false;
    resetDrag();
    setVisual({ distance: 0, state: 'idle', transitioning: true });
    setTimeout(
      () => setVisual((p) => ({ ...p, transitioning: false })),
      TRANSITION_MS,
    );
  };

  // ── Scroll handlers ────────────────────────────────────────────────────────

  const bindscrolltoupper = () => {
    // Intentionally empty.
    // Lynx fires this at scrollTop ≤ upper-threshold (default ~50 px), which is
    // NOT the true top. Updating scrollTopRef here would make it stale (0) while
    // the user is still mid-page. bindscroll below has the accurate value.
  };

  const bindscroll = (e: any) => {
    const top = e?.detail?.scrollTop ?? 0;
    scrollTopRef.current = top;

    // Kill an active pull if the scroll-view moved away from the top
    if (isDragging.current && top > 4) {
      resetDrag();
      setVisual({ distance: 0, state: 'idle', transitioning: false });
    }
  };

  // ── Touch handlers ─────────────────────────────────────────────────────────

  const handleTouchStart = (e: any) => {
    if (isRefreshing.current) return;
    startY.current      = e.touches?.[0]?.clientY ?? 0;
    isDragging.current  = false;
    gestureLocked.current = false;  // reset per-gesture lock
  };

  const handleTouchMove = (e: any) => {
    if (isRefreshing.current) return;
    // Once this gesture was identified as a normal scroll, ignore every move
    if (gestureLocked.current) return;

    const delta = (e.touches?.[0]?.clientY ?? 0) - startY.current;

    if (!isDragging.current) {
      // ── Intent detection: decide what kind of gesture this is ──────────
      if (scrollTopRef.current > 0) {
        // Not at top — lock as scroll for the entire gesture
        gestureLocked.current = true;
        return;
      }
      if (delta >= DEADZONE) {
        // Clearly pulling down at scrollTop=0 → arm PTR
        isDragging.current = true;
      } else if (delta <= -DEADZONE) {
        // Clearly scrolling up → lock as scroll
        gestureLocked.current = true;
        return;
      } else {
        // Still in the deadzone — wait for more movement
        return;
      }
    }

    // ── Active PTR drag ────────────────────────────────────────────────────
    // Extra guard: abort if scroll-view crept away from top
    if (scrollTopRef.current > 4) {
      resetDrag();
      return;
    }

    if (delta <= 0) {
      if (nextDistance.current !== 0) {
        nextDistance.current = 0;
        nextState.current    = 'idle';
        if (!rafPending.current) {
          rafPending.current = true;
          requestAnimationFrame(commitVisual);
        }
      }
      return;
    }

    const d = delta < threshold
      ? delta
      : threshold + (delta - threshold) * RESISTANCE;
    nextDistance.current = d;
    nextState.current    = d >= threshold ? 'ready' : 'pulling';

    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(commitVisual);
    }
  };

  const handleTouchEnd = async () => {
    gestureLocked.current = false;

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
      {/* Indicator slides down from above */}
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
