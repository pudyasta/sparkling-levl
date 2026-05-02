import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useLessonsRepository } from '@/repository/lessons/useGetLessonsRepo';

export const useGetLesson = (params: {
  course_slug: string;
  unit_slug: string;
  lesson_slug: string;
  enabled?: boolean;
}) => {
  const { getLessonApi } = useLessonsRepository();
  const query = useQuery({
    queryKey: ['lesson', params.course_slug, params.unit_slug, params.lesson_slug],
    queryFn: () => getLessonApi(params),
    enabled: params.enabled !== false && !!params.lesson_slug,
  });
  return { ...query, lesson: query.data?.data as any };
};

export const useMarkAsDone = () => {
  const { markAsDoneApi } = useLessonsRepository();
  const mutation = useMutation({
    mutationFn: (lessonSlug: string) => markAsDoneApi(lessonSlug),
  });
  return {
    execute: (lessonSlug: string, callbacks?: { onSuccess?: (data: any) => void; onError?: (err: any) => void }) => {
      mutation.mutate(lessonSlug, {
        onSuccess: (data) => callbacks?.onSuccess?.(data),
        onError: (err) => callbacks?.onError?.(err),
      });
    },
    isLoading: mutation.isPending,
  };
};

export const useSubmitAssignment = () => {
  const { submitAssignmentApi } = useLessonsRepository();
  const mutation = useMutation({
    mutationFn: ({ assignmentId, ...data }: { assignmentId: number; [key: string]: any }) =>
      submitAssignmentApi(assignmentId, data),
  });
  return { execute: mutation.mutate, isLoading: mutation.isPending };
};
