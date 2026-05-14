import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import CourseCard from '@/components/CoursesCard/CoursesCard';
import { Shimmer } from '@/components/common';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { getTimeOfDay } from '@/lib/helper/getTime';
import {
  useGetDashboardRecentLearning,
  useGetDashboardSummary,
  useGetRecommendedCourses,
} from '@/pages/main/usecase/useGetAllDashboard';
import { useGetAchievements } from '@/pages/main/usecase/useGetProfile';
import { fireSvg, xpFilled } from '@/assets/images/icon';

const GRADIENTS: Record<string, [string, string, string]> = {
  pagi: ['#E3F2FD', '#FFE0B2', '#FFF9C4'],
  siang: ['#E3F4FF', '#B3E5FC', '#FFFFFF'],
  sore: ['#FF9E80', '#F48FB1', '#CE93D8'],
  malam: ['#1A237E', '#283593', '#3F51B5'],
};

function HomeShimmer() {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
      <View style={[styles.header, { backgroundColor: '#E3F2FD' }]}>
        <View style={styles.headerRow}>
          <View style={{ gap: 8 }}>
            <Shimmer height={14} width={100} />
            <Shimmer height={28} width={160} />
          </View>
          <Shimmer isRound width={60} height={60} />
        </View>
        <View style={styles.badgeRow}>
          <Shimmer height={56} width={120} borderRadius={12} />
          <Shimmer height={56} width={80} borderRadius={12} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={{ gap: 12 }}>
          <View style={styles.sectionHeaderRow}>
            <Shimmer height={22} width={140} />
            <Shimmer height={14} width={70} />
          </View>
          <View style={styles.recentCard}>
            <Shimmer width={96} height={96} borderRadius={12} />
            <View style={{ flex: 1, gap: 8 }}>
              <Shimmer height={16} width={160} />
              <Shimmer height={12} width={100} />
              <Shimmer height={8} />
            </View>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Shimmer height={22} width={180} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.achievementSkeleton}>
                <Shimmer width={80} height={80} borderRadius={16} />
                <Shimmer height={12} width={60} />
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={{ gap: 8 }}>
          <Shimmer height={22} width={180} />
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.courseSkeleton}>
              <Shimmer height={140} borderRadius={12} />
              <View style={{ gap: 8 }}>
                <Shimmer height={16} width={200} />
                <Shimmer height={12} width={140} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default function HomeScreen() {
  const { user } = useNativeBridge();
  const timeOfDay = getTimeOfDay();
  const gradientColors = GRADIENTS[timeOfDay] ?? GRADIENTS.pagi;
  const isNight = timeOfDay === 'malam';

  const { summary, refetch: refetchSummary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { recentLearning, refetch: refetchRecent } = useGetDashboardRecentLearning();
  const { achievements, refetch: refetchAchievements } = useGetAchievements();
  const { recommendedCourses, isLoading, refetch: refetchCourses } = useGetRecommendedCourses();

  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSummary(), refetchRecent(), refetchAchievements(), refetchCourses()]);
    setRefreshing(false);
  };

  if (isLoading && !recommendedCourses?.length) {
    return <HomeShimmer />;
  }

  const initials =
    user?.name
      ? (user.name.split(' ')[0]?.[0] ?? '') + (user.name.split(' ')[1]?.[0] ?? '')
      : '';

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <LinearGradient colors={gradientColors} style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ gap: 4 }}>
            <Text size={TextType.b2} color={isNight ? 'white' : Colors.TextPrimary}>
              Selamat {timeOfDay},
            </Text>
            <Text size={TextType.h1} fontWeight="bold" color={isNight ? 'white' : Colors.TextPrimary}>
              {user?.name || ''}
            </Text>
          </View>
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <CustomImage src={user.avatar_url} width={48} height={48} style={styles.avatar} />
            ) : (
              <Text color="white" size={TextType.h3} fontWeight="bold">
                {initials}
              </Text>
            )}
          </View>
        </View>

        {summary && (
          <View style={styles.badgeRow}>
            <LinearGradient colors={['#e23d3d', '#e98980']} style={styles.streakBadge} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <CustomImage src={fireSvg} width={18} height={24} />
              <View>
                <Text size={TextType.h2} fontWeight="bold" color="white">
                  {summary.gamification_stats.day_streak || 0}
                </Text>
                <Text size={TextType.b3} color="white">
                  Hari Streak
                </Text>
              </View>
            </LinearGradient>

            <LinearGradient colors={['#f7b500', '#f2d06b']} style={styles.xpBadge}>
              <CustomImage src={xpFilled} width={18} height={24} />
              <Text size={TextType.b1} fontWeight="bold" color="white">
                {summary.gamification_stats.xp || 0} XP
              </Text>
            </LinearGradient>
          </View>
        )}
      </LinearGradient>

      <View style={styles.body}>
        {/* Continue Learning */}
        {recentLearning && recentLearning.length > 0 && (
          <View style={{ gap: 12 }}>
            <SectionHeader title="Lanjut Belajar" onPress={() => router.push('/my-courses')} />
            <TouchableOpacity
              style={styles.recentCard}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/course-detail',
                  params: {
                    courseId: recentLearning[0].course.id,
                    course_slug: recentLearning[0].course.slug,
                  },
                })
              }
            >
              <View style={styles.recentThumb}>
                <Image
                  source={{ uri: recentLearning[0].course?.thumbnail || '' }}
                  style={{ width: 96, height: 96 }}
                  resizeMode="cover"
                />
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text size={TextType.b1} fontWeight="bold" color={Colors.N900} numberOfLines={2}>
                  {recentLearning[0].course?.title || ''}
                </Text>
                <Text size={TextType.b3} color={Colors.Primary}>
                  {recentLearning[0].progress.completed_lessons} dari{' '}
                  {recentLearning[0].progress.total_lessons} materi
                </Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${recentLearning[0].progress.percentage}%` as any },
                      ]}
                    />
                  </View>
                  <Text size={TextType.b3} color={Colors.TextTertiary}>
                    {recentLearning[0].progress.percentage}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Achievements */}
        {achievements && achievements.length > 0 && (
          <View style={{ gap: 8 }}>
            <SectionHeader title="Pencapaian Terbaru" isSeeAll={false} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
              {achievements.map((item, idx) => (
                <View key={idx} style={styles.achievementItem}>
                  <View style={styles.achievementImg}>
                    <CustomImage src={item.icon_url || ''} width={80} height={80} />
                  </View>
                  <Text size={TextType.b3} color={Colors.TextSecondary} style={{ textAlign: 'center' }} numberOfLines={2}>
                    {item.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recommended Courses */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Rekomendasi Kursus" isSeeAll={false} />
          {(recommendedCourses ?? []).map((course) => (
            <CourseCard
              key={course.id}
              bindTap={() =>
                router.push({
                  pathname: '/course-detail',
                  params: { courseId: course.id, course_slug: course.slug },
                })
              }
              course={{
                id: course.id.toString(),
                title: course.title,
                description: course.short_desc,
                level: course.level_tag,
                category: course.category?.name || '',
                image: course.thumbnail,
                lessons: course.units?.length || 0,
              }}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function SectionHeader({
  title,
  onPress,
  isSeeAll = true,
}: {
  title: string;
  onPress?: () => void;
  isSeeAll?: boolean;
}) {
  return (
    <View style={styles.sectionHeaderRow}>
      <Text size={TextType.h2} fontWeight="bold">
        {title}
      </Text>
      {isSeeAll && (
        <TouchableOpacity onPress={onPress}>
          <Text size={TextType.b2} color={Colors.Primary}>
            Lihat Semua
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 80 },
  header: { minHeight: 160, paddingHorizontal: 16, paddingTop: 32, paddingBottom: 40, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  avatarContainer: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 8 },
  xpBadge: { alignItems: 'center', gap: 8, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12 },
  body: { paddingHorizontal: 16, paddingTop: 20, gap: 24 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  recentCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.Surface, borderRadius: 16, padding: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  recentThumb: { width: 96, height: 96, borderRadius: 12, overflow: 'hidden' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  progressBarBg: { flex: 1, height: 8, borderRadius: 999, backgroundColor: '#F1F5F9', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.Primary },
  achievementItem: { marginRight: 16, width: 80, alignItems: 'center', gap: 8 },
  achievementImg: { borderRadius: 16, borderWidth: 1, borderColor: '#F1F5F9', backgroundColor: Colors.Surface, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 1 },
  achievementSkeleton: { marginRight: 16, alignItems: 'center', gap: 8 },
  courseSkeleton: { backgroundColor: Colors.Surface, borderRadius: 16, padding: 16, gap: 12 },
});
