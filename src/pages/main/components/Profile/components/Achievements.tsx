import type { FC } from '@lynx-js/react';
import styles from '../Profile.module.css';
import type { Achievement } from '../types';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import Card from '@/components/common/Card/Card';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';

const AchievementItem: FC<Achievement> = ({ title, iconUrl, color, isActive }) => {
  return (
    <Card className={styles.achievementItem}>
      <view className={styles.achievementIconBg}>
        <CustomImage src={iconUrl} className={styles.achievementIcon} />
      </view>
      <Text className={styles.achievementTitle} size={TextType.b3} bold>
        {title}
      </Text>
    </Card>
  );
};

export default AchievementItem;
