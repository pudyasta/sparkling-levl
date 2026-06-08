import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { API_BASE_URL, POST_METHOD } from '@/constant/api';
import {
  AUTH_LOGIN_ENDPOINT,
  AUTH_REFRESH_ENDPOINT,
  AUTH_REGISTER_ENDPOINT,
} from '@/constant/route';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import type { Token } from '@/pages/Login/repository/type';

import { callToast } from '../helper/showToast';

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
  const response = await guestAPIClient(AUTH_REFRESH_ENDPOINT, {
    method: POST_METHOD,
    data: { refresh_token: refreshToken },
  });
  return response.data;
};

export const guestAPIClient = async (url: string, config: AxiosRequestConfig = {}) => {
  try {
    const response = await instance.request({
      url,
      headers: { 'Content-Type': 'application/json' },
      ...config,
    });

    return response;
  } catch (error) {
    throw error;
  }
};

export const useApiClient = () => {
  const { accessToken, setAccessToken, navigateTo } = useNativeBridge();
  const isTimeout = (err: unknown) =>
    axios.isAxiosError(err) && (err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED');
  const api = async (url: string, config: AxiosRequestConfig = {}) => {
    const headers = {
      ...(config.headers || {}),
      ...(accessToken?.access_token ? { Authorization: `Bearer ${accessToken.access_token}` } : {}),
    };

    // -------- 1st try (normal request)
    let res;
    try {
      res = await instance.request({ url, ...config, headers, validateStatus: () => true });
      console.log('APIII', JSON.stringify(res, null, 2));
    } catch (err) {
      if (isTimeout(err)) {
        callToast('Terjadi kendala dalam koneksi.', 'error');
        return;
      }
      throw err;
    }

    // -------- If 401 & refresh token null → redirect to login
    if (res.status !== 401 || url == AUTH_REGISTER_ENDPOINT || url == AUTH_LOGIN_ENDPOINT)
      return res;
    // -------- Handle 401: If no refresh token, we can't proceed this request
    if (!accessToken?.refresh_token) {
      navigateTo('login');
      return res;
    }

    /**
    |--------------------------------------------------
    | AUTO LOGIN 
    |--------------------------------------------------
    */
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
    } catch (err) {
      if (isTimeout(err)) {
        callToast('Terjadi kendala dalam koneksi.', 'error');
        return;
      }
      // navigateTo('login');
    }
  };

  const guestAPIClient = async (url: string, config: AxiosRequestConfig = {}) => {
    try {
      const response = await instance.request({
        url,
        ...config,
      });

      return response;
    } catch (error) {
      throw error;
    }
  };

  return { api, guestAPIClient };
};
