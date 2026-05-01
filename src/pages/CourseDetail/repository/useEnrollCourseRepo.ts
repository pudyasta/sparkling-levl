import { POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

import type { CourseEnrollResponse, EnrollCoursePayload } from '../type/enrollment';

const ENROLL_COURSE_ENDPOINT = '/courses/COURSE_SLUG/enroll';

export const useEnrollCourseRepo = () => {
  const { api } = useApiClient();

  const enrollCourseApi = async (
    courseSlug: string,
    payload?: EnrollCoursePayload
  ): Promise<CourseEnrollResponse> => {
    const response = await api(ENROLL_COURSE_ENDPOINT.replace('COURSE_SLUG', courseSlug), {
      method: POST_METHOD,
      data: payload,
    });
    console.log('RESP', JSON.stringify(response, null, 2));
    return response?.data;
  };

  return { enrollCourseApi };
};
