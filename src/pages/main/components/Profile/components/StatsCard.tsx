import type { FC } from '@lynx-js/react';
import styles from '../Profile.module.css';
import type { StatItem } from '../types';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import Card from '@/components/common/Card/Card';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';

const StatsCard: FC<StatItem> = ({ label, value, iconUrl }) => {
  return (
    <view className={styles.statsCard}>
      <view className={styles.statsIconRow}>
        <CustomImage className={styles.statsIcon} src={iconUrl} />
        <Text size={TextType.b2}>{label}</Text>
      </view>
      <Text size={TextType.h2} bold>
        {value}
      </Text>
    </view>
  );
};

export default StatsCard;
