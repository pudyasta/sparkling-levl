import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { useMemo } from '@lynx-js/react';
import type {
  LeaderboardResponse,
  MyRankResponse,
} from '../repository/type/leaderboard';
import { useMainRepository } from '../repository/MainRepository';
import type { AxiosError } from 'axios'; // Assuming you use Axios

// Define a type for your API error structure
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export const useGetLeaderboard = <T = LeaderboardResponse>(
  options?: UseQueryOptions<LeaderboardResponse, AxiosError<ApiError>, T>,
) => {
  const { getLeaderboardApi } = useMainRepository();

  const query = useQuery({
    queryKey: ['leaderboards'],
    queryFn: async () => {
      const response = await getLeaderboardApi();
      return response.data;
    },
    ...options,
  });

  const { topThree, restRank } = useMemo(() => {
    const entries = (query.data as any) || [];
    const top = entries.slice(0, 3);
    if (top.length >= 2) {
      [top[0], top[1]] = [top[1], top[0]];
    }
    return { topThree: top, restRank: entries.slice(3, -1) };
  }, [query.data]);

  return {
    ...query,
    topThree,
    restRank,
    rawPosition: query.data as T,
    error: query.error,
    isError: query.isError,
  };
};

export const useGetUserRank = <T = MyRankResponse>(
  options?: UseQueryOptions<MyRankResponse, AxiosError<ApiError>, T>,
) => {
  const { getUserRankApi } = useMainRepository();

  const query = useQuery({
    queryKey: ['userRank'],
    queryFn: async () => {
      const response = await getUserRankApi();
      return response.data;
    },
    ...options,
  });

  return {
    ...query,
    userRank: query.data as T,
    error: query.error,
    isError: query.isError,
  };
};
