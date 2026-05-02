import { Image } from 'expo-image';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppButton from '@/components/AppButton';
import AppLoading from '@/components/AppLoading';
import AppText, { TextType } from '@/components/AppText';
import AppCard from '@/components/AppCard';
import { Colors } from '@/constant/colors';
import { useAuth } from '@/context/AuthContext';
import { useGetAchievements, useGetGamificationStats } from '@/usecase/main/useGetProfile';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { stats, isLoading } = useGetGamificationStats();
  const { achievements, isLoading: achLoading } = useGetAchievements();

  if (isLoading || achLoading) return <AppLoading fullScreen />;

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('') ?? 'AC';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatar} contentFit="cover" />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
          <AppText size={TextType.h2} fontWeight="bold" color="white">{user?.name ?? ''}</AppText>
          <AppText size={TextType.b2} color="white" style={{ opacity: 0.8 }}>{user?.email ?? ''}</AppText>
          <View style={styles.streakBadge}>
            <Text>🔥</Text>
            <AppText size={TextType.b2} color="white">{stats.activity?.current_streak ?? 0} day streak</AppText>
          </View>
        </View>

        <View style={styles.body}>
          {/* Level Progress */}
          <AppCard>
            <View style={styles.levelRow}>
              <View style={{ flex: 1 }}>
                <AppText size={TextType.h2} fontWeight="bold">{stats.level?.name ?? 'Beginner'}</AppText>
                <AppText size={TextType.b3} color={Colors.Disabled}>
                  {stats.level?.xp_to_next_level ?? 0} XP to Level {(stats.level?.current ?? 0) + 1}
                </AppText>
              </View>
              <View style={styles.levelBadge}>
                <AppText fontWeight="bold" color="white">{stats.level?.current ?? 0}</AppText>
              </View>
            </View>
            <View style={styles.progressBg}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${stats.level?.progress_percentage ?? 0}%` as any },
                ]}
              />
            </View>
          </AppCard>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <StatCard label="Total XP" value={stats.xp?.total ?? 0} emoji="⚡" />
            <StatCard label="Courses" value={stats.xp?.period ?? 0} emoji="📚" />
            <StatCard label="Longest Streak" value={stats.activity?.longest_streak ?? 0} emoji="🔥" />
            <StatCard label="Current Streak" value={stats.activity?.current_streak ?? 0} emoji="📅" />
          </View>

          {/* Achievements */}
          <View>
            <AppText size={TextType.h2} fontWeight="bold" style={{ marginBottom: 12 }}>
              Achievements
            </AppText>
            <View style={styles.achRow}>
              {achievements.slice(0, 9).map((ach: any) => (
                <View key={ach.id} style={styles.achItem}>
                  <Image source={{ uri: ach.icon_url }} style={styles.achIcon} contentFit="cover" />
                  <AppText size={TextType.b3} style={{ textAlign: 'center' }} numberOfLines={2}>
                    {ach.name}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Logout */}
          <AppButton label="Logout" color="primary" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</Text>
      <AppText size={TextType.h2} fontWeight="bold">{String(value)}</AppText>
      <AppText size={TextType.b3} color={Colors.Disabled}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.Primary,
    padding: 24,
    paddingTop: 32,
    alignItems: 'center',
    gap: 6,
  },
  avatarContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#fff' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 99,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 4,
  },
  body: { padding: 16, gap: 20 },
  levelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.Primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBg: { height: 8, borderRadius: 4, backgroundColor: '#F1F3F4', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.Primary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flex: 1,
    minWidth: '40%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  achRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achItem: { alignItems: 'center', width: 72 },
  achIcon: { width: 64, height: 64, borderRadius: 12, backgroundColor: '#F1F3F4' },
});
