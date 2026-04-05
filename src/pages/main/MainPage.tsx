import { Tabs } from '../../components/common/Tabs/Tabs';
import Courses from './components/Courses/Courses';

import {
  homeActive,
  homeInactive,
  userActive,
  userInactive,
  rankingActive,
  rankingInactive,
  bookActive,
  bookInactive,
  booksvg,
} from '../../assets/images/homeTabIcon';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Home from './components/Home/Home';
import { ProfileScreen } from './components/Profile/ProfileScreen';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { useEffect } from '@lynx-js/react';

interface Props {}

const MainPage: React.FC<Props> = ({}) => {
  const { isAuthenticated, user, routerParams, navigateTo, hydrate, accessToken } =
    useNativeBridge();
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
    if (!isAuthenticated) {
      navigateTo('login.lynx.bundle', { title: 'Home', hide_nav_bar: 1, close: true }, () => {
        console.log('navigate', isAuthenticated, accessToken);
      });
    }
  }, [isAuthenticated]);

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
