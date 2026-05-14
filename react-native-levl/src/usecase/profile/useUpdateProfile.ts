import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useProfileRepository } from '@/repository/profile/useProfileRepository';

interface Options {
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
}

export const useUpdateProfile = (options?: Options) => {
  const { updateProfileApi } = useProfileRepository();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { name: string; phone?: string; bio?: string; location?: string }) =>
      updateProfileApi(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(res?.data);
    },
    onError: (err) => options?.onError?.(err),
  });

  return { execute: mutation.mutate, isLoading: mutation.isPending };
};
