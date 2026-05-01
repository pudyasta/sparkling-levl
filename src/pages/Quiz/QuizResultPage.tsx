import { useEffect, useState } from '@lynx-js/react';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import { useQuizRepo } from './repo/useQuizRepo';
import type { QuizAnswerResource, QuizSubmissionResource } from './type/QuizData';

const formatSeconds = (seconds: number | null) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

const ScoreRing = ({ percentage, isPassed }: { percentage: number; isPassed: boolean }) => {
  const color = isPassed ? '#22c55e' : '#ef4444';
  return (
    <view className="mb-6 items-center justify-center">
      <view
        className="h-36 w-36 items-center rounded-full border-8 justify-center"
        style={{ borderColor: color }}
      >
        <text className="text-4xl font-extrabold" style={{ color }}>
          {percentage}%
        </text>
      </view>
      <view
        className="mt-3 rounded-full px-4 py-1"
        style={{ backgroundColor: isPassed ? '#dcfce7' : '#fee2e2' }}
      >
        <text className="text-sm font-bold" style={{ color: isPassed ? '#15803d' : '#b91c1c' }}>
          {isPassed ? '🎉 PASSED' : '😔 NOT PASSED'}
        </text>
      </view>
    </view>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <view className="flex-1 flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-4 flex">
    <Text size={TextType.b2} className="text-slate-400">
      {label}
    </Text>
    <Text size={TextType.h2} fontWeight="bold" className="mt-1 text-slate-800">
      {value}
    </Text>
  </view>
);

const AnswerReviewItem = ({ answer, index }: { answer: QuizAnswerResource; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const question = answer.question;
  const isEssay = question?.type === 'essay';
  const isPendingGrade = isEssay && answer.score === null;

  const statusColor = isPendingGrade
    ? '#f59e0b'
    : answer.score && answer.score > 0
      ? '#22c55e'
      : '#ef4444';

  const statusLabel = isPendingGrade
    ? '⏳ Pending'
    : answer.score && answer.score > 0
      ? '✓ Correct'
      : '✗ Incorrect';

  return (
    <view className="mb-3 rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <view
        className="flex-row items-center p-4 flex justify-between"
        bindtap={() => setIsOpen(!isOpen)}
      >
        <view className="flex-1 flex-row items-center gap-3 flex">
          <view
            className="h-8 w-8 items-center rounded-full justify-center"
            style={{ backgroundColor: `${statusColor}20` }}
          >
            <text className="text-xs font-bold" style={{ color: statusColor }}>
              {index + 1}
            </text>
          </view>
          <Text size={TextType.b2} className="flex-1 text-slate-700">
            {question?.content ?? '—'}
          </Text>
        </view>
        <view className="flex-row items-center gap-2 flex">
          <text className="text-xs font-bold" style={{ color: statusColor }}>
            {statusLabel}
          </text>
          <text className="text-slate-300">{isOpen ? '▲' : '▼'}</text>
        </view>
      </view>

      {isOpen && (
        <view className="border-t border-slate-100 px-4 pb-4 pt-3">
          {/* Your answer */}
          <Text size={TextType.b3} className="mb-1 text-slate-400">
            Your answer:
          </Text>
          <Text size={TextType.b2} className="mb-3 text-slate-700">
            {isEssay ? (answer.content ?? '—') : (answer.selected_options?.join(', ') ?? '—')}
          </Text>

          {/* Score */}
          <view className="flex-row items-center gap-2 flex">
            <Text size={TextType.b3} className="text-slate-400">
              Score:
            </Text>
            <Text size={TextType.b2} fontWeight="bold" className="text-slate-800">
              {answer.score ?? (isPendingGrade ? 'Awaiting manual grade' : '0')}
              {!isPendingGrade && ` / ${question?.max_score ?? '—'}`}
            </Text>
          </view>

          {/* Feedback */}
          {answer.feedback && (
            <view className="mt-3 rounded-xl bg-blue-50 p-3">
              <Text size={TextType.b3} className="text-blue-600">
                {answer.feedback}
              </Text>
            </view>
          )}
        </view>
      )}
    </view>
  );
};

const QuizResultPage = () => {
  const { routerParams, navigateTo } = useNativeBridge();
  const { getResultsApi } = useQuizRepo();

  const submissionId: number = routerParams?.submission_id;
  const quizId: number = routerParams?.quiz_id;

  const [submission, setSubmission] = useState<QuizSubmissionResource | null>(null);
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getResultsApi(quizId);
        // Pick the submission matching our submissionId
        const match = res.data.find((s) => s.id === submissionId) ?? res.data[0];
        setSubmission(match);
        setPhase('done');
      } catch (e) {
        console.log('QuizResultPage error:', e);
        setPhase('error');
      }
    };
    load();
  }, []);

  if (phase === 'loading') {
    return (
      <view className="flex-1 items-center bg-[#F8F9FA] justify-center">
        <text className="mb-3 text-4xl">📊</text>
        <Text size={TextType.b1} className="text-slate-400">
          Loading results...
        </Text>
      </view>
    );
  }

  if (phase === 'error' || !submission) {
    return (
      <view className="flex-1 items-center bg-[#F8F9FA] px-8 justify-center">
        <text className="mb-3 text-5xl">⚠️</text>
        <Text size={TextType.h2} fontWeight="bold" className="mb-6 text-slate-800 text-center">
          Could not load results
        </Text>
        <Button
          onPress={() => navigateTo('main.lynx.bundle', { close: true })}
          className="h-12 w-full rounded-2xl"
        >
          Go Home
        </Button>
      </view>
    );
  }

  const percentage = submission.final_score ?? submission.score ?? 0;
  const isPassed = submission.is_passed ?? false;
  const answers = submission.answers ?? [];
  const hasEssay = answers.some((a) => a.question?.type === 'essay');

  return (
    <view className="h-screen w-full flex-col bg-[#F8F9FA] flex">
      {/* Header */}
      <view className="bg-white px-5 pb-4 pt-12 shadow-sm">
        <Text size={TextType.h2} fontWeight="bold" className="text-slate-800">
          Quiz Result
        </Text>
        <Text size={TextType.b2} className="text-slate-400">
          {submission.quiz?.title ?? '—'}
        </Text>
      </view>

      <scroll-view className="flex-1 px-5 pt-6" scroll-y>
        {/* Score ring */}
        <view className="mb-6 items-center rounded-3xl bg-white p-6 shadow-sm">
          <ScoreRing percentage={percentage} isPassed={isPassed} />

          {/* Stat row */}
          <view className="flex-row gap-3 flex">
            <StatCard label="Time Spent" value={formatSeconds(submission.time_spent_seconds)} />
            <StatCard label="Attempt" value={`#${submission.attempt_number}`} />
            <StatCard
              label="Status"
              value={submission.grading_status_label ?? submission.status_label}
            />
          </view>

          {/* Essay pending notice */}
          {hasEssay && submission.grading_status !== 'graded' && (
            <view className="mt-4 w-full flex-row items-center gap-2 rounded-2xl bg-amber-50 p-4 flex">
              <text className="text-xl">⏱️</text>
              <view className="flex-1">
                <Text size={TextType.b2} fontWeight="bold" className="text-amber-700">
                  Essay Pending Review
                </Text>
                <Text size={TextType.b3} className="text-amber-600">
                  Your essay answers are being graded manually. Final score may change.
                </Text>
              </view>
            </view>
          )}
        </view>

        {/* Answer review */}
        {answers.length > 0 && (
          <view className="mb-6">
            <Text size={TextType.h3} fontWeight="bold" className="mb-3 text-slate-800">
              Answer Review
            </Text>
            {answers.map((answer, i) => (
              <AnswerReviewItem key={answer.id} answer={answer} index={i} />
            ))}
          </view>
        )}

        <view className="h-10" />
      </scroll-view>

      {/* Footer */}
      <view className="border-t border-slate-100 bg-white p-5 pb-10">
        <Button
          className="h-14 w-full rounded-2xl bg-blue-600"
          onPress={() => navigateTo('main.lynx.bundle', { close: true })}
        >
          <text className="font-bold text-white">Back to Home</text>
        </Button>
      </view>
    </view>
  );
};

export default QuizResultPage;
