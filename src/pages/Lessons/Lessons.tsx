import { useEffect, useState } from '@lynx-js/react';
import * as router from 'sparkling-navigation';

import { arrowBackBlack } from '@/assets/images/icon';
import { BackInterceptor } from '@/components/BackInterceptor/BackInterceptor';
import { useConfirmation } from '@/components/ConfirmationModal/ConfitmationModal';
import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { Button } from '@/components/common';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import AssignmentContent from './components/Assignment';
import LessonContent from './components/Lessons';
import QuizContent from './components/Quiz';
import type { AssignmentStudentResponse } from './repository/type/assignment';
import type { LessonData } from './repository/type/lessons';
import type { QuizStudentResponse } from './repository/type/quiz';
import { useGetLessons } from './usecase/useGetLessons';

const LessonPage = () => {
  const { routerParams } = useNativeBridge();

  const [currentParams, setCurrentParams] = useState({
    lesson_slug: routerParams?.lesson_slug || '',
    unit_slug: routerParams?.unit_slug || '',
    course_slug: routerParams?.course_slug || '',
    assignment_id: routerParams?.assignment_id || 0,
    type: routerParams?.type || '',
  });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [totalLessons, setTotalLessons] = useState(0);
  const { confirm, ConfirmationModal } = useConfirmation();

  let allLessons = routerParams?.all_lessons || [];

  const {
    data: lessons,
    isLoading: isLoadingApi,
    refetch,
  } = useGetLessons({
    course_slug: currentParams.course_slug,
    unit_slug: currentParams.unit_slug,
    lesson_slug: currentParams.lesson_slug,
    assignment_id: currentParams.assignment_id,
    type: currentParams.type,
    quiz_id: currentParams.assignment_id,
  });

  const handlePageChange = (index: number) => {
    setIsLoading(true);
    const target = allLessons[index];
    if (!target || target.is_locked) return;

    setCurrentParams({
      ...currentParams,
      lesson_slug: target.slug,
      assignment_id: target.id,
      type: target.type,
    });
    setIsSheetOpen(false);
  };

  useEffect(() => {
    refetch().finally(() => setIsLoading(false));
  }, [currentParams, isLoading]);

  const handleSetCompleted = () => {
    const complete = allLessons.filter((l: any) => l.is_completed)?.length || 0;
    setCompletedLessons(complete);
    setProgressPercentage(allLessons?.length > 0 ? (complete / allLessons?.length) * 100 : 0);
  };

  useEffect(() => {
    setTotalLessons(allLessons.length);
    handleSetCompleted();
  }, []);

  const handleLessonCompleted = (nextIndex: number) => {
    allLessons[lessons!.data?.order - 1].is_completed = true;
    if (lessons!.data?.order && lessons!.data?.order < allLessons?.length) {
      allLessons[lessons!.data?.order].is_locked = false;
    }
    handleSetCompleted();
    refetch();
    handlePageChange(nextIndex);
  };

  const handleBottomSheetHeight = (length: number) => {
    if (length <= 2) return '25vh';
    if (length <= 4) return '40vh';
    return '45vh';
  };

  const renderContent = () => {
    switch (currentParams.type) {
      case 'assignment':
        return (
          <AssignmentContent
            data={lessons?.data as AssignmentStudentResponse}
            onDataChanged={refetch}
          />
        );
      case 'quiz':
        return <QuizContent data={lessons?.data as QuizStudentResponse} />;
      default:
        return (
          <LessonContent
            data={lessons?.data as LessonData}
            lessonSlug={currentParams.lesson_slug}
            onCompleted={handleLessonCompleted}
          />
        );
    }
  };

  return (
    !isLoadingApi && (
      <view className="h-screen w-full relative">
        <scroll-view className="h-full w-full" scroll-y>
          {isLoading ? (
            <view className="h-[100vh] items-center flex justify-center">
              <Loading size={32} />
            </view>
          ) : (
            <view
              key={`${currentParams.lesson_slug}-${currentParams.assignment_id}`}
              className="animate-fade-in"
            >
              {renderContent()}
            </view>
          )}
        </scroll-view>

        {/* Progress Trigger */}
        <view className="z-[110] w-full items-center gap-4 border-b border-[#f1f3f4] bg-white p-4 px-5 flex absolute top-0">
          <view
            bindtap={() => confirm(() => router.close())}
            className="h-9 w-9 items-center rounded-full bg-slate-100 p-2 justify-center"
          >
            <CustomImage className="h-full w-full" src={arrowBackBlack} />
          </view>
          <view className="flex-1" bindtap={() => setIsSheetOpen(!isSheetOpen)}>
            <view className="mb-2 flex-row flex justify-between">
              <Text size={TextType.b1}>
                Progres Kursus {completedLessons} / {totalLessons}
              </Text>
              <Text>{isSheetOpen ? '▼' : '▲'}</Text>
            </view>
            <view className="h-1.5 w-full rounded-full bg-[#f1f3f4]">
              <view
                className="h-full rounded-full transition duration-300 ease-in-out"
                style={{ backgroundColor: Colors.Primary, width: `${progressPercentage}%` }}
              />
            </view>
          </view>
        </view>

        {/* Bottom Sheet List */}
        <view
          className={`z-[105] w-full rounded-b-3xl bg-white p-4 absolute top-0 overflow-hidden shadow-2xl transition-transform duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSheetOpen ? 'translate-y-[60px]' : '-translate-y-full'}`}
          style={{ height: handleBottomSheetHeight(routerParams?.all_lessons?.length || 0) }}
        >
          <scroll-view className="h-full w-full px-1" scroll-y>
            {routerParams?.all_lessons?.map((item: any, i: number) => {
              const isActive = item.id === currentParams.assignment_id;
              return (
                <view
                  key={item.id}
                  bindtap={() => {
                    if (item.is_locked) return;
                    handlePageChange(i);
                  }}
                  className={`mb-2 flex-row items-center rounded-xl border p-4 flex transition-all duration-200 ${isActive ? 'border-[#d1e3ff] bg-[#f0f7ff]' : 'border-transparent'} ${item.is_locked ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <view className="mr-4">
                    {item.is_completed ? (
                      <view className="h-6 w-6 items-center rounded-full bg-[#34a853] flex justify-center">
                        <text className="text-xs font-extrabold text-white">✓</text>
                      </view>
                    ) : (
                      <view
                        className={`h-[22px] w-[22px] rounded-full border-2 bg-white ${isActive ? 'border-[#1a73e8]' : 'border-[#dadce0]'}`}
                      />
                    )}
                  </view>
                  <text
                    className={`text-base font-medium ${isActive ? 'font-bold text-[#1a73e8]' : 'text-[#3c4043]'}`}
                  >
                    {item.title}
                  </text>
                </view>
              );
            })}
            <Button variant="outlined" color="secondary" onPress={() => router.close()}>
              Keluar
            </Button>
          </scroll-view>
        </view>

        <ConfirmationModal />
        <BackInterceptor />
      </view>
    )
  );
};

export default LessonPage;
