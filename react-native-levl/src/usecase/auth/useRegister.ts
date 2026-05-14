import { useMutation } from '@tanstack/react-query';

import { validateSafely } from '@/lib/helper/validate';
import { useRegisterRepo } from '@/repository/auth/useRegisterRepo';
import type { RegisterRequest } from '@/types/auth';

import { registerSchema } from './registerValidation';

interface UseRegisterOptions {
  onValidationError?: (errors: Record<string, string>) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useRegister = (options?: UseRegisterOptions) => {
  const { registerApi } = useRegisterRepo();

  const mutation = useMutation({
    mutationFn: async (rawValues: RegisterRequest) => {
      const result = await validateSafely(registerSchema, rawValues);
      if (!result.success) {
        throw { type: 'VALIDATION_ERROR', errors: result.errors };
      }
      return registerApi(rawValues);
    },
    onSuccess: ({ data }) => {
      options?.onSuccess?.(data);
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
