import React from 'react';
import { AppQueryClientProvider } from './QueryClient';
import { NativeBridgeProvider } from './NativeBridgeProvider';

export const AppProvider = ({ children }: { children: React.ReactNode }) => (
  <AppQueryClientProvider>
    <NativeBridgeProvider>{children}</NativeBridgeProvider>
  </AppQueryClientProvider>
);
