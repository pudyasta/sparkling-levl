import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import CustomImage from '@/components/common/CustomImage/CustomImage';

import styles from '../Profile.module.css';
import type { UserProfileData } from '../types';

export const ProfileHeader = ({
  name,
  email,
  streak,
  initials,
  bio,
  avatarUrl,
}: UserProfileData) => {
  return (
    <view className={styles.header}>
      <view className={styles.avatarLarge}>
        {avatarUrl ? (
          <CustomImage className={styles.avatarImage} src={avatarUrl} />
        ) : (
          <Text size={TextType.h1}>{initials}</Text>
        )}
      </view>
      <text className={styles.profileName}>{name}</text>
      <text className={styles.profileEmail}>{bio}</text>
      <view className={styles.streakBadge}>
        <text className={styles.streakText}>🔥 {streak} Day Streak</text>
      </view>
    </view>
  );
};
