import { useMutation } from '@tanstack/react-query';
import { setItem } from 'sparkling-storage';

import { BizKey, PrefKey } from '@/lib/helper/localStorage';

import { useQuizRepo } from '../repo/useQuizRepo';
import type { SubmitQuizResponse } from '../type/QuizData';

interface Options {
  sessionToken: string;
  onSuccess?: (data: SubmitQuizResponse) => void;
  onError?: (error: any) => void;
}

export const useSubmitQuiz = (options?: Options) => {
  const { submitQuizApi } = useQuizRepo();

  const mutation = useMutation({
    mutationFn: (submissionId: number) => submitQuizApi(submissionId, options?.sessionToken || ''),
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (error: any) => {
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
