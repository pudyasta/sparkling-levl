import { useQuery } from '@tanstack/react-query';
import { useMainRepository } from '@/repository/main/MainRepository';

export const useGetLeaderboard = () => {
  const { getLeaderboardApi } = useMainRepository();
  const query = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboardApi,
  });
  const allEntries: any[] = query.data?.data ?? [];
  return {
    ...query,
    topThree: allEntries.slice(0, 3),
    restRank: allEntries.slice(3),
  };
};

export const useGetUserRank = () => {
  const { getUserRankApi } = useMainRepository();
  const query = useQuery({
    queryKey: ['user-rank'],
    queryFn: getUserRankApi,
  });
  return { ...query, userRank: query.data?.data as any };
};
