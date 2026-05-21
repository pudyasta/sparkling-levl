import { useRef, useState } from '@lynx-js/react';

export interface PTRScrollProps {
  bindscrolltoupper: () => void;
  bindscroll: (e: any) => void;
}

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  /** Render prop — wire the returned handlers onto your inner scroll-view */
  children: (scrollProps: PTRScrollProps) => React.ReactNode;
  threshold?: number;
}

type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing';

interface Visual {
  distance: number;
  state: PullState;
  transitioning: boolean;
}

const THRESHOLD = 80;
const INDICATOR_HEIGHT = 60;
const TRANSITION_DURATION = 300;
const RESISTANCE = 0.4;
const SPINNER_DOTS = Array.from({ length: 8 });

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

  const startY = useRef(0);
  const isDragging = useRef(false);
  const isRefreshing = useRef(false);
  const isAtTop = useRef(true);
  const rafPending = useRef(false);
  const nextDistance = useRef(0);
  const nextState = useRef<PullState>('idle');
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Visual commit (called by RAF, max once per frame) ────────────────────
  const commitVisual = () => {
    rafPending.current = false;
    if (!isDragging.current) return; // stale RAF after touchEnd — ignore
    setVisual((prev) => {
      const d = nextDistance.current;
      const s = nextState.current;
      if (prev.distance === d && prev.state === s) return prev;
      return { distance: d, state: s, transitioning: false };
    });
  };

  const snapBack = () => {
    isRefreshing.current = false;
    nextDistance.current = 0;
    nextState.current = 'idle';
    setVisual({ distance: 0, state: 'idle', transitioning: true });
    setTimeout(() => setVisual((prev) => ({ ...prev, transitioning: false })), TRANSITION_DURATION);
  };

  // ── Scroll event handlers — pass these to the inner scroll-view ──────────
  const bindscrolltoupper = () => {
    isAtTop.current = true;
  };

  const bindscroll = (e: any) => {
    isAtTop.current = (e?.detail?.scrollTop ?? 0) <= 0;
  };

  // ── Touch handlers on the outer wrapper ──────────────────────────────────
  const handleTouchStart = (e: any) => {
    if (isRefreshing.current || !isAtTop.current) return;
    startY.current = e.touches?.[0]?.clientY ?? 0;
    isDragging.current = true;
  };

  const handleTouchMove = (e: any) => {
    if (!isDragging.current || isRefreshing.current) return;

    const delta = (e.touches?.[0]?.clientY ?? 0) - startY.current;

    if (delta <= 0) {
      // Hot path during normal scroll — bail with zero allocations
      if (nextDistance.current === 0) return;
      nextDistance.current = 0;
      nextState.current = 'idle';
    } else {
      const d = delta < threshold ? delta : threshold + (delta - threshold) * RESISTANCE;
      nextDistance.current = d;
      nextState.current = d >= threshold ? 'ready' : 'pulling';
    }

    if (!rafPending.current) {
      rafPending.current = true;
      requestAnimationFrame(commitVisual);
    }
  };

  const handleTouchEnd = async () => {
    isDragging.current = false;

    if (nextState.current !== 'ready') {
      snapBack();
      return;
    }

    isRefreshing.current = true;
    setVisual({ distance: threshold, state: 'refreshing', transitioning: true });
    setTimeout(() => setVisual((prev) => ({ ...prev, transitioning: false })), TRANSITION_DURATION);

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

  const { distance, state, transitioning } = visual;
  // Indicator slides in from above: -INDICATOR_HEIGHT (hidden) → 0 (fully visible)
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
      {/* Indicator overlays from top — content never shifts */}
      <view
        className="items-center absolute left-0 right-0 justify-center"
        style={{
          height: `${INDICATOR_HEIGHT}px`,
          top: 0,
          zIndex: 100,
          transform: `translateY(${indicatorTranslate}px)`,
          transition: transitioning ? `transform ${TRANSITION_DURATION}ms ease-out` : 'none',
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

      {/* Content: scroll-view scrolls natively, untouched by PTR transforms */}
      {children({ bindscrolltoupper, bindscroll })}
    </view>
  );
};
