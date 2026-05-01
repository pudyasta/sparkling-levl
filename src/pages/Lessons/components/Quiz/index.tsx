import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import type { QuizStudentResponse } from '../../repository/type/quiz';

const QuizContent = ({ data }: { data: QuizStudentResponse }) => {
  const { navigateTo } = useNativeBridge();
  return (
    data && (
      <view className="flex-col pb-[40px] pt-[60px] flex">
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
        <Button
          className="h-14 w-full"
          onPress={() =>
            navigateTo('quiz.lynx.bundle', {
              totalQuestions: data.questions_count,
              quizId: data.id,
            })
          }
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
      </view>
    )
  );
};

export default QuizContent;
