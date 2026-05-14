// toast/ToastContext.tsx
import { useEffect } from '@lynx-js/react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

import { registerToast } from '@/lib/helper/showToast';

import { Toast } from './Toast';

export type ToastType = 'success' | 'info' | 'error';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  show: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'info' });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ visible: true, message, type });

    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, duration);
  }, []);

  registerToast(show);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
