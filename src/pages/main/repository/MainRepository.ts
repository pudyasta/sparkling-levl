import type { CourseResponse, GetAllCoursesRequest } from './type/course';
import { GET_METHOD } from '@/constant/api';
import {
  GET_ALL_ACHIEVEMENTS,
  GET_ALL_COURSES,
  GET_GAMIFICATION_STATS,
  GET_LEADERBOARD,
  GET_USER_RANK,
} from './constant';
import { guestAPIClient, useApiClient } from '@/lib/api/core';
import {
  DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT,
  DASHBOARD_RECENT_LEARNING_ENDPOINT,
  DASHBOARD_RECOMMENDED_COURSES_ENDPOINT,
  DASHBOARD_SUMMARY_ENDPOINT,
} from '@/constant/route';

export const getAllCoursesApi = async (
  data: GetAllCoursesRequest,
): Promise<CourseResponse> => {
  let url = GET_ALL_COURSES;

  const response = await guestAPIClient(url, {
    method: GET_METHOD,
    timeout: 5000,
  });
  return response?.data;
};

export const useMainRepository = () => {
  const { api } = useApiClient();

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
