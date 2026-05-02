import { GET_METHOD, POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

export const useCourseDetailRepository = () => {
  const { api } = useApiClient();

  const getCourseDetailApi = async (slug: string) => {
    const response = await api(`/courses/${slug}?include=units,category,elements,tags`, {
      method: GET_METHOD,
    });
    return response?.data;
  };

  const enrollCourseApi = async (slug: string) => {
    const response = await api(`/courses/${slug}/enroll`, { method: POST_METHOD });
    return response?.data;
  };

  return { getCourseDetailApi, enrollCourseApi };
};
