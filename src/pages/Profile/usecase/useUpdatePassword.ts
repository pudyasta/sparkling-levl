import { useMutation } from '@tanstack/react-query';

import { callToast } from '@/lib/helper/showToast';
import { validateSafely } from '@/lib/helper/validate';

import type { UpdatePasswordPayload } from '../repository/type';
import { useProfileRepo } from '../repository/userProfile';
import { UpdatePassSchema } from './updatePasswordValidation';

interface Options {
  onValidationError?: (errors: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useUpdatePassword = (options?: Options) => {
  const { updatePasswordApi } = useProfileRepo();

  const mutation = useMutation({
    mutationFn: async (payload: UpdatePasswordPayload) => {
      const result = await validateSafely(UpdatePassSchema, payload);
      if (!result.success) {
        throw { type: 'VALIDATION_ERROR', errors: result.errors };
      }
      return updatePasswordApi(payload);
    },
    onSuccess: (data) => {
      if (data.success) {
        options?.onSuccess?.(data);
      } else {
        callToast(data.message, 'error');
      }
    },
    onError: (error: any) => {
      if (error.type === 'VALIDATION_ERROR') {
        options?.onValidationError?.(error.errors);
      }
      options?.onError?.(error);
    },
  });

  return {
    execute: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
