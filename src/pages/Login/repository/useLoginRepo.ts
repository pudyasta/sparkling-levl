import { POST_METHOD } from '@/constant/api';
import { AUTH_LOGIN_ENDPOINT } from '@/constant/route';
import { useApiClient } from '@/lib/api/core';

import type { LoginRequest } from './type';

export const useLoginRepo = () => {
  const { api } = useApiClient();

  const loginApi = (data: LoginRequest) => {
    const res = api(AUTH_LOGIN_ENDPOINT, {
      method: POST_METHOD,
      data,
    });
    return res;
  };

  return { loginApi };
};
