import Toast from 'react-native-toast-message';

export type ToastType = 'success' | 'error' | 'info';

export function callToast(message: string, type: ToastType = 'info') {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    visibilityTime: 3000,
  });
}
