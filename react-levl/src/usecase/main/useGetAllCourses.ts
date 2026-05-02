import { useInfiniteQuery } from '@tanstack/react-query';
import { useMainRepository } from '@/repository/main/MainRepository';
import type { CourseQueryParams, CourseData } from '@/types/course';

export const useGetAllCourses = (params?: Omit<CourseQueryParams, 'page'>) => {
  const { getAllCoursesApi } = useMainRepository();

  const query = useInfiniteQuery({
    queryKey: ['courses', params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getAllCoursesApi({ ...params, page: pageParam as number }),
    getNextPageParam: (lastPage: any) => {
      const pagination = lastPage?.meta?.pagination;
      if (!pagination) return undefined;
      return pagination.has_next ? pagination.current_page + 1 : undefined;
    },
  });

  const courses: CourseData[] = query.data?.pages.flatMap((p: any) => p?.data ?? []) ?? [];

  return {
    ...query,
    courses,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
  };
};
