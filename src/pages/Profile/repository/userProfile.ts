import { DELETE_METHOD, GET_METHOD, POST_METHOD, PUT_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

import type {
  AvatarUploadResponse,
  ChangeEmailPayload,
  DeleteAccountPayload,
  DeleteAccountResponse,
  EmailChangeResponse,
  EmptyApiResponse,
  GetPrivacyResponse,
  GetProfileResponse,
  RestoreAccountPayload,
  UpdatePasswordPayload,
  UpdatePrivacyPayload,
  UpdatePrivacyResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
  VerifyEmailChangePayload,
} from './type';

const EP = {
  PROFILE: '/profile',
  AVATAR: '/profile/avatar',
  PASSWORD: '/profile/password',
  EMAIL_CHANGE: '/profile/email/change',
  EMAIL_VERIFY: '/profile/email/change/verify',
  PRIVACY: '/profile/privacy',
  DELETE_REQUEST: '/profile/account/delete/request',
  DELETE_CONFIRM: '/profile/account/delete/confirm',
  RESTORE: '/profile/account/restore',
};

export const useProfileRepo = () => {
  const { api } = useApiClient();

  const getProfileApi = async (): Promise<GetProfileResponse> => {
    const res = await api(EP.PROFILE, { method: GET_METHOD });
    return res?.data;
  };

  const updateProfileApi = async (
    payload: UpdateProfilePayload
  ): Promise<UpdateProfileResponse> => {
    const res = await api(EP.PROFILE, { method: PUT_METHOD, data: payload });
    return res?.data;
  };

  const uploadAvatarApi = async (
    fileUri: string,
    fileName: string,
    mimeType: string
  ): Promise<AvatarUploadResponse> => {
    // Avatar uses multipart — delegate to NativeFileUploader via pipe.call on JS side
    // This repo method is a placeholder; actual call goes through native module
    throw new Error('Use pipe.call FileUploader.uploadFile for avatar uploads');
  };

  const deleteAvatarApi = async (): Promise<EmptyApiResponse> => {
    const res = await api(EP.AVATAR, { method: DELETE_METHOD });
    return res?.data;
  };

  const updatePasswordApi = async (payload: UpdatePasswordPayload): Promise<EmptyApiResponse> => {
    const res = await api(EP.PASSWORD, { method: PUT_METHOD, data: payload });
    return res?.data;
  };

  const changeEmailApi = async (payload: ChangeEmailPayload): Promise<EmailChangeResponse> => {
    const res = await api(EP.EMAIL_CHANGE, { method: POST_METHOD, data: payload });
    return res?.data;
  };

  const verifyEmailChangeApi = async (
    payload: VerifyEmailChangePayload
  ): Promise<EmptyApiResponse> => {
    const res = await api(EP.EMAIL_VERIFY, { method: POST_METHOD, data: payload });
    return res?.data;
  };

  const getPrivacyApi = async (): Promise<GetPrivacyResponse> => {
    const res = await api(EP.PRIVACY, { method: GET_METHOD });
    return res?.data;
  };

  const updatePrivacyApi = async (
    payload: UpdatePrivacyPayload
  ): Promise<UpdatePrivacyResponse> => {
    const res = await api(EP.PRIVACY, { method: PUT_METHOD, data: payload });
    return res?.data;
  };

  const deleteAccountRequestApi = async (
    payload: DeleteAccountPayload
  ): Promise<DeleteAccountResponse> => {
    const res = await api(EP.DELETE_REQUEST, { method: POST_METHOD, data: payload });
    return res?.data;
  };

  const deleteAccountConfirmApi = async (
    payload: VerifyEmailChangePayload
  ): Promise<EmptyApiResponse> => {
    const res = await api(EP.DELETE_CONFIRM, { method: POST_METHOD, data: payload });
    return res?.data;
  };

  const restoreAccountApi = async (payload: RestoreAccountPayload): Promise<EmptyApiResponse> => {
    const res = await api(EP.RESTORE, { method: POST_METHOD, data: payload });
    return res?.data;
  };

  return {
    getProfileApi,
    updateProfileApi,
    uploadAvatarApi,
    deleteAvatarApi,
    updatePasswordApi,
    changeEmailApi,
    verifyEmailChangeApi,
    getPrivacyApi,
    updatePrivacyApi,
    deleteAccountRequestApi,
    deleteAccountConfirmApi,
    restoreAccountApi,
  };
};
