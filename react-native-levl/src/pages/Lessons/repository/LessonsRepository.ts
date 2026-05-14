import { GET_METHOD, POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

export const useLessonsRepository = () => {
  const { api } = useApiClient();

  return {
    getLessonApi: (coursSlug: string, unitSlug: string, lessonSlug: string) =>
      api(`/courses/${coursSlug}/units/${unitSlug}/lessons/${lessonSlug}`, { method: GET_METHOD })
        .then((r: any) => r?.data),

    markAsDoneApi: (lessonSlug: string) =>
      api(`/lessons/${lessonSlug}/complete`, { method: POST_METHOD })
        .then((r: any) => r?.data),
  };
};
