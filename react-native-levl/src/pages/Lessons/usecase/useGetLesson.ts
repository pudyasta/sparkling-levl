import { useMutation, useQuery } from '@tanstack/react-query';

import { callToast } from '@/lib/helper/showToast';

import { useLessonsRepository } from '../repository/LessonsRepository';
import type { LessonData } from '../repository/type/lessons';

export const useGetLesson = (
  courseSlug: string,
  unitSlug: string,
  lessonSlug: string,
  enabled = true,
) => {
  const { getLessonApi } = useLessonsRepository();

  const query = useQuery<LessonData>({
    queryKey: ['lesson', courseSlug, unitSlug, lessonSlug],
    queryFn: async () => {
      const res = await getLessonApi(courseSlug, unitSlug, lessonSlug);
      return res?.data ?? null;
    },
    enabled: enabled && !!courseSlug && !!unitSlug && !!lessonSlug,
  });

  return { ...query, lesson: query.data };
};

export const useMarkAsDone = (callbacks?: {
  onSuccess?: (xpReward: number) => void;
  onError?: () => void;
}) => {
  const { markAsDoneApi } = useLessonsRepository();

  const mutation = useMutation({
    mutationFn: (lessonSlug: string) => markAsDoneApi(lessonSlug),
    onSuccess: (res: any) => {
      callbacks?.onSuccess?.(res?.data?.xp_reward ?? 0);
    },
    onError: () => {
      callToast('Gagal menandai pelajaran selesai.', 'error');
      callbacks?.onError?.();
    },
  });

  return { execute: mutation.mutate, isLoading: mutation.isPending };
};
