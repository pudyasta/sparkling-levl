import { createContext, useContext, useEffect, useState } from 'react';
import { getPref, PrefKey, removePref, setPref } from '@/lib/helper/localStorage';
import { isTokenValid } from '@/lib/helper/isTokenValid';
import { refreshTokenApi } from '@/lib/api/core';
import type { Token, User } from '@/pages/Login/repository/type';
import { navigate } from '@/lib/native/nativeNavigate';
import { EMAIL_CONFIRMATION_ACTIVITY, LOGIN_ACTIVITY } from '@/constant/activity';
import { Loading } from '@/components/Loading/Loading';
import { getItem, setItem } from 'sparkling-storage';

type AuthContextType = {
  accessToken: Token | null;
  setAccessToken: (t: Token | null) => void;
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hydrate: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [accessToken, _setAccessToken] = useState<Token | null>(null);
  const [user, _setUser] = useState<User | null>(null);
  const [isAuthenticated, _setIsAuthenticated] = useState(false);
  const [hydrate, setHydrate] = useState(false);

  useEffect(() => {
    getItem({ key: PrefKey.Token, biz: 'auth' }, (res) => {
      if (res.data && isTokenValid(res.data.access_token)) {
        _setAccessToken(res.data);
      } else if (res.data && res.data.refresh_token) {
        refreshTokenApi(res.data.refresh_token)
          .then((res) => {
            if (res.data) _setAccessToken(res.data);
          })
          .catch(() => {
            logout();
            return;
          });
      }
    });

    getItem({ key: PrefKey.User, biz: 'auth' }, (res) => {
      if (res.data) {
        _setUser(res.data);
      }
    });
    setHydrate(true);
  }, []);

  const setAccessToken = (token: Token | null) => {
    if (!token) return;
    token.expires_in = token.expires_in + Math.floor(Date.now() / 1000);
    _setAccessToken(token);
    setItem({ key: PrefKey.Token, data: token, biz: 'auth' }, (res) => {
      console.log(res.code, res.msg);
    });
  };

  const setUser = (user: User | null) => {
    _setUser(user);
    setItem({ key: PrefKey.User, data: user, biz: 'auth' }, () => {});
  };

  const logout = () => {
    _setAccessToken(null);
    _setUser(null);
    removePref();
    navigate(LOGIN_ACTIVITY);
  };

  useEffect(() => {
    _setIsAuthenticated(Boolean(accessToken && isTokenValid(accessToken)));
  }, [accessToken, user]);

  if (!hydrate) {
    return null;
  }
  return (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken,
        user,
        setUser,
        logout,
        isAuthenticated,
        hydrate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
