import { useEffect, useState } from '@lynx-js/react';
import * as router from 'sparkling-navigation';

import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { htmlToPlainText } from '@/lib/helper/htmlToLynx';

import { useQuizRepo } from '../Quiz/repo/useQuizRepo';
import type { QuizAnswerResource, QuizSubmissionResource } from '../Quiz/type/QuizData';

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
        className="h-36 w-36 items-center rounded-full border-8 p-5 justify-center"
        style={{ borderColor: color }}
      >
        <text className="text-4xl font-extrabold" style={{ color }}>
          {parseInt(percentage.toString())}
        </text>
      </view>
      <view
        className="mt-3 rounded-full px-4 py-1"
        style={{ backgroundColor: isPassed ? '#dcfce7' : '#fee2e2' }}
      >
        <text className="text-sm font-bold" style={{ color: isPassed ? '#15803d' : '#b91c1c' }}>
          {isPassed ? 'Lulus' : 'Belum Lulus'}
        </text>
      </view>
    </view>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <view className="flex-1 flex-col items-center rounded-2xl border border-light bg-surface-alt p-4 flex">
    <Text size={TextType.b2} className="text-subtle">
      {label}
    </Text>
    <Text size={TextType.h2} fontWeight="bold" className="mt-1 text-neutral">
      {value}
    </Text>
  </view>
);

const AnswerReviewItem = ({ answer, index }: { answer: QuizAnswerResource; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const question = answer.question;
  const isEssay = question?.type === 'essay';
  const isTrueFalse = question?.type === 'true_false';
  const isPendingGrade = isEssay && answer.score === null;

  const statusColor = isPendingGrade
    ? '#f59e0b'
    : answer.score && answer.score > 0
      ? '#22c55e'
      : '#ef4444';

  const statusLabel = isPendingGrade
    ? '⏳ Pending'
    : answer.score && answer.score > 0
      ? 'Benar'
      : 'Salah';

  return (
    <view className="mb-3 rounded-2xl border border-light bg-surface overflow-hidden">
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
          <Text size={TextType.b2} className="flex-1 text-neutral">
            {htmlToPlainText(question?.content ?? '—')}
          </Text>
        </view>
        <view className="flex-row items-center gap-2 flex">
          <text className="text-xs font-bold" style={{ color: statusColor }}>
            {statusLabel}
          </text>
          <text className="text-subtle">{isOpen ? '▲' : '▼'}</text>
        </view>
      </view>

      {isOpen && (
        <view className="border-t border-light px-4 pb-4 pt-3">
          {/* Your answer */}
          <Text size={TextType.b3} className="mb-1 text-subtle">
            Jawaban kamu:
          </Text>
          <Text size={TextType.b2} className="mb-3 text-neutral">
            {isEssay
              ? (answer.content ?? '—')
              : isTrueFalse
                ? (() => {
                    const selected = answer.selected_options?.[0];
                    if (selected === null || selected === undefined) return '—';
                    return Number(selected) === 0 ? 'Benar' : 'Salah';
                  })()
                : (answer.selected_options
                    ?.map((o) => {
                      return answer.question?.options[Number(o)]?.text ?? o;
                    })
                    .join(', ') ?? '—')}
          </Text>

          {/* Score */}
          <view className="flex-row items-center gap-2 flex">
            <Text size={TextType.b3} className="text-subtle">
              Skor:
            </Text>
            <Text size={TextType.b2} fontWeight="bold" className="text-neutral">
              {answer.score ?? (isPendingGrade ? 'Pending penilaian manual' : '0')}
              {!isPendingGrade && ` / ${question?.max_score ?? '—'}`}
            </Text>
          </view>

          {/* Feedback */}
          {answer.feedback && (
            <view className="mt-3 rounded-xl bg-accent p-3">
              <Text size={TextType.b3} className="text-primary">
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
  const { routerParams, navigateTo, setParams } = useNativeBridge();
  const { getResultsApi } = useQuizRepo();

  const submissionId: number = routerParams?.submission_id;

  const [submission, setSubmission] = useState<QuizSubmissionResource | null>(null);
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');

  useEffect(() => {
    console.log(JSON.stringify(routerParams, null, 2));
    const load = async () => {
      try {
        const res = await getResultsApi(submissionId);
        setSubmission(res.data);
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
      <view className="h-[100vh] flex-1 items-center bg-canvas justify-center">
        <Loading />
        <Text size={TextType.b1} className="text-subtle">
          Kami sedang memproses hasil quiz kamu...
        </Text>
      </view>
    );
  }

  if (phase === 'error' || !submission) {
    return (
      <view className="h-screen flex-col items-center bg-canvas px-8 flex justify-center">
        <text className="mb-3 text-5xl">⚠️</text>
        <Text size={TextType.h2} fontWeight="bold" className="mb-6 text-neutral text-center">
          Oops, Kami baru tidak bisa memuat hasil quiz
        </Text>
        <Button
          onPress={() => navigateTo('main', { close: true })}
          className="h-12 w-full rounded-2xl"
        >
          Kembali ke materi
        </Button>
      </view>
    );
  }

  const percentage = submission.final_score ?? submission.score ?? 0;
  const isPassed = submission.is_passed ?? false;
  const answers = submission.answers ?? [];
  const hasEssay = answers.some((a) => a.question?.type === 'essay');

  return (
    <view className="h-screen w-full flex-col bg-canvas flex">
      <scroll-view className="flex-1 px-5 pt-6" scroll-y>
        {/* Score ring */}
        <view className="mb-6 items-center rounded-3xl bg-surface p-6 shadow-sm">
          <ScoreRing percentage={percentage} isPassed={isPassed} />

          {/* Stat row */}
          <view className="flex-row gap-3 flex">
            <StatCard label="Waktu" value={formatSeconds(submission.time_spent_seconds)} />
            <StatCard label="Perobaan ke" value={`#${submission.attempt_number}`} />
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
                  Jawaban essay Anda sedang menunggu penilaian manual. Skor akhir akan diperbarui
                  setelah penilaian selesai.
                </Text>
              </view>
            </view>
          )}
        </view>

        {/* Answer review */}
        {answers.length > 0 && (
          <view className="mb-6">
            <Text size={TextType.h3} fontWeight="bold" className="mb-3 text-neutral">
              Review Jawaban
            </Text>
            {answers.map((answer, i) => (
              <AnswerReviewItem key={answer.id} answer={answer} index={i} />
            ))}
          </view>
        )}

        <view className="h-10" />
      </scroll-view>

      {/* Footer */}
      <view className="border-t border-light bg-surface p-5 pb-10">
        <Button
          className="h-14 w-full rounded-2xl bg-primary"
          onPress={() => {
            setParams({ courseId: routerParams?.courseId, course_slug: routerParams?.course_slug });
            router.close();
          }}
        >
          Kembali ke Materi
        </Button>
      </view>
    </view>
  );
};

export default QuizResultPage;
