import { useMutation } from '@tanstack/react-query';

import { useQuizRepo } from '../repo/useQuizRepo';
import type { QuizOverviewResponse } from '../type/QuizData';

interface UseGetQuizOverviewOptions {
  onSuccess?: (data: QuizOverviewResponse) => void;
  onError?: (error: any) => void;
}

export const useGetQuizOverview = (options?: UseGetQuizOverviewOptions) => {
  const { getQuizOverviewApi } = useQuizRepo();

  const mutation = useMutation({
    mutationFn: ({ submissionId, sessionToken }: { submissionId: number; sessionToken: string }) =>
      getQuizOverviewApi(submissionId, sessionToken),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
