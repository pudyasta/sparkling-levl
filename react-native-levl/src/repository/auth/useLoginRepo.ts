import { guestAPIClient } from '@/lib/api/core';
import { POST_METHOD } from '@/constant/api';
import { AUTH_LOGIN_ENDPOINT } from '@/constant/route';
import type { LoginRequest } from '@/types/auth';

export const useLoginRepo = () => {
  const loginApi = async (data: LoginRequest) => {
    const response = await guestAPIClient(AUTH_LOGIN_ENDPOINT, {
      method: POST_METHOD,
      data,
    });
    return response;
  };

  return { loginApi };
};
