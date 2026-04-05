import { useQuery, type QueryOptions } from '@tanstack/react-query';
import type {
  DashboardData,
  DashboardResponse,
  LearningActivity,
  RecentLearningResponse,
  RecommendedCourse,
  RecommendedCoursesResponse,
} from '../repository/type/dashboard';
import { useMainRepository } from '../repository/MainRepository';

export const useGetDashboardSummary = <T = DashboardData>(
  options?: QueryOptions<T>,
) => {
  const { getDashboardSummaryApi } = useMainRepository();

  const query = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async (): Promise<DashboardResponse> => {
      const response = await getDashboardSummaryApi();
      return response;
    },
  });

  return {
    ...query,
    summary: query.data?.data as T,
    isLoading: query.isLoading,
  };
};

export const useGetDashboardRecentLearning = <T = LearningActivity[]>(
  options?: QueryOptions<T>,
) => {
  const { getDashboardRecentLearningApi } = useMainRepository();

  const query = useQuery({
    queryKey: ['dashboard-recent-learning'],
    queryFn: async (): Promise<RecentLearningResponse> => {
      const response = await getDashboardRecentLearningApi();
      return response;
    },
  });

  return {
    ...query,
    recentLearning: query.data?.data as T,
    isLoading: query.isLoading,
  };
};

export const useGetRecommendedCourses = <T = RecommendedCourse[]>(
  options?: QueryOptions<T>,
) => {
  const { getDashboardRecommendedCoursesApi } = useMainRepository();

  const query = useQuery({
    queryKey: ['recommended-courses'],
    queryFn: async (): Promise<RecommendedCoursesResponse> => {
      const response = await getDashboardRecommendedCoursesApi();
      return response;
    },
  });

  return {
    ...query,
    recommendedCourses: query.data?.data as T,
    isLoading: query.isLoading,
  };
};
