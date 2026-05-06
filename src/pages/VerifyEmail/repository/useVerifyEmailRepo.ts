import { POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';

import type { VerifyEmailPayload, VerifyEmailResponse } from './type';

const VERIFY_EMAIL_ENDPOINT = '/auth/email/verify';

export const useVerifyEmailRepo = () => {
  const { api } = useApiClient();

  const verifyEmailApi = async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
    const res = await api(VERIFY_EMAIL_ENDPOINT, {
      method: POST_METHOD,
      data: payload,
    });
    return res?.data;
  };

  return { verifyEmailApi };
};
