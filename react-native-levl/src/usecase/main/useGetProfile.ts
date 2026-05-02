import { useQuery } from '@tanstack/react-query';
import { useMainRepository } from '@/repository/main/MainRepository';

export const useGetGamificationStats = () => {
  const { getGamificationStatsApi } = useMainRepository();
  const query = useQuery({
    queryKey: ['gamification-stats'],
    queryFn: getGamificationStatsApi,
  });
  return {
    ...query,
    stats: (query.data?.data ?? {
      level: { name: '', current: 0, xp_to_next_level: 0, progress_percentage: 0 },
      xp: { total: 0, period: 0 },
      activity: { current_streak: 0, longest_streak: 0 },
    }) as any,
  };
};

export const useGetAchievements = () => {
  const { getAllAchievementsApi } = useMainRepository();
  const query = useQuery({
    queryKey: ['achievements'],
    queryFn: getAllAchievementsApi,
  });
  return { ...query, achievements: (query.data?.data ?? []) as any[] };
};
