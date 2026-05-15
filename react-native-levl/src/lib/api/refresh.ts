import { API_BASE_URL, POST_METHOD } from '@/constant/api';
import { AUTH_REFRESH_ENDPOINT } from '@/constant/route';
import axios from 'axios';
import type { ApiResponse } from './core';
import type { Token } from '@/pages/Login/repository/type';

const instance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const refreshTokenApi = async (refreshToken: string): Promise<ApiResponse<Token>> => {
  const response = await instance.request({
    url: AUTH_REFRESH_ENDPOINT,
    method: POST_METHOD,
    data: { refresh_token: refreshToken },
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};
