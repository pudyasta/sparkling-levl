import { useState } from '@lynx-js/react';

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
    <>
      {/* content */}
      <scroll-view
        className=" bg-[#F6F8FA] h-[calc(100vh-56px)]"
        scroll-orientation="vertical"
      >
        {items[active]?.content}
      </scroll-view>

      {/* TABS */}
      <view className="flex flex-row w-full bg-white fixed bottom-0">
        {items.map((item, i) => (
          <view
            key={item.key ?? i}
            bindtap={() => handleChange(i)}
            className={`pt-5 pb-6 flex items-center flex-col justify-center w-full border-b-2 gap-1 ${
              i === active ? 'border-b-[#1677ff]' : ''
            }`}
          >
            <image
              src={i === active ? item.label.srcActive : item.label.srcInactive}
              className="w-8 h-8 transition-all duration-300"
            />
            <text
              className={`text-sm font-semibold ${i === active ? 'text-[#1677ff]' : 'text-gray-500'}`}
            >
              {item.label.text}
            </text>
          </view>
        ))}
      </view>
    </>
  );
}
