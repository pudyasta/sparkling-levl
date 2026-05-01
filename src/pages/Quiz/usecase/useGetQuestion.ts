import { useMutation } from '@tanstack/react-query';

import { useQuizRepo } from '../repo/useQuizRepo';
import type { GetQuestionByPageResponse } from '../type/QuizData';

interface Options {
  onSuccess?: (data: GetQuestionByPageResponse) => void;
  onError?: (error: any) => void;
}

export const useGetQuestion = (options?: Options) => {
  const { getQuestionApi } = useQuizRepo();

  const mutation = useMutation({
    mutationFn: ({ submissionId, page }: { submissionId: number; page: number }) =>
      getQuestionApi(submissionId, page),
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (error: any) => {
      console.log('useGetQuestion error:', JSON.stringify(error, null, 2));
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
