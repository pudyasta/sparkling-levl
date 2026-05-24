import { POST_METHOD } from '@/constant/api';
import { AUTH_LOGIN_ENDPOINT } from '@/constant/route';
import { guestAPIClient } from '@/lib/api/core';

import type { LoginRequest } from './type';

export const useLoginRepo = () => {
  const loginApi = (data: LoginRequest) =>
    guestAPIClient(AUTH_LOGIN_ENDPOINT, { method: POST_METHOD, data });

  return { loginApi };
};
