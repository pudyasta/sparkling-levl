import { createContext, useContext, useState } from 'react';
import * as router from 'sparkling-navigation';
// Delete this file
type RouterParamsContextType = {
  params: Record<string, any> | null;
  setParams: (p: Record<string, any> | null) => void;
  navigateTo: (activity: string, params?: Record<string, any>, callback?: () => void) => void;
};

const RouterParamsContext = createContext<RouterParamsContextType | null>(null);
export const RouterParamsProvider = ({ children }: { children: React.ReactNode }) => {
  const [params, setParams] = useState<Record<string, any> | null>(null);

  const navigateTo = (
    activity: string,
    params: Record<string, any> = {},
    callback?: () => void
  ) => {
    router.navigate(
      {
        path: activity,
        options: { params: { ...params, hide_nav_bar: 1 } },
      },
      () => {
        callback?.();
        setParams(params);
      }
    );
  };

  return (
    <RouterParamsContext.Provider
      value={{
        params,
        setParams,
        navigateTo,
      }}
    >
      {children}
    </RouterParamsContext.Provider>
  );
};
export const useRouterParams = () => {
  const ctx = useContext(RouterParamsContext);
  if (!ctx) throw new Error('useRouterParams must be used within RouterParamsProvider');
  return ctx;
};
