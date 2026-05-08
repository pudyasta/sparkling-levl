import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfileResource, UpdateProfilePayload } from '../repository/type';
import { useProfileRepo } from '../repository/userProfile';

interface Options {
  onSuccess?: (data: ProfileResource) => void;
  onError?: (error: any) => void;
}

export const useUpdateProfile = (options?: Options) => {
  const { updateProfileApi } = useProfileRepo();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfileApi(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      options?.onSuccess?.(res.data);
    },
    onError: (error: any) => {
      console.log('useUpdateProfile error:', JSON.stringify(error, null, 2));
      options?.onError?.(error);
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
