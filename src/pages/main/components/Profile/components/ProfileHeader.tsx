import { setting } from '@/assets/images/icon';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

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
}: UserProfileData) => {
  const { navigateTo } = useNativeBridge();
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
      <text className={styles.profileEmail}>{email}</text>
      <view className={styles.streakBadge}>
        <text className={styles.streakText}>🔥 {streak} Day Streak</text>
      </view>
      <view
        bindtap={() => navigateTo('profile')}
        className="items-center rounded-full border border-white/30 bg-white/20 p-3 flex absolute right-5 top-5 justify-center"
      >
        <CustomImage className="h-[25px] w-[25px]" src={setting} />
      </view>
    </view>
  );
};
