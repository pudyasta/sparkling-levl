import { type FC, useEffect, useLynxGlobalEventListener } from '@lynx-js/react';
import { close } from 'sparkling-navigation';

import { back } from '@/assets/images/icon';
import { PullToRefresh } from '@/components/PullToRefresh/PullToRefresh';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card/Card';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import Shimmer from '@/components/common/Shimmer/Shimmer';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { htmlToPlainText } from '@/lib/helper/htmlToLynx';

import { Enroll } from './components/Enroll';
import { UnitSection } from './components/Units';
import type { EnrollmentType } from './type/enrollment';
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
const CourseDetailSkeleton = () => (
  <scroll-view className="h-full w-full bg-slate-50" scroll-y>
    {/* Hero Skeleton */}
    <view className="bg-[#c7c7c7] px-6 pb-[70px] pt-[50px]">
      {/* Back button */}
      <Shimmer isRound width={40} height={40} className="mb-6" />

      {/* Badge */}
      <Shimmer width={80} height={24} className="mb-3 rounded-lg" />

      {/* Title */}
      <Shimmer height={40} className="mb-2 rounded-lg" />
      <Shimmer width="60%" height={40} className="mb-4 rounded-lg" />

      {/* Description */}
      <Shimmer height={18} className="mb-2 rounded-lg" />
      <Shimmer height={18} className="mb-2 rounded-lg" />
      <Shimmer width="75%" height={18} className="rounded-lg" />
    </view>

    {/* Content Body */}
    <view className="-mt-[60px] px-5 pb-10">
      {/* Progress Card Skeleton */}
      <view className="mb-4 rounded-2xl bg-white p-6 shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
        <view className="mb-3 flex-row flex justify-between">
          <Shimmer width={120} height={20} className="rounded-lg" />
          <Shimmer width={50} height={20} className="rounded-lg" />
        </view>
        <Shimmer height={10} className="mb-5 rounded-full" />
        <Shimmer height={44} className="rounded-xl" />
      </view>

      {/* Section Title */}
      <Shimmer width={140} height={24} className="mb-4 mt-2 rounded-lg" />

      {/* Unit Items */}
      {[1, 2, 3].map((i) => (
        <view key={i} className="mb-3 rounded-2xl border border-slate-100 bg-white p-4">
          <view className="mb-2 flex-row items-center flex justify-between">
            <Shimmer width="70%" height={20} className="rounded-lg" />
            <Shimmer width={24} height={24} className="rounded-lg" />
          </view>
          <Shimmer width="45%" height={14} className="rounded-lg" />
        </view>
      ))}
    </view>
  </scroll-view>
);

