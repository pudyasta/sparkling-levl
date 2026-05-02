import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { refreshTokenApi } from '@/lib/api/core';
import { StorageKey, getStorageItem, removeStorageItem, setStorageItem } from '@/lib/helper/storage';
import { isTokenValid } from '@/lib/helper/isTokenValid';
import type { Token, User } from '@/types/auth';

type AuthContextType = {
  accessToken: Token | null;
  setAccessToken: (t: Token | null) => void;
  user: User;
  setUser: (u: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hydrated: boolean;
  isRefreshing: boolean;
  navigateToLogin: () => void;
  setNavigateToLogin: (fn: () => void) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, _setAccessToken] = useState<Token | null>(null);
  const [user, _setUser] = useState<User>({} as User);
  const [hydrated, setHydrated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigateToLoginRef = useRef<() => void>(() => {});

  const isAuthenticated = useMemo(() => isTokenValid(accessToken), [accessToken]);

  useEffect(() => {
    let loaded = 0;
    const done = () => {
      loaded++;
      if (loaded === 2) setHydrated(true);
    };

    (async () => {
      const storedToken = await getStorageItem<Token>(StorageKey.Token);
      if (storedToken && isTokenValid(storedToken)) {
        _setAccessToken(storedToken);
        done();
      } else if (storedToken?.refresh_token) {
        setIsRefreshing(true);
        try {
          const res = await refreshTokenApi(storedToken.refresh_token);
          if (res.data) setAccessToken(res.data);
        } catch {
          // ignore
        } finally {
          setIsRefreshing(false);
          done();
        }
      } else {
        done();
      }
    })();

    (async () => {
      const storedUser = await getStorageItem<User>(StorageKey.User);
      if (storedUser) _setUser(storedUser);
      done();
    })();
  }, []);

  const setAccessToken = useCallback((token: Token | null) => {
    if (!token) return;
    const withAbsExpiry: Token = {
      ...token,
      expires_in: token.expires_in + Math.floor(Date.now() / 1000),
    };
    _setAccessToken(withAbsExpiry);
    setStorageItem(StorageKey.Token, withAbsExpiry);
  }, []);

  const setUser = useCallback((u: User) => {
    _setUser(u);
    setStorageItem(StorageKey.User, u);
  }, []);

  const logout = useCallback(async () => {
    _setAccessToken(null);
    _setUser({} as User);
    await removeStorageItem(StorageKey.Token);
    await removeStorageItem(StorageKey.User);
    navigateToLoginRef.current();
  }, []);

  const navigateToLogin = useCallback(() => {
    navigateToLoginRef.current();
  }, []);

  const setNavigateToLogin = useCallback((fn: () => void) => {
    navigateToLoginRef.current = fn;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        user,
        setUser,
        logout,
        isAuthenticated,
        hydrated,
        isRefreshing,
        navigateToLogin,
        setNavigateToLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
