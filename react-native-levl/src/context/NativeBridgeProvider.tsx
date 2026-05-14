import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { refreshTokenApi } from '@/lib/api/core';
import { isTokenValid } from '@/lib/helper/isTokenValid';
import { BizKey, PrefKey, getStorageItem, removeStorageItem, setStorageItem } from '@/lib/helper/localStorage';
import type { Token, User } from '@/pages/Login/repository/type';

type NativeBridgeContextType = {
  accessToken: Token | null;
  setAccessToken: (t: Token | null) => void;
  user: User;
  setUser: (u: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hydrate: boolean;
  isRefreshing: boolean;
  routerParams: Record<string, any> | null;
  setRouterParams: (p: Record<string, any> | null) => void;
  navigateTo: (path: string, params?: Record<string, any>) => void;
  setParams: (p: Record<string, any> | null) => void;
};

const NativeBridgeContext = createContext<NativeBridgeContextType | null>(null);

export const NativeBridgeProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, _setAccessToken] = useState<Token | null>(null);
  const [user, _setUser] = useState<User>({} as User);
  const [hydrate, setHydrate] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [routerParams, _setRouterParams] = useState<Record<string, any> | null>(null);

  const isAuthenticated = useMemo(() => isTokenValid(accessToken), [accessToken]);

  useEffect(() => {
    const init = async () => {
      let itemsLoaded = 0;
      const checkHydration = () => {
        itemsLoaded++;
        if (itemsLoaded === 3) setHydrate(true);
      };

      const params = await getStorageItem<Record<string, any>>(PrefKey.params, BizKey.Other);
      if (params) _setRouterParams(params);
      checkHydration();

      const token = await getStorageItem<Token>(PrefKey.Token, BizKey.Authorization);
      if (token && isTokenValid(token)) {
        _setAccessToken(token);
        checkHydration();
      } else if (token?.refresh_token) {
        setIsRefreshing(true);
        try {
          const res = await refreshTokenApi(token.refresh_token);
          if (res.data) setAccessToken(res.data as Token);
        } catch {}
        setIsRefreshing(false);
        checkHydration();
      } else {
        checkHydration();
      }

      const savedUser = await getStorageItem<User>(PrefKey.User, BizKey.Authorization);
      if (savedUser) _setUser(savedUser);
      checkHydration();
    };

    init();
  }, []);

  const setAccessToken = (token: Token | null) => {
    if (!token) return;
    const withExpiry: Token = {
      ...token,
      expires_in: token.expires_in + Math.floor(Date.now() / 1000),
    };
    _setAccessToken(withExpiry);
    setStorageItem(PrefKey.Token, BizKey.Authorization, withExpiry);
  };

  const setUser = (u: User) => {
    _setUser(u);
    setStorageItem(PrefKey.User, BizKey.Authorization, u);
  };

  const logout = () => {
    _setAccessToken(null);
    _setUser({} as User);
    removeStorageItem(PrefKey.Token, BizKey.Authorization);
    removeStorageItem(PrefKey.User, BizKey.Authorization);
    router.replace('/(auth)/login');
  };

  const setParams = (params: Record<string, any> | null) => {
    _setRouterParams(params);
    setStorageItem(PrefKey.params, BizKey.Other, params);
  };

  const navigateTo = (path: string, params?: Record<string, any>) => {
    if (params) setParams(params);
    const replace = params?.replace ?? params?.close ?? false;
    const href = path.startsWith('/') ? path : `/${path}`;
    if (replace) {
      router.replace(href as any);
    } else {
      router.push(href as any);
    }
  };

  if (!hydrate) return null;

  return (
    <NativeBridgeContext.Provider
      value={{
        accessToken,
        setAccessToken,
        user,
        setUser,
        logout,
        isAuthenticated,
        hydrate,
        isRefreshing,
        routerParams,
        setRouterParams: setParams,
        navigateTo,
        setParams,
      }}
    >
      {children}
    </NativeBridgeContext.Provider>
  );
};

export function useNativeBridge(): NativeBridgeContextType {
  const ctx = useContext(NativeBridgeContext);
  if (!ctx) throw new Error('useNativeBridge must be used within NativeBridgeProvider');
  return ctx;
}
