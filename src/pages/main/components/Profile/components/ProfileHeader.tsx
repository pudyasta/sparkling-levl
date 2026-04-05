import CustomImage from '@/components/common/CustomImage/CustomImage';
import styles from '../Profile.module.css';

import type { UserProfileData } from '../types';

export const ProfileHeader = ({
  name,
  email,
  streak,
  initials,
  level,
  currentXP,
  nextLevelXP,
  avatarUrl,
}: UserProfileData) => (
  <view className={styles.header}>
    <view className={styles.avatarLarge}>
      {avatarUrl ? (
        <CustomImage className={styles.avatarImage} src={avatarUrl} />
      ) : (
        <text>{initials}</text>
      )}
    </view>
    <text className={styles.profileName}>{name}</text>
    <text className={styles.profileEmail}>{email}</text>
    <view className={styles.streakBadge}>
      <text className={styles.streakText}>🔥 {streak} Day Streak</text>
    </view>
  </view>
);
