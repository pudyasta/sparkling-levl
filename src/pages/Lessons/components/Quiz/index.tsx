import { useEffect, useState } from '@lynx-js/react';
import { getItem, setItem } from 'sparkling-storage';

import { Modal, ModalTemplate } from '@/components/Modal/Modal.view';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { BizKey, PrefKey } from '@/lib/helper/localStorage';
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
  const { navigateTo } = useNativeBridge();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<QuizCoreProps | null>(null);

  const [existingID, setExistingID] = useState<number>(0);

  const { execute: takeover, isLoading: isTakingOver } = useTakeoverQuiz({
    onSuccess: (data) => {
      console.log(JSON.stringify(data, null, 2));
      let timeLeft = 0;
      if (!data.duration) {
        timeLeft = -1;
      } else {
        timeLeft = data.duration - (data.time_spent_seconds || 0);
      }
      setItem(
        {
          key: PrefKey.SubmissionId + data.id,
          data: {
            quizId: data.id,
            submissionId: data.id,
            sessionToken: data.session_token,
            timeLeft: timeLeft,
          },
          biz: BizKey.Quiz,
        },
        () => {
          navigateTo('quiz.lynx.bundle', {
            quizId: data?.id,
          });
        }
      );
    },
    onError: () => {},
  });

  const { execute: startQuiz } = useStartQuiz({
    onSuccess: (res) => {
      console.log(JSON.stringify(res, null, 2));
      if (!res.success) {
        if (res.data.submission_id) {
          setExistingID(res.data.submission_id);
          setIsModalOpen(true);
        }
        return;
      }

      const endTime = Date.now() + (res.data?.duration || 0) * 60 * 1000;

      setItem(
        {
          key: PrefKey.SubmissionId + res.data.id,
          biz: BizKey.Quiz,
          data: { submissionId: res.data.id, endTime, sessionToken: res.data?.session_token || '' },
        },
        (res) => {
          console.log('saving', JSON.stringify(res, null, 2));
          navigateTo('quiz.lynx.bundle', {
            totalQuestions: data?.questions_count || 0,
            quizId: data?.id,
          });
        }
      );
    },
    onError: () => {},
  });

  useEffect(() => {
    getItem({ key: PrefKey.SubmissionId + data?.id, biz: BizKey.Quiz }, (res) => {
      setExistingSubmission(res.data);
    });
  }, []);

  const handleStartQuiz = () => {
    console.log('gasss');

    // if (existingSubmission) {
    //   navigateTo('quiz.lynx.bundle', {
    //     totalQuestions: data?.questions_count || 0,
    //     quizId: data?.id,
    //   });
    //   return;
    // }

    startQuiz(data?.id);
  };

  const handleTakeoverQuiz = () => {
    console.log(existingSubmission);
    takeover(existingID);
    setIsModalOpen(false);
  };

  return (
    data && (
      <view className="h-[100vh] flex-col px-5 pb-[40px] pt-[70px] flex">
        {/* Header Section */}
        <view className="mb-6">
          <view className="mb-2 flex-row items-center flex">
            <view className="mr-2 rounded-md bg-blue-100 px-2 py-1">
              <text className="uppercase text-[10px] font-bold tracking-wider text-blue-600">
                Quiz
              </text>
            </view>
            <Text size={TextType.b2} color={Colors.Primary}>
              Quiz • {data?.questions_count} Pertanyaan
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
            <Text size={TextType.b2} color={Colors.Primary}>
              Waktu
            </Text>
            <Text size={TextType.h2} fontWeight={'bold'} className="mt-1">
              {data.time_limit_minutes} Menit
            </Text>
          </view>
          <view className="flex-1 flex-col items-center rounded-2xl border border-[#e8eaed] bg-[#f8f9fa] p-4 flex">
            <Text size={TextType.b2} color={Colors.Primary}>
              Passing Grade
            </Text>
            <Text size={TextType.h2} fontWeight={'bold'} className="mt-1 text-green-600">
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
        <Button className="h-14 w-full" onPress={handleStartQuiz}>
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
      </view>
    )
  );
};

export default QuizContent;
