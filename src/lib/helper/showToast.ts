import type { ToastType } from '@/context/ToastProvider/ToastContext';

type ShowFn = (message: string, type?: ToastType, duration?: number) => void;

let _show: ShowFn | null = null;

export function registerToast(fn: ShowFn) {
  _show = fn;
}

export function callToast(message: string, type: ToastType = 'info', duration?: number) {
  if (!_show) throw new Error('Toast not registered');
  _show(message, type, duration);
}
