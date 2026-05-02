import axios, { type AxiosRequestConfig } from 'axios';
import { router } from 'expo-router';

import { API_BASE_URL, POST_METHOD } from '@/constant/api';
import { AUTH_REFRESH_ENDPOINT } from '@/constant/route';
import { useAuth } from '@/context/AuthContext';
import type { Token } from '@/types/auth';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta: null | Record<string, unknown>;
  errors: null | Record<string, unknown>;
}

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

export const guestAPIClient = async (url: string, config: AxiosRequestConfig = {}) => {
  const response = await instance.request({
    url,
    headers: { 'Content-Type': 'application/json' },
    ...config,
  });
  return response;
};

export const useApiClient = () => {
  const { accessToken, setAccessToken } = useAuth();

  const api = async (url: string, config: AxiosRequestConfig = {}) => {
    const headers = {
      ...(config.headers || {}),
      ...(accessToken?.access_token
        ? { Authorization: `Bearer ${accessToken.access_token}` }
        : {}),
    };

    let res = await instance.request({
      url,
      ...config,
      headers,
      validateStatus: () => true,
    });

    if (res.status !== 401) return res;

    if (!accessToken?.refresh_token) {
      router.replace('/(auth)/login');
      return res;
    }

    try {
      const newToken = await refreshTokenApi(accessToken.refresh_token);
      if (!newToken?.data?.access_token) throw new Error('Refresh failed');

      setAccessToken(newToken.data);

      return await instance.request({
        url,
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${newToken.data.access_token}`,
        },
      });
    } catch {
      router.replace('/(auth)/login');
      return res;
    }
  };

  const guestClient = async (url: string, config: AxiosRequestConfig = {}) => {
    const response = await instance.request({ url, ...config });
    return response;
  };

  return { api, guestAPIClient: guestClient };
};
