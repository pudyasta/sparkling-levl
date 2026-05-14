import { DELETE_METHOD, GET_METHOD, POST_METHOD, PUT_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

import type {
  ChangeEmailPayload,
  DeleteAccountPayload,
  UpdatePasswordPayload,
  UpdateProfilePayload,
  VerifyEmailChangePayload,
} from './type';

const EP = {
  PROFILE: '/profile',
  PASSWORD: '/profile/password',
  EMAIL_CHANGE: '/profile/email/change',
  EMAIL_VERIFY: '/profile/email/change/verify',
  DELETE_REQUEST: '/profile/account/delete/request',
  DELETE_CONFIRM: '/profile/account/delete/confirm',
};

export const useProfileSettingsRepository = () => {
  const { api } = useApiClient();

  return {
    getProfileApi: () =>
      api(EP.PROFILE, { method: GET_METHOD }).then((r: any) => r?.data),

    updateProfileApi: (payload: UpdateProfilePayload) =>
      api(EP.PROFILE, { method: PUT_METHOD, data: payload }).then((r: any) => r?.data),

    updatePasswordApi: (payload: UpdatePasswordPayload) =>
      api(EP.PASSWORD, { method: PUT_METHOD, data: payload }).then((r: any) => r?.data),

    changeEmailApi: (payload: ChangeEmailPayload) =>
      api(EP.EMAIL_CHANGE, { method: POST_METHOD, data: payload }).then((r: any) => r?.data),

    verifyEmailChangeApi: (payload: VerifyEmailChangePayload) =>
      api(EP.EMAIL_VERIFY, { method: POST_METHOD, data: payload }).then((r: any) => r?.data),

    deleteAccountRequestApi: (payload: DeleteAccountPayload) =>
      api(EP.DELETE_REQUEST, { method: POST_METHOD, data: payload }).then((r: any) => r?.data),

    deleteAccountConfirmApi: (payload: VerifyEmailChangePayload) =>
      api(EP.DELETE_CONFIRM, { method: POST_METHOD, data: payload }).then((r: any) => r?.data),
  };
};
