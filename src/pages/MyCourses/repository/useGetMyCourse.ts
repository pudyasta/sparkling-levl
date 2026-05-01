import { GET_METHOD } from '@/constant/api';
import { MY_COURSE_ENDPOINT } from '@/constant/route';
import { useApiClient } from '@/lib/api/core';

export const useGetMyCourseRepo = () => {
  const { api } = useApiClient();

  const getMyCourseApi = ({ search }: { search?: string }) => {
    return api(MY_COURSE_ENDPOINT, {
      method: GET_METHOD,
    });
  };

  return { getMyCourseApi };
};
