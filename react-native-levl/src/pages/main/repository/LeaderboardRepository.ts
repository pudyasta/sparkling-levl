import { GET_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

const LEADERBOARD_ENDPOINT = '/leaderboard';
const LEADERBOARD_ME_ENDPOINT = '/leaderboard/me';

export const useLeaderboardRepository = () => {
  const { api } = useApiClient();

  return {
    getLeaderboardApi: () =>
      api(LEADERBOARD_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),

    getUserRankApi: () =>
      api(LEADERBOARD_ME_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),
  };
};
