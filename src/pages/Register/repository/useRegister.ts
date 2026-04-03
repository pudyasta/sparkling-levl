import { useApiClient } from '@/lib/api/core';
import type { RegisterRequest } from './type';
import { AUTH_REGISTER_ENDPOINT } from '@/constant/route';
import { POST_METHOD } from '@/constant/api';

export const useRegisterRepo = () => {
  const { guestAPIClient } = useApiClient();

  const registerApi = (data: RegisterRequest) => {
    return guestAPIClient(AUTH_REGISTER_ENDPOINT, {
      method: POST_METHOD,
      data,
    });
  };

  return { registerApi };
};
