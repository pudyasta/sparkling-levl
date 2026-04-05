import { useQuery } from '@tanstack/react-query';
import { getAllCoursesApi } from '../repository/MainRepository';
import type { CourseResponse } from '../repository/type/course';

interface QueryOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export const useGetAllCourses = <T = CourseResponse>(
  options?: QueryOptions<T>,
) => {
  const query = useQuery({
    queryKey: ['courses'],
    queryFn: async (): Promise<CourseResponse> => {
      const response = await getAllCoursesApi({});
      return response;
    },
  });

  return {
    ...query,
    courses: query.data as T,
    isLoading: query.isLoading,
  };
};
