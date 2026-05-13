import { useState } from '@lynx-js/react';

import CustomImage from '../CustomImage/CustomImage';
import styles from './Tabs.module.css';

interface TabItem {
  key?: string;
  label: {
    text: string;
    srcActive: string;
    srcInactive: string;
  };
  content: React.ReactNode;
}

export function Tabs({
  items,
  defaultIndex = 0,
  onChange,
}: {
  items: TabItem[];
  defaultIndex?: number;
  onChange?: (i: number) => void;
}) {
  const [active, setActive] = useState(defaultIndex);
  const handleChange = (i: number) => {
    setActive(i);
    onChange?.(i);
  };
  return (
    <view className="h-full flex-col bg-canvas flex">
      <scroll-view className="mb-18 flex-1" scroll-orientation="vertical">
        {items[active]?.content}
      </scroll-view>

      {/* TABS */}
      <view className="w-full flex-row border-t border-light bg-surface px-4 flex fixed bottom-0">
        {items.map((item, i) => {
          const isActive = i === active;

          return (
            <view
              key={item.key ?? i}
              bindtap={() => handleChange(i)}
              className={`flex-1 flex-col items-center border-b-2 py-5 flex justify-center ${
                isActive ? 'border-primary' : 'border-transparent'
              }`}
            >
              <CustomImage
                src={isActive ? item.label.srcActive : item.label.srcInactive}
                className={`h-9 w-9 ${isActive ? 'opacity-100' : 'opacity-80'}`}
              />
              <text
                className={`mt-1 text-sm font-semibold ${
                  isActive ? 'text-primary' : 'text-subtle'
                }`}
              >
                {item.label.text}
              </text>
            </view>
          );
        })}
      </view>
    </view>
  );
}
