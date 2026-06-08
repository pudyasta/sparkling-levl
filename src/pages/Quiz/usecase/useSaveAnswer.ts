import { useMutation } from '@tanstack/react-query';

import { useQuizRepo } from '../repo/useQuizRepo';
import type { SaveAnswerPayload } from '../type/QuizData';

interface Options {
  sessionToken: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useSaveAnswer = (options?: Options) => {
  const { saveAnswerApi } = useQuizRepo();

  const mutation = useMutation({
    mutationFn: ({ submissionId, payload }: { submissionId: number; payload: SaveAnswerPayload }) =>
      saveAnswerApi(submissionId, payload, options?.sessionToken || ''),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      options?.onError?.(error);
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  };
};
