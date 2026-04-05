import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
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

  const leaderboardEntries = (query.data as any) || [];
  let topThree = leaderboardEntries.slice(0, 3);
  if (topThree.length >= 2) {
    [topThree[0], topThree[1]] = [topThree[1], topThree[0]];
  }
  const restRank = leaderboardEntries.slice(3, -1);

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
