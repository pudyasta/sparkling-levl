import { GET_METHOD } from '@/constant/api';

import { guestAPIClient, useApiClient } from '@/lib/api/core';
import { COURSE_DETAIL_ENDPOINT, DASHBOARD_RECENT_ACHIEVEMENTS_ENDPOINT } from '@/constant/route';
import type { CourseResponse } from './type';

export const useCourseDetailApi = () => {
  const { api } = useApiClient();

  const getDetailCourse = async (slug: string) => {
    const url = COURSE_DETAIL_ENDPOINT.replace('SLUG', slug);

    const response = await api(url, {
      method: GET_METHOD,
    });

    return response.data as CourseResponse;
  };

  return {
    getDetailCourse,
  };
};
