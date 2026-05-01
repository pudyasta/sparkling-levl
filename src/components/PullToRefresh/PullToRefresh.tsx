// lib/components/PullToRefresh.tsx
import { useRef, useState } from '@lynx-js/react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
}

type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing';

const THRESHOLD = 80;
const INDICATOR_HEIGHT = 64;
const TRANSITION_DURATION = 300;

export const PullToRefresh = ({
  onRefresh,
  children,
  threshold = THRESHOLD,
}: PullToRefreshProps) => {
  const [pullState, setPullState] = useState<PullState>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const startY = useRef<number>(0);
  const isDragging = useRef<boolean>(false);
  const refreshTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const indicatorTranslate = Math.min(pullDistance, threshold) - INDICATOR_HEIGHT;
  const contentTranslate =
    pullState === 'refreshing' ? INDICATOR_HEIGHT : Math.min(pullDistance, threshold);
  const pullProgress = Math.min(pullDistance / threshold, 1);
  const spinnerDots = Array.from({ length: 8 });

  const snapBack = () => {
    setIsTransitioning(true);
    setPullDistance(0);
    setPullState('idle');
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);
  };

  const handleTouchStart = (e: any) => {
    if (pullState === 'refreshing') return;
    startY.current = e.touches?.[0]?.clientY ?? 0;
    isDragging.current = true;
  };

  const handleTouchMove = (e: any) => {
    if (!isDragging.current || pullState === 'refreshing') return;

    const currentY = e.touches?.[0]?.clientY ?? 0;
    const delta = currentY - startY.current;

    if (delta <= 0) {
      setPullDistance(0);
      setPullState('idle');
      return;
    }

    // Rubber-band resistance past threshold
    const resistance = delta < threshold ? delta : threshold + (delta - threshold) * 0.7;
    setPullDistance(resistance);
    setPullState(resistance >= threshold ? 'ready' : 'pulling');
  };

  const handleTouchEnd = async () => {
    isDragging.current = false;

    if (pullState !== 'ready') {
      snapBack();
      return;
    }

    setIsTransitioning(true);
    setPullState('refreshing');
    setPullDistance(threshold);
    setTimeout(() => setIsTransitioning(false), TRANSITION_DURATION);

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

  return (
    <view
      className="flex-1 overflow-hidden"
      bindtouchstart={handleTouchStart}
      bindtouchmove={handleTouchMove}
      bindtouchend={handleTouchEnd}
    >
      {/* Pull indicator */}
      <view
        className="items-center absolute left-0 right-0 justify-center"
        style={{
          height: `${INDICATOR_HEIGHT}px`,
          top: 0,
          transform: `translateY(${indicatorTranslate}px)`,
          transition: isTransitioning ? `transform ${TRANSITION_DURATION}ms ease-out` : 'none',
        }}
      >
        <view className="h-10 w-10 items-center rounded-full bg-white justify-center shadow-md">
          {pullState === 'refreshing' ? (
            <view className="h-6 w-6 items-center justify-center">
              {spinnerDots.map((_, i) => (
                <view
                  key={i}
                  className="h-1 w-1 rounded-full bg-blue-500 absolute"
                  style={{
                    opacity: (i + 1) / spinnerDots.length,
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
                color: pullState === 'ready' ? '#3b82f6' : '#94a3b8',
              }}
            >
              ↓
            </text>
          )}
        </view>
      </view>

      {/* Page content */}
      <view
        className="flex-1"
        style={{
          transform: `translateY(${contentTranslate}px)`,
          transition: isTransitioning ? `transform ${TRANSITION_DURATION}ms ease-out` : 'none',
        }}
      >
        {children}
      </view>
    </view>
  );
};
