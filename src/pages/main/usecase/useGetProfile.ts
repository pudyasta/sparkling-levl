import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import type {
  Badge,
  BadgeResponse,
  GamificationData,
  GamificationSummaryResponse,
} from '../repository/type/profile';
import type { AxiosError } from 'axios';
import { useMainRepository } from '../repository/MainRepository';

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export const useGetGamificationStats = <T = GamificationData>(
  options?: UseQueryOptions<
    GamificationSummaryResponse,
    AxiosError<ApiError>,
    T
  >,
) => {
  const { getGamificationStatsApi } = useMainRepository();

  const query = useQuery({
    queryKey: ['gamificationStats'],
    queryFn: async () => {
      const response = await getGamificationStatsApi();
      return response.data;
    },
    ...options,
  });

  return {
    ...query,
    stats: query.data as T,
    error: query.error,
    isError: query.isError,
  };
};

export const useGetAchievements = <T = Badge[]>(
  options?: UseQueryOptions<BadgeResponse, AxiosError<ApiError>, T>,
) => {
  const { getAllAchievementsApi } = useMainRepository();

  const query = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const response = await getAllAchievementsApi();
      return response.data;
    },
    ...options,
  });

  return {
    ...query,
    achievements: query.data as T,
    error: query.error,
    isError: query.isError,
  };
};
