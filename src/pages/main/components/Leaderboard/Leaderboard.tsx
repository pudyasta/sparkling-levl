import { useEffect } from 'react';

import { thropy } from '@/assets/images/icon';
import { loginBanner } from '@/assets/images/pages';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import IconWithBackground from '@/components/common/IconWithBackground/IconWithBackground';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import type { LeaderboardEntry } from '../../repository/type/leaderboard';
import { useGetLeaderboard, useGetUserRank } from '../../usecase/useGetLeaderboards';
import styles from './Leaderboard.module.css';
import './Leaderboard.module.css';
import LeaderboardItem from './LeaderboardItem/LeaderboardItem';
import LeaderboardLoader from './loader';

type Variant = 'second' | 'first' | 'third';

enum Variants {
  first = 'first',
  second = 'second',
  third = 'third',
}

const variantClassMap: Record<Variant, string> = {
  first: styles.lbCardHighlight,
  second: styles.lbCardSecond,
  third: styles.lbCardThird,
};

const rankMapping = [
  { badge: '2', variant: Variants.second },
  { badge: '1', variant: Variants.first },
  { badge: '3', variant: Variants.third },
];

function Leaderboard() {
  const { topThree, restRank, isLoading } = useGetLeaderboard();
  const { userRank, isLoading: isUserLoading } = useGetUserRank();
  const user = useNativeBridge();

  useEffect(() => {}, [userRank]);

  return (
    <view className="w-full pb-5">
      <view className="bg-gradient-primary items-center gap-4 px-6 py-7 flex">
        <IconWithBackground image={thropy} />
        <view>
          <Text size={TextType.h1} fontWeight="bold" color="white" fontFamily={FontFamily.jakarta}>
            Ranking
          </Text>
          <Text size={TextType.b2} color="white">
            Kumpulkan poin dan bersaing peserta lain!
          </Text>
        </view>
      </view>

      {isUserLoading || isLoading ? (
        <LeaderboardLoader />
      ) : (
        <view className="animate-fade-in">
          <view className="flex-row border-b border-light pt-3 flex justify-around">
            <view className={styles.lbRow}>
              {topThree.map((user: LeaderboardEntry, idx: number) => (
                <view
                  key={user.user.name}
                  className={`${styles.lbCard} ${variantClassMap[rankMapping[idx].variant as Variant]}`}
                >
                  <view className={styles.lbAvatarWrapper}>
                    <view className={styles.lbAvatar}>
                      {user.user.avatar_url ? (
                        <CustomImage src={user.user.avatar_url} className={styles.avatarSvg} />
                      ) : (
                        <Text color="white" className={styles.lbAvatarText}>
                          {user.user.name.slice(0, 2)}
                        </Text>
                      )}
                    </view>
                    <view className={styles.lbBadge}>
                      <Text className={styles.lbBadgeText}>{rankMapping[idx].badge}</Text>
                    </view>
                  </view>
                  <view className={styles.lbInfo}>
                    <Text size={TextType.b1} fontWeight="bold" style={{ textAlign: 'center' }}>
                      {user.user.name.split(' ')[0] +
                        ' ' +
                        (user.user.name.split(' ')[1]?.[0] || '')}
                    </Text>
                    <view className={styles.xpRow} style={{ textAlign: 'center' }}>
                      <Text className={styles.xpIcon}>⚡</Text>
                      <Text
                        color={rankMapping[idx].variant === Variants.first ? Colors.Secondary : ''}
                      >
                        {`${user.total_xp} XP`}
                      </Text>
                    </view>
                  </view>
                </view>
              ))}
            </view>
          </view>

          {/* Full list */}
          <view className="flex-col gap-1 p-3 flex">
            {restRank.map((l: LeaderboardEntry, idx: number) => (
              <LeaderboardItem
                rank={idx + 4}
                initials={l.user.avatar_url ? '' : l.user.name.slice(0, 2)}
                name={l.user.name}
                avatar={l.user.avatar_url}
                xp={`${l.total_xp} XP`}
              />
            ))}
            <LeaderboardItem
              /* @ts-ignore */
              rank={userRank?.rank || 0}
              initials={user!.user!.avatar_url ? '' : user!.user!.name.slice(0, 2)}
              name={user!.user!.name}
              avatar={user!.user!.avatar_url}
              /* @ts-ignore */
              xp={`${userRank?.total_xp || 0} XP`}
            />
          </view>
        </view>
      )}
    </view>
  );
}
export default Leaderboard;
