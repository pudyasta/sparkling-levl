import { useEffect, useMemo } from '@lynx-js/react';

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
import Courses from './components/Courses/Courses';
import Home from './components/Home/Home';
import Leaderboard from './components/Leaderboard/Leaderboard';
import { ProfileScreen } from './components/Profile/ProfileScreen';

interface Props {}

const MainPage: React.FC<Props> = ({}) => {
  const { isAuthenticated, navigateTo, hydrate, isRefreshing, user } = useNativeBridge();
  // Memoized so JSX element objects are never recreated across MainPage renders.
  const pages = useMemo(
    () => [
      {
        label: { text: 'Home', srcActive: homeActive, srcInactive: homeInactive },
        content: <Home />,
      },
      {
        label: { text: 'Courses', srcActive: booksvg, srcInactive: bookInactive },
        content: <Courses />,
      },
      {
        label: { text: 'Ranking', srcActive: rankingActive, srcInactive: rankingInactive },
        content: <Leaderboard />,
      },
      {
        label: { text: 'Profile', srcActive: userActive, srcInactive: userInactive },
        content: <ProfileScreen />,
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
