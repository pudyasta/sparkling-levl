import { useMutation } from '@tanstack/react-query';
import * as yup from 'yup';

import { useProfileRepository } from '@/repository/profile/useProfileRepository';
import { validateSafely } from '@/lib/helper/validate';

const UpdatePassSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: yup
    .string()
    .matches(/([@$!%*?&\-_])/, 'Password must contain a special character')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .min(8, 'Password must be at least 8 characters long'),
  new_password_confirmation: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords do not match')
    .required('Please confirm your password'),
});

interface Options {
  onValidationError?: (errors: Record<string, string>) => void;
  onSuccess?: (data: any) => void;
  onError?: (err: any) => void;
}

export const useUpdatePassword = (options?: Options) => {
  const { updatePasswordApi } = useProfileRepository();

  const mutation = useMutation({
    mutationFn: async (payload: {
      current_password: string;
      new_password: string;
      new_password_confirmation: string;
    }) => {
      const result = await validateSafely(UpdatePassSchema, payload);
      if (!result.success) {
        throw { type: 'VALIDATION_ERROR', errors: result.errors };
      }
      return updatePasswordApi(payload);
    },
    onSuccess: (data) => options?.onSuccess?.(data),
    onError: (error: any) => {
      if (error?.type === 'VALIDATION_ERROR') {
        options?.onValidationError?.(error.errors);
      } else {
        options?.onError?.(error);
      }
    },
  });

  return { execute: mutation.mutate, isLoading: mutation.isPending };
};
