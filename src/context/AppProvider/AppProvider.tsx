// src/providers/AppProvider.tsx
import type { FC, PropsWithChildren } from '@lynx-js/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../AuthProvider';
import { StyleProvider } from '../StyleProvider';
import { queryClient } from '../QueryClient';

export const AppProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StyleProvider>{children}</StyleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
