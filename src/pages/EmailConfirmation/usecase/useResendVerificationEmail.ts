import { useMutation } from '@tanstack/react-query';
import { validateSafely } from '@/lib/helper/validate';
import { navigate } from '@/lib/native/nativeNavigate';
import { email } from 'zod';
import type { AuthResponse } from '@/pages/Login/repository/type';
import { useResendVerificationEmailRepo } from '../repository/useResendVerificationEmailRepo';

interface UseResendVerificationEmailOptions {
  onValidationError?: (errors: any) => void;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export const useResendVerificationEmail = (
  options?: UseResendVerificationEmailOptions,
) => {
  const { resendVerificationEmailApi } = useResendVerificationEmailRepo();
  const mutation = useMutation<AuthResponse, any, any>({
    mutationFn: async () => {
      const response = await resendVerificationEmailApi();

      return response.data;
    },
    onSuccess: (data) => {
      console.log(data);
      //   if (data.message == 'messages.validation.failed') {
      //     const err = {
      //       email: data.errors.email?.[0] || null,
      //       password: data.errors.password?.[0] || null,
      //       password_confirmation: data.errors.password_confirmation?.[0] || null,
      //       username: data.errors.username?.[0] || null,
      //       name: data.errors.name?.[0] || null,
      //     };
      //     options?.onValidationError?.(err);
      //   } else {
      //     options?.onSuccess?.(data);
      //   }

      //   const response = await registerApi({
      //     name: rawValues.name,
      //     username: rawValues.username,
      //     email: rawValues.email,
      //     password: rawValues.password,
      //     password_confirmation: rawValues.password_confirmation,
      //   });

      //   return response.data;
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
