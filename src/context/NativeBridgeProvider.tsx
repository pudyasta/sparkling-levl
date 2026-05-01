import { useMemo } from '@lynx-js/react/compat';
import { createContext, useContext, useEffect, useState } from 'react';
import * as router from 'sparkling-navigation';
import { getItem, setItem } from 'sparkling-storage';

import { refreshTokenApi } from '@/lib/api/core';
import { isTokenValid } from '@/lib/helper/isTokenValid';
import { BizKey, PrefKey } from '@/lib/helper/localStorage';
import type { Token, User } from '@/pages/Login/repository/type';

type NativeBridgeContextType = {
  // AUTH Related
  accessToken: Token | null;
  setAccessToken: (t: Token | null) => void;
  user: User;
  setUser: (u: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hydrate: boolean;
  isRefreshing: boolean;

  // Params
  routerParams: Record<string, any> | null;
  setRouterParams: (p: Record<string, any> | null) => void;
  navigateTo: (activity: string, params?: Record<string, any>, callback?: () => void) => void;
};

const NativeBridgeContext = createContext<NativeBridgeContextType | null>(null);
export const NativeBridgeProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, _setAccessToken] = useState<Token | null>(null);
  const [user, _setUser] = useState<User>({} as User);
  const [hydrate, setHydrate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const isAuthenticated = useMemo(() => isTokenValid(accessToken), [accessToken]);
  const [routerParams, _setRouterParams] = useState<Record<string, any> | null>(null);

  // QUIZ

  useEffect(() => {
    setHydrate(false);
    let itemsLoaded = 0;

    const checkHydration = () => {
      itemsLoaded++;
      if (itemsLoaded === 3) setHydrate(true);
    };

    getItem({ key: PrefKey.params, biz: BizKey.Other }, (res) => {
      if (res.data) {
        _setRouterParams(res.data.data as Record<string, any>);
      }
      checkHydration();
    });

    getItem({ key: PrefKey.Token, biz: BizKey.Authorization }, (res) => {
      if (res.data && isTokenValid(res.data.data)) {
        _setAccessToken(res.data.data as Token);
        checkHydration();
      } else if (res.data && res.data.data?.refresh_token) {
        setIsRefreshing(true);
        refreshTokenApi(res.data.data.refresh_token)
          .then((res) => {
            if (res.data) setAccessToken(res.data as Token);
          })
          .catch((err) => {
            logout;
          })
          .finally(() => {
            setIsRefreshing(false);
            checkHydration();
          });
      } else {
        checkHydration();
      }
    });

    getItem({ key: PrefKey.User, biz: BizKey.Authorization }, (res) => {
      if (res.data) {
        _setUser(res.data.data as User);
      }
      checkHydration();
    });
  }, []);

  const setAccessToken = (token: Token | null) => {
    if (!token) return;
    token.expires_in = token.expires_in + Math.floor(Date.now() / 1000);
    _setAccessToken(token);
    setItem({ key: PrefKey.Token, data: token, biz: BizKey.Authorization }, (res) => {});
  };

  const setUser = (user: User) => {
    _setUser(user);
    setItem({ key: PrefKey.User, data: user, biz: BizKey.Authorization }, () => {});
  };

  const logout = () => {
    _setAccessToken(null);
    _setUser({} as User);
    setItem({ key: PrefKey.Token, data: {}, biz: BizKey.Authorization }, (res) => {
      if (res.code !== 1) return;
      setItem({ key: PrefKey.User, data: {}, biz: BizKey.Authorization }, (res) => {});
    });
    navigateTo('login.lynx.bundle');
  };

  const setParams = (params: Record<string, any> | null) => {
    _setRouterParams(params);
    setItem({ key: PrefKey.params, data: params, biz: BizKey.Other }, () => {});
  };

  const navigateTo = (
    activity: string,
    params: Record<string, any> = {},
    callback?: () => void
  ) => {
    if (isNavigating) return;
    setIsNavigating(true);
    router.navigate(
      {
        path: activity,
        options: { params: { ...params, hide_nav_bar: 1 } },
      },
      () => {
        if (params.close == true) {
          router.close({ containerID: lynx.__globalProps.containerID });
        }
        callback?.();
        setParams(params);
        setIsNavigating(false);
      }
    );
  };

  return (
    hydrate && (
      <NativeBridgeContext.Provider
        value={{
          accessToken,
          setAccessToken,
          user,
          setUser,
          logout,
          isAuthenticated,
          hydrate,
          routerParams,
          setRouterParams: setParams,
          navigateTo,
          isRefreshing,
        }}
      >
        {children}
      </NativeBridgeContext.Provider>
    )
  );
};
export function useNativeBridge(): NativeBridgeContextType {
  const ctx = useContext(NativeBridgeContext);
  if (!ctx) throw new Error('useNativeBridge must be used within AuthProvider');
  return ctx;
}
