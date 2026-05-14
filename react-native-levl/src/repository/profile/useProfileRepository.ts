import { DELETE_METHOD, GET_METHOD, POST_METHOD, PUT_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

export const useProfileRepository = () => {
  const { api } = useApiClient();

  const getProfileApi = async () => {
    const res = await api('/profile', { method: GET_METHOD });
    return res?.data;
  };

  const updateProfileApi = async (payload: {
    name: string;
    phone?: string;
    bio?: string;
    location?: string;
  }) => {
    const res = await api('/profile', { method: PUT_METHOD, data: payload });
    return res?.data;
  };

  const updatePasswordApi = async (payload: {
    current_password: string;
    new_password: string;
    new_password_confirmation: string;
  }) => {
    const res = await api('/profile/password', { method: PUT_METHOD, data: payload });
    return res?.data;
  };

  const changeEmailApi = async (payload: { new_email: string }) => {
    const res = await api('/profile/email/change', { method: POST_METHOD, data: payload });
    return res?.data;
  };

  const verifyEmailChangeApi = async (payload: { uuid: string; token: string }) => {
    const res = await api('/profile/email/change/verify', { method: POST_METHOD, data: payload });
    return res?.data;
  };

  const deleteAccountRequestApi = async (payload: { password: string }) => {
    const res = await api('/profile/account/delete/request', { method: POST_METHOD, data: payload });
    return res?.data;
  };

  const deleteAccountConfirmApi = async (payload: { uuid: string; token: string }) => {
    const res = await api('/profile/account/delete/confirm', { method: POST_METHOD, data: payload });
    return res?.data;
  };

  return {
    getProfileApi,
    updateProfileApi,
    updatePasswordApi,
    changeEmailApi,
    verifyEmailChangeApi,
    deleteAccountRequestApi,
    deleteAccountConfirmApi,
  };
};
