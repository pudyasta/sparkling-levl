import { useEffect, useState } from '@lynx-js/react';

import { Loading } from '@/components/Loading/Loading';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import AssignmentContent from './components/Assignment';
import LessonContent from './components/Lessons';
import QuizContent from './components/Quiz';
import type { AssignmentStudentResponse } from './repository/type/assignment';
import type { LessonData } from './repository/type/lessons';
import type { QuizStudentResponse } from './repository/type/quiz';
import { useGetLessons } from './usecase/useGetLessons';
import { useMarkAsDone } from './usecase/useMarkAsDone';
import { type SubmitAssignmentRequest, useSubmitAssignment } from './usecase/useSubmitAssignment';

const LessonPage = () => {
  const { routerParams } = useNativeBridge();
  const { execute } = useMarkAsDone();
  const { execute: submitAssignment } = useSubmitAssignment();
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
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  let allLessons = routerParams?.all_lessons || [];

  const {
    data: lessons,
    isLoading: isLoadingApi,
    refetch,
    error,
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
    refetch().finally(() => {
      setIsLoading(false);
    });
  }, [currentParams, isLoading]);

  const handleSetCompleted = () => {
    const complete = allLessons.filter((l: any) => l.is_completed)?.length || 0;
    setCompletedLessons(complete);
    setProgressPercentage(allLessons?.length > 0 ? (complete / allLessons?.length) * 100 : 0);
  };

  useEffect(() => {
    handleSetCompleted();
  }, []);

  useEffect(() => {
    console.log(JSON.stringify(error, null, 2));
    console.log(JSON.stringify(lessons, null, 2));
  }, [lessons]);

  const handleBottomSheetHeight = (length: number) => {
    if (length <= 2) return '25vh';
    if (length <= 4) return '40vh';
    return '45vh';
  };

  const handleMarkAsDoneLessons = () => {
    setIsButtonLoading(true);
    execute(currentParams.lesson_slug, {
      onSuccess: (data) => {
        console.log(data);
        setIsButtonLoading(false);
        refetch();
        allLessons[lessons!.data?.order - 1].is_completed = true;
        if (lessons!.data?.order && lessons!.data?.order < allLessons?.length) {
          allLessons[lessons!.data?.order].is_locked = false;
        }
        handleSetCompleted();
        setIsModalOpen(true);

        return;
      },
      onError: (error) => {
        setIsModalOpen(true);
        setIsButtonLoading(false);
        return;
      },
    });
  };

  const handleSubmitAssignment = (request: SubmitAssignmentRequest) => {
    submitAssignment({ ...request, assignmentID: lessons!.data.id });
  };

  const renderContent = () => {
    if (isLoading)
      return (
        <view className="h-[100vh] items-center flex justify-center">
          <Loading size={32} />
        </view>
      );

    switch (currentParams.type) {
      case 'assignment':
        return (
          <AssignmentContent
            data={lessons?.data as AssignmentStudentResponse}
            onSubmit={handleSubmitAssignment}
          />
        );
      case 'quiz':
        return <QuizContent data={lessons?.data as QuizStudentResponse} />;
      default:
        return (
          <LessonContent
            data={lessons?.data as LessonData}
            handleMarkAsDoneLessons={handleMarkAsDoneLessons}
            loading={isButtonLoading}
          />
        );
    }
  };

  return (
    !isLoadingApi && (
      <view className="h-screen w-full relative">
        <scroll-view className="h-full w-full p-5" scroll-y>
          {isLoadingApi ? <Loading /> : renderContent()}
        </scroll-view>

        {/* Progress Trigger */}
        <view
          className="z-[110] w-full border-b border-[#f1f3f4] bg-white p-4 px-5 absolute top-0"
          bindtap={() => setIsSheetOpen(!isSheetOpen)}
        >
          <view className="mb-2 flex-row flex justify-between">
            <Text size={TextType.b1}>
              Course Progress {completedLessons}/{routerParams?.all_lessons?.length || 0}
            </Text>
            <Text>{isSheetOpen ? '▼' : '▲'}</Text>
          </view>
          <view className={`bg-[#f1f3f4]} h-1.5 w-full rounded-full`}>
            <view
              className={`h-full rounded-full transition duration-300 ease-in-out`}
              style={{ backgroundColor: Colors.Primary, width: `${progressPercentage}%` }}
            />
          </view>
        </view>

        {/* Bottom Sheet List */}
        <view
          className={`duration-350 z-[105] w-full rounded-b-3xl bg-white p-4 absolute top-0 shadow-2xl transition-transform ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSheetOpen ? 'translate-y-[60px]' : '-translate-y-full'}`}
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
          </scroll-view>
        </view>
        {currentParams.type === 'lesson' && (
          <Modal
            template={ModalTemplate.Sad}
            visible={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Yeay kamu berhasil"
            body={`Kamu mendapatkan +${lessons?.data.xp_reward} XP`}
            buttonText="Lanjut ke lesson selanjutnya"
            onButtonPress={() => {
              console.log('index', lessons!.data.order);
              handlePageChange(lessons!.data.order);
            }}
          />
        )}
      </view>
    )
  );
};

export default LessonPage;
