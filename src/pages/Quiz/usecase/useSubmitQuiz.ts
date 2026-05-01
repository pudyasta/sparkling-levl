import { useMutation } from '@tanstack/react-query';
import { setItem } from 'sparkling-storage';

import { BizKey, PrefKey } from '@/lib/helper/localStorage';

import { useQuizRepo } from '../repo/useQuizRepo';
import type { SubmitQuizResponse } from '../type/QuizData';

interface Options {
  onSuccess?: (data: SubmitQuizResponse) => void;
  onError?: (error: any) => void;
}

export const useSubmitQuiz = (options?: Options) => {
  const { submitQuizApi } = useQuizRepo();

  const mutation = useMutation({
    mutationFn: (submissionId: number) => submitQuizApi(submissionId),
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (error: any) => {
      console.log('useSubmitQuiz error:', JSON.stringify(error, null, 2));
      options?.onError?.(error);
      setItem({ key: PrefKey.SubmissionId, biz: BizKey.Quiz, value: null }, () => {});
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  };
};
