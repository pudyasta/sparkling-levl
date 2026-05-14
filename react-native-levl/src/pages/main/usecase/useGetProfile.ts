import { useQuery } from '@tanstack/react-query';

import { useProfileRepository } from '../repository/ProfileRepository';
import { useLeaderboardRepository } from '../repository/LeaderboardRepository';
import type { GamificationData } from '../repository/type/profile';
import type { Badge } from '../repository/type/profile';
import type { UserProfile } from '../repository/type/profile';
import type { UserRank } from '../repository/type/leaderboard';

export const useGetProfile = () => {
  const { getProfileApi } = useProfileRepository();

  const query = useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await getProfileApi();
      return res?.data ?? null;
    },
  });

  return { ...query, profile: query.data };
};

export const useGetGamificationStats = () => {
  const { getGamificationStatsApi } = useProfileRepository();

  const query = useQuery<GamificationData>({
    queryKey: ['gamification', 'stats'],
    queryFn: async () => {
      const res = await getGamificationStatsApi();
      return res?.data ?? null;
    },
  });

  return { ...query, stats: query.data };
};

export const useGetAchievements = () => {
  const { getAchievementsApi } = useProfileRepository();

  const query = useQuery<Badge[]>({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await getAchievementsApi();
      return res?.data ?? [];
    },
  });

  return { ...query, achievements: query.data ?? [] };
};

export const useGetUserRank = () => {
  const { getUserRankApi } = useLeaderboardRepository();

  const query = useQuery<UserRank>({
    queryKey: ['leaderboard', 'me'],
    queryFn: async () => {
      const res = await getUserRankApi();
      return res?.data ?? null;
    },
  });

  return { ...query, userRank: query.data };
};
