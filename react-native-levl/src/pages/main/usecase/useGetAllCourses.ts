import { useInfiniteQuery } from '@tanstack/react-query';

import type { CourseFilters } from '../repository/CourseRepository';
import { useCourseRepository } from '../repository/CourseRepository';
import type { Course, CoursesResponse } from '../repository/type/course';

export const useGetAllCourses = (filters: CourseFilters = {}) => {
  const { getCoursesApi } = useCourseRepository();

  const query = useInfiniteQuery<CoursesResponse>({
    queryKey: ['courses', 'all', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await getCoursesApi(pageParam as number, filters);
      return res as CoursesResponse;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (!lastPage?.meta) return undefined;
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
  });

  const courses: Course[] = query.data?.pages.flatMap((page) => page?.data ?? []) ?? [];

  return {
    ...query,
    courses,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
};

export const flattenCoursePages = (pages?: CoursesResponse[]): Course[] => {
  if (!pages) return [];
  return pages.flatMap((page) => page?.data ?? []);
};
