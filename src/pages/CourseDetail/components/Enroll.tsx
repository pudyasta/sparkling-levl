import { useState } from '@lynx-js/react';

import Input from '@/components/Input/Input';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card/Card';

import type { EnrollmentType } from '../type/enrollment';
import { useEnrollCourse } from '../usecase/useEnrollCourse';

interface EnrollProps {
  courseSlug: string;
  enrollmentType: EnrollmentType;
  onEnrollSuccess?: () => void;
}

export const Enroll = ({ courseSlug, enrollmentType, onEnrollSuccess }: EnrollProps) => {
  const [enrollmentKey, setEnrollmentKey] = useState('');
  const [keyError, setKeyError] = useState<string | null>(null);
  const [showPendingInfo, setShowPendingInfo] = useState(false);

  const { execute, isLoading } = useEnrollCourse({
    onSuccess: (data) => {
      console.log('hasil enroll', JSON.stringify(data, null, 2));
      if (data.data.status === 'pending') {
        setShowPendingInfo(true);
        return;
      }
      onEnrollSuccess?.();
    },
    onValidationError: (errors) => {
      setKeyError('Invalid enrollment key. Please try again.');
    },
    onError: () => {
      setKeyError('Something went wrong. Please try again.');
    },
  });

  const handleEnroll = () => {
    setKeyError(null);

    if (enrollmentType === 'key_based' && !enrollmentKey.trim()) {
      setKeyError('Please enter your enrollment key.');
      return;
    }

    execute({
      courseSlug,
      payload: enrollmentType === 'key_based' ? { enrollment_key: enrollmentKey } : undefined,
    });
  };

  // Approval pending state
  if (showPendingInfo) {
    return (
      <view className="items-center">
        <text className="mb-2 text-4xl">⏳</text>
        <Text className="mb-2 text-lg font-bold text-slate-800 text-center" size={TextType.h2}>
          Permintaan Terkirim!
        </Text>
        <Text className="text-sm text-slate-400 text-center" size={TextType.b2}>
          Pendaftaranmu sedang menunggu persetujuan. Kamu akan diberi tahu setelah admin menyetujui.
        </Text>
      </view>
    );
  }

  return (
    <>
      {enrollmentType === 'auto_accept' && (
        <AutoAcceptView isLoading={isLoading} onEnroll={handleEnroll} />
      )}

      {enrollmentType === 'key_based' && (
        <KeyBasedView
          enrollmentKey={enrollmentKey}
          keyError={keyError}
          isLoading={isLoading}
          onChangeKey={setEnrollmentKey}
          onEnroll={handleEnroll}
        />
      )}

      {enrollmentType === 'approval' && (
        <ApprovalView isLoading={isLoading} onEnroll={handleEnroll} />
      )}
    </>
  );
};

// ─── Sub-views ────────────────────────────────────────────────────────────────

const AutoAcceptView = ({ isLoading, onEnroll }: { isLoading: boolean; onEnroll: () => void }) => (
  <view>
    <view className="mb-4 flex-row items-center gap-2">
      <text className="text-2xl">🎓</text>
      <Text className="text-lg font-extrabold text-slate-800" size={TextType.h2}>
        Daftar untuk mulai belajar!
      </Text>
    </view>
    <Text className="mb-5 text-sm text-slate-400" size={TextType.b2}>
      Kursus ini terbuka buat semua orang. Gabung sekarang yuk!
    </Text>
    <Button variant="filled" color="primary" onPress={onEnroll} disabled={isLoading}>
      {isLoading ? 'Enrolling...' : 'Daftar'}
    </Button>
  </view>
);

const KeyBasedView = ({
  enrollmentKey,
  keyError,
  isLoading,
  onChangeKey,
  onEnroll,
}: {
  enrollmentKey: string;
  keyError: string | null;
  isLoading: boolean;
  onChangeKey: (v: string) => void;
  onEnroll: () => void;
}) => (
  <view>
    <view className="mb-4 flex-row items-center gap-2">
      <text className="text-2xl">🔑</text>
      <Text className="text-lg font-extrabold text-slate-800" size={TextType.h2}>
        Input kode pendaftaran
      </Text>
    </view>
    <Text className="mb-4 text-sm text-slate-400" size={TextType.b2}>
      Kursus ini memerlukan kode pendaftaran. Silakan kode kunci Anda di bawah ini untuk bergabung.
    </Text>

    {/* Key input */}
    <Input title="" />

    {keyError && (
      <Text className="mb-3 text-xs text-red-400" size={TextType.b3}>
        {keyError}
      </Text>
    )}

    <view className="mb-5" />

    <Button variant="filled" color="primary" onPress={onEnroll} disabled={isLoading}>
      {isLoading ? 'Verifying...' : 'Daftar'}
    </Button>
  </view>
);

const ApprovalView = ({ isLoading, onEnroll }: { isLoading: boolean; onEnroll: () => void }) => (
  <view>
    <view className="mb-4 flex-row items-center gap-2">
      <text className="text-2xl">📋</text>
      <Text className="text-lg font-extrabold text-slate-800" size={TextType.h2}>
        Minta untuk bergabung
      </Text>
    </view>
    <Text className="mb-2 text-sm text-slate-400" size={TextType.b2}>
      Kursus ini memerlukan persetujuan admin. Permintaanmu akan ditinjau sebelum dapat mengakses
      kontennya.
    </Text>

    {/* Info pill */}
    <view className="mb-5 flex-row items-center gap-2 rounded-xl bg-amber-50 px-4 py-3">
      <Text className="text-xs text-amber-600" size={TextType.b3}>
        Persetujuan mungkin membutuhkan waktu hingga 1-2 hari kerja.
      </Text>
    </view>

    <Button
      isLoading={isLoading}
      variant="outlined"
      color="primary"
      onPress={onEnroll}
      disabled={isLoading}
    >
      Daftar
    </Button>
  </view>
);
