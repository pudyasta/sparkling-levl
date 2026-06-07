import { type RefObject, useEffect, useRef, useState } from '@lynx-js/react';

import Input, { type InputRef } from '@/components/Input/Input';
import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import { callToast } from '@/lib/helper/showToast';

import type { EnrollmentType } from '../type/enrollment';
import { useEnrollCourse } from '../usecase/useEnrollCourse';

interface EnrollProps {
  courseSlug: string;
  status?: string;
  enrollmentType: EnrollmentType;
  onEnrollSuccess?: () => void;
}

export const Enroll = ({ courseSlug, status, enrollmentType, onEnrollSuccess }: EnrollProps) => {
  const [keyError, setKeyError] = useState<string | null>(null);
  const [showPendingInfo, setShowPendingInfo] = useState(false);
  const inputRef = useRef<InputRef>(null);

  const { execute, isLoading } = useEnrollCourse({
    onSuccess: (data) => {
      if (data.data.status === 'pending') {
        callToast('Permintaan terkirim!', 'info');
        setShowPendingInfo(true);
        return;
      }
      onEnrollSuccess?.();
      callToast('Pendaftaranmu berhasil!', 'success');
    },
    onValidationError: (errors) => {
      setKeyError('Kode pendaftaran tidak valid. Coba lagi.');
    },
    onError: () => {
      callToast('Oops, permintaan kamu gagal dikirim. Coba lagi.', 'error');
    },
  });

  const handleEnroll = () => {
    setKeyError(null);

    if (enrollmentType === 'key_based' && !inputRef.current?.getValue()?.trim()) {
      setKeyError('Masukkan kode pendaftaran.');
      return;
    }
    execute({
      courseSlug,
      payload:
        enrollmentType === 'key_based'
          ? { enrollment_key: inputRef.current?.getValue() || '' }
          : undefined,
    });
  };

  // Approval pending state
  if (showPendingInfo || status == 'pending') {
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
          keyError={keyError}
          isLoading={isLoading}
          onEnroll={handleEnroll}
          inputRef={inputRef}
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
      <Text className="text-lg font-extrabold text-slate-800" size={TextType.h2}>
        Daftar untuk mulai belajar!
      </Text>
    </view>
    <Text className="mb-5 text-sm text-slate-400" size={TextType.b2}>
      Kursus ini terbuka buat semua orang. Gabung sekarang yuk!
    </Text>
    <Button
      variant="filled"
      color="primary"
      onPress={onEnroll}
      disabled={isLoading}
      isLoading={isLoading}
    >
      Daftar
    </Button>
  </view>
);

const KeyBasedView = ({
  keyError,
  isLoading,
  onEnroll,
  inputRef,
}: {
  keyError: string | null;
  isLoading: boolean;
  onEnroll: () => void;
  inputRef: RefObject<InputRef>;
}) => (
  <view>
    <view className="mb-4 flex-row items-center gap-2">
      <Text className="text-lg font-extrabold text-slate-800" size={TextType.h2}>
        Input kode pendaftaran
      </Text>
    </view>
    <Text className="mb-4 text-sm text-slate-400" size={TextType.b2}>
      Kursus ini memerlukan kode pendaftaran. Silakan kode kunci Anda di bawah ini untuk bergabung.
    </Text>

    {/* Key input */}
    <Input title="" ref={inputRef} />

    {keyError && (
      <Text className="mt-2 text-red-400" size={TextType.b3} color={'red'}>
        {keyError}
      </Text>
    )}

    <view className="mb-5" />

    <Button
      variant="filled"
      color="primary"
      onPress={onEnroll}
      disabled={isLoading}
      isLoading={isLoading}
    >
      Daftar
    </Button>
  </view>
);

const ApprovalView = ({ isLoading, onEnroll }: { isLoading: boolean; onEnroll: () => void }) => (
  <view>
    <view className="mb-4 flex-row items-center gap-2">
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
