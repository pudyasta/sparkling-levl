import { useState } from '@lynx-js/react';
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
    console.log(i);
    setActive(i);
    onChange?.(i);
  };
  return (
    <view className={styles.container}>
      <scroll-view className={styles.scrollView} scroll-orientation="vertical">
        {items[active]?.content}
      </scroll-view>

      {/* TABS */}
      <view className={styles.tabBar}>
        {items.map((item, i) => {
          const isActive = i === active;

          return (
            <view
              key={item.key ?? i}
              bindtap={() => handleChange(i)}
              className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            >
              <image
                src={isActive ? item.label.srcActive : item.label.srcInactive}
                className={`${styles.tabIcon} ${isActive ? styles.tabIconActive : ''}`}
              />
              <text className={`${styles.tabLabel} ${isActive ? styles.tabLabelActive : ''}`}>
                {item.label.text}
              </text>
            </view>
          );
        })}
      </view>
    </view>
  );
}
