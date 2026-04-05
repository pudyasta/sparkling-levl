import { loginBanner } from '@/assets/images/pages';
import { Colors } from '@/constant/style';
import style from './Home.module.css';
import Text from '@/components/Text';
import Card from '@/components/common/Card/Card';
import { dummy, fire } from '@/assets/images/icon';
import { TextType } from '@/components/Text/types';
import CourseCard from '@/components/CoursesCard/CoursesCard';
import { getTimeOfDay } from '@/lib/helper/getTime';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { useGetAchievements, useGetGamificationStats } from '../../usecase/useGetProfile';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import {
  useGetDashboardRecentLearning,
  useGetDashboardSummary,
  useGetRecommendedCourses,
} from '../../usecase/useGetAllDashboard';

export default function LearningDashboard() {
  const { user, navigateTo } = useNativeBridge();

  const { summary } = useGetDashboardSummary();
  const { recentLearning } = useGetDashboardRecentLearning();
  const { achievements } = useGetAchievements();
  const { recommendedCourses } = useGetRecommendedCourses();

  return (
    recentLearning &&
    summary &&
    recommendedCourses && (
      <scroll-view className={style.container} scroll-y>
        {/* Header Section */}
        <view
          style={{
            background: 'linear-gradient(180deg, #2d7cf1 0%, #1a5bb9 100%)',
          }}
          className={style.header}
        >
          <view className={style.headerContent}>
            <view className={style.headerInfo}>
              <view className={style.headerName}>
                <Text size={TextType.b2} color="white">
                  Good {getTimeOfDay()},
                </Text>
                <Text size={TextType.h1} bold color="white">
                  {user?.name || ''}
                </Text>
              </view>
              <view className={style.avatarContainer}>
                <text className={style.avatarText}>AC</text>
              </view>
            </view>
            <view className={style.statsRow}>
              <view className={style.streakBadge}>
                <image src={fire} className={style.fireIcon} />
                <view>
                  <Text size={TextType.h2} bold color="white">
                    {summary?.streak.current || 0}
                  </Text>
                  <Text size={TextType.b3} color="white">
                    Days Streak
                  </Text>
                </view>
              </view>
              <view className={style.xpBadge}>
                <Text size={TextType.b1} className={style.xpText} color="white">
                  ✨ +{summary.xp.this_month || 0} XP
                </Text>
              </view>
            </view>
          </view>
        </view>

        <view className={style.contentWrapper}>
          {/* Continue Learning */}
          <view>
            <SectionHeader title="Continue Learning" />
            <Card
              className={style.courseCard}
              bindTap={() =>
                navigateTo('courseDetail.lynx.bundle', {
                  courseId: recentLearning[0].course.id,
                  slug: recentLearning[0].course.slug,
                })
              }
            >
              <CustomImage
                src={recentLearning[0].course.thumbnail}
                className={style.courseThumbnail}
              />
              <view className={style.content}>
                <Text size={TextType.b1} bold className={style.courseTitle}>
                  {recentLearning[0].course.title}
                </Text>
                <Text size={TextType.b3} color={Colors.Primary}>
                  {recentLearning[0].progress.completed_lessons} of{' '}
                  {recentLearning[0].progress.total_lessons} lessons{' - '}
                  <Text size={TextType.b3}>{recentLearning[0].last_lesson.title}</Text>
                </Text>
                <view className={style.progressBarTrack}>
                  <view
                    className={style.progressBarFill}
                    style={{
                      backgroundColor: Colors.Primary,
                      width: `${recentLearning[0].progress.percentage}%`,
                    }}
                  />
                </view>
              </view>
            </Card>
          </view>

          {/* Recent Achievements */}
          <view>
            <SectionHeader title="Recent Achievements" />
            <scroll-view scroll-x className={style.achievementScroll}>
              {achievements?.map((i) => (
                <view className={style.achievementItem}>
                  <view className={style.imageWrapper}>
                    <CustomImage className={style.achievementIcon} src={i.icon_url} />
                  </view>
                  <Text className={style.achievementLabel} size={TextType.b3}>
                    {i.name}
                  </Text>
                </view>
              ))}
            </scroll-view>
          </view>

          {/* Recommended */}
          <view>
            <SectionHeader title="Recommended Course" />
            {/* <CourseCard /> */}
            {recommendedCourses.map((course) => (
              <CourseCard
                key={course.id}
                title={course.title}
                desc={course.description}
                difficulty={course.instructor.name}
                image={course.thumbnail}
                bindTap={() =>
                  navigateTo('courseDetail.lynx.bundle', {
                    courseId: recentLearning[0].course.id,
                    slug: course.slug,
                  })
                }
              />
            ))}
          </view>
        </view>
      </scroll-view>
    )
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <view className={style.sectionHeaderRow}>
      <Text size={TextType.h2} bold>
        {title}
      </Text>
      <Text size={TextType.b2} style={{ color: Colors.Primary }}>
        See All &gt;
      </Text>
    </view>
  );
}
