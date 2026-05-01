import { useQuery } from '@tanstack/react-query';

import type { CourseData, CourseResponse } from '../repository/type';
import { useCourseDetailApi } from '../repository/useCourseDetailRepository';

interface QueryOptions<T> {
  slug: string;
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
}

export const useGetCourseDetail = <T = CourseData>(options?: QueryOptions<T>) => {
  const { getDetailCourse } = useCourseDetailApi();

  const query = useQuery({
    queryKey: ['coursesDetail'],
    queryFn: async (): Promise<CourseResponse> => {
      const response = await getDetailCourse(options?.slug || '');
      return response;
    },
  });

  return {
    ...query,
    courses: query?.data?.data as T,
    isLoading: query.isLoading,
  };
};
