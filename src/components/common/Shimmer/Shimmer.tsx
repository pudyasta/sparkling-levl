import type { FC } from '@lynx-js/react';

interface ShimmerProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  isRound?: boolean;
}
const Shimmer: FC<ShimmerProps> = ({ width, height, isRound = false, className }) => {
  return (
    <view
      className={`bg-[#e0e0e0] relative overflow-hidden ${isRound ? 'rounded-full' : 'rounded-[4px]'} ${className || 'h-5 w-full rounded-[10px]'}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <view className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
    </view>
  );
};

export default Shimmer;
