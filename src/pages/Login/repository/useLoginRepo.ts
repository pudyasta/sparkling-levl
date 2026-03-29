import { POST_METHOD } from '@/constant/api';
import { useApiClient } from '@/lib/api/core';
import type { LoginRequest } from './type';
import { AUTH_LOGIN_ENDPOINT } from '@/constant/route';

export const useLoginRepo = () => {
  const { guestAPIClient } = useApiClient();

  const loginApi = (data: LoginRequest) => {
    return guestAPIClient(AUTH_LOGIN_ENDPOINT, {
      method: POST_METHOD,
      data,
      timeout: 8000,
    });
  };

  return { loginApi };
};
