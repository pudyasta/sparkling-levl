import axios, { type AxiosRequestConfig } from 'axios';

import { API_BASE_URL } from '@/constant/api';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import { callToast } from '../helper/showToast';
import { refreshTokenApi } from './refresh';

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
      ...(accessToken?.access_token
        ? { Authorization: `Bearer ${accessToken.access_token}` }
        : {}),
    };

    let res;
    try {
      res = await instance.request({ url, ...config, headers, validateStatus: () => true });
    } catch (err) {
      if (isTimeout(err)) {
        callToast('Terjadi kendala dalam koneksi.', 'error');
        return;
      }
      throw err;
    }

    if (res.status !== 401) return res;

    if (!accessToken?.refresh_token) {
      navigateTo('/(auth)/login', { replace: true });
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
    } catch (err) {
      if (isTimeout(err)) {
        callToast('Terjadi kendala dalam koneksi.', 'error');
        return;
      }
    }
  };

  const guestAPIClientAuth = async (url: string, config: AxiosRequestConfig = {}) => {
    try {
      return await instance.request({ url, ...config });
    } catch (error) {
      throw error;
    }
  };

  return { api, guestAPIClient: guestAPIClientAuth };
};
