import { useEffect, useState } from '@lynx-js/react';

import Text from '@/components/Text';
import { TextType } from '@/components/Text/types';

import type { ToastType } from './ToastContext';

// toast/Toast.tsx
const CONFIG = {
  success: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', label: '✓' },
  info: { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', label: '?' },
  error: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600', label: '✕' },
};

export function Toast({
  visible,
  message,
  type,
}: {
  visible: boolean;
  message: string;
  type: ToastType;
}) {
  const [mounted, setMounted] = useState(false);
  const cfg = CONFIG[type];

  useEffect(() => {
    if (visible) {
      const t = setTimeout(() => setMounted(true), 16);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [visible]);

  if (!visible && !mounted) return null;

  return (
    <view
      className={`w-full px-4 absolute bottom-20 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
      }`}
    >
      <view
        className={`elevation-6 flex-row items-center gap-3 rounded-2xl border ${cfg.border} bg-white px-4 py-3 flex shadow-lg`}
      >
        <view className={`h-10 w-10 shrink-0 items-center rounded-xl ${cfg.bg} justify-center`}>
          <text className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</text>
        </view>
        <view className="flex-1">
          <Text size={TextType.b2}>{message}</Text>
        </view>
      </view>
    </view>
  );
}
