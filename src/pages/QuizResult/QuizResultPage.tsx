import { useEffect, useState } from '@lynx-js/react';
import * as router from 'sparkling-navigation';

import { useBackInterceptor } from '@/components/BackInterceptor/BackInterceptor';
import { Loading } from '@/components/Loading/Loading';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Badge from '@/components/common/Badge/Badge';
import Button from '@/components/common/Button';
import { Colors } from '@/constant/style';
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
  const ringColor = isPassed ? Colors.Success : Colors.Error;
  return (
    <view style={{ marginBottom: '24px', alignItems: 'center', justifyContent: 'center' }}>
      <view
        style={{
          height: '144px',
          width: '144px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '9999px',
          borderWidth: '8px',
          borderStyle: 'solid',
          borderColor: ringColor,
          padding: '20px',
        }}
      >
        <text
          style={{
            fontSize: '32px',
            fontWeight: '700',
            fontFamily: 'jakarta',
            color: ringColor,
            textAlign: 'center',
          }}
        >
          {parseInt(percentage.toString())}
        </text>
      </view>
      <view style={{ marginTop: '12px' }}>
        <Badge variant={isPassed ? 'success' : 'danger'}>
          {isPassed ? 'Lulus' : 'Belum Lulus'}
        </Badge>
      </view>
    </view>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <view className="flex-1 flex-col items-center rounded-2xl border border-slate-100 bg-slate-50 p-4 flex">
    <Text size={TextType.p} className="text-slate-400">
      {label}
    </Text>
    <Text size={TextType.h3} fontWeight="bold" className="mt-1 text-slate-800">
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

  const statusVariant = isPendingGrade
    ? 'warning'
    : answer.score && answer.score > 0
      ? 'success'
      : 'danger';

  const statusColor = isPendingGrade
    ? Colors.Warning
    : answer.score && answer.score > 0
      ? Colors.Success
      : Colors.Error;

  const statusLabel = isPendingGrade
    ? 'Pending'
    : answer.score && answer.score > 0
      ? 'Benar'
      : 'Salah';

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
            {htmlToPlainText(question?.content ?? '—')}
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
            Jawaban kamu:
          </Text>
          <Text size={TextType.b2} className="mb-3 text-slate-700">
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
            <Text size={TextType.b3} className="text-slate-400">
              Skor:
            </Text>
            <Text size={TextType.b2} fontWeight="bold" className="text-slate-800">
              {answer.score ?? (isPendingGrade ? 'Pending penilaian manual' : '0')}
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
  const { routerParams, navigateTo, setParams } = useNativeBridge();
  const { getResultsApi } = useQuizRepo();

  const submissionId: number = routerParams?.submission_id;

  const [submission, setSubmission] = useState<QuizSubmissionResource | null>(null);
  const [phase, setPhase] = useState<'loading' | 'done' | 'error'>('loading');
  const { confirmBack } = useBackInterceptor({
    onBackPressed: () => confirmBack(),
  });

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
      <view
        style={{
          height: '100vh',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.Canvas,
          gap: '12px',
        }}
      >
        <Loading />
        <Text size={TextType.b2} color={Colors.TextTertiary}>
          Kami sedang memproses hasil quiz kamu...
        </Text>
      </view>
    );
  }

  if (phase === 'error' || !submission) {
    return (
      <view
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: Colors.Canvas,
          paddingLeft: '32px',
          paddingRight: '32px',
        }}
      >
        <text style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</text>
        <Text
          size={TextType.h2}
          fontWeight="700"
          color={Colors.N900}
          style={{ marginBottom: '24px', textAlign: 'center' }}
        >
          Oops, Kami baru tidak bisa memuat hasil quiz
        </Text>
        <Button onPress={() => navigateTo('main', { close: true })}>Kembali ke materi</Button>
      </view>
    );
  }

  const percentage = submission.final_score ?? submission.score ?? 0;
  const isPassed = submission.is_passed ?? false;
  const answers = submission.answers ?? [];
  const hasEssay = answers.some((a) => a.question?.type === 'essay');

  return (
    <view
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: Colors.Canvas,
      }}
    >
      <scroll-view className="flex-1 px-5 pt-6" scroll-y>
        {/* Score ring card */}
        <view
          style={{
            marginBottom: '24px',
            alignItems: 'center',
            borderRadius: '16px',
            backgroundColor: Colors.Surface,
            padding: '24px',
            border: `1px solid ${Colors.Border}`,
          }}
        >
          <ScoreRing percentage={percentage} isPassed={isPassed} />

          {/* Stat row */}
          <view style={{ display: 'flex', flexDirection: 'row', gap: '12px', width: '100%' }}>
            <StatCard label="Waktu" value={formatSeconds(submission.time_spent_seconds)} />
            <StatCard label="Percobaan ke" value={`#${submission.attempt_number}`} />
            <StatCard
              label="Status"
              value={submission.grading_status_label ?? submission.status_label}
            />
          </view>

          {/* Essay pending notice */}
          {hasEssay && submission.grading_status !== 'graded' && (
            <view
              style={{
                marginTop: '16px',
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                borderRadius: '12px',
                backgroundColor: Colors.WarningBg,
                padding: '16px',
              }}
            >
              <text style={{ fontSize: '20px' }}>⏱️</text>
              <view style={{ flex: 1 }}>
                <Text size={TextType.b2} fontWeight="700" color={Colors.WarningBadgeText}>
                  Essay Pending Review
                </Text>
                <Text size={TextType.b3} color={Colors.WarningBadgeText}>
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
            <Text size={TextType.h3} fontWeight="bold" className="mb-3 text-slate-800">
              Review Jawaban
            </Text>
            {answers.map((answer, i) => (
              <AnswerReviewItem key={answer.id} answer={answer} index={i} />
            ))}
          </view>
        )}

        <view style={{ height: '40px' }} />
      </scroll-view>

      {/* Footer */}
      <view
        style={{
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: Colors.Border,
          backgroundColor: Colors.Surface,
          padding: '20px',
          paddingBottom: '36px',
        }}
      >
        <Button
          onPress={() => {
            setParams({ courseId: routerParams?.courseId, course_slug: routerParams?.course_slug });
            confirmBack();
          }}
        >
          Kembali ke Materi
        </Button>
      </view>
    </view>
  );
};

export default QuizResultPage;
