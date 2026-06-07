import { useEffect, useRef, useState } from '@lynx-js/react';
import { getItem } from 'sparkling-storage';

import { BackInterceptor } from '@/components/BackInterceptor/BackInterceptor';
import { useConfirmation } from '@/components/ConfirmationModal/ConfitmationModal';
import Input, { type InputRef } from '@/components/Input/Input';
import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { htmlToPlainText } from '@/lib/helper/htmlToLynx';
import { BizKey, PrefKey } from '@/lib/helper/localStorage';
import { callToast } from '@/lib/helper/showToast';

import type { QuizCoreProps } from '../Lessons/components/Quiz';
import type {
  QuizOverviewOptionValue,
  QuizOverviewQuestion,
  SaveAnswerPayload,
} from './type/QuizData';
import { useGetQuizOverview } from './usecase/useGetQuizOverview';
import { useSaveAnswer } from './usecase/useSaveAnswer';
import { useSubmitQuiz } from './usecase/useSubmitQuiz';

const getOptionText = (option: QuizOverviewOptionValue): string =>
  typeof option === 'string' ? option : option.text;

const QuizPage = () => {
  const { routerParams, navigateTo } = useNativeBridge();
  const quizId: number = routerParams?.quizId;

  const submission = useRef<QuizCoreProps | null>(null);
  const inputRef = useRef<InputRef>(null);
  const localAnswers = useRef<
    Record<number, { content: string | null; selected_options: string[] | null }>
  >({});

  const [questions, setQuestions] = useState<QuizOverviewQuestion[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const { confirm, ConfirmationModal } = useConfirmation();

  const [isSaving, setIsSaving] = useState(false);
  const [phase, setPhase] = useState<'loading' | 'quiz' | 'submitting' | 'error'>('loading');
  const [isNavVisible, setIsNavVisible] = useState(false);
  const [isNavAnimated, setIsNavAnimated] = useState(false);

  const [timeLeft, setTimeLeft] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoSubmitted = useRef(false);

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
    return { bg: 'bg-[#e8f0fe]', text: 'text-[#1a73e8]', dot: 'bg-[#1a73e8]' };
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
    if (timeLeft === 0 && !hasAutoSubmitted.current && submission.current) {
      hasAutoSubmitted.current = true;
      stopTimer();
      submitQuiz(submission.current.submissionId);
    }
  }, [timeLeft]);

  const { execute: fetchOverview } = useGetQuizOverview({
    onSuccess: (res) => {
      const data = res.data;

      setTotalQuestions(data.total_questions);
      setQuestions(data.questions);

      // Seed local answer cache from server-provided answers
      data.questions.forEach((q) => {
        localAnswers.current[q.id] = q.answer
          ? { content: q.answer.content, selected_options: q.answer.selected_options }
          : { content: null, selected_options: null };
      });
      // Initialize answered set from server summary
      const answered = data.summary.filter((s) => s.is_answered).map((s) => s.order - 1);
      setAnsweredQuestions(answered);

      // Timer: trust server's time_remaining_seconds over local cache
      if (data.is_time_limited && data.time_remaining_seconds != null) {
        setTimeLeft(data.time_remaining_seconds);
        if (data.time_remaining_seconds > 0) startTimer();
      } else {
        setTimeLeft(-1);
      }

      setPhase('quiz');
    },
    onError: (err) => {
      setPhase('error');
    },
  });

  const { execute: saveAnswer } = useSaveAnswer({
    sessionToken: submission.current?.sessionToken || '',
    onError: (e) => {
      callToast('Gagal menyimpan jawaban. Coba lagi.', 'error');
    },
  });

  const { execute: submitQuiz } = useSubmitQuiz({
    sessionToken: submission.current?.sessionToken || '',
    onSuccess: (data) => {
      stopTimer();
      callToast('Jawaban berhasil di kirim.', 'success');
      setTimeout(() => {
        navigateTo('quizResult', {
          submission_id: data.data.id,
          quiz_id: quizId,
          score: data.data.score,
          final_score: data.data.final_score,
          is_passed: data.data.is_passed,
          time_spent: data.data.time_spent_seconds,
          close: true,
          courseId: routerParams?.courseId,
          course_slug: routerParams?.course_slug,
        });
      }, 1000);
    },
    onError: () => {
      callToast('Jawaban gagal di kirim.', 'error');
      setPhase('error');
    },
  });

  // ─── Init ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    getItem({ key: PrefKey.SubmissionId + quizId, biz: BizKey.Quiz }, (res) => {
      const data = res.data.data as QuizCoreProps | null;
      if (!data?.submissionId) return;
      submission.current = data;
      setPhase('loading');
      fetchOverview({ submissionId: data.submissionId, sessionToken: data.sessionToken });
    });
    return () => stopTimer();
  }, []);

  // ─── Restore answer when page changes ────────────────────────────────────
  // Reads from localAnswers ref so we always show what the user last entered,
  // even if they navigated away and came back before the API confirmed.
  useEffect(() => {
    if (phase !== 'quiz' || questions.length === 0) return;
    const q = questions[currentPage - 1];
    if (!q) return;
    const cached = localAnswers.current[q.id];
    if (cached?.selected_options?.length) {
      setCurrentAnswer(
        q.type === 'checkbox' ? cached.selected_options : (cached.selected_options[0] ?? null)
      );
    } else if (cached?.content) {
      if (q.type === 'essay') inputRef.current?.setValue(cached.content);
      setCurrentAnswer(cached.content);
    } else {
      setCurrentAnswer(q.type === 'checkbox' ? [] : null);
    }
  }, [currentPage, phase]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const currentQuestion = questions[currentPage - 1] ?? null;

  const buildPayload = (): SaveAnswerPayload => {
    if (!currentQuestion) return {} as SaveAnswerPayload;
    if (currentQuestion.type === 'essay') {
      return {
        quiz_question_id: currentQuestion.id,
        selected_options: null,
        content: inputRef.current?.getValue() || '',
      };
    }
    if (currentQuestion.type === 'checkbox') {
      return {
        quiz_question_id: currentQuestion.id,
        selected_options: currentAnswer as number[],
        content: null,
      };
    }
    return {
      quiz_question_id: currentQuestion.id,
      selected_options: [currentAnswer as number],
      content: null,
    };
  };

  const persistAnswerLocally = (payload: SaveAnswerPayload) => {
    if (!currentQuestion) return;
    localAnswers.current[currentQuestion.id] = {
      content: payload.content,
      selected_options: payload.selected_options?.map(String) ?? null,
    };
    setAnsweredQuestions((prev) =>
      prev.includes(currentPage - 1) ? prev : [...prev, currentPage - 1]
    );
  };

  const handleNext = async () => {
    if (!submission.current || !currentQuestion) return;
    const payload = buildPayload();
    setIsSaving(true);
    saveAnswer(
      { submissionId: submission.current.submissionId, payload },
      {
        onSettled: () => {
          persistAnswerLocally(payload);
          setIsSaving(false);
          if (currentPage < totalQuestions) {
            setCurrentPage((p) => p + 1);
          } else {
            stopTimer();
            confirm(() => {
              if (!submission.current) {
                callToast('Maaf sedang terjadi kendala. Coba beberapa saat lagi', 'error');
                return;
              }
              submitQuiz(submission.current!.submissionId);
            });
          }
        },
      }
    );
  };

  const handleBack = () => {
    if (!submission.current || !currentQuestion || currentPage <= 1) return;
    const payload = buildPayload();
    if (!payload) return;
    setIsSaving(true);
    saveAnswer(
      { submissionId: submission.current.submissionId, payload },
      {
        onSettled: () => {
          persistAnswerLocally(payload);
          setIsSaving(false);
          setCurrentPage((p) => p - 1);
        },
      }
    );
  };

  const handleJumpTo = (index: number) => {
    closeNav();
    if (!submission.current || !currentQuestion) return;
    const payload = buildPayload();
    setIsSaving(true);
    saveAnswer(
      { submissionId: submission.current.submissionId, payload },
      {
        onSettled: () => {
          persistAnswerLocally(payload);
          setIsSaving(false);
          setTimeout(() => setCurrentPage(index + 1), 300);
        },
      }
    );
  };

  const toggleFlag = () => {
    setFlaggedQuestions((prev) =>
      prev.includes(currentPage - 1)
        ? prev.filter((i) => i !== currentPage - 1)
        : [...prev, currentPage - 1]
    );
  };

  const handleSelection = (optionId: string) => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'checkbox') {
      const prev = Array.isArray(currentAnswer) ? currentAnswer : [];
      setCurrentAnswer(
        prev.includes(optionId) ? prev.filter((id: string) => id !== optionId) : [...prev, optionId]
      );
    } else {
      setCurrentAnswer(optionId);
    }
  };

  const isSelected = (optionId: string) => {
    if (currentQuestion?.type === 'checkbox') {
      return Array.isArray(currentAnswer) && currentAnswer.includes(optionId);
    }
    return currentAnswer === optionId;
  };

  const isNextDisabled = () =>
    isSaving || phase === 'submitting' || timeLeft === 0 || !currentQuestion;

  const progressWidth = totalQuestions > 0 ? (currentPage / totalQuestions) * 100 : 0;
  const options = Array.isArray(currentQuestion?.options) ? currentQuestion!.options : [];
  const isFlagged = flaggedQuestions.includes(currentPage - 1);

  if (phase === 'submitting') {
    return (
      <view className="h-[100vh] items-center bg-[#F8F9FA] flex justify-center">
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
      {options.map((option, index) => {
        const active = isSelected(index.toString());
        const isCheckbox = currentQuestion?.type === 'checkbox';
        return (
          <view
            key={index}
            className={`flex-row items-center rounded-2xl border-2 p-4 flex ${
              active ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white'
            }`}
            bindtap={() => handleSelection(index.toString())}
          >
            <view
              className={`mr-4 h-6 w-6 items-center border-2 justify-center ${
                isCheckbox ? 'rounded-md' : 'rounded-full'
              } ${active ? 'border-[#1a73e8] bg-[#1a73e8]' : 'border-slate-200'}`}
            >
              {active && (
                <view
                  className={isCheckbox ? 'h-3 w-3 bg-white' : 'h-2 w-2 rounded-full bg-white'}
                />
              )}
            </view>
            <Text size={TextType.b2}>{getOptionText(option)}</Text>
          </view>
        );
      })}
    </view>
  );

  const renderEssay = () => (
    <view className="h-full flex-col flex">
      <Input ref={inputRef} title="" id="answerField" initialValue={currentAnswer} />
    </view>
  );

  const renderTrueFalse = () => {
    const tfOptions = [
      { label: 'Benar', isTrue: true },
      { label: 'Salah', isTrue: false },
    ];

    return (
      <view className="flex-col gap-3 flex">
        {tfOptions.map((option, index) => {
          const active = isSelected(index.toString());

          return (
            <view
              key={index}
              className={`flex-row items-center rounded-2xl border-2 p-5 flex ${
                active
                  ? option.isTrue
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-400 bg-red-50'
                  : 'border-slate-100 bg-white'
              }`}
              bindtap={() => handleSelection(index.toString())}
            >
              {/* Icon */}
              <view
                className={`mr-4 h-10 w-10 items-center rounded-full justify-center ${
                  active ? (option.isTrue ? 'bg-green-500' : 'bg-red-400') : 'bg-slate-100'
                }`}
              >
                <text className={`text-base font-bold ${active ? 'text-white' : 'text-slate-400'}`}>
                  {active ? (option.isTrue ? '✓' : '✗') : option.isTrue ? 'B' : 'S'}
                </text>
              </view>

              {/* Label */}
              <view className="flex-1 flex-col flex">
                <Text
                  size={TextType.b1}
                  fontWeight="bold"
                  className={
                    active ? (option.isTrue ? 'text-green-700' : 'text-red-600') : 'text-slate-700'
                  }
                >
                  {option.label}
                </Text>
              </view>

              {/* Selected dot */}
              <view
                className={`h-6 w-6 items-center rounded-full border-2 justify-center ${
                  active
                    ? option.isTrue
                      ? 'border-green-500 bg-green-500'
                      : 'border-red-400 bg-red-400'
                    : 'border-slate-200 bg-white'
                }`}
              >
                {active && <view className="h-2 w-2 rounded-full bg-white" />}
              </view>
            </view>
          );
        })}
      </view>
    );
  };

  return (
    <view className="h-screen w-full flex-col bg-[#F8F9FA] flex relative">
      {/* Header */}
      <view className="bg-white px-5 py-4 shadow-sm">
        <view
          className={`mb-4 flex-row items-center flex ${timeLeft > 0 ? 'justify-between' : 'justify-end'}`}
        >
          {/* Timer pill */}
          {timeLeft > 0 && (
            <view
              className={`flex-row items-center gap-2 rounded-full px-3 py-1 flex ${timerColor.bg}`}
            >
              <>
                <view className={`h-1.5 w-1.5 rounded-full ${timerColor.dot}`} />
                <Text size={TextType.b2} fontWeight="bold" className={timerColor.text}>
                  {formatTime(timeLeft)}
                </Text>
              </>
            </view>
          )}

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

      {/* Content */}
      <scroll-view className="flex-1 bg-white px-5 pt-8" scroll-y>
        {phase === 'loading' ? (
          <view className="h-[40vh] items-center flex justify-center">
            <Loading size={32} />
          </view>
        ) : (
          <view key={currentPage} className="animate-fade-in">
            <view className="flex-row flex justify-between">
              <view className="items-center rounded-full bg-[#FFF8E6] px-3 py-1 flex">
                <text className="uppercase text-[10px] font-bold text-[#FBB03B]">
                  {currentQuestion?.type_label ?? 'Question'}
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

            <Text
              size={TextType.h2}
              fontWeight="bold"
              className="my-6 leading-tight text-slate-800"
            >
              {htmlToPlainText(currentQuestion?.content || '')}
            </Text>

            {currentQuestion?.type === 'essay'
              ? renderEssay()
              : currentQuestion?.type === 'true_false'
                ? renderTrueFalse()
                : renderOptions()}
          </view>
        )}
      </scroll-view>

      {/* Footer */}
      <view className="border-t border-slate-100 bg-white p-5 pb-10">
        <view className="flex-row gap-3 flex">
          {currentPage > 1 && (
            <Button onPress={handleBack} isLoading={isSaving} color="white">
              Kembali
            </Button>
          )}
          <Button disabled={isNextDisabled()} onPress={handleNext} isLoading={isSaving}>
            {currentPage < totalQuestions ? 'Next' : 'Finish Quiz ✓'}
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
                Daftar Pertanyaan
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
                        isCurrent
                          ? 'border-blue-600 bg-blue-100 text-blue-700'
                          : answeredQuestions.includes(i)
                            ? 'border-green-500 bg-green-100 text-green-700'
                            : 'border-slate-300 bg-white text-slate-400'
                      }`}
                      bindtap={() => handleJumpTo(i)}
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
      <ConfirmationModal />

      <BackInterceptor />
    </view>
  );
};

export default QuizPage;
