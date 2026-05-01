import { GET_METHOD } from '@/constant/api';
import {
  DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT,
  DASHBOARD_RECENT_LEARNING_ENDPOINT,
  DASHBOARD_RECOMMENDED_COURSES_ENDPOINT,
  DASHBOARD_SUMMARY_ENDPOINT,
} from '@/constant/route';
import { guestAPIClient, useApiClient } from '@/lib/api/core';

import {
  GET_ALL_ACHIEVEMENTS,
  GET_ALL_COURSES,
  GET_GAMIFICATION_STATS,
  GET_LEADERBOARD,
  GET_USER_RANK,
} from './constant';
import type { CourseQueryParams, CourseResponse, GetAllCoursesRequest } from './type/course';

export const getAllCoursesApi = async (data: GetAllCoursesRequest): Promise<CourseResponse> => {
  let url = GET_ALL_COURSES;

  const response = await guestAPIClient(url, {
    method: GET_METHOD,
    timeout: 5000,
  });
  return response?.data;
};

export const useMainRepository = () => {
  const { api } = useApiClient();

  const getAllCoursesApi = async (params?: CourseQueryParams): Promise<CourseResponse> => {
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

    const response = await api(`${GET_ALL_COURSES}?${query.toString()}`, {
      method: GET_METHOD,
      timeout: 5000,
    });
    console.log('RES', JSON.stringify(response, null, 2));

    return response?.data;
  };

  const getLeaderboardApi = async () => {
    const url = GET_LEADERBOARD;
    const response = await api(url, {
      method: GET_METHOD,
    });

    return response?.data;
  };

  const getUserRankApi = async () => {
    const url = GET_USER_RANK;
    const response = await api(url, {
      method: GET_METHOD,
    });
    return response?.data;
  };

  const getGamificationStatsApi = async () => {
    const url = GET_GAMIFICATION_STATS;
    const response = await api(url, {
      method: GET_METHOD,
    });
    return response?.data;
  };

  const getAllAchievementsApi = async () => {
    const url = GET_ALL_ACHIEVEMENTS;
    const response = await api(url, {
      method: GET_METHOD,
    });
    return response?.data;
  };

  // Dashboard route
  const getDashboardSummaryApi = async () => {
    const url = DASHBOARD_SUMMARY_ENDPOINT;
    const response = await api(url, {
      method: GET_METHOD,
    });
    return response?.data;
  };

  const getDashboardRecentLearningApi = async () => {
    const url = DASHBOARD_RECENT_LEARNING_ENDPOINT;
    const response = await api(url, {
      method: GET_METHOD,
    });
    return response?.data;
  };

  const getDashboardRecommendedCoursesApi = async () => {
    const url = DASHBOARD_RECOMMENDED_COURSES_ENDPOINT;
    const response = await api(url, {
      method: GET_METHOD,
    });
    return response?.data;
  };

  const getDashboardRecentCoursesApi = async () => {
    const url = DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT;
    const response = await api(url, {
      method: GET_METHOD,
    });
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
    getDashboardRecentCoursesApi,
  };
};
