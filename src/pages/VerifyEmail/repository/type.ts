import type { ApiResponse } from '@/lib/api/core';
import type { User } from '@/pages/Login/repository/type';

export interface VerifyEmailPayload {
  uuid: string;
  token: string;
}

export interface VerifyEmailData {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
  message: string | null;
}

export type VerifyEmailResponse = ApiResponse<VerifyEmailData>;
