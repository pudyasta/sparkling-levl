import { memo, useCallback, useRef, useState } from '@lynx-js/react';

import { usePressBounce } from '@/lib/hooks/usePressBounce';

import CustomImage from '../CustomImage/CustomImage';

interface TabItem {
  key?: string;
  label: {
    text: string;
    srcActive: string;
    srcInactive: string;
  };
  // Thunk so the panel's JSX (and any lazy chunk it contains) is only evaluated
  // when the tab is actually rendered — see MainPage.
  content: () => React.ReactNode;
}

// ── Tab bar button — stable identity prevents re-registering bindtap handlers ──
const TabButton = memo(function TabButton({
  item,
  index,
  isActive,
  onPress,
}: {
  item: TabItem;
  index: number;
  isActive: boolean;
  onPress: (i: number) => void;
}) {
  // Brief toggle drives the reusable press-bounce animation on tap.
  const { trigger, className: bounce } = usePressBounce();

  const handleTap = useCallback(() => {
    trigger();
    onPress(index);
  }, [index, onPress, trigger]);

  return (
    <view
      bindtap={handleTap}
      className={`flex-1 flex-col items-center py-3 flex justify-center ${bounce}`}
    >
      <CustomImage
        src={isActive ? item.label.srcActive : item.label.srcInactive}
        className="h-7 w-7"
      />
      <text
        className={`mt-0.5 text-xs font-semibold ${isActive ? 'text-[#1a73e8]' : 'text-[#9aa0a6]'}`}
      >
        {item.label.text}
      </text>
    </view>
  );
});

export const Tabs = memo(function Tabs({
  items,
  defaultIndex = 0,
  onChange,
}: {
  items: TabItem[];
  defaultIndex?: number;
  onChange?: (i: number) => void;
}) {
  const [active, setActive] = useState(defaultIndex);

  // Track which tabs have been visited. Once visited, the panel stays mounted
  // (just hidden with display:none) so React state + query cache are preserved.
  // useRef so the visited set doesn't affect the useCallback dependency.
  const visitedRef = useRef<Set<number>>(new Set([defaultIndex]));

  const handleChange = useCallback(
    (i: number) => {
      visitedRef.current.add(i);
      setActive(i);
      onChange?.(i);
    },
    [onChange]
  );

  return (
    // Flex column fills the full screen height — no fixed positioning needed.
    <view className="h-full flex-col bg-[#f6f8fa] flex">
      {/* ── Content panels ───────────────────────────────────────────────────
          A view-based "router": every visited panel stays mounted and only the
          active one is shown (display:flex) while the rest are display:none, so
          React state, scroll position and TanStack Query cache survive switches.
          No outer scroll-view — each tab screen owns its own scroll-view. The
          active panel gets animate-fade-in for a cross-fade on switch.    ── */}
      <view className="flex-1">
        {items.map((item, i) => (
          <view
            key={item.key ?? i}
            className={i === active ? 'animate-fade-in' : ''}
            style={{
              display: i === active ? 'flex' : 'none',
              flex: 1,
              flexDirection: 'column',
            }}
          >
            {visitedRef.current.has(i) ? item.content() : null}
          </view>
        ))}
      </view>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <view className="w-full flex-row border-t border-[#eeeeee] bg-white px-4 flex">
        {items.map((item, i) => (
          <TabButton
            key={item.key ?? i}
            item={item}
            index={i}
            isActive={i === active}
            onPress={handleChange}
          />
        ))}
      </view>
    </view>
  );
});
