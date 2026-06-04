import { useEffect, useState } from '@lynx-js/react';
import { setItem } from 'sparkling-storage';

import { useConfirmation } from '@/components/ConfirmationModal/ConfitmationModal';
import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { BizKey, PrefKey } from '@/lib/helper/localStorage';
import { callToast } from '@/lib/helper/showToast';
import { useStartQuiz } from '@/pages/Quiz/usecase/useStartQuiz';

import type { QuizStudentResponse } from '../../repository/type/quiz';
import { useTakeoverQuiz } from '../../usecase/useTakeoverQuiz';

export interface QuizCoreProps {
  quizId: number;
  submissionId: number;
  sessionToken: string;
  timeLeft: number;
}

const QuizContent = ({ data }: { data: QuizStudentResponse }) => {
  const { navigateTo, routerParams } = useNativeBridge();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { confirm, ConfirmationModal } = useConfirmation();

  const [existingID, setExistingID] = useState<number>(0);

  const { execute: takeover } = useTakeoverQuiz({
    onSuccess: (data) => {
      const timeLeft = data.duration ? data.duration - (data.time_spent_seconds || 0) : -1;
      setItem(
        {
          key: PrefKey.SubmissionId + data.id,
          data: {
            quizId: data.id,
            submissionId: data.id,
            sessionToken: data.session_token,
            timeLeft,
          },
          biz: BizKey.Quiz,
        },
        () => {
          navigateTo('quiz', {
            quizId: data?.id,
            courseId: routerParams?.courseId,
            course_slug: routerParams?.course_slug,
            close: true,
          });
        }
      );
    },
    onError: () => {},
  });

  const { execute: startQuiz } = useStartQuiz({
    onSuccess: (res) => {
      if (!res.success) {
        if (res.data.submission_id) {
          setExistingID(res.data.submission_id);
          setIsModalOpen(true);
        }
        if (res.errors.quiz) {
          callToast(res.errors.quiz[0], 'error');
        }
        return;
      }
      const timeLeft = res.data.duration || -1;
      setItem(
        {
          key: PrefKey.SubmissionId + data?.id,
          data: {
            quizId: data.id,
            submissionId: res.data.id,
            sessionToken: res.data.session_token,
            timeLeft,
          },
          biz: BizKey.Quiz,
        },
        () => {
          navigateTo('quiz', {
            quizId: data?.id,
            courseId: routerParams?.courseId,
            lesson_slug: routerParams?.lesson_slug,
            course_slug: routerParams?.course_slug,
            close: true,
          });
        }
      );
    },
    onError: () => {},
  });

  const handleTakeoverQuiz = () => {
    takeover(existingID);
    setIsModalOpen(false);
  };

  useEffect(() => {
    console.log(JSON.stringify(data, null, 2));
  }, []);

  return (
    data && (
      <view className="mt-5 h-[100vh] flex-col px-5 pb-[40px] pt-[60px] flex">
        {/* Header Section */}
        <view className="mb-6">
          <view className="mb-2 flex-row items-center flex">
            <view className="mr-2 rounded-md bg-blue-100 px-2 py-1">
              <text className="uppercase text-[10px] font-bold tracking-wider text-blue-600">
                Quiz
              </text>
            </view>
            <Text size={TextType.b2} color={Colors.Primary}>
              Materi Ke-{data.order}
            </Text>
          </view>
          <Text size={TextType.h2} fontWeight={'bold'} className="leading-tight">
            {data.title}
          </Text>
        </view>

        {/* Description Section */}
        <view className="mb-6">
          <Text size={TextType.h3} color={Colors.Primary} className="mb-1">
            Deskripsi:
          </Text>
          <Text size={TextType.b1} className="leading-relaxed">
            {data.description}
          </Text>
        </view>

        {/* Info Cards Grid */}
        <view className="mb-8 flex-row gap-4 flex">
          <view className="flex-1 flex-col items-center rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-4 flex">
            <Text size={TextType.b2} color={Colors.Primary} className="text-center">
              Waktu
            </Text>
            <Text size={TextType.h2} fontWeight={'bold'} className="mt-3 text-center">
              {data.time_limit_minutes ? `${data.time_limit_minutes} Menit` : '-'}
            </Text>
          </view>
          <view className="flex-1 flex-col items-center rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-4 flex">
            <Text size={TextType.b2} color={Colors.Primary}>
              Status
            </Text>
            <Text size={TextType.h3} fontWeight={'bold'} className="mt-3 text-center">
              {data.submission_status_label || '-'}
            </Text>
          </view>
          <view className="flex-1 flex-col items-center rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-4 flex">
            <Text size={TextType.b2} color={Colors.Primary} className="text-center">
              Passing Grade
            </Text>
            <Text size={TextType.h3} fontWeight={'bold'} className="mt-3 text-center">
              {data.passing_grade}%
            </Text>
          </view>
        </view>

        {/* Reward Info */}
        <view className="mb-8 flex-row items-center rounded-2xl border border-yellow-100 bg-yellow-50 p-4 flex">
          <view className="mr-3 h-10 w-10 items-center rounded-full bg-yellow-400 flex justify-center">
            <text className="font-bold text-white">★</text>
          </view>
          <view className="flex-col flex">
            <Text size={TextType.b2} fontWeight={'bold'} className="text-yellow-800">
              Hadiah XP
            </Text>
            <Text size={TextType.b2} className="text-yellow-700">
              Dapatkan {data.xp_reward} XP + {data.xp_perfect_bonus} Bonus Sempurna
            </Text>
          </view>
        </view>

        {/* Start Button */}
        <Button
          className="h-14 w-full"
          onPress={() => {
            confirm(() => startQuiz(data?.id));
          }}
        >
          Mulai Kerjakan Quiz
        </Button>

        {/* Attempts Info */}
        <view className="mt-4 items-center">
          <Text size={TextType.b2} color={Colors.Primary}>
            {data.attempts_used === 0
              ? 'Anda belum pernah mencoba quiz ini.'
              : `Percobaan digunakan: ${data.attempts_used}`}
          </Text>
        </view>

        <Modal
          template={ModalTemplate.Custom}
          visible={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <view className="flex-col gap-4 flex">
            <Text size={TextType.h2} fontWeight="600" className="text-center">
              Kuis sedang dikerjakan di perangkat lain.
            </Text>
            <Text className="text-[#5f6368] text-center">
              Apakah Kamu ingin mengambil alih kuis ini? Dengan mengambil alih, sesi kuis di
              perangkat lain akan dihentikan dan Kamu bisa melanjutkan kuis di perangkat ini.
            </Text>
            <view className="flex-col gap-3 flex">
              <Button size="small" variant="filled" color="primary" onPress={handleTakeoverQuiz}>
                Lanjutkan di Perangkat Ini
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onPress={() => setIsModalOpen(false)}
              >
                Tidak
              </Button>
            </view>
          </view>
        </Modal>
        <ConfirmationModal />
      </view>
    )
  );
};

export default QuizContent;
