import { useMutation } from '@tanstack/react-query';
import { loginSchema, type LoginSchema } from './loginValidation';
import { useAuth } from '@/context/AuthProvider';
import { validateSafely } from '@/lib/helper/validate';
import { useLoginRepo } from '../repository/useLoginRepo';
import type { LoginRequest } from '../repository/type';

interface UseLoginOptions {
  onValidationError?: (errors: any) => void;
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

      const validatedData: LoginSchema = rawValues as LoginSchema;
      return loginApi({
        login: validatedData.login,
        password: validatedData.password,
      });
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

      setUser({
        id: data.data.user.id,
        name: data.data.user.name,
        username: data.data.user.username,
        email: data.data.user.email,
        status: data.data.user.status,
        email_verified_at: data.data.user.email_verified_at,
        created_at: data.data.user.created_at,
        updated_at: data.data.user.updated_at,
        roles: data.data.user.roles,
        avatar_url: data.data.user.avatar_url,
      });

      options?.onSuccess?.(data);
    },
    onError: (error: any) => {
      console.log(error);
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
    data: mutation.data,
  };
};
