import { useMutation } from '@tanstack/react-query';

import type { ChangeEmailPayload, VerifyEmailChangePayload } from '../repository/type';
import { useProfileRepo } from '../repository/userProfile';

interface Options {
  onSuccess?: (uuid?: string) => void;
  onError?: (error: any) => void;
}

export const useChangeEmail = (options?: Options) => {
  const { changeEmailApi } = useProfileRepo();

  const mutation = useMutation({
    mutationFn: (payload: ChangeEmailPayload) => changeEmailApi(payload),
    onSuccess: (res) => options?.onSuccess?.(res.data.uuid),
    onError: (error: any) => options?.onError?.(error),
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
  };
};

export const useVerifyEmailChange = (options?: Options) => {
  const { verifyEmailChangeApi } = useProfileRepo();

  const mutation = useMutation({
    mutationFn: (payload: VerifyEmailChangePayload) => verifyEmailChangeApi(payload),
    onSuccess: () => options?.onSuccess?.(),
    onError: (error: any) => options?.onError?.(error),
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
