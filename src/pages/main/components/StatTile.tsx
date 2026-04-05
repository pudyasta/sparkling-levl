import { useState } from '@lynx-js/react';
interface StatTileProps {
  value: number;
  label: string;
  isPrimary?: boolean;
}
const StatTile: React.FC<StatTileProps> = ({
  value,
  label,
  isPrimary = false,
}) => {
  return (
    <view className="flex-1 bg-white rounded-xl shadow-sm p-4 text-center border border-gray-100">
      <text
        className={`text-xl font-bold ${isPrimary ? 'text-yellow-600' : 'text-gray-800'}`}
      >
        {value}
      </text>
      <text className="text-xs text-gray-500 mt-1">{label}</text>
    </view>
  );
};
export default StatTile;
