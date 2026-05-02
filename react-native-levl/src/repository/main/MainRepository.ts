import { GET_METHOD } from '@/constant/api';
import {
  DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT,
  DASHBOARD_RECENT_LEARNING_ENDPOINT,
  DASHBOARD_RECOMMENDED_COURSES_ENDPOINT,
  DASHBOARD_SUMMARY_ENDPOINT,
} from '@/constant/route';
import { useApiClient } from '@/lib/api/core';
import type { CourseQueryParams } from '@/types/course';

import {
  GET_ALL_ACHIEVEMENTS,
  GET_ALL_COURSES,
  GET_GAMIFICATION_STATS,
  GET_LEADERBOARD,
  GET_MY_COURSES,
  GET_USER_RANK,
} from './constant';

export const useMainRepository = () => {
  const { api } = useApiClient();

  const getAllCoursesApi = async (params?: CourseQueryParams) => {
    const query = new URLSearchParams();
    query.set('include', params?.include ?? 'units,category,tags');
    query.set('per_page', String(params?.per_page ?? 20));
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.sort) query.set('sort', params.sort);
    if (params?.['filter[status]']) query.set('filter[status]', params['filter[status]']!);
    if (params?.['filter[level_tag]']) query.set('filter[level_tag]', params['filter[level_tag]']!);
    if (params?.['filter[type]']) query.set('filter[type]', params['filter[type]']!);
    if (params?.['filter[category_id]'])
      query.set('filter[category_id]', String(params['filter[category_id]']));

    const response = await api(`${GET_ALL_COURSES}?${query.toString()}`, { method: GET_METHOD });
    return response?.data;
  };

  const getLeaderboardApi = async () => {
    const response = await api(GET_LEADERBOARD, { method: GET_METHOD });
    return response?.data;
  };

  const getUserRankApi = async () => {
    const response = await api(GET_USER_RANK, { method: GET_METHOD });
    return response?.data;
  };

  const getGamificationStatsApi = async () => {
    const response = await api(GET_GAMIFICATION_STATS, { method: GET_METHOD });
    return response?.data;
  };

  const getAllAchievementsApi = async () => {
    const response = await api(GET_ALL_ACHIEVEMENTS, { method: GET_METHOD });
    return response?.data;
  };

  const getDashboardSummaryApi = async () => {
    const response = await api(DASHBOARD_SUMMARY_ENDPOINT, { method: GET_METHOD });
    return response?.data;
  };

  const getDashboardRecentLearningApi = async () => {
    const response = await api(DASHBOARD_RECENT_LEARNING_ENDPOINT, { method: GET_METHOD });
    return response?.data;
  };

  const getDashboardRecommendedCoursesApi = async () => {
    const response = await api(DASHBOARD_RECOMMENDED_COURSES_ENDPOINT, { method: GET_METHOD });
    return response?.data;
  };

  const getDashboardRecentAchievementsApi = async () => {
    const response = await api(DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT, { method: GET_METHOD });
    return response?.data;
  };

  const getMyCourseApi = async (search?: string) => {
    const url = search ? `${GET_MY_COURSES}?search=${encodeURIComponent(search)}` : GET_MY_COURSES;
    const response = await api(url, { method: GET_METHOD });
    return response?.data;
  };

  return {
    getAllCoursesApi,
    getLeaderboardApi,
    getUserRankApi,
    getGamificationStatsApi,
    getAllAchievementsApi,
    getDashboardSummaryApi,
    getDashboardRecentLearningApi,
    getDashboardRecommendedCoursesApi,
    getDashboardRecentAchievementsApi,
    getMyCourseApi,
  };
};
