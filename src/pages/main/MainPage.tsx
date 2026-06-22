import { Suspense, lazy, useEffect, useMemo } from '@lynx-js/react';

import { Loading } from '@/components/Loading/Loading';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

import {
  bookInactive,
  booksvg,
  homeActive,
  homeInactive,
  rankingActive,
  rankingInactive,
  userActive,
  userInactive,
} from '../../assets/images/homeTabIcon';
import { Tabs } from '../../components/common/Tabs/Tabs';

// ── Lazy tab content ────────────────────────────────────────────────────────
// Each tab is split into its own chunk and only fetched/evaluated the first
// time its tab is activated, keeping the initial main bundle (and TFFR) small.
const Home = lazy(() => import('./components/Home/Home'));
const Courses = lazy(() => import('./components/Courses/Courses'));
const Leaderboard = lazy(() => import('./components/Leaderboard/Leaderboard'));
const ProfileScreen = lazy(() =>
  import('./components/Profile/ProfileScreen').then((m) => ({ default: m.ProfileScreen }))
);

// Fallback while a tab chunk is loading — centered in the panel.
const TabFallback = () => (
  <view className="h-full w-full items-center flex justify-center">
    <Loading />
  </view>
);

interface Props {}

const MainPage: React.FC<Props> = ({}) => {
  const { isAuthenticated, navigateTo, hydrate, isRefreshing, user } = useNativeBridge();
  // Content is a thunk (not a pre-constructed JSX node) so the Suspense/lazy
  // element is only evaluated when Tabs actually renders the active panel.
  const pages = useMemo(
    () => [
      {
        label: { text: 'Home', srcActive: homeActive, srcInactive: homeInactive },
        content: () => (
          <Suspense fallback={<TabFallback />}>
            <Home />
          </Suspense>
        ),
      },
      {
        label: { text: 'Courses', srcActive: booksvg, srcInactive: bookInactive },
        content: () => (
          <Suspense fallback={<TabFallback />}>
            <Courses />
          </Suspense>
        ),
      },
      {
        label: { text: 'Ranking', srcActive: rankingActive, srcInactive: rankingInactive },
        content: () => (
          <Suspense fallback={<TabFallback />}>
            <Leaderboard />
          </Suspense>
        ),
      },
      {
        label: { text: 'Profile', srcActive: userActive, srcInactive: userInactive },
        content: () => (
          <Suspense fallback={<TabFallback />}>
            <ProfileScreen />
          </Suspense>
        ),
      },
    ],
    []
  );

  useEffect(() => {
    if (isRefreshing) return;

    if (!isAuthenticated) {
      navigateTo('login', { close: true });
      return;
    }
    if (user.status !== 'active') {
      navigateTo('emailConfirmation', { close: true });
      return;
    }
  }, [isAuthenticated, isRefreshing]);

  return (
    isAuthenticated &&
    hydrate && (
      <>
        <Tabs items={pages} />
      </>
    )
  );
};

export default MainPage;
