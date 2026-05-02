import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLoading from '@/components/AppLoading';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { useAuth } from '@/context/AuthContext';
import { useGetLeaderboard, useGetUserRank } from '@/usecase/main/useGetLeaderboards';

const rankMapping = [
  { badge: '2', color: '#C0C0C0' },
  { badge: '1', color: '#FFD700' },
  { badge: '3', color: '#CD7F32' },
];

export default function LeaderboardScreen() {
  const { topThree, restRank, isLoading } = useGetLeaderboard();
  const { userRank } = useGetUserRank();
  const { user } = useAuth();

  if (isLoading) return <AppLoading fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={{ fontSize: 28 }}>🏆</Text>
        <View>
          <AppText size={TextType.h1} fontWeight="bold" color="white">Leaderboard</AppText>
          <AppText size={TextType.b2} color="white">Compete with other learners</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Top 3 */}
        {topThree.length >= 3 && (
          <View style={styles.podium}>
            {[topThree[1], topThree[0], topThree[2]].map((entry: any, idx: number) => {
              const mapping = rankMapping[idx];
              return (
                <View key={entry.user.name} style={[styles.podiumCard, idx === 1 && styles.podiumFirst]}>
                  <View style={[styles.podiumAvatar, { borderColor: mapping.color }]}>
                    {entry.user.avatar_url ? (
                      <Image source={{ uri: entry.user.avatar_url }} style={styles.avatarImg} contentFit="cover" />
                    ) : (
                      <AppText color="white" fontWeight="bold">{entry.user.name.slice(0, 2)}</AppText>
                    )}
                  </View>
                  <View style={[styles.badge, { backgroundColor: mapping.color }]}>
                    <Text style={styles.badgeText}>{mapping.badge}</Text>
                  </View>
                  <AppText size={TextType.b2} fontWeight="bold" style={{ textAlign: 'center' }} numberOfLines={1}>
                    {entry.user.name.split(' ')[0]}
                  </AppText>
                  <AppText size={TextType.b3} color={Colors.Primary}>
                    ⚡ {entry.total_xp} XP
                  </AppText>
                </View>
              );
            })}
          </View>
        )}

        {/* Rest */}
        <View style={{ padding: 16, gap: 8 }}>
          {restRank.map((entry: any, idx: number) => (
            <LeaderboardRow key={entry.user.name} rank={idx + 4} entry={entry} />
          ))}
          {user && (
            <LeaderboardRow
              rank={userRank?.rank ?? 0}
              entry={{ user: { name: user.name, avatar_url: user.avatar_url }, total_xp: userRank?.total_xp ?? 0 }}
              isCurrentUser
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LeaderboardRow({ rank, entry, isCurrentUser }: { rank: number; entry: any; isCurrentUser?: boolean }) {
  return (
    <View style={[styles.row, isCurrentUser && styles.rowHighlight]}>
      <Text style={styles.rank}>#{rank}</Text>
      <View style={styles.rowAvatar}>
        {entry.user.avatar_url ? (
          <Image source={{ uri: entry.user.avatar_url }} style={styles.avatarSmall} contentFit="cover" />
        ) : (
          <Text style={{ color: '#fff', fontWeight: '700' }}>{entry.user.name.slice(0, 2)}</Text>
        )}
      </View>
      <AppText style={{ flex: 1 }} fontWeight={isCurrentUser ? 'bold' : 'normal'}>
        {entry.user.name}
      </AppText>
      <AppText size={TextType.b2} color={Colors.Primary} fontWeight="bold">
        ⚡ {entry.total_xp} XP
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: Colors.Primary,
    padding: 20,
    paddingTop: 24,
  },
  podium: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#EEF4FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F0FE',
  },
  podiumCard: {
    alignItems: 'center',
    gap: 6,
    width: 90,
  },
  podiumFirst: { marginTop: -16 },
  podiumAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    backgroundColor: Colors.Primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
  },
  badgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rowHighlight: { backgroundColor: Colors.Accent, borderWidth: 1, borderColor: Colors.Primary },
  rank: { fontSize: 14, fontWeight: '700', color: Colors.Disabled, width: 32 },
  rowAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.Primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarSmall: { width: 40, height: 40 },
});
