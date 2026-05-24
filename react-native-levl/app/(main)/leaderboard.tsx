import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import CustomImage from '@/components/common/CustomImage/CustomImage';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import type { LeaderboardEntry } from '@/pages/main/repository/type/leaderboard';
import { useGetLeaderboard } from '@/pages/main/usecase/useGetLeaderboards';
import { useGetUserRank } from '@/pages/main/usecase/useGetProfile';
import { thropy } from '@/assets/images/icon';

const RANK_CONFIGS = [
  { badge: '2', borderColor: '#94A3B8', bgColor: '#CBD5E1', height: 80 },
  { badge: '1', borderColor: '#F59E0B', bgColor: '#FEF3C7', height: 100 },
  { badge: '3', borderColor: '#CD7C3A', bgColor: '#FDE8C8', height: 70 },
];
const PODIUM_ORDER = [1, 0, 2]; // display order: 2nd, 1st, 3rd

function LeaderboardLoader() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={Colors.Primary} size="large" />
    </View>
  );
}

function PodiumCard({ entry, config }: { entry: LeaderboardEntry; config: typeof RANK_CONFIGS[0] }) {
  const initials = entry.user.name.slice(0, 2).toUpperCase();
  const shortName =
    entry.user.name.split(' ')[0] + ' ' + (entry.user.name.split(' ')[1]?.[0] ?? '');

  return (
    <View style={[styles.podiumCard, { borderColor: config.borderColor, backgroundColor: config.bgColor }]}>
      <View style={styles.podiumAvatar}>
        {entry.user.avatar_url ? (
          <CustomImage src={entry.user.avatar_url} width={44} height={44} style={{ borderRadius: 22 }} />
        ) : (
          <Text fontWeight="bold" color="white" size={TextType.b1}>{initials}</Text>
        )}
      </View>
      <View style={[styles.podiumBadge, { backgroundColor: config.borderColor }]}>
        <Text size={TextType.b3} fontWeight="bold" color="white">{config.badge}</Text>
      </View>
      <Text size={TextType.b3} fontWeight="bold" style={{ textAlign: 'center' }} numberOfLines={2}>
        {shortName}
      </Text>
      <View style={styles.xpRow}>
        <Text style={styles.xpIcon}>⚡</Text>
        <Text size={TextType.b3} color={Colors.Secondary} fontWeight="bold">
          {entry.total_xp} XP
        </Text>
      </View>
    </View>
  );
}

function LeaderboardItem({
  rank,
  name,
  avatar,
  xp,
  isMe = false,
}: {
  rank: number;
  name: string;
  avatar: string;
  xp: string;
  isMe?: boolean;
}) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <View style={[styles.listItem, isMe && styles.listItemMe]}>
      <View style={styles.rankCircle}>
        <Text size={TextType.b2} fontWeight="bold" color={Colors.TextSecondary}>
          {rank}
        </Text>
      </View>
      <View style={styles.avatarCircle}>
        {avatar ? (
          <CustomImage src={avatar} width={40} height={40} style={{ borderRadius: 20 }} />
        ) : (
          <Text fontWeight="bold" color="white" size={TextType.b2}>{initials}</Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text size={TextType.b1} fontWeight={isMe ? 'bold' : '500'} numberOfLines={1}>
          {name}
        </Text>
        <View style={styles.xpRow}>
          <Text style={styles.xpIcon}>⚡</Text>
          <Text size={TextType.b3} color={Colors.TextTertiary}>{xp}</Text>
        </View>
      </View>
      {isMe && (
        <View style={styles.meBadge}>
          <Text size={TextType.b3} color={Colors.Primary} fontWeight="bold">Kamu</Text>
        </View>
      )}
    </View>
  );
}

export default function LeaderboardScreen() {
  const { user } = useNativeBridge();
  const { data: entries, isLoading } = useGetLeaderboard();
  const { userRank, isLoading: isUserLoading } = useGetUserRank();

  const topThree = (entries ?? []).slice(0, 3);
  const restRank = (entries ?? []).slice(3);

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={[Colors.Primary, Colors.PrimaryDark]}
        style={styles.headerGradient}
      >
        <CustomImage src={thropy} width={40} height={40} />
        <View>
          <Text size={TextType.h1} fontWeight="bold" color="white" fontFamily={FontFamily.jakarta}>
            Ranking
          </Text>
          <Text size={TextType.b2} color="white">
            Kumpulkan poin dan bersaing peserta lain!
          </Text>
        </View>
      </LinearGradient>

      {isLoading || isUserLoading ? (
        <LeaderboardLoader />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Podium top 3 */}
          {topThree.length >= 3 && (
            <View style={styles.podiumRow}>
              {PODIUM_ORDER.map((idx) => (
                <PodiumCard
                  key={topThree[idx].user.name}
                  entry={topThree[idx]}
                  config={RANK_CONFIGS[idx]}
                />
              ))}
            </View>
          )}

          {/* Full list */}
          <View style={styles.listContainer}>
            {restRank.map((entry: LeaderboardEntry, idx: number) => (
              <LeaderboardItem
                key={entry.user.name}
                rank={idx + 4}
                name={entry.user.name}
                avatar={entry.user.avatar_url}
                xp={`${entry.total_xp} XP`}
              />
            ))}

            {/* Current user row */}
            <LeaderboardItem
              rank={userRank?.rank || 0}
              name={user?.name || ''}
              avatar={user?.avatar_url || ''}
              xp={`${userRank?.total_xp || 0} XP`}
              isMe
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    paddingTop: 28,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
    backgroundColor: Colors.Surface,
  },
  podiumCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 10,
    gap: 6,
    width: 108,
  },
  podiumAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.Primary,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  podiumBadge: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -14,
  },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  xpIcon: { fontSize: 12 },
  listContainer: { padding: 12, gap: 8 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  listItemMe: {
    borderColor: Colors.Primary,
    backgroundColor: Colors.InfoBg,
    marginTop: 8,
  },
  rankCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.N100,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.Primary,
    alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden',
  },
  meBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.Primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
});
