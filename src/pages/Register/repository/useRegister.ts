import { POST_METHOD } from '@/constant/api';
import { AUTH_REGISTER_ENDPOINT } from '@/constant/route';
import { useApiClient } from '@/lib/api/core';

import type { RegisterRequest } from './type';

export const useRegisterRepo = () => {
  const { api } = useApiClient();

  const registerApi = (data: RegisterRequest) => {
    const res = api(AUTH_REGISTER_ENDPOINT, {
      method: POST_METHOD,
      data,
    });
    return res;
  };

  return { registerApi };
};
