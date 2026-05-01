import { useEffect, useRef, useState } from '@lynx-js/react';
import { getItem, setItem } from 'sparkling-storage';

import Input from '@/components/Input/Input';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { BizKey, PrefKey } from '@/lib/helper/localStorage';

import type {
  GetQuestionByPageResponse,
  QuizQuestionResource,
  SaveAnswerPayload,
} from './type/QuizData';
import { useGetQuestion } from './usecase/useGetQuestion';
import { useSaveAnswer } from './usecase/useSaveAnswer';
import { useStartQuiz } from './usecase/useStartQuiz';
import { useSubmitQuiz } from './usecase/useSubmitQuiz';

const QUIZ_DURATION_SECONDS = 2 * 60 * 60; // 2 hours

const QuizPage = () => {
  const { routerParams, navigateTo } = useNativeBridge();
  const quizId: number = routerParams?.quizId;

  // ─── Session state ────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const submissionId = useRef<number | null>(null);

  // ─── Timer state ──────────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoSubmitted = useRef(false);

  // ─── Question state ───────────────────────────────────────────────────────
  const [question, setQuestion] = useState<QuizQuestionResource | null>(null);
  const [meta, setMeta] = useState<GetQuestionByPageResponse['data']['meta'] | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [isSaving, setIsSaving] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'quiz' | 'submitting' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [isNavAnimated, setIsNavAnimated] = useState(false);

  const openNav = () => {
    setIsNavVisible(true);
    setTimeout(() => setIsNavAnimated(true), 16);
  };

  const closeNav = () => {
    setIsNavAnimated(false);
    setTimeout(() => setIsNavVisible(false), 300);
  };

  // ─── Timer helpers ────────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const timerColor = (() => {
    if (timeLeft <= 60) return { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' };
    if (timeLeft <= 300) return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
    return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
  })();

  const startTimer = () => {
    if (timerRef.current) return; // already running
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // ─── Auto-submit when timer hits 0 ───────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && !hasAutoSubmitted.current && submissionId.current) {
      hasAutoSubmitted.current = true;
      stopTimer();
      setPhase('submitting');
      submitQuiz(submissionId.current);
    }
  }, [timeLeft]);

  // ─── Cleanup timer on unmount ─────────────────────────────────────────────
  useEffect(() => {
    return () => stopTimer();
  }, []);

  // ─── Hooks ────────────────────────────────────────────────────────────────
  const { execute: startQuiz } = useStartQuiz({
    onSuccess: (data) => {
      submissionId.current = data.data.id;
      setItem(
        { key: PrefKey.SubmissionId, biz: BizKey.Quiz, data: { submissionId: data.data.id } },
        () => {}
      );
      fetchQuestion(1);
      startTimer(); // ← start timer after quiz begins
    },
    onError: () => {
      setErrorMessage('Failed to start quiz. Please try again.');
      setPhase('error');
    },
  });

  const { execute: fetchQuestionMutation } = useGetQuestion({
    onSuccess: (res) => {
      const q = res.data.data;
      const nav = res.data.meta.pagination;
      const existingAnswer = res.data.answer;

      setQuestion(q);
      setMeta({
        pagination: {
          current_page: nav.current_page,
          total: nav.total,
          has_next: nav.has_next,
          has_prev: nav.has_prev,
        },
      });
      setTotalQuestions(nav.total);

      if (existingAnswer?.selected_options) {
        setCurrentAnswer(
          q.type === 'checkbox'
            ? existingAnswer.selected_options
            : (existingAnswer.selected_options[0] ?? null)
        );
      } else if (existingAnswer?.content) {
        setCurrentAnswer(existingAnswer.content);
      } else {
        setCurrentAnswer(q.type === 'checkbox' ? [] : null);
      }

      setPhase('quiz');
    },
    onError: () => {
      setErrorMessage('Failed to load question.');
      setPhase('error');
    },
  });

  const { execute: saveAnswer } = useSaveAnswer({
    onError: (e) => console.log('Save answer failed silently:', e),
  });

  const { execute: submitQuiz } = useSubmitQuiz({
    onSuccess: (data) => {
      stopTimer();
      navigateTo('quiz-result.lynx.bundle', {
        submission_id: data.data.id,
        quiz_id: quizId,
        score: data.data.score,
        final_score: data.data.final_score,
        is_passed: data.data.is_passed,
        time_spent: data.data.time_spent_seconds,
        close: true,
      });
    },
    onError: () => {
      setErrorMessage('Failed to submit quiz. Please try again.');
      setPhase('error');
    },
  });

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    getItem({ key: PrefKey.SubmissionId, biz: BizKey.Quiz }, (res) => {
      const savedId = res.data.data?.submissionId;
      if (savedId) {
        submissionId.current = savedId;
        fetchQuestion(1);
        startTimer(); // ← resume timer on re-entry
        return;
      }
      startQuiz(quizId);
    });
  }, []);

  useEffect(() => {
    if (!submissionId.current) return;
    saveAnswer({ submissionId: submissionId.current, payload: buildPayload() });
  }, [question]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const fetchQuestion = (page: number) => {
    if (!submissionId.current) return;
    setPhase('loading');
    setCurrentPage(page);
    fetchQuestionMutation({ submissionId: submissionId.current, page });
  };

  const buildPayload = (): SaveAnswerPayload => {
    if (!question) return {} as SaveAnswerPayload;
    if (question.type === 'essay') {
      return {
        quiz_question_id: question.id,
        selected_options: null,
        content: currentAnswer as string,
      };
    }
    if (question.type === 'checkbox') {
      return {
        quiz_question_id: question.id,
        selected_options: currentAnswer as number[],
        content: null,
      };
    }
    return {
      quiz_question_id: question.id,
      selected_options: [currentAnswer as number],
      content: null,
    };
  };

  const handleNext = async () => {
    if (!submissionId.current || !question) return;
    const payload = buildPayload();
    if (!payload) return;

    setIsSaving(true);
    saveAnswer(
      { submissionId: submissionId.current, payload },
      {
        onSettled: () => {
          if (!submissionId.current) return;
          setIsSaving(false);
          if (meta?.pagination.has_next) {
            fetchQuestion(currentPage + 1);
          } else {
            stopTimer();
            setPhase('submitting');
            submitQuiz(submissionId.current);
          }
        },
      }
    );
  };

  const handleBack = () => {
    if (currentPage > 1) fetchQuestion(currentPage - 1);
  };

  const handleJumpTo = (page: number) => {
    setIsNavVisible(false);
    fetchQuestion(page + 1);
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) =>
      prev.includes(currentPage - 1)
        ? prev.filter((i) => i !== currentPage - 1)
        : [...prev, currentPage - 1]
    );
  };

  const handleSelection = (optionId: number) => {
    if (!question) return;
    if (question.type === 'checkbox') {
      const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
      setCurrentAnswer(
        prev.includes(optionId) ? prev.filter((id: number) => id !== optionId) : [...prev, optionId]
      );
    } else {
      setCurrentAnswer(optionId);
    }
  };

  const isSelected = (optionId: number) => {
    if (question?.type === 'checkbox') {
      return Array.isArray(currentAnswer) && currentAnswer.includes(optionId);
    }
    return currentAnswer === optionId;
  };

  const isNextDisabled = () => {
    if (isSaving || phase === 'submitting' || timeLeft === 0) return true;
    if (!question) return true;
  };

  const progressWidth = totalQuestions > 0 ? (currentPage / totalQuestions) * 100 : 0;
  const options = Array.isArray(question?.options) ? question!.options : [];
  const isFlagged = flaggedQuestions.includes(currentPage - 1);

  if (phase === 'submitting') {
    return (
      <view className="flex-1 items-center bg-[#F8F9FA] justify-center">
        <text className="mb-3 text-4xl">📤</text>
        <Text size={TextType.b1} className="text-slate-400">
          {timeLeft === 0 ? "Time's up! Submitting your quiz..." : 'Submitting your quiz...'}
        </Text>
      </view>
    );
  }

  // ─── Renderers ────────────────────────────────────────────────────────────
  const renderOptions = () => (
    <view className="flex-col gap-3 flex">
      {(options as any[]).map((option) => {
        const active = isSelected(option);
        const isCheckbox = question?.type === 'checkbox';
        return (
          <view
            key={option.id}
            className={`flex-row items-center rounded-2xl border-2 p-4 flex ${
              active ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white'
            }`}
            bindtap={() => handleSelection(option)}
          >
            <view
              className={`mr-4 h-6 w-6 items-center border-2 justify-center ${
                isCheckbox ? 'rounded-md' : 'rounded-full'
              } ${active ? 'border-blue-500 bg-blue-500' : 'border-slate-200'}`}
            >
              {active && (
                <view
                  className={isCheckbox ? 'h-3 w-3 bg-white' : 'h-2 w-2 rounded-full bg-white'}
                />
              )}
            </view>
            <text
              className={`flex-1 text-sm ${active ? 'font-bold text-blue-600' : 'text-slate-600'}`}
            >
              {option}
            </text>
          </view>
        );
      })}
    </view>
  );

  const renderEssay = () => (
    <view className="flex-col flex">
      <Input title="Tuliskan jawaban Anda:" />
    </view>
  );

  return (
    <view className="h-screen w-full flex-col bg-[#F8F9FA] flex relative">
      {/* Header */}
      <view className="bg-white px-5 py-4 shadow-sm">
        <view className="mb-4 flex-row items-center flex justify-between">
          {/* Timer pill */}
          <view
            className={`flex-row items-center gap-2 rounded-full px-3 py-1 flex ${timerColor.bg}`}
          >
            <view className={`h-1.5 w-1.5 rounded-full ${timerColor.dot}`} />
            <Text size={TextType.b2} fontWeight="bold" className={timerColor.text}>
              {formatTime(timeLeft)}
            </Text>
          </view>

          {/* Question nav pill */}
          <view
            bindtap={() => openNav()}
            className="flex-row items-center gap-2 rounded-full bg-blue-50 px-3 py-1 flex"
          >
            <Text size={TextType.b2} fontWeight="bold" className="text-blue-600">
              {currentPage} / {totalQuestions}
            </Text>
            <text className="text-xs text-blue-600">☰</text>
          </view>
        </view>

        <view className="h-1.5 w-full rounded-full bg-slate-100">
          <view
            className="h-full rounded-full bg-[#FBB03B]"
            style={{ width: `${progressWidth}%` }}
          />
        </view>
      </view>

      {/* Content — unchanged below */}
      <scroll-view className="flex-1 bg-white px-5 pt-8" scroll-y>
        <view className="flex-row flex justify-between">
          <view className="items-center rounded-full bg-[#FFF8E6] px-3 py-1 flex">
            <text className="uppercase text-[10px] font-bold text-[#FBB03B]">
              {question?.type_label ?? 'Question'}
            </text>
          </view>
          <view
            bindtap={toggleFlag}
            className={`h-8 flex-row items-center gap-1 rounded-full border px-3 flex ${
              isFlagged ? 'border-orange-200 bg-orange-50' : 'border-transparent bg-slate-50'
            }`}
          >
            <text>{isFlagged ? '🚩' : '🏳️'}</text>
            <text
              className={`text-[10px] font-bold ${isFlagged ? 'text-orange-500' : 'text-slate-400'}`}
            >
              {isFlagged ? 'FLAGGED' : 'FLAG'}
            </text>
          </view>
        </view>

        <Text size={TextType.h2} fontWeight="bold" className="my-6 leading-tight text-slate-800">
          {question?.content}
        </Text>

        {phase !== 'loading' ? question?.type === 'essay' ? renderEssay() : renderOptions() : <></>}
      </scroll-view>

      {/* Footer */}
      <view className="border-t border-slate-100 bg-white p-5 pb-10">
        <view className="flex-row gap-3 flex">
          {currentPage > 1 && (
            <view
              bindtap={handleBack}
              className="h-14 flex-1 items-center rounded-2xl border-2 border-slate-200 justify-center"
            >
              <text className="font-bold text-slate-600">Back</text>
            </view>
          )}
          <Button
            disabled={isNextDisabled()}
            onPress={handleNext}
            className={`h-14 flex-1 rounded-2xl ${isNextDisabled() ? 'bg-slate-200' : 'bg-blue-600'}`}
          >
            <text className={`font-bold ${isNextDisabled() ? 'text-slate-400' : 'text-white'}`}>
              {isSaving ? 'Saving...' : meta?.pagination.has_next ? 'Next' : 'Finish Quiz ✓'}
            </text>
          </Button>
        </view>
      </view>

      {/* Nav bottom sheet — unchanged */}
      {isNavVisible && (
        <view className="z-[200] flex-col flex absolute inset-0 justify-end">
          <view
            className="absolute inset-0"
            style={{
              backgroundColor: `rgba(0,0,0,${isNavAnimated ? 0.4 : 0})`,
              transition: 'background-color 300ms ease',
            }}
            bindtap={closeNav}
          />
          <view
            className="max-h-[70vh] flex-col rounded-t-[32px] bg-white p-6 flex relative"
            style={{
              transform: `translateY(${isNavAnimated ? 0 : 100}%)`,
              transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            <view className="mb-6 flex-row items-center flex justify-between">
              <Text size={TextType.h2} fontWeight="bold">
                Question List
              </Text>
              <view bindtap={closeNav} className="p-2">
                <text className="font-bold text-slate-400">✕</text>
              </view>
            </view>
            <scroll-view className="flex-1" scroll-y>
              <view className="flex-row flex-wrap gap-4 pb-10 flex">
                {Array.from({ length: totalQuestions }).map((_, i) => {
                  const isCurrent = i + 1 === currentPage;
                  const isFlaggedItem = flaggedQuestions.includes(i);
                  return (
                    <view
                      key={i}
                      className={`h-12 w-12 items-center rounded-xl border-2 flex relative justify-center ${
                        isCurrent ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50'
                      }`}
                      bindtap={() => {
                        closeNav();
                        setTimeout(() => handleJumpTo(i), 300);
                      }}
                    >
                      <text
                        className={`font-bold ${isCurrent ? 'text-blue-600' : 'text-slate-600'}`}
                      >
                        {i + 1}
                      </text>
                      {isFlaggedItem && (
                        <view className="absolute -right-1 -top-1">
                          <text className="text-[10px]">🚩</text>
                        </view>
                      )}
                    </view>
                  );
                })}
              </view>
            </scroll-view>
          </view>
        </view>
      )}
    </view>
  );
};

export default QuizPage;
