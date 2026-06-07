import { useEffect, useState } from '@lynx-js/react';
import pipe from 'sparkling-method';

import { docsMascot } from '@/assets/images/mascot';
import Text from '@/components/Text';
import { FontFamily, TextType } from '@/components/Text/types';
import Button from '@/components/common/Button';
import CustomImage from '@/components/common/CustomImage/CustomImage';
import { Colors } from '@/constant/style';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import { useResendVerificationEmail } from '../EmailConfirmation/usecase/useResendVerificationEmail';
import { useVerifyEmail } from './usecase/useVerifyEmail';

type Phase = 'verifying' | 'success' | 'error';

const VerifyEmailPage = () => {
  const { setAccessToken, setUser, navigateTo } = useNativeBridge();
  const [phase, setPhase] = useState<Phase>('verifying');
  const [message, setMessage] = useState('');

  const { uuid, token, email } = lynx.__globalProps ?? {};
  const [canResend, setCanResend] = useState(true);

  const { execute: resendVerificationEmail, isLoading } = useResendVerificationEmail();
  const [timer, setTimer] = useState(59);

  const { execute: verifyEmail } = useVerifyEmail({
    onSuccess: async (data) => {
      setAccessToken({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      });
      setUser(data.user);

      setPhase('success');
      setMessage('Your email has been verified. Redirecting you to the app...');

      setTimeout(() => {
        navigateTo('main', { close: true });
      }, 2000);
    },
    onError: (error) => {
      setPhase('error');
      setMessage(error?.message ?? 'Verification failed. The link may have expired.');
    },
  });

  useEffect(() => {
    if (!uuid || !token) {
      setPhase('error');
      setMessage('Invalid verification link. Please request a new one.');
      return;
    }
    verifyEmail({ uuid, token });
  }, []);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (!canResend) return;
    resendVerificationEmail(() => {
      setTimer(59);
      setCanResend(false);
    });
  };

  return (
    <view className="h-full items-center bg-white px-5 justify-center">
      <view className="mb-5 h-44 w-44 items-center justify-center">
        <CustomImage src={docsMascot} className="h-full w-full" />
      </view>

      {/* Status pill */}
      <view
        className="mb-4 rounded-full px-4 py-1"
        style={{
          backgroundColor:
            phase === 'verifying' ? '#DBEAFE' : phase === 'success' ? '#DCFCE7' : '#FFE4E6',
        }}
      >
        <text
          className="uppercase text-xs font-bold tracking-widest"
          style={{
            color: phase === 'verifying' ? '#1D4ED8' : phase === 'success' ? '#15803D' : '#BE123C',
          }}
        >
          {phase === 'verifying' ? 'Verifying' : phase === 'success' ? 'Verified' : 'Failed'}
        </text>
      </view>

      {/* Title */}
      <Text
        size={TextType.h1}
        fontWeight="bold"
        fontFamily={FontFamily.jakarta}
        className="mb-2 text-black text-center"
      >
        {phase === 'verifying'
          ? 'Tunggu sebentar yaa, kami baru memverifikasi email Kamu.'
          : phase === 'success'
            ? 'Email Kamu berhasil diverifikasi!'
            : 'Verifikasi email Kamu gagal'}
      </Text>

      {/* Email chip */}
      {email && (
        <Text
          size={TextType.h2}
          fontWeight="bold"
          color={Colors.Primary}
          className="mb-2 text-center"
        >
          {email}
        </Text>
      )}

      {/* Instruction */}
      <Text size={TextType.b3} className="mb-8 leading-5 text-slate-400 text-center">
        {phase === 'verifying'
          ? 'Tunggu sebentar yaa, kami baru memverifikasi email Kamu.'
          : phase === 'success'
            ? 'Email Kamu berhasil diverifikasi!'
            : 'Link verifikasi mungkin sudah kadaluarsa. Silakan coba lagi dengan link terbaru yang kami kirimkan ke email Kamu.'}
      </Text>

      {/* Verifying dots */}
      {phase === 'verifying' && (
        <view className="mb-8 flex-row items-center gap-3 flex justify-center">
          {[0.3, 0.6, 1].map((opacity, i) => (
            <view key={i} className="h-2.5 w-2.5 rounded-full bg-blue-500" style={{ opacity }} />
          ))}
        </view>
      )}

      {/* Footer */}
      <view className="w-full">
        {/* Error actions */}
        {phase === 'error' && (
          <view className="flex-col gap-3 flex">
            <Button disabled={!canResend} onPress={handleResend} color="primary">
              Kirim Ulang Email
            </Button>
            <Button variant="outlined" onPress={() => navigateTo('login', { close: true })}>
              Kembali ke login
            </Button>
          </view>
        )}

        {/* Success redirect hint */}
        {phase === 'success' && (
          <text className="text-base font-bold text-white">
            Kamu akan masuk ke aplikasi beberapa saat lagi
          </text>
        )}
      </view>
    </view>
  );
};

export default VerifyEmailPage;
