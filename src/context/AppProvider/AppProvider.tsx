// src/providers/AppProvider.tsx
import type { FC, PropsWithChildren } from '@lynx-js/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { NativeBridgeProvider } from '../NativeBridgeProvider';
import { queryClient } from '../QueryClient';
import { StyleProvider } from '../StyleProvider';
import { ToastProvider } from '../ToastProvider/ToastContext';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <NativeBridgeProvider>
      <QueryClientProvider client={queryClient}>
        <StyleProvider>
          <ToastProvider>{children}</ToastProvider>
        </StyleProvider>
      </QueryClientProvider>
    </NativeBridgeProvider>
  );
};
