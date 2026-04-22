import { type FC, useEffect } from '@lynx-js/react';
import { close } from 'sparkling-navigation';

import { back } from '@/assets/images/icon';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card/Card';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import styles from './CourseDetail.module.css';
import { UnitSection } from './components/Units';
import { useGetCourseDetail } from './usecase/useCourseDetail';

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  isCompleted: boolean;
  isLocked: boolean;
  xpValue: number;
}

export interface CourseDetailData {
  id: string;
  title: string;
  category: string;
  instructor: string;
  description: string;
  bannerUrl: string;
  totalDuration: string;
  lessonCount: number;
  totalXP: number;
  progressPercentage: number;
  lessons: Lesson[];
}

export const CourseDetail: FC = () => {
  const { routerParams } = useNativeBridge();
  const { courses, isLoading } = useGetCourseDetail({
    slug: routerParams?.slug || '',
  });

  useEffect(() => {
    if (!courses) return;
  }, [courses]);

  return (
    !isLoading && (
      // <></>
      <scroll-view className={styles.container} scroll-y>
        {/* 1. Hero Header */}
        <view
          className={styles.hero}
          style={{
            backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%), url(${courses.banner})`,
          }}
        >
          <view className={styles.navRow}>
            <view className={styles.iconBtn} bindtap={() => close()}>
              <CustomImage src={back} className={styles.backButton} />
            </view>
          </view>
          <view className={styles.badge} style={{ backgroundColor: Colors.Primary }}>
            <Text size={TextType.b3} className={styles.badgeText} color="white">
              {courses.category.name}
            </Text>
          </view>
          <Text
            className={styles.courseTitle}
            size={TextType.h1}
            fontFamily={FontFamily.jakarta}
            color={'white'}
          >
            {courses.title}
          </Text>
          <Text className={styles.descriptionText} size={TextType.b2} color={'white'}>
            {courses.short_desc}
          </Text>

          <view className={styles.metaRow}>
            {/* <Text className={styles.metaItem}>🕒 {data.totalDuration}</Text>
            <Text className={styles.metaItem}>⚡ {data.totalXP} XP</Text> */}
          </view>
        </view>

        {/* 2. Overlapping Progress Card */}
        <view className={styles.contentBody}>
          <Card className={styles.progressCard}>
            {courses.enrollment_status === 'active' ? (
              <>
                <view className={styles.progressTextRow}>
                  <Text className={styles.cardLabel} size={TextType.b1}>
                    Your Progress
                  </Text>
                  <Text className={styles.cardValue} color={Colors.Primary} size={TextType.h2}>
                    {courses.progress.percentage}%
                  </Text>
                </view>
                <view className={styles.progressBarBg}>
                  <view
                    className={styles.progressBarFill}
                    style={{
                      width: `${courses.progress.percentage}%`,
                      backgroundColor: Colors.Primary,
                    }}
                  />
                </view>
                <Button variant="outlined" color="primary">
                  Continue Learning
                </Button>
              </>
            ) : (
              <Text size={TextType.h2} color={Colors.Primary}>
                Enroll to Start Learning!
              </Text>
            )}
          </Card>

          {/* 4. Lesson List */}
          {courses.units && courses.units && (
            <Text className={styles.sectionTitle} size={TextType.h2}>
              Course Units
            </Text>
          )}
          {courses.units &&
            courses.units.map((unit, index) => (
              <UnitSection
                key={unit.id}
                unit={unit}
                isLastAccessed={
                  courses?.progress?.last_accessed_unit
                    ? unit.id == courses.progress.last_accessed_unit.id
                    : false
                }
              />
            ))}
        </view>
      </scroll-view>
    )
  );
};
