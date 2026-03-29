import type { FC } from '@lynx-js/react';
import styles from './Shimmer.module.css';

interface ShimmerProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  isRound?: boolean;
}

const Shimmer: FC<ShimmerProps> = ({
  width,
  height,
  isRound = false,
  borderRadius,
  className,
}) => {
  return (
    <view
      className={`${styles.shimmerContainer} ${className == '' ? styles.default : className}`}
      style={{
        width,
        height,
        borderRadius: isRound ? '999px' : '4px',
      }}
    >
      <view className={styles.shimmerWave} />
    </view>
  );
};

export default Shimmer;