export const CourseDetail: FC = () => {
  const { routerParams, navigateTo } = useNativeBridge();
  const { courses, isLoading, refetch } = useGetCourseDetail({
    slug: routerParams?.course_slug || '',
  });

  useLynxGlobalEventListener('nativePageResumed', (res) => {
    console.log('back from page');
    // refresh data here
  });

  const refetchAll = () => {
    console.log(routerParams);
    refetch();
  };

  const continueLearning = () => {
    const lesson = courses.progress.last_accessed_lesson;
    const unit = courses.progress.last_accessed_unit;

    const currentUnit = courses.units.find((u) => u.id === courses.progress.last_accessed_unit.id);

    if (!currentUnit) {
      return;
    }
    const currentLesson = currentUnit.elements.find(
      (l) => l.id === courses.progress.last_accessed_lesson?.id
    );
    if (!currentLesson) {
      return;
    }

    const i = currentUnit?.elements.indexOf(currentLesson);

    navigateTo('lessons', {
      courseId: courses.id,
      lesson_slug: lesson.slug,
      unit_slug: unit.slug,
      course_slug: courses.slug,
      all_lessons: currentUnit.elements,
      next_course: i < currentUnit.elements.length - 1 ? currentUnit.elements[i + 1].slug : null,
      // back_course: i > 0 ? currentUnit.elements[i - 1].slug : null,
      type: currentLesson.type,
      assignment_id: lesson.id,
    });
  };
  useEffect(() => {
    console.log(routerParams);
  }, []);

  return isLoading ? (
    <CourseDetailSkeleton />
  ) : (
    <PullToRefresh onRefresh={async () => refetchAll()}>
      {(scrollProps) => (
        <scroll-view
          className="h-[100vh] animate-fade-in flex-col bg-slate-50 flex"
          scroll-y
          bindscrolltoupper={scrollProps.bindscrolltoupper}
          bindscroll={scrollProps.bindscroll}
        >
          {/* 1. Hero Header */}
          <view
            className="bg-cover bg-center px-6 pb-[70px] pt-[50px]"
            style={{
              backgroundImage: `linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%), url(${courses?.banner})`,
            }}
          >
            <view className="mb-6 flex-row flex justify-between">
              <view
                className="h-10 w-10 items-center rounded-full bg-white/20 flex justify-center shadow-lg"
                bindtap={() => close()}
              >
                <CustomImage src={back} className="h-[18px] w-[18px] text-white" />
              </view>
            </view>

            <view
              className="mb-3 self-start rounded-lg px-3 py-1"
              style={{ backgroundColor: Colors.Primary }}
            >
              <Text className="text-xs font-bold text-white" size={TextType.b3} color="white">
                {courses?.category.name}
              </Text>
            </view>

            <Text
              className="mb-4 text-[32px] font-extrabold leading-10 text-white"
              size={TextType.h1}
              fontFamily={FontFamily.jakarta}
              color="white"
            >
              {courses?.title}
            </Text>

            <Text
              className="mb-8 text-[15px] leading-6 text-white"
              size={TextType.b2}
              color="white"
            >
              {htmlToPlainText(courses?.short_desc)}
            </Text>

            <view className="flex-row items-center flex" />
          </view>

          {/* 2. Overlapping Progress Card */}
          <view className="-mt-[60px] px-5 pb-10">
            <Card className="p-6 shadow-[0_10px_25px_rgba(0,0,0,0.1)]">
              {courses?.enrollment_status === 'active' ||
              courses?.enrollment_status === 'completed' ? (
                <>
                  <view className="mb-3 flex-row gap-3 flex justify-between">
                    <Text className="text-base font-bold text-slate-800" size={TextType.b1}>
                      Progres Kamu
                    </Text>
                    <Text
                      className="text-lg font-extrabold"
                      color={Colors.Primary}
                      size={TextType.h2}
                    >
                      {courses?.progress?.percentage}%
                    </Text>
                  </view>
                  <view className="mb-5 h-[10px] rounded-full bg-slate-100 overflow-hidden">
                    <view
                      className="h-[10px] rounded-full"
                      style={{
                        width: `${courses?.progress?.percentage}%`,
                        backgroundColor: Colors.Primary,
                      }}
                    />
                  </view>
                  {/* <Button
                    variant="outlined"
                    color="primary"
                    onPress={() => {
                      continueLearning();
                    }}
                  >
                    Continue Learning
                  </Button> */}
                </>
              ) : (
                <Enroll
                  courseSlug={courses?.slug}
                  status={courses.enrollment_status}
                  enrollmentType={courses?.enrollment_type as EnrollmentType} // 'auto_accept' | 'key_based' | 'approval'
                  onEnrollSuccess={() => refetch()}
                />
              )}
            </Card>

            {/* 3. Course Units */}
            {courses.units && (
              <Text
                className="mb-3 mt-2.5 text-xl font-extrabold text-slate-800"
                size={TextType.h2}
              >
                Course Units
              </Text>
            )}

            {courses.units?.map((unit) => (
              <UnitSection
                key={unit.id}
                unit={unit}
                isLastAccessed={
                  courses?.progress?.last_accessed_unit
                    ? unit.id == courses.progress.last_accessed_unit.id
                    : false
                }
                courseSlug={courses.slug}
                courseId={courses.id}
              />
            ))}
          </view>
        </scroll-view>
      )}
    </PullToRefresh>
  );
};
