import { useQuery } from '@tanstack/react-query';

import { useLeaderboardRepository } from '../repository/LeaderboardRepository';
import type { LeaderboardEntry, UserRank } from '../repository/type/leaderboard';

export const useGetLeaderboard = () => {
  const { getLeaderboardApi } = useLeaderboardRepository();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const res = await getLeaderboardApi();
      return res?.data ?? [];
    },
  });
};

export const useGetUserRank = () => {
  const { getUserRankApi } = useLeaderboardRepository();

  return useQuery<UserRank>({
    queryKey: ['leaderboard', 'me'],
    queryFn: async () => {
      const res = await getUserRankApi();
      return res?.data ?? null;
    },
  });
};
