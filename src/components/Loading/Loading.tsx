import type { FC } from '@lynx-js/react';
import style from './Loading.module.css';
interface Props {
  size?: number;
  color1?: string;
  color2?: string;
}
export const Loading: FC<Props> = ({
  size = 60,
  color1 = '#1A73E8',
  color2 = '#FFC107',
}) => {
  const ballSize = size * 0.38;
  const gap = size * 0.1;
  const totalWidth = ballSize * 2 + gap;
  const cx = totalWidth / 2;
  const cy = size / 2;
  const r = ballSize / 2;
  return (
    <view
      className={style.tiktokLoader}
      style={{
        width: `${totalWidth}px`,
        height: `${ballSize}px`,
      }}
    >
      <view
        className={`${style.tiktokBall} ${style.tiktokBallLeft} left-0`}
        style={{
          width: `${ballSize}px`,
          height: `${ballSize}px`,
          backgroundColor: color1,
        }}
      />
      <view
        className={`${style.tiktokBall} ${style.tiktokBallRight} right-0`}
        style={{
          width: `${ballSize}px`,
          height: `${ballSize}px`,
          backgroundColor: color2,
        }}
      />
    </view>
  );
};
