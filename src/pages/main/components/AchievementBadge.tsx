import { useState } from '@lynx-js/react';
interface AchievementBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorClass: string;
}
const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  icon,
  title,
  description,
  colorClass,
}) => {
  return (
    <view className="flex flex-col items-center space-y-2 p-2 w-full bg-white">
      <view className={`p-4 rounded-full ${colorClass} shadow-md`}>{icon}</view>
      <text className="text-sm font-semibold text-gray-700 text-center">
        {title}
      </text>
      <text className="text-xs text-gray-400 text-center hidden">
        {description}
      </text>
    </view>
  );
};
export default AchievementBadge;
