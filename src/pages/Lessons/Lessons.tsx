import { useEffect, useLynxGlobalEventListener, useState } from '@lynx-js/react';
import pipe from 'sparkling-method';

import { Loading } from '@/components/Loading/Loading';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { callToast } from '@/lib/helper/showToast';

import AssignmentContent from './components/Assignment';
import LessonContent from './components/Lessons';
import QuizContent from './components/Quiz';
import type { AssignmentStudentResponse } from './repository/type/assignment';
import type { LessonData } from './repository/type/lessons';
import type { QuizStudentResponse } from './repository/type/quiz';
import { useGetLessons } from './usecase/useGetLessons';
import { useMarkAsDone } from './usecase/useMarkAsDone';
import { type SubmitAssignmentRequest, useSubmitAssignment } from './usecase/useSubmitAssignment';
import { useSubmitFinalAssignment } from './usecase/useSubmitFinalAssignment';

const LessonPage = () => {
  const { routerParams } = useNativeBridge();
  const { execute } = useMarkAsDone();

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
  const [isBackModalOpen, setIsBackModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

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

  const { execute: submitAssignment } = useSubmitAssignment({
    onSuccess: (data: any) => {
      refetch();
      callToast('Tugas berhasil disimpan sebagai draft', 'success');
    },
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

  const handleBottomSheetHeight = (length: number) => {
    if (length <= 2) return '25vh';
    if (length <= 4) return '40vh';
    return '45vh';
  };

  const handleMarkAsDoneLessons = () => {
    setIsButtonLoading(true);
    execute(currentParams.lesson_slug, {
      onSuccess: (data) => {
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
    submitAssignment({ ...request });
  };

  const renderContent = () => {
    switch (currentParams.type) {
      case 'assignment':
        return (
          <AssignmentContent
            data={lessons?.data as AssignmentStudentResponse}
            onSubmit={handleSubmitAssignment}
            onSubmitFinal={handleOpenSubmitModal}
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

  const handleConfirmBack = () => {
    setIsBackModalOpen(false);
    pipe.call('navigation.setBackInterceptor', { enabled: false }, () => {
      pipe.call('navigation.goBack', {}, (res) => {});
    });
  };

  useEffect(() => {
    pipe.call('navigation.setBackInterceptor', { enabled: true }, (res) => {});
    return () => {
      pipe.call('navigation.setBackInterceptor', { enabled: false }, () => {});
    };
  }, []);

  useLynxGlobalEventListener('nativeBackPressed', () => {
    setIsBackModalOpen(true);
  });

  useEffect(() => {
    console.log('lessons', JSON.stringify(lessons, null, 2));
  }, [lessons]);

  const { execute: submitFinalAssignment, isLoading: isSubmittingFinal } = useSubmitFinalAssignment(
    {
      onSuccess: () => {
        setIsSubmitModalOpen(false);
        refetch();
      },
      onError: () => {
        setIsSubmitModalOpen(false);
      },
    }
  );

  const handleOpenSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const handleConfirmFinalSubmit = () => {
    const quizData = lessons?.data as AssignmentStudentResponse;
    const submissionId = quizData.submissions[quizData.submissions.length - 1]?.id;

    if (!submissionId) {
      callToast('Submission tidak ditemukan', 'error');
      return;
    }
    submitFinalAssignment({ submission_id: submissionId });
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
        <view
          className="z-[110] w-full border-b border-light bg-surface p-4 px-5 absolute top-0"
          bindtap={() => setIsSheetOpen(!isSheetOpen)}
        >
          <view className="mb-2 flex-row flex justify-between">
            <Text size={TextType.b1}>
              Course Progress {completedLessons}/{routerParams?.all_lessons?.length || 0}
            </Text>
            <Text>{isSheetOpen ? '▼' : '▲'}</Text>
          </view>
          <view className="h-1.5 w-full rounded-full bg-surface-alt">
            <view
              className={`h-full rounded-full transition duration-300 ease-in-out`}
              style={{ backgroundColor: Colors.Primary, width: `${progressPercentage}%` }}
            />
          </view>
        </view>

        {/* Bottom Sheet List */}
        <view
          className={`z-[105] w-full rounded-b-3xl bg-surface p-4 absolute top-0 overflow-hidden shadow-2xl transition-transform duration-[350ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isSheetOpen ? 'translate-y-[60px]' : '-translate-y-full'}`}
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
                  className={`mb-2 flex-row items-center rounded-xl border p-4 flex transition-all duration-200 ${isActive ? 'border-light bg-accent' : 'border-transparent'} ${item.is_locked ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <view className="mr-4">
                    {item.is_completed ? (
                      <view className="h-6 w-6 items-center rounded-full bg-success flex justify-center">
                        <text className="text-xs font-extrabold text-white">✓</text>
                      </view>
                    ) : (
                      <view
                        className={`h-[22px] w-[22px] rounded-full border-2 bg-surface ${isActive ? 'border-primary' : 'border-default'}`}
                      />
                    )}
                  </view>
                  <text
                    className={`text-base font-medium ${isActive ? 'font-bold text-primary' : 'text-neutral'}`}
                  >
                    {item.title}
                  </text>
                </view>
              );
            })}
          </scroll-view>
        </view>
        {currentParams.type === 'lesson' && (
          <>
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
          </>
        )}

        <Modal
          template={ModalTemplate.Custom}
          visible={isBackModalOpen}
          onClose={() => setIsBackModalOpen(false)}
        >
          <view className="flex-col gap-4 flex">
            <Text size={TextType.h2} fontWeight="600" className="text-center">
              Keluar dari halaman ini?
            </Text>
            <Text className="text-muted text-center">
              Kemajuan kamu akan hilang jika kamu keluar.
            </Text>
            <view className="flex-col gap-3 flex">
              <Button size="small" variant="filled" color="primary" onPress={handleConfirmBack}>
                Keluar
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onPress={() => setIsBackModalOpen(false)}
              >
                Tetap di sini
              </Button>
            </view>
          </view>
        </Modal>

        <Modal
          template={ModalTemplate.Custom}
          visible={isSubmitModalOpen}
          onClose={() => setIsSubmitModalOpen(false)}
        >
          <view className="flex-col gap-4 flex">
            <Text size={TextType.h2} fontWeight="600" className="text-center">
              Kumpulkan tugas?
            </Text>
            <Text className="text-muted text-center">
              Setelah dikumpulkan, kamu tidak bisa mengubah jawaban lagi. Pastikan semua sudah benar
              ya.
            </Text>
            <view className="flex-col gap-3 flex">
              <Button
                size="small"
                variant="filled"
                color="primary"
                onPress={handleConfirmFinalSubmit}
                isLoading={isSubmittingFinal}
              >
                Kumpulkan sekarang
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onPress={() => setIsSubmitModalOpen(false)}
              >
                Periksa lagi
              </Button>
            </view>
          </view>
        </Modal>
      </view>
    )
  );
};

export default LessonPage;
