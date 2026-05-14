import { useMutation } from '@tanstack/react-query';

import type { UpdatePasswordPayload } from '../repository/type';
import { useProfileRepo } from '../repository/userProfile';

interface Options {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useUpdatePassword = (options?: Options) => {
  const { updatePasswordApi } = useProfileRepo();

  const mutation = useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => updatePasswordApi(payload),
    onSuccess: () => options?.onSuccess?.(),
    onError: (error: any) => {
      options?.onError?.(error);
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
