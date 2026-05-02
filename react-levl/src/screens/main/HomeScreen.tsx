import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLoading from '@/components/AppLoading';
import AppText, { TextType } from '@/components/AppText';
import { Colors } from '@/constant/colors';
import { useAuth } from '@/context/AuthContext';
import { getTimeOfDay } from '@/lib/helper/getTime';
import { useGetAchievements, useGetGamificationStats } from '@/usecase/main/useGetProfile';
import {
  useGetDashboardRecentLearning,
  useGetDashboardSummary,
  useGetRecommendedCourses,
} from '@/usecase/main/useGetAllDashboard';
import type { RootStackParamList } from '@/types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const gradients: Record<string, string[]> = {
  pagi: ['#E3F2FD', '#FFE0B2'],
  siang: ['#E3F4FF', '#B3E5FC'],
  sore: ['#FF9E80', '#CE93D8'],
  malam: ['#1A237E', '#3F51B5'],
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const timeOfDay = getTimeOfDay();
  const isDark = timeOfDay === 'malam';

  const { summary, refetch: refetchSummary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { recentLearning, refetch: refetchRecent, isLoading: loadingRecent } = useGetDashboardRecentLearning();
  const { achievements, refetch: refetchAch } = useGetAchievements();
  const { recommendedCourses, refetch: refetchRec } = useGetRecommendedCourses();

  const isLoading = loadingSummary || loadingRecent;

  const refetchAll = () => {
    refetchSummary();
    refetchRecent();
    refetchAch();
    refetchRec();
  };

  if (isLoading) return <AppLoading fullScreen />;

  const recent = recentLearning?.[0];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetchAll} />}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: gradients[timeOfDay]?.[0] ?? '#E3F2FD' },
          ]}
        >
          <View style={styles.headerRow}>
            <View>
              <AppText size={TextType.b2} color={isDark ? 'white' : 'black'}>
                Selamat {timeOfDay},
              </AppText>
              <AppText size={TextType.h1} fontWeight="bold" color={isDark ? 'white' : 'black'}>
                {user?.name || ''}
              </AppText>
            </View>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                {user?.name?.slice(0, 2).toUpperCase() ?? 'AC'}
              </Text>
            </View>
          </View>

          {summary && (
            <View style={styles.badges}>
              <View style={styles.streakBadge}>
                <Text style={{ fontSize: 18 }}>🔥</Text>
                <View>
                  <AppText size={TextType.h2} fontWeight="bold" color="white">
                    {summary.gamification_stats?.day_streak ?? 0}
                  </AppText>
                  <AppText size={TextType.b3} color="white">Days Streak</AppText>
                </View>
              </View>
              <View style={styles.xpBadge}>
                <AppText size={TextType.b1} fontWeight="bold" color="white">
                  ✨ +{summary.gamification_stats?.xp ?? 0} XP
                </AppText>
              </View>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Continue Learning */}
          {recent && (
            <View style={styles.section}>
              <SectionHeader
                title="Lanjut Belajar"
                onSeeAll={() => navigation.navigate('MyCourses')}
              />
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('CourseDetail', {
                    courseId: recent.course.id,
                    slug: recent.course.slug,
                  })
                }
                style={styles.recentCard}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: recent.course.thumbnail }}
                  style={styles.recentImage}
                  contentFit="cover"
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <AppText size={TextType.b1} fontWeight="bold" numberOfLines={2}>
                    {recent.course.title}
                  </AppText>
                  <AppText size={TextType.b3} color={Colors.Primary}>
                    {recent.progress.completed_lessons} of {recent.progress.total_lessons} lessons
                  </AppText>
                  <View style={styles.progressRow}>
                    <View style={styles.progressBg}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${recent.progress.percentage}%` as any },
                        ]}
                      />
                    </View>
                    <AppText size={TextType.b3} color={Colors.Disabled}>
                      {recent.progress.percentage}%
                    </AppText>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Achievements */}
          {achievements && achievements.length > 0 && (
            <View style={styles.section}>
              <SectionHeader title="Pencapaian Terbaru" isSeeAll={false} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {achievements.map((ach: any, i: number) => (
                  <View key={i} style={styles.achItem}>
                    <Image source={{ uri: ach.icon_url }} style={styles.achIcon} contentFit="cover" />
                    <AppText size={TextType.b3} style={{ textAlign: 'center', marginTop: 6 }}>
                      {ach.name}
                    </AppText>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({
  title,
  onSeeAll,
  isSeeAll = true,
}: {
  title: string;
  onSeeAll?: () => void;
  isSeeAll?: boolean;
}) {
  return (
    <View style={styles.sectionHeader}>
      <AppText size={TextType.h2} fontWeight="bold">{title}</AppText>
      {isSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <AppText size={TextType.b2} color={Colors.Primary}>Lihat Semua</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.Primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: { flexDirection: 'row', gap: 12 },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#e23d3d',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  xpBadge: {
    backgroundColor: '#f7b500',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  body: { padding: 16, gap: 24 },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  recentImage: { width: 88, height: 88, borderRadius: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F3F4',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: Colors.Primary },
  achItem: { width: 80, alignItems: 'center', marginRight: 16 },
  achIcon: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#F1F3F4',
  },
});
