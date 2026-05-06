import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ProfilePrivacyResource, UpdatePrivacyPayload } from '../repository/type';
import { useProfileRepo } from '../repository/userProfile';

interface Options {
  onSuccess?: (data: ProfilePrivacyResource) => void;
  onError?: (error: any) => void;
}

export const useUpdatePrivacy = (options?: Options) => {
  const { updatePrivacyApi } = useProfileRepo();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdatePrivacyPayload) => updatePrivacyApi(payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['profile', 'privacy'] });
      options?.onSuccess?.(res.data);
    },
    onError: (error: any) => options?.onError?.(error),
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
  };
};
