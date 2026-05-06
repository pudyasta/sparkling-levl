import { useMutation } from '@tanstack/react-query';

import type { DeleteAccountPayload, VerifyEmailChangePayload } from '../repository/type';
import { useProfileRepo } from '../repository/userProfile';

interface Options {
  onSuccess?: (uuid?: string) => void;
  onError?: (error: any) => void;
}

export const useDeleteAccountRequest = (options?: Options) => {
  const { deleteAccountRequestApi } = useProfileRepo();

  const mutation = useMutation({
    mutationFn: (payload: DeleteAccountPayload) => deleteAccountRequestApi(payload),
    onSuccess: (res) => options?.onSuccess?.(res.data.uuid),
    onError: (error: any) => options?.onError?.(error),
  });

  return { execute: mutation.mutate, isLoading: mutation.isPending };
};

export const useDeleteAccountConfirm = (options?: Options) => {
  const { deleteAccountConfirmApi } = useProfileRepo();

  const mutation = useMutation({
    mutationFn: (payload: VerifyEmailChangePayload) => deleteAccountConfirmApi(payload),
    onSuccess: () => options?.onSuccess?.(),
    onError: (error: any) => options?.onError?.(error),
  });

  return { execute: mutation.mutate, isLoading: mutation.isPending };
};
