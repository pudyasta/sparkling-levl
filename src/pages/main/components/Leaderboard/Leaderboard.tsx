import { trophy } from '@/assets/images/icon';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import IconWithBackground from '@/components/common/IconWithBackground/IconWithBackground';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import type { LeaderboardEntry } from '../../repository/type/leaderboard';
import { useGetLeaderboard, useGetUserRank } from '../../usecase/useGetLeaderboards';
import styles from './Leaderboard.module.css';
import LeaderboardItem from './LeaderboardItem/LeaderboardItem';
import LeaderboardLoader from './loader';

type Variant = 'second' | 'first' | 'third';

const rankMapping = [
  { badge: '2', variant: 'second' as Variant },
  { badge: '1', variant: 'first' as Variant },
  { badge: '3', variant: 'third' as Variant },
];

const variantClassMap: Record<Variant, string> = {
  first: styles.lbCardHighlight,
  second: styles.lbCardSecond,
  third: styles.lbCardThird,
};

function Leaderboard() {
  const { topThree, restRank, isLoading } = useGetLeaderboard();
  const { userRank, isLoading: isUserLoading } = useGetUserRank();
  const { user } = useNativeBridge();

  return (
    <scroll-view className="flex-1" scroll-orientation="vertical">
      {/* Header */}
      <view
        className="flex-row items-center gap-4 px-6 py-6 flex"
        style={{ background: 'linear-gradient(180deg, #1a73e8 0%, #1557b0 100%)' }}
      >
        <IconWithBackground image={trophy} />
        <view>
          <Text size={TextType.h1} fontWeight="bold" color="white" fontFamily={FontFamily.jakarta}>
            Ranking
          </Text>
          <Text size={TextType.b2} color="white">
            Kumpulkan poin dan bersaing peserta lain!
          </Text>
        </view>
      </view>

      {isLoading || isUserLoading ? (
        <LeaderboardLoader />
      ) : (
        <view className="animate-fade-in pb-[70px]">
          {/* Podium top 3 */}
          <view className="border-b border-gray-200">
            <view className={styles.lbRow}>
              {topThree.map((entry: LeaderboardEntry, idx: number) => (
                <view
                  key={entry.user.id}
                  className={`${styles.lbCard} ${variantClassMap[rankMapping[idx].variant]}`}
                >
                  <view className={styles.lbAvatarWrapper}>
                    <view className={styles.lbAvatar}>
                      {entry.user.avatar_url ? (
                        <CustomImage src={entry.user.avatar_url} className={styles.avatarSvg} />
                      ) : (
                        <Text color="white" className={styles.lbAvatarText}>
                          {entry.user.name.slice(0, 2)}
                        </Text>
                      )}
                    </view>
                    <view className={styles.lbBadge}>
                      <Text className={styles.lbBadgeText}>{rankMapping[idx].badge}</Text>
                    </view>
                  </view>

                  <view className={styles.lbInfo}>
                    <Text size={TextType.b1} fontWeight="bold" style={{ textAlign: 'center' }}>
                      {entry.user.name.split(' ')[0] +
                        ' ' +
                        (entry.user.name.split(' ')[1]?.[0] ?? '')}
                    </Text>
                    <view className={styles.xpRow}>
                      <Text className={styles.xpIcon}>⚡</Text>
                      <Text color={rankMapping[idx].variant === 'first' ? Colors.Secondary : ''}>
                        {`${entry.total_xp} XP`}
                      </Text>
                    </view>
                  </view>
                </view>
              ))}
            </view>
          </view>

          {/* Full list */}
          <view className="flex-col gap-2 p-3 flex">
            {restRank.map((entry: LeaderboardEntry, idx: number) => (
              <LeaderboardItem
                key={entry.user.id}
                rank={idx + 4}
                initials={entry.user.avatar_url ? '' : entry.user.name.slice(0, 2)}
                name={entry.user.name}
                avatar={entry.user.avatar_url}
                xp={`${entry.total_xp} XP`}
              />
            ))}

            {/* Current user row */}
            <LeaderboardItem
              rank={(userRank as any)?.rank ?? 0}
              initials={user?.avatar_url ? '' : (user?.name?.slice(0, 2) ?? '')}
              name={user?.name ?? ''}
              avatar={user?.avatar_url ?? ''}
              xp={`${(userRank as any)?.total_xp ?? 0} XP`}
            />
          </view>
        </view>
      )}
    </scroll-view>
  );
}

export default Leaderboard;
