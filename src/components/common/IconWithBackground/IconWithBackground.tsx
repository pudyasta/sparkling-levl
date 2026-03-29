import { useState } from '@lynx-js/react';
import style from './IconWithBackground.module.css';
interface IconWithBackgroundProps {
  image: string;
}
const IconWithBackground: React.FC<IconWithBackgroundProps> = ({ image }) => {
  return (
    <view className={style.logo}>
      <image src={image} style={{ width: '28px', height: '28px' }} />
    </view>
  );
};
export default IconWithBackground;
