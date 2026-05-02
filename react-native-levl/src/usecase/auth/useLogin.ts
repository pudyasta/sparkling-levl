import { useMutation } from '@tanstack/react-query';

import { useAuth } from '@/context/AuthContext';
import { validateSafely } from '@/lib/helper/validate';
import { useLoginRepo } from '@/repository/auth/useLoginRepo';
import type { LoginRequest } from '@/types/auth';

import { loginSchema } from './loginValidation';

interface UseLoginOptions {
  onValidationError?: (errors: Record<string, string>) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useLogin = (options?: UseLoginOptions) => {
  const { loginApi } = useLoginRepo();
  const { setAccessToken, setUser } = useAuth();

  const mutation = useMutation({
    mutationFn: async (rawValues: LoginRequest) => {
      const result = await validateSafely(loginSchema, rawValues);
      if (!result.success) {
        throw { type: 'VALIDATION_ERROR', errors: result.errors };
      }
      return loginApi(rawValues);
    },
    onSuccess: ({ data }) => {
      if (!data.data?.access_token || !data.data?.refresh_token) {
        throw new Error('Invalid token response');
      }
      setAccessToken({
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
        expires_in: data.data.expires_in,
      });
      setUser(data.data.user);
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
