import { useEffect, useState } from '@lynx-js/react';
import { close } from 'sparkling-navigation';

import { useNativeBridge } from '@/context/NativeBridgeProvider';

import Button from '../common/Button';

interface ErrorPageProps {
  error?: Error | null;
  onRetry?: () => void;
}

const errorMessages: Record<string, { title: string; description: string; emoji: string }> = {
  network: {
    emoji: '📡',
    title: 'Ups, koneksi kamu putus!',
    description: 'Coba cek internet kamu dulu, terus coba lagi ya..',
  },
  forbidden: {
    emoji: '🚫',
    title: 'Ups, kamu belum punya akses buat konten ini!',
    description: 'Coba cek kembali ya..',
  },
  unauthorized: {
    emoji: '🔐',
    title: 'Sesi kamu udah habis!',
    description: 'Login lagi yuk biar bisa lanjut..',
  },
  notfound: {
    emoji: '🗺️',
    title: 'Waduh, tujuanmu nggak ada!',
    description: 'Mungkin kamu salah, cek lagi buat lebih yakin ya..',
  },
  server: {
    emoji: '🛠️',
    title: 'Lagi ada masalah nih di server!',
    description: 'Tenang, lagi kami benerin kok. Coba lagi nanti ya..',
  },
  unknown: {
    emoji: '⚠️',
    title: 'Hmm, ada yang nggak beres!',
    description: 'Coba ulangi lagi ya, siapa tahu berhasil..',
  },
};

const detectErrorType = (error?: Error | null): keyof typeof errorMessages => {
  if (!error) return 'unknown';
  const msg = error.message?.toLowerCase() ?? '';
  console.log('ERROR', JSON.stringify(msg, null, 2));
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) return 'network';
  if (msg.includes('401') || msg.includes('unauthorized')) return 'unauthorized';
  if (msg.includes('403') || msg.includes('unauthorized')) return 'unauthorized';
  if (msg.includes('404') || msg.includes('not found')) return 'notfound';
  if (msg.includes('500') || msg.includes('server')) return 'server';
  return 'unknown';
};

export const ErrorPage = ({ error, onRetry }: ErrorPageProps) => {
  const { navigateTo, logout } = useNativeBridge();
  const [visible, setVisible] = useState(false);

  const errorType = detectErrorType(error);
  const { emoji, title, description } = errorMessages[errorType];
  const isUnauthorized = errorType === 'unauthorized';

  useEffect(() => {
    // Slight delay so the fade-in is visible
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handlePrimary = () => {
    if (isUnauthorized) {
      logout();
    } else {
      onRetry?.();
    }
  };

  return (
    <view className="h-[100vh] flex-1 items-center px-8 justify-center">
      {/* Card */}
      <view
        className={`w-full items-center rounded-3xl py-12 transition-all duration-500 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Emoji illustration */}
        <view className="mb-6 h-24 w-24 items-center rounded-full bg-slate-100 justify-center">
          <text className="text-5xl">{emoji}</text>
        </view>

        {/* Title */}
        <text className="mb-3 text-2xl font-bold text-slate-800 text-center">{title}</text>

        {/* Description */}
        <text className="mb-8 text-sm leading-6 text-slate-400 text-center">{description}</text>

        {/* Error detail (dev only) */}
        {__DEV__ && error?.message && (
          <view className="mb-6 w-full rounded-xl bg-red-50 px-4 py-3">
            <text className="font-mono text-xs text-red-400">{error.message}</text>
          </view>
        )}

        {/* Primary action */}
        <Button
          className="mb-3 h-14 w-full items-center rounded-2xl bg-blue-500 justify-center"
          onPress={handlePrimary}
        >
          {isUnauthorized ? 'Log In Again' : 'Coba Lagi'}
        </Button>

        {/* Secondary — go home */}
        {!isUnauthorized && (
          <Button variant="outlined" onPress={() => close()}>
            Kembali
          </Button>
        )}
      </view>
    </view>
  );
};
