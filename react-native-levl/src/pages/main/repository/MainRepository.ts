import { GET_METHOD } from '@/constant/api';
import {
  DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT,
  DASHBOARD_RECENT_LEARNING_ENDPOINT,
  DASHBOARD_RECOMMENDED_COURSES_ENDPOINT,
  DASHBOARD_SUMMARY_ENDPOINT,
  MY_COURSE_ENDPOINT,
} from '@/constant/route';
import { useApiClient } from '@/lib/api/core';

export const useMainRepository = () => {
  const { api } = useApiClient();

  return {
    getDashboardSummaryApi: () =>
      api(DASHBOARD_SUMMARY_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),

    getDashboardRecentLearningApi: () =>
      api(DASHBOARD_RECENT_LEARNING_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),

    getDashboardRecommendedCoursesApi: () =>
      api(DASHBOARD_RECOMMENDED_COURSES_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),

    getDashboardRecentAchievementsApi: () =>
      api(DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT, { method: GET_METHOD }).then((r: any) => r?.data),

    getMyCoursesApi: (search = '') =>
      api(`${MY_COURSE_ENDPOINT}${search}`, { method: GET_METHOD }).then((r: any) => r?.data),
  };
};
