import { POST_METHOD } from '@/constant/api';
import { AUTH_REGISTER_ENDPOINT } from '@/constant/route';
import { guestAPIClient } from '@/lib/api/core';

import type { RegisterRequest } from './type';

export const useRegisterRepo = () => {
  const registerApi = (data: RegisterRequest) =>
    guestAPIClient(AUTH_REGISTER_ENDPOINT, { method: POST_METHOD, data });

  return { registerApi };
};
