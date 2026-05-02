import { useQuery } from '@tanstack/react-query';
import { useMainRepository } from '@/repository/main/MainRepository';

export const useGetDashboardSummary = () => {
  const { getDashboardSummaryApi } = useMainRepository();
  const query = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummaryApi,
  });
  return { ...query, summary: query.data?.data };
};

export const useGetDashboardRecentLearning = () => {
  const { getDashboardRecentLearningApi } = useMainRepository();
  const query = useQuery({
    queryKey: ['dashboard-recent-learning'],
    queryFn: getDashboardRecentLearningApi,
  });
  return { ...query, recentLearning: query.data?.data as any[] | undefined };
};

export const useGetRecommendedCourses = () => {
  const { getDashboardRecommendedCoursesApi } = useMainRepository();
  const query = useQuery({
    queryKey: ['recommended-courses'],
    queryFn: getDashboardRecommendedCoursesApi,
  });
  return { ...query, recommendedCourses: query.data?.data as any[] | undefined };
};
