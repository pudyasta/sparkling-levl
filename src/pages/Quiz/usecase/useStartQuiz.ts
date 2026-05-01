import { useMutation } from '@tanstack/react-query';

import { useQuizRepo } from '../repo/useQuizRepo';
import type { StartQuizResponse } from '../type/QuizData';

interface Options {
  onSuccess?: (data: StartQuizResponse) => void;
  onError?: (error: any) => void;
}

export const useStartQuiz = (options?: Options) => {
  const { startQuizApi } = useQuizRepo();

  const mutation = useMutation({
    mutationFn: (quizId: number) => startQuizApi(quizId),
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (error: any) => {
      console.log('useStartQuiz error:', JSON.stringify(error, null, 2));
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
