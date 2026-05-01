import { POST_METHOD } from '@/constant/api';
import { LESSON_MARK_AS_DONE_ENDPOINT } from '@/constant/route';
import { useApiClient } from '@/lib/api/core';

export const useMarkAsDoneRepo = () => {
  const { api } = useApiClient();

  const markAsDoneApi = (lessonSlug: string) => {
    return api(LESSON_MARK_AS_DONE_ENDPOINT.replace('LESSON_SLUG', lessonSlug), {
      method: POST_METHOD,
    });
  };

  return { markAsDoneApi };
};
