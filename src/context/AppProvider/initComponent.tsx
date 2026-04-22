// src/utils/bootstrap.tsx
import { root } from '@lynx-js/react';

import '../../styles/core.css';
import { AppProvider } from './AppProvider';

declare module '@lynx-js/types' {
  interface GlobalProps {
    appTheme: string;
    title: string;
    appName: string;
    deviceType: string;
    deviceModel: string;
    osVersion: string;
    containerID: string;
  }
}
export function initComponent<P extends object>(Component: React.ComponentType<P>) {
  const nativeProps = (lynx.__globalProps || {}) as P;
  root.render(
    <AppProvider>
      <Component {...nativeProps} />
    </AppProvider>
  );

  if (import.meta.webpackHot) {
    import.meta.webpackHot.accept();
  }
}
