import { registerSchema } from './registerValidation';
import { useMutation } from '@tanstack/react-query';
import { validateSafely } from '@/lib/helper/validate';
import type { RegisterRequest } from '../repository/type';
import { useRegisterRepo } from '../repository/useRegister';
import type { AuthResponse } from '@/pages/Login/repository/type';
import { useNativeBridge } from '@/context/NativeBridgeProvider';

interface UseRegisterOptions {
  onValidationError?: (errors: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useRegister = (options?: UseRegisterOptions) => {
  const { registerApi } = useRegisterRepo();
  const { setAccessToken, setUser } = useNativeBridge();

  const mutation = useMutation<AuthResponse, any, RegisterRequest>({
    mutationFn: async (rawValues: RegisterRequest) => {
      const result = await validateSafely(registerSchema, rawValues);
      if (!result.success) {
        throw { type: 'VALIDATION_ERROR', errors: result.errors };
      }

      const response = await registerApi({
        name: rawValues.name,
        username: rawValues.username,
        email: rawValues.email,
        password: rawValues.password,
        password_confirmation: rawValues.password_confirmation,
      });

      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      if (data.message == 'messages.validation.failed') {
        const err = {
          email: data.errors.email?.[0] || null,
          password: data.errors.password?.[0] || null,
          password_confirmation: data.errors.password_confirmation?.[0] || null,
          username: data.errors.username?.[0] || null,
          name: data.errors.name?.[0] || null,
        };
        options?.onValidationError?.(err);
      } else if (!data.data?.access_token || !data.data?.refresh_token) {
        throw new Error('Invalid token response');
      } else {
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
    data: mutation.data,
  };
};
