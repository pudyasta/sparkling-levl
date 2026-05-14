import type { ReactNode } from '@lynx-js/react';

import style from './Card.module.css';

interface CardProps {
  children: ReactNode;
  bindTap?: (e: any) => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, bindTap, className }) => {
  return (
    <view className={`${style.cardContainer} ${className ?? ''}`} bindtap={bindTap}>
      {children}
    </view>
  );
};

export default Card;
