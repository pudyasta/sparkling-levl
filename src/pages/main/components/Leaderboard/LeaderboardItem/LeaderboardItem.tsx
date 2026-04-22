import { useEffect, useState, type FC } from '@lynx-js/react';
import styles from './Leaderboarditem.module.css';
import Card from '@/components/common/Card/Card';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'native-svg': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { src?: string },
        HTMLElement
      >;
    }
  }
}

interface LeaderboardItemProps {
  rank: number;
  initials: string;
  name: string;
  xp: string; // e.g. "10,540 XP"
  avatar: string;
}
const LeaderboardItem: FC<LeaderboardItemProps> = ({ rank, initials, name, xp, avatar }) => {
  return (
    <Card className={styles.card}>
      <view className={styles.rankCircle}>
        <Text className={styles.rankText}>{rank}</Text>
      </view>
      <view className={styles.avatarCircle}>
        {avatar ? (
          <CustomImage src={avatar} className={styles.avatarSvg} />
        ) : (
          <Text className={styles.avatarText}>{initials}</Text>
        )}
      </view>
      <view className={styles.info}>
        <Text className={styles.name} size={TextType.b1}>
          {name}
        </Text>
        <view className={styles.xpRow}>
          <Text className={styles.xpIcon}>⚡</Text>
          <Text className={styles.xpText}>{xp}</Text>
        </view>
      </view>
    </Card>
  );
};
export default LeaderboardItem;
