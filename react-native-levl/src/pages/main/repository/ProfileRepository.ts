import { GET_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

const PROFILE_ENDPOINT = '/profile';
const GAMIFICATION_STATS_ENDPOINT = '/user/gamification-summary';
const ACHIEVEMENTS_ENDPOINT = '/user/badges';

export const useProfileRepository = () => {
  const { api } = useApiClient();

  return {
    getProfileApi: () =>
      api(PROFILE_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),

    getGamificationStatsApi: () =>
      api(GAMIFICATION_STATS_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),

    getAchievementsApi: () =>
      api(ACHIEVEMENTS_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),
  };
};
