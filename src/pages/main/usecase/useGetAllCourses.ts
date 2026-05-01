import { useInfiniteQuery } from '@tanstack/react-query';

import { useMainRepository } from '../repository/MainRepository';
import type { CourseData, CourseQueryParams } from '../repository/type/course';

const PER_PAGE = 20;

interface Options {
  onError?: (error: any) => void;
}

export const useGetAllCourses = (filters: Omit<CourseQueryParams, 'page'>, options?: Options) => {
  const { getAllCoursesApi } = useMainRepository();

  const query = useInfiniteQuery({
    queryKey: ['courses', filters],
    queryFn: async ({ pageParam = 1 }) => {
      return getAllCoursesApi({ ...filters, page: pageParam, per_page: PER_PAGE });
    },
    getNextPageParam: (lastPage) => {
      const meta = lastPage?.meta as any;
      if (!meta) return undefined;
      const { current_page, last_page } = meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const courses: CourseData[] =
    query.data?.pages.flatMap((page) => (page?.data as CourseData[]) ?? []) ?? [];

  return {
    courses,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    error: query.error,
  };
};
