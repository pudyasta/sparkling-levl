import { useMutation } from '@tanstack/react-query';

import { useMarkAsDoneRepo } from '../repository/useMarkAsDoneRepo';

interface UseMarkAsDoneOptions {
  onValidationError?: (errors: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useMarkAsDone = (options?: UseMarkAsDoneOptions) => {
  const { markAsDoneApi } = useMarkAsDoneRepo();

  const mutation = useMutation({
    mutationFn: async (lessonSlug: string) => {
      return markAsDoneApi(lessonSlug);
    },
    onSuccess: ({ data }) => {
      console.log('data', JSON.stringify(data, null, 2));

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.log('ERRRR', JSON.stringify(error, null, 2));
      options?.onError?.(error);
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
};
