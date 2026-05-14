import { useMutation, useQuery } from '@tanstack/react-query';

import { callToast } from '@/lib/helper/showToast';

import { useProfileSettingsRepository } from '../repository/ProfileSettingsRepository';
import type {
  ChangeEmailPayload,
  DeleteAccountPayload,
  UpdatePasswordPayload,
  UpdateProfilePayload,
  VerifyEmailChangePayload,
} from '../repository/type';

export const useGetProfileSettings = () => {
  const { getProfileApi } = useProfileSettingsRepository();
  const query = useQuery({
    queryKey: ['profile-settings'],
    queryFn: () => getProfileApi().then((r: any) => r?.data ?? null),
  });
  return { ...query, profile: query.data };
};

export const useUpdateProfile = (callbacks?: { onSuccess?: () => void; onError?: () => void }) => {
  const { updateProfileApi } = useProfileSettingsRepository();
  const mutation = useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateProfileApi(payload),
    onSuccess: () => {
      callToast('Profil berhasil diperbarui!', 'success');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      callToast('Gagal memperbarui profil.', 'error');
      callbacks?.onError?.();
    },
  });
  return { execute: mutation.mutate, isLoading: mutation.isPending };
};

export const useUpdatePassword = (callbacks?: {
  onSuccess?: () => void;
  onError?: (err: any) => void;
  onValidationError?: (errors: Record<string, string>) => void;
}) => {
  const { updatePasswordApi } = useProfileSettingsRepository();
  const mutation = useMutation({
    mutationFn: (payload: UpdatePasswordPayload) => updatePasswordApi(payload),
    onSuccess: () => {
      callToast('Berhasil mengubah kata sandi.', 'success');
      callbacks?.onSuccess?.();
    },
    onError: (err: any) => {
      const errors = err?.response?.data?.errors;
      if (errors && callbacks?.onValidationError) {
        const flat: Record<string, string> = {};
        for (const key of Object.keys(errors)) {
          flat[key] = Array.isArray(errors[key]) ? errors[key][0] : errors[key];
        }
        callbacks.onValidationError(flat);
      } else {
        callToast('Terjadi kesalahan saat mengubah kata sandi.', 'error');
        callbacks?.onError?.(err);
      }
    },
  });
  return { execute: mutation.mutate, isLoading: mutation.isPending };
};

export const useChangeEmail = (callbacks?: {
  onSuccess?: (uuid?: string) => void;
  onError?: () => void;
}) => {
  const { changeEmailApi } = useProfileSettingsRepository();
  const mutation = useMutation({
    mutationFn: (payload: ChangeEmailPayload) => changeEmailApi(payload),
    onSuccess: (res: any) => {
      callbacks?.onSuccess?.(res?.data?.uuid);
    },
    onError: () => {
      callToast('Gagal mengirim verifikasi email.', 'error');
      callbacks?.onError?.();
    },
  });
  return { execute: mutation.mutate, isLoading: mutation.isPending };
};

export const useVerifyEmailChange = (callbacks?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { verifyEmailChangeApi } = useProfileSettingsRepository();
  const mutation = useMutation({
    mutationFn: (payload: VerifyEmailChangePayload) => verifyEmailChangeApi(payload),
    onSuccess: () => {
      callToast('Email berhasil diubah!', 'success');
      callbacks?.onSuccess?.();
    },
    onError: () => {
      callToast('Token tidak valid.', 'error');
      callbacks?.onError?.();
    },
  });
  return { execute: mutation.mutate, isLoading: mutation.isPending };
};

export const useDeleteAccountRequest = (callbacks?: {
  onSuccess?: (uuid?: string) => void;
  onError?: () => void;
}) => {
  const { deleteAccountRequestApi } = useProfileSettingsRepository();
  const mutation = useMutation({
    mutationFn: (payload: DeleteAccountPayload) => deleteAccountRequestApi(payload),
    onSuccess: (res: any) => {
      callbacks?.onSuccess?.(res?.data?.uuid);
    },
    onError: () => {
      callToast('Terjadi kesalahan.', 'error');
      callbacks?.onError?.();
    },
  });
  return { execute: mutation.mutate, isLoading: mutation.isPending };
};

export const useDeleteAccountConfirm = (callbacks?: {
  onSuccess?: () => void;
  onError?: () => void;
}) => {
  const { deleteAccountConfirmApi } = useProfileSettingsRepository();
  const mutation = useMutation({
    mutationFn: (payload: VerifyEmailChangePayload) => deleteAccountConfirmApi(payload),
    onSuccess: () => {
      callbacks?.onSuccess?.();
    },
    onError: () => {
      callToast('Token tidak valid.', 'error');
      callbacks?.onError?.();
    },
  });
  return { execute: mutation.mutate, isLoading: mutation.isPending };
};
