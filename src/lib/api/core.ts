import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { API_BASE_URL, POST_METHOD } from '@/constant/api';
import { AUTH_REFRESH_ENDPOINT } from '@/constant/route';
import { useNativeBridge } from '@/context/NativeBridgeProvider';
import type { Token } from '@/pages/Login/repository/type';

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
  console.log('API', refreshToken);
  const response = await guestAPIClient(AUTH_REFRESH_ENDPOINT, {
    method: POST_METHOD,
    data: { refresh_token: refreshToken },
  });
  return response.data;
};

export const guestAPIClient = async (url: string, config: AxiosRequestConfig = {}) => {
  console.log('response ini', JSON.stringify(config, null, 2));

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

  const api = async (url: string, config: AxiosRequestConfig = {}) => {
    const headers = {
      ...(config.headers || {}),
      ...(accessToken?.access_token ? { Authorization: `Bearer ${accessToken.access_token}` } : {}),
    };

    // -------- 1st try (normal request)
    let res = await instance.request({
      url,
      ...config,
      headers,
      validateStatus: () => true,
    });

    // -------- If 401 & refresh token null → redirect to login
    if (res.status !== 401) return res;
    // -------- Handle 401: If no refresh token, we can't proceed this request
    if (!accessToken?.refresh_token) {
      console.log('Access token', JSON.stringify(accessToken, null, 2));
      navigateTo('login.lynx.bundle');
      return res;
    }

    /**
    |--------------------------------------------------
    | AUTO LOGIN 
    |--------------------------------------------------
    */
    try {
      const newToken = await refreshTokenApi(accessToken.refresh_token);

      if (!newToken?.data?.access_token) {
        throw new Error('Refresh failed');
      }

      // -------- Update access token
      console.log('newToken', newToken);
      setAccessToken(newToken.data);

      // -------- Final Retry with the brand-new token
      return await instance.request({
        url,
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: `Bearer ${newToken.data.access_token}`,
        },
      });
    } catch (err) {
      console.log('error Refresh', JSON.stringify(err, null, 2));
      // setAccessToken(null);
      // navigateTo('login.lynx.bundle');
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
