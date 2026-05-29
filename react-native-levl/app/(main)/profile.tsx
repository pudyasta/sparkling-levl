import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  courses,
  date,
  documentLock,
  editIcon,
  manageAccount,
  time,
  xp,
} from '@/assets/images/icon';
import {
  useGetAchievements,
  useGetGamificationStats,
  useGetProfile,
} from '@/pages/main/usecase/useGetProfile';

import Text from '../../src/components/Text';
import { FontFamily, TextType } from '../../src/components/Text/types';
import CustomImage from '../../src/components/common/CustomImage/CustomImage';
import { Colors } from '../../src/constant/style';
import { useNativeBridge } from '../../src/context/NativeBridgeProvider';

function StatCard({
  label,
  value,
  iconSrc,
}: {
  label: string;
  value: number | string;
  iconSrc: any;
}) {
  return (
    <View style={styles.statCard}>
      <CustomImage src={iconSrc} width={24} height={24} />
      <Text size={TextType.h2} fontWeight="bold" color={Colors.Primary}>
        {value}
      </Text>
      <Text size={TextType.b3} color={Colors.TextTertiary} style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

const SETTINGS_MENU = [
  {
    icon: editIcon,
    label: 'Edit Profil',
    description: 'Ubah informasi profil Kamu',
    screen: 'profile',
  },
  {
    icon: documentLock,
    label: 'Keamanan Akun',
    description: 'Ubah password dan email Kamu',
    screen: 'security',
  },
  {
    icon: manageAccount,
    label: 'Akun',
    description: 'Logout atau hapus akun Kamu',
    screen: 'danger',
  },
];

export default function ProfileScreen() {
  const { logout } = useNativeBridge();
  const { profile, isLoading: profileLoading, refetch: refetchProfile } = useGetProfile();
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useGetGamificationStats();
  const {
    achievements,
    isLoading: achievementsLoading,
    refetch: refetchAchievements,
  } = useGetAchievements();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchProfile(), refetchStats(), refetchAchievements()]);
    setRefreshing(false);
  };

  if (profileLoading || statsLoading || achievementsLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.Primary} size="large" />
      </View>
    );
  }

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarLarge}>
          {profile?.avatar_url ? (
            <CustomImage
              src={profile.avatar_url}
              width={80}
              height={80}
              style={{ borderRadius: 40 }}
            />
          ) : (
            <Text size={TextType.h1} fontWeight="bold" color="white">
              {initials}
            </Text>
          )}
        </View>
        <Text
          size={TextType.h1}
          fontWeight="bold"
          fontFamily={FontFamily.jakarta}
          style={{ textAlign: 'center' }}
        >
          {profile?.name || ''}
        </Text>
        <Text size={TextType.b2} color={Colors.TextSecondary} style={{ textAlign: 'center' }}>
          {profile?.bio || profile?.email || ''}
        </Text>
        {stats && (
          <View style={styles.streakBadge}>
            <Text size={TextType.b2} fontWeight="bold" color="#D97706">
              🔥 {stats.activity.current_streak} Day Streak
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* Level progress */}
        {stats && (
          <View style={styles.progressCard}>
            <View style={styles.progressTop}>
              <View>
                <Text size={TextType.h2} fontWeight="bold" fontFamily={FontFamily.jakarta}>
                  {stats.level.name}
                </Text>
                <Text size={TextType.b3} color={Colors.TextTertiary}>
                  {stats.level.xp_to_next_level} XP untuk Level {stats.level.current + 1}
                </Text>
              </View>
              <View style={styles.levelBadge}>
                <Text size={TextType.b1} fontWeight="bold" color="white">
                  {stats.level.current}
                </Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${stats.level.progress_percentage}%` as any },
                ]}
              />
            </View>
          </View>
        )}

        {/* Stats grid */}
        {stats && (
          <View style={styles.statsGrid}>
            <StatCard label="Total XP" value={stats.xp.total} iconSrc={xp} />
            <StatCard
              label="Total Kursus"
              value={stats.activity.total_course_enrolled}
              iconSrc={courses}
            />
            <StatCard label="Total Jam Belajar" value={stats.xp.period} iconSrc={time} />
            <StatCard
              label="Streak Terpanjang"
              value={stats.activity.longest_streak}
              iconSrc={date}
            />
          </View>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <View style={{ gap: 12 }}>
            <View style={styles.sectionHeaderRow}>
              <Text size={TextType.h2} fontWeight="bold" fontFamily={FontFamily.jakarta}>
                Pencapaian
              </Text>
            </View>
            <View style={styles.achievementGrid}>
              {achievements.slice(0, 9).map((item) => (
                <View key={item.id} style={styles.achievementItem}>
                  <View style={styles.achievementImg}>
                    <CustomImage src={item.icon_url || ''} width={64} height={64} />
                  </View>
                  <Text
                    size={TextType.b3}
                    color={Colors.TextSecondary}
                    style={{ textAlign: 'center' }}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Settings */}
        <View style={{ gap: 8 }}>
          <Text size={TextType.h2} fontWeight="bold" fontFamily={FontFamily.jakarta}>
            Pengaturan Akun
          </Text>
          <View style={styles.settingsCard}>
            {SETTINGS_MENU.map((item, idx) => (
              <TouchableOpacity
                key={item.screen}
                onPress={() =>
                  router.push({
                    pathname: '/profile-settings',
                    params: { screen: item.screen },
                  })
                }
                style={[
                  styles.settingsRow,
                  idx < SETTINGS_MENU.length - 1 && styles.settingsDivider,
                ]}
              >
                <View style={styles.settingsIcon}>
                  <CustomImage src={item.icon} width={20} height={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text size={TextType.b1}>{item.label}</Text>
                  <Text size={TextType.p} color={Colors.TextTertiary}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.Canvas },
  scrollContent: { paddingBottom: 80 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: Colors.Surface,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Border,
  },
  avatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.Primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 4,
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 4,
  },
  body: { padding: 16, gap: 20 },
  progressCard: {
    backgroundColor: Colors.Surface,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.Primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarBg: {
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.N100,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.Primary },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.Surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementItem: { width: 80, alignItems: 'center', gap: 6 },
  achievementImg: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.Border,
    backgroundColor: Colors.Surface,
    overflow: 'hidden',
    width: 64,
    height: 64,
  },
  settingsCard: {
    backgroundColor: Colors.Surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.Border,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingsDivider: { borderBottomWidth: 1, borderBottomColor: Colors.Divider },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.N100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
