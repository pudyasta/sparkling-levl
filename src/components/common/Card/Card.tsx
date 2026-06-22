import type { ReactNode } from '@lynx-js/react';

import { usePressBounce } from '@/lib/hooks/usePressBounce';

import style from './Card.module.css';

interface CardProps {
  children: ReactNode;
  bindTap?: (e: any) => void;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, bindTap, className }) => {
  // Every card bounces on press (the optional bindTap still fires for cards
  // that navigate); rows like leaderboard entries animate even without one.
  const { trigger, className: bounce } = usePressBounce();

  const handleTap = (e: any) => {
    trigger();
    bindTap?.(e);
  };

  return (
    <view
      className={`${style.cardContainer} ${bounce} ${className ?? ''}`}
      bindtap={handleTap}
    >
      {children}
    </view>
  );
};

export default Card;
