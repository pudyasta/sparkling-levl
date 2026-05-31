import { useMemo } from '@lynx-js/react/compat';
import { dehydrate } from '@tanstack/react-query';
import { createContext, useContext, useEffect, useState } from 'react';
import * as router from 'sparkling-navigation';
import { getItem, setItem } from 'sparkling-storage';

import { Loading } from '@/components/Loading/Loading';
import { refreshTokenApi } from '@/lib/api/core';
import { isTokenValid } from '@/lib/helper/isTokenValid';
import { BizKey, PrefKey } from '@/lib/helper/localStorage';
import type { Token, User } from '@/pages/Login/repository/type';

import { queryClient } from './QueryClient';

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
  setParams: (p: Record<string, any> | null) => void;
};

// ---------------------------------------------------------------------------
// Synchronous read from lynx.__globalProps (set by the navigating page).
// lynx.__globalProps is populated before any React renders, so useState lazy
// initializers can consume it with zero async overhead.
// ---------------------------------------------------------------------------
interface NavGlobalProps {
  _auth?: Token;
  _user?: User;
  hide_nav_bar?: number;
  [key: string]: any;
}

function getGlobalProps(): NavGlobalProps {
  try {
    return (lynx.__globalProps || {}) as NavGlobalProps;
  } catch {
    return {};
  }
}

// Returns valid token + user if the navigating page injected them; null otherwise.
function readNavAuth(): { token: Token; user: User } | null {
  const gp = getGlobalProps();
  if (gp._auth && isTokenValid(gp._auth)) {
    return { token: gp._auth, user: gp._user ?? ({} as User) };
  }
  return null;
}

// Route params are everything in globalProps except internal keys.
function readNavParams(): Record<string, any> | null {
  const { _auth, _user, hide_nav_bar, ...rest } = getGlobalProps();
  return Object.keys(rest).length > 0 ? rest : null;
}

// ---------------------------------------------------------------------------

const NativeBridgeContext = createContext<NativeBridgeContextType | null>(null);

export const NativeBridgeProvider = ({ children }: { children: React.ReactNode }) => {
  // Computed once per bundle load — never changes during the component lifetime.
  const navAuth = readNavAuth();

  // Lazy initialisers run synchronously on first render.
  // If the navigating page passed auth via globalProps, we start hydrated with
  // no async wait at all. On first launch or login page, navAuth is null and
  // we fall back to the standard storage hydration below.
  const [accessToken, _setAccessToken] = useState<Token | null>(() => navAuth?.token ?? null);
  const [user, _setUser] = useState<User>(() => navAuth?.user ?? ({} as User));
  const [routerParams, _setRouterParams] = useState<Record<string, any> | null>(() =>
    readNavParams()
  );
  const [hydrate, setHydrate] = useState(() => navAuth !== null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const isAuthenticated = useMemo(() => isTokenValid(accessToken), [accessToken]);

  useEffect(() => {
    if (navAuth) {
      // Fast path: auth came from navigation props — already rendered.
      // Still refresh user data silently in the background in case it changed.
      getItem({ key: PrefKey.User, biz: BizKey.Authorization }, (res) => {
        if (res.data) _setUser(res.data.data as User);
      });
      return;
    }

    // Slow path: first launch, login page, or direct bundle open.
    // Params and user: non-blocking — update state whenever they arrive.
    getItem({ key: PrefKey.params, biz: BizKey.Other }, (res) => {
      if (res.data) _setRouterParams(res.data.data as Record<string, any>);
    });

    getItem({ key: PrefKey.User, biz: BizKey.Authorization }, (res) => {
      if (res.data) _setUser(res.data.data as User);
    });

    // Token: the sole hydration gate on the slow path.
    getItem({ key: PrefKey.Token, biz: BizKey.Authorization }, (res) => {
      if (res.data && isTokenValid(res.data.data)) {
        _setAccessToken(res.data.data as Token);
        setHydrate(true);
      } else if (res.data?.data?.refresh_token) {
        setIsRefreshing(true);
        refreshTokenApi(res.data.data.refresh_token)
          .then((refreshRes) => {
            if (refreshRes.data) setAccessToken(refreshRes.data as Token);
          })
          .catch(() => logout())
          .finally(() => {
            setIsRefreshing(false);
            setHydrate(true);
          });
      } else {
        setHydrate(true);
      }
    });
  }, []);

  const setAccessToken = (token: Token | null) => {
    if (!token) return;
    token.expires_in = token.expires_in + Math.floor(Date.now() / 1000);
    _setAccessToken(token);
    setItem({ key: PrefKey.Token, data: token, biz: BizKey.Authorization }, () => {});
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
      setItem({ key: PrefKey.User, data: {}, biz: BizKey.Authorization }, () => {});
    });
    navigateTo('login');
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
    // Store route params only — auth and cache are passed in-memory via native
    // props, not persisted to storage.
    setParams(params);

    // Serialize the current query cache so the next bundle can start warm.
    // Exclude infinite (paginated) queries — they can be large and the next
    // screen rarely needs the full paginated list from the previous screen.
    let queryCache: ReturnType<typeof dehydrate> | undefined;
    try {
      queryCache = dehydrate(queryClient, {
        shouldDehydrateQuery: (query) =>
          query.state.status === 'success' && query.queryKey[0] !== 'courses',
      });
    } catch {
      // dehydrate failed — navigate without cache
    }

    router.navigate(
      {
        path: activity + '.lynx.bundle',
        options: {
          params: {
            ...params,
            hide_nav_bar: 1,
            _auth: accessToken,
            _user: user,
            _queryCache: queryCache,
          },
          replace: params.close,
        },
      },
      (res) => {
        callback?.();
        setIsNavigating(false);
      }
    );
  };

  if (!hydrate) {
    return (
      <view className="h-full items-center flex justify-center">
        <Loading size={32} />
      </view>
    );
  }

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
        routerParams,
        setRouterParams: setParams,
        navigateTo,
        isRefreshing,
        setParams,
      }}
    >
      {children}
    </NativeBridgeContext.Provider>
  );
};

export function useNativeBridge(): NativeBridgeContextType {
  const ctx = useContext(NativeBridgeContext);
  if (!ctx) throw new Error('useNativeBridge must be used within AuthProvider');
  return ctx;
}
