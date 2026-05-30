import { GET_METHOD, POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

export const useCourseDetailRepository = () => {
  const { api } = useApiClient();

  return {
    getCourseDetailApi: (slug: string) =>
      api(`/courses/${slug}?include=units,category,elements,tags&lang=id`, {
        method: GET_METHOD,
      }).then((r: any) => {
        return r?.data;
      }),

    enrollCourseApi: (slug: string, payload?: { enrollment_key?: string }) =>
      api(`/courses/${slug}/enroll`, { method: POST_METHOD, data: payload ?? {} }).then(
        (r: any) => r?.data
      ),
  };
};
