import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuth } from '@/context/AuthProvider';
import { API_BASE_URL, POST_METHOD } from '@/constant/api';
import { useEffect } from '@lynx-js/react';
import { AUTH_REFRESH_ENDPOINT } from '@/constant/route';
import type { AuthResponse } from '@/pages/Login/repository/type';

const instance = axios.create({
  baseURL: API_BASE_URL,
  // headers: { 'Content-Type': 'application/json' },
});

export const refreshTokenApi = async (refreshToken: string): Promise<AuthResponse> => {
  const response = await guestAPIClient(AUTH_REFRESH_ENDPOINT, {
    method: POST_METHOD,
    data: { refresh_token: refreshToken },
  });
  return response.data;
};

export const guestAPIClient = async (url: string, config: AxiosRequestConfig = {}) => {
  const start = Date.now();

  try {
    const response = await instance.request({
      url,
      ...config,
      // Temporarily remove this to see if Axios catch block triggers faster
      validateStatus: (status) => status >= 200 && status < 300,
    });

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const useApiClient = () => {
  const { accessToken, setAccessToken } = useAuth();

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
      console.log(accessToken);
      // navigate('/login');
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
      setAccessToken({
        ...accessToken,
        access_token: newToken.data.access_token,
        refresh_token: newToken.data.refresh_token,
      });

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
      // If refresh fails, the session is dead. Log out the user.
      setAccessToken(null);
      console.log(err);
      // navigate('/login');
      return res;
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
      console.log(error);
      throw error;
    }
  };

  return { api, guestAPIClient };
};
