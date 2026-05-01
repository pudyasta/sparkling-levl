import { useEffect } from '@lynx-js/react';

import { useNativeBridge } from '@/context/NativeBridgeProvider';

import {
  bookActive,
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
  const { isAuthenticated, navigateTo, hydrate, isRefreshing } = useNativeBridge();
  const pages = [
    {
      label: {
        text: 'Home',
        srcActive: homeActive,
        srcInactive: homeInactive,
      },
      content: <Home />,
    },
    {
      label: {
        text: 'Courses',
        srcActive: bookActive,
        srcInactive: bookInactive,
      },
      content: <Courses />,
    },
    {
      label: {
        text: 'Ranking',
        srcActive: rankingActive,
        srcInactive: rankingInactive,
      },
      content: <Leaderboard />,
    },
    {
      label: {
        text: 'Profile',
        srcActive: userActive,
        srcInactive: userInactive,
      },
      content: <ProfileScreen />,
    },
  ];

  useEffect(() => {
    if (isRefreshing) return;

    if (!isAuthenticated) {
      navigateTo('login.lynx.bundle', { title: 'Home', hide_nav_bar: 1, close: true });
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
