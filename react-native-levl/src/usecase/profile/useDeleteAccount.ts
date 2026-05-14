import { useMutation } from '@tanstack/react-query';
import { useProfileRepository } from '@/repository/profile/useProfileRepository';

interface Options {
  onSuccess?: (uuid?: string) => void;
  onError?: (err: any) => void;
}

export const useDeleteAccountRequest = (options?: Options) => {
  const { deleteAccountRequestApi } = useProfileRepository();

  const mutation = useMutation({
    mutationFn: (payload: { password: string }) => deleteAccountRequestApi(payload),
    onSuccess: (res) => options?.onSuccess?.(res?.data?.uuid),
    onError: (err) => options?.onError?.(err),
  });

  return { execute: mutation.mutate, isLoading: mutation.isPending };
};

export const useDeleteAccountConfirm = (options?: { onSuccess?: () => void; onError?: (err: any) => void }) => {
  const { deleteAccountConfirmApi } = useProfileRepository();

  const mutation = useMutation({
    mutationFn: (payload: { uuid: string; token: string }) => deleteAccountConfirmApi(payload),
    onSuccess: () => options?.onSuccess?.(),
    onError: (err) => options?.onError?.(err),
  });

  return { execute: mutation.mutate, isLoading: mutation.isPending };
};
