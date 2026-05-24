import { useMutation, useQuery } from '@tanstack/react-query';

import { callToast } from '@/lib/helper/showToast';

import { useCourseDetailRepository } from '../repository/CourseDetailRepository';
import type { CourseDetailData } from '../repository/type';

export const useGetCourseDetail = (slug: string) => {
  const { getCourseDetailApi } = useCourseDetailRepository();

  const query = useQuery<CourseDetailData>({
    queryKey: ['course-detail', slug],
    queryFn: async () => {
      const res = await getCourseDetailApi(slug);
      return res?.data ?? null;
    },
    enabled: !!slug,
  });

  return { ...query, course: query.data };
};

export const useEnrollCourse = (callbacks?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { enrollCourseApi } = useCourseDetailRepository();

  const mutation = useMutation({
    mutationFn: ({ slug, enrollmentKey }: { slug: string; enrollmentKey?: string }) =>
      enrollCourseApi(slug, enrollmentKey ? { enrollment_key: enrollmentKey } : undefined),
    onSuccess: () => {
      callToast('Berhasil mendaftar kursus!', 'success');
      callbacks?.onSuccess?.();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Gagal mendaftar kursus.';
      callToast(msg, 'error');
      callbacks?.onError?.();
    },
  });

  return { enroll: mutation.mutate, isLoading: mutation.isPending };
};
