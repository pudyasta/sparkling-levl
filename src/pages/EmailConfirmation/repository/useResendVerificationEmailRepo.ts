import { POST_METHOD } from '@/constant/api';
import {
  AUTH_RESEND_VERIFY_EMAIL_ENDPOINT,
  AUTH_VERIFY_EMAIL_ENDPOINT,
} from '@/constant/route';
import { useApiClient } from '@/lib/api/core';

export const useResendVerificationEmailRepo = () => {
  const { api } = useApiClient();

  const resendVerificationEmailApi = () => {
    return api(AUTH_RESEND_VERIFY_EMAIL_ENDPOINT, {
      method: POST_METHOD,
    });
  };

  return { resendVerificationEmailApi };
};
