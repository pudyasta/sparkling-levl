// src/providers/AppProvider.tsx
import type { FC, PropsWithChildren } from '@lynx-js/react';
import { QueryClientProvider } from '@tanstack/react-query';

import { NativeBridgeProvider } from '../NativeBridgeProvider';
import { queryClient } from '../QueryClient';
import { StyleProvider } from '../StyleProvider';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <NativeBridgeProvider>
        <StyleProvider>{children}</StyleProvider>
      </NativeBridgeProvider>
    </QueryClientProvider>
  );
};
