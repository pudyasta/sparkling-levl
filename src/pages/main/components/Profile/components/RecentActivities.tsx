import type { FC } from '@lynx-js/react';
import styles from '../Profile.module.css';
import type { Activity } from '../types';
import CustomImage from '@/components/common/CustomImage/CustomImage';

const RecentActivityItem: FC<Activity> = ({
  title,
  timestamp,
  xpGain,
  iconUrl,
}) => {
  return (
    <view className={styles.activityItem}>
      <view className={styles.activityIconCircle}>
        <CustomImage src={iconUrl} className={styles.activityIcon} />
      </view>
      <view className={styles.activityContent}>
        <text className={styles.activityTitle}>{title}</text>
        <text className={styles.activityMeta}>
          {timestamp} • +{xpGain} XP
        </text>
      </view>
    </view>
  );
};

export default RecentActivityItem;
