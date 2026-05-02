import { useQuery } from '@tanstack/react-query';
import { useCourseDetailRepository } from '@/repository/courseDetail/useCourseDetailRepository';

export const useGetCourseDetail = (slug: string) => {
  const { getCourseDetailApi } = useCourseDetailRepository();
  const query = useQuery({
    queryKey: ['course-detail', slug],
    queryFn: () => getCourseDetailApi(slug),
    enabled: !!slug,
  });
  return { ...query, course: query.data?.data as any };
};
