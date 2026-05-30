import { memo, useCallback, useRef, useState } from '@lynx-js/react';

import CustomImage from '../CustomImage/CustomImage';

interface TabItem {
  key?: string;
  label: {
    text: string;
    srcActive: string;
    srcInactive: string;
  };
  content: React.ReactNode;
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
  return (
    <view
      bindtap={() => onPress(index)}
      className="flex-1 flex-col items-center py-3 flex justify-center"
    >
      <CustomImage
        src={isActive ? item.label.srcActive : item.label.srcInactive}
        className="h-7 w-7"
      />
      <text
        className={`mt-0.5 text-xs font-semibold ${
          isActive ? 'text-[#1a73e8]' : 'text-[#9aa0a6]'
        }`}
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
    [onChange],
  );

  return (
    // Flex column fills the full screen height — no fixed positioning needed.
    <view className="h-full flex-col bg-[#f6f8fa] flex">

      {/* ── Content panels ───────────────────────────────────────────────────
          All visited panels stay mounted. Only the active one is visible via
          display:flex; the rest are display:none so they don't affect layout
          but React keeps their state and TanStack Query keeps their cache.
          Each panel fills the full remaining height; its own scroll-view
          handles scrolling — no outer scroll-view wrapper here.          ── */}
      <view className="flex-1">
        {items.map((item, i) => (
          <view
            key={item.key ?? i}
            style={{
              display: i === active ? 'flex' : 'none',
              flex: 1,
              flexDirection: 'column',
            }}
          >
            {visitedRef.current.has(i) ? item.content : null}
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
