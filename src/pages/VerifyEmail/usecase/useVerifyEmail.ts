import { useMutation } from '@tanstack/react-query';

import type { VerifyEmailData, VerifyEmailResponse } from '../repository/type';
import { useVerifyEmailRepo } from '../repository/useVerifyEmailRepo';

interface Options {
  onSuccess?: (data: VerifyEmailData) => void;
  onError?: (error: any) => void;
}

export const useVerifyEmail = (options?: Options) => {
  const { verifyEmailApi } = useVerifyEmailRepo();

  const mutation = useMutation({
    mutationFn: (payload: { uuid: string; token: string }) => verifyEmailApi(payload),
    onSuccess: (res: VerifyEmailResponse) => {
      if (!res.success) {
        options?.onError?.(res.errors);
        return;
      }
      options?.onSuccess?.(res.data);
    },
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
