import { useState } from '@lynx-js/react';
interface CardProps {
  children: React.ReactNode;
  bindTap?: (e: any) => void;
  className?: string;
}
const Card: React.FC<CardProps> = ({ children, bindTap, className }) => {
  return (
    <view
      className={`mb-3 px-6 py-5 rounded-2xl border border-gray-200 bg-white ${className}`}
      bindtap={bindTap}
    >
      {children}
    </view>
  );
};
export default Card;
