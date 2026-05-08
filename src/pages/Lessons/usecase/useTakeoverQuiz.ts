// usecase/useTakeoverQuiz.ts
import { useMutation } from '@tanstack/react-query';

import { useQuizRepo } from '@/pages/Quiz/repo/useQuizRepo';
import type { TakeoverQuizResource } from '@/pages/Quiz/type/QuizData';

interface Options {
  onSuccess?: (data: TakeoverQuizResource) => void;
  onError?: (error: any) => void;
}

export const useTakeoverQuiz = (options?: Options) => {
  const { takeoverQuizApi } = useQuizRepo();

  const mutation = useMutation({
    mutationFn: (submissionId: number) => takeoverQuizApi(submissionId),
    onSuccess: (res) => {
      if (!res.success) {
        options?.onError?.(res.errors);
        return;
      }
      options?.onSuccess?.(res.data);
    },
    onError: (error: any) => {
      console.log('useTakeoverQuiz error:', JSON.stringify(error, null, 2));
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
