import { useEffect } from 'react';

import { fire, fireSvg, xpFilled } from '@/assets/images/icon';
import CourseCard from '@/components/CoursesCard/CoursesCard';
import { PullToRefresh } from '@/components/PullToRefresh/PullToRefresh';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Card from '@/components/common/Card/Card';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { getTimeOfDay } from '@/lib/helper/getTime';

import {
  useGetDashboardRecentLearning,
  useGetDashboardSummary,
  useGetRecommendedCourses,
} from '../../usecase/useGetAllDashboard';
import { useGetAchievements } from '../../usecase/useGetProfile';
import style from './Home.module.css';

export default function LearningDashboard() {
  const { user, navigateTo } = useNativeBridge();

  const { summary, refetch: refetchGetDashboardSummary } = useGetDashboardSummary();
  const { recentLearning, refetch: refetchGetDashboardRecentLearning } =
    useGetDashboardRecentLearning();
  const { achievements, refetch: refetchGetAchievements } = useGetAchievements();
  const { recommendedCourses, refetch: refetchGetRecommendedCourses } = useGetRecommendedCourses();

  const gradients = {
    pagi: 'linear-gradient(180deg, #E3F2FD 0%, #FFE0B2 40%, #FFF9C4 100%)',
    siang: 'linear-gradient(180deg, #E3F4FF 0%, #B3E5FC 50%, #FFFFFF 100%)',
    sore: 'linear-gradient(180deg, #FF9E80 0%, #F48FB1 40%, #CE93D8 80%, #5C6BC0 100%)',
    malam: 'linear-gradient(180deg, #1A237E 0%, #283593 50%, #3F51B5 100%)',
  };

  const refetchAll = () => {
    refetchGetDashboardSummary();
    refetchGetDashboardRecentLearning();
    refetchGetAchievements();
    refetchGetRecommendedCourses();
  };
  const timeOfDay = getTimeOfDay();

  useEffect(() => {
    // console.log(JSON.stringify(recentLearning, null, 2));
  }, [recentLearning]);

  return (
    recommendedCourses && (
      <PullToRefresh onRefresh={async () => refetchAll()}>
        <scroll-view className="flex-1 animate-fade-in bg-slate-50 pb-[80px]">
          {/* Header Section */}
          <view
            className="min-h-[20vh] flex-col px-4 pb-10 pt-8 flex"
            style={{ background: gradients[timeOfDay] || gradients.pagi }}
          >
            <view className="w-full flex-col gap-2.5 flex">
              <view className="flex-row items-center flex justify-between">
                <view className="flex-col gap-1 flex">
                  <Text
                    size={TextType.b2}
                    color={timeOfDay == 'malam' ? 'white' : 'black'}
                    className="opacity-90"
                  >
                    Selamat {timeOfDay},
                  </Text>
                  <Text
                    size={TextType.h1}
                    fontWeight="bold"
                    color={timeOfDay == 'malam' ? 'white' : 'black'}
                  >
                    {user?.name || ''}
                  </Text>
                </view>
                <view className="h-[60px] w-[60px] items-center rounded-full border border-white/30 bg-white/20 flex justify-center">
                  {user?.avatar_url ? (
                    <CustomImage src={user?.avatar_url || ''} className="h-12 w-12 rounded-full" />
                  ) : (
                    <Text color="white" size={TextType.h3} fontWeight="bold">
                      {user?.name.split(' ')[0][0] + (user?.name.split(' ')[1][0] || '')}
                    </Text>
                  )}
                </view>
              </view>

              {summary && (
                <view className="mt-2 flex-row items-center gap-2 flex">
                  {/* Streak Badge */}
                  <view
                    className="flex-row items-center gap-2 rounded-xl px-5 py-2 flex"
                    style={{ background: 'linear-gradient(90deg, #e23d3d, #e98980)' }}
                  >
                    <CustomImage src={fireSvg} className="h-6 w-[18px]" />
                    <view className="flex-col flex">
                      <Text size={TextType.h2} fontWeight="bold" color="white">
                        {summary.gamification_stats.day_streak || 0}
                      </Text>
                      <Text size={TextType.b3} color="white" className="opacity-80">
                        Hari Streak
                      </Text>
                    </view>
                  </view>

                  {/* XP Badge */}
                  <view
                    className="items-center gap-2 self-stretch rounded-xl px-3 py-3 flex"
                    style={{ background: 'linear-gradient(180deg, #f7b500, #f2d06b)' }}
                  >
                    <CustomImage src={xpFilled} className="h-6 w-[18px]" />

                    <Text size={TextType.b1} fontWeight="bold" color="white">
                      {summary.gamification_stats.xp || 0} XP
                    </Text>
                  </view>
                </view>
              )}
            </view>
          </view>
          <view className="mt-5 flex-col gap-4 px-4 flex">
            {/* Continue Learning */}
            {recentLearning && recentLearning.length > 0 && (
              <view className="flex-col gap-3 flex">
                <SectionHeader title="Lanjut Belajar" bindTap={() => navigateTo('myCourse')} />
                <Card
                  className="flex-row items-center gap-4 rounded-2xl bg-white p-1 flex shadow-sm"
                  bindTap={() =>
                    navigateTo('courseDetail', {
                      courseId: recentLearning[0].course.id,
                      course_slug: recentLearning[0].course.slug,
                    })
                  }
                >
                  <view className="h-24 w-24 rounded-xl overflow-hidden">
                    <CustomImage
                      src={recentLearning[0].course?.thumbnail || ''}
                      className="h-full w-full"
                    />
                  </view>
                  <view className="flex-1 flex-col gap-1 flex">
                    <Text size={TextType.b1} fontWeight="bold" className="text-slate-800">
                      {recentLearning[0].course?.title || ''}
                    </Text>
                    <Text size={TextType.b3} color={Colors.Primary}>
                      {recentLearning[0].progress.completed_lessons} dari{' '}
                      {recentLearning[0].progress.total_lessons} materi
                    </Text>
                    <view className="mt-1 flex-row items-center gap-2 flex">
                      <view className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                        <view
                          className="h-full rounded-full"
                          style={{
                            backgroundColor: Colors.Primary,
                            width: `${recentLearning[0].progress.percentage}%`,
                          }}
                        />
                      </view>
                      <Text size={TextType.b3} className="text-slate-400">
                        {recentLearning[0].progress.percentage}%
                      </Text>
                    </view>
                  </view>
                </Card>
              </view>
            )}

            {/* Recent Achievements */}
            {achievements && achievements.length > 0 && (
              <view className="flex-col gap-1 flex">
                <SectionHeader title="Pencapaian Terbaru" />
                <scroll-view scroll-x className="flex-row py-1 flex">
                  {achievements?.map((i, idx) => {
                    return (
                      <view key={idx} className="mr-4 w-[80px] flex-col items-center flex">
                        <view className="mb-2 rounded-2xl border border-slate-50 bg-white overflow-hidden shadow-sm">
                          <CustomImage className="h-20 w-20" src={i?.icon_url || ''} />
                        </view>
                        <Text className="text-slate-600 text-center" size={TextType.b3}>
                          {i.name}
                        </Text>
                      </view>
                    );
                  })}
                </scroll-view>
              </view>
            )}

            {/* Recommended Course */}
            <view className="flex-col gap-1 flex">
              <SectionHeader title="Rekomendasi Kursus" isSeeAll={false} />
              {recommendedCourses.map((course) => (
                <CourseCard
                  bindTap={() =>
                    navigateTo('courseDetail', {
                      courseId: course.id,
                      course_slug: course.slug,
                    })
                  }
                  key={course.id}
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
            </view>
          </view>
        </scroll-view>
      </PullToRefresh>
    )
  );
}

function SectionHeader({
  title,
  bindTap,
  isSeeAll = true,
}: {
  title: string;
  bindTap?: () => void;
  isSeeAll?: boolean;
}) {
  return (
    <view className={style.sectionHeaderRow}>
      <Text size={TextType.h2} fontWeight="bold">
        {title}
      </Text>
      {isSeeAll && (
        <Text size={TextType.b2} style={{ color: Colors.Primary }} onClick={bindTap}>
          Lihat Semua
        </Text>
      )}
    </view>
  );
}
