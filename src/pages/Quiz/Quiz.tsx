import { useEffect, useState } from '@lynx-js/react';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';

import type { QuizQuestionBase, QuizSubmissionStudentQuestionsResponse } from './type/QuizData';

interface QuizPageProps {
  quizData: QuizSubmissionStudentQuestionsResponse;
  onNext: (selectedId: number | string | null) => void;
  onBack: () => void;
}

const mockQuizData: QuizSubmissionStudentQuestionsResponse = {
  data: {
    id: 101,
    quiz_id: 24,
    type: 'multiple_choice',
    type_label: 'Pilihan Ganda',
    content: 'What is the correct way to pass props in React?',
    weight: 10,
    order: 1,
    max_score: 10,
    can_auto_grade: true,
    requires_options: true,
    created_at: '2026-02-01T08:44:10+00:00',
    options: [
      { id: 1, label: 'component(prop1, prop2)', is_correct: false },
      { id: 2, label: '<Component prop1={value} prop2={value} />', is_correct: true },
      { id: 3, label: 'Component.props = {value}', is_correct: false },
      { id: 4, label: 'new Component({props})', is_correct: false },
    ],
  },
  meta: {
    current_page: 1,
    per_page: 1,
    total: 3,
    has_previous: false,
    has_next: true,
    current_order: 1,
    total_questions: 3,
  },
  answer: {
    id: 500,
    content: null,
    selected_options: null, // User hasn't selected anything yet
  },
};

const QuizPage = ({ quizData, onNext, onBack }: QuizPageProps) => {
  const { data: question, meta, answer } = mockQuizData;
  const [selectedOption, setSelectedOption] = useState<any>(answer?.selected_options || null);

  // Sync state if question changes (for SPA-style state navigation)
  useEffect(() => {
    setSelectedOption(answer?.selected_options || null);
  }, [question.id]);

  // Calculate progress percentage for the bar
  const progressWidth = (meta.current_order / meta.total_questions) * 100;

  // Cast options to array (assuming QuizAnswerOption[] based on your interface)
  const options = Array.isArray(question.options) ? question.options : [];

  return (
    <view className="h-screen w-full flex-col bg-[#F8F9FA] flex">
      <view className="bg-white px-5 pb-4 pt-12">
        <view className="mb-4 flex-row items-center flex justify-between">
          <view
            className="h-10 w-10 items-center rounded-full bg-slate-50 justify-center active:opacity-60"
            bindtap={onBack}
          >
            <text className="text-xl">←</text>
          </view>
          <Text size={TextType.b2} className="text-slate-400">
            Question {meta.current_order} of {meta.total_questions}
          </Text>
        </view>

        {/* Progress Bar Container */}
        <view className="h-1.5 w-full rounded-full bg-slate-100">
          <view
            className="h-full rounded-full bg-[#FBB03B] transition-all duration-300"
            style={{ width: `${progressWidth}%` }}
          />
        </view>
      </view>

      {/* Question Card */}
      <scroll-view className="flex-1 px-5 pt-8" scroll-y>
        <view className="shadow-slate-200 rounded-[32px] bg-white p-8 shadow-sm">
          <view className="mb-4 self-start rounded-full bg-[#FFF8E6] px-3 py-1">
            <text className="uppercase text-[10px] font-bold text-[#FBB03B]">
              Question {meta.current_order}
            </text>
          </view>

          <Text size={TextType.h2} fontWeight="bold" className="mb-8 leading-tight text-slate-800">
            {question.content}
          </Text>

          {/* Options List */}
          <view className="flex-col gap-3 flex">
            {options.map((option: any) => {
              const isSelected = selectedOption === option.id;
              return (
                <view
                  key={option.id}
                  className={`flex-row items-center rounded-2xl border-2 p-4 flex transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white'
                  }`}
                  bindtap={() => setSelectedOption(option.id)}
                >
                  <view
                    className={`mr-4 h-6 w-6 items-center rounded-full border-2 justify-center ${
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-200'
                    }`}
                  >
                    {isSelected && <view className="h-2 w-2 rounded-full bg-white" />}
                  </view>
                  <text
                    className={`flex-1 text-sm ${isSelected ? 'font-bold text-blue-600' : 'text-slate-600'}`}
                  >
                    {option.label || option.content}
                  </text>
                </view>
              );
            })}
          </view>
        </view>
        <view className="h-10" />
      </scroll-view>

      {/* Footer Navigation */}
      <view className="bg-[#F8F9FA] p-5 pb-10">
        <Button
          disabled={!selectedOption}
          onPress={() => onNext(selectedOption)}
          className={`h-14 w-full rounded-2xl ${!selectedOption ? 'bg-slate-200' : 'bg-blue-600'}`}
        >
          <text className={`font-bold ${!selectedOption ? 'text-slate-400' : 'text-white'}`}>
            {meta.has_next ? 'Next Question' : 'Finish Quiz'}
          </text>
        </Button>
      </view>
    </view>
  );
};

export default QuizPage;
