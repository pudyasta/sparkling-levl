import { guestAPIClient } from '@/lib/api/core';
import { POST_METHOD } from '@/constant/api';
import { AUTH_REGISTER_ENDPOINT, AUTH_RESEND_VERIFY_EMAIL_ENDPOINT } from '@/constant/route';
import type { RegisterRequest } from '@/types/auth';

export const useRegisterRepo = () => {
  const registerApi = async (data: RegisterRequest) => {
    const response = await guestAPIClient(AUTH_REGISTER_ENDPOINT, {
      method: POST_METHOD,
      data,
    });
    return response;
  };

  const resendVerificationEmailApi = async (email: string) => {
    const response = await guestAPIClient(AUTH_RESEND_VERIFY_EMAIL_ENDPOINT, {
      method: POST_METHOD,
      data: { email },
    });
    return response;
  };

  return { registerApi, resendVerificationEmailApi };
};
