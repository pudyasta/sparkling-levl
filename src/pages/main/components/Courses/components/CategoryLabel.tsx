import { memo } from '@lynx-js/react';

import { usePressBounce } from '@/lib/hooks/usePressBounce';

import { Colors } from '../../../../../constant/style';

interface LabelProps {
  isActive: boolean;
  bindTap: (e: any) => void;
  category: string;
}
const CategoryLabel = memo<LabelProps>(({
  isActive,
  category,
  bindTap,
}) => {
  const { trigger, className: bounce } = usePressBounce();
  return (
    <view
      className={`px-3 py-1.5 rounded-full border ${bounce}`}
      style={{
        backgroundColor: isActive ? Colors.Primary : Colors.Background,
        borderColor: isActive ? Colors.Primary : Colors.Background,
        transition: 'transform 0.15s ease, opacity 0.15s ease',
      }}
      bindtap={(e: any) => {
        trigger();
        bindTap(e);
      }}
    >
      <text
        className={
          isActive
            ? 'text-white text-sm font-semibold'
            : 'text-gray-700 text-sm'
        }
      >
        {category}
      </text>
    </view>
  );
});
export default CategoryLabel;
