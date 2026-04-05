// src/providers/AppProvider.tsx
import type { FC, PropsWithChildren } from '@lynx-js/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { NativeBridgeProvider } from '../NativeBridgeProvider';
import { StyleProvider } from '../StyleProvider';
import { queryClient } from '../QueryClient';
import { RouterParamsProvider } from '../RouterParamsProvider';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NativeBridgeProvider>
        <RouterParamsProvider>
          <StyleProvider>{children}</StyleProvider>
        </RouterParamsProvider>
      </NativeBridgeProvider>
    </QueryClientProvider>
  );
};
