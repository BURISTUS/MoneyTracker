import axios, {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import i18n from '../i18n';
import { showGlobalError } from '../components/ui/Toast';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? 'http://10.0.2.2:3001/api' : '');

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

let isRedirecting = false;

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'en',
  },
  timeout: 30000,
});

const updateLanguageHeader = (config: InternalAxiosRequestConfig) => {
  config.headers['Accept-Language'] = i18n.language || 'en';
  return config;
};

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    updateLanguageHeader(config);
    if (__DEV__)
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        lang: config.headers['Accept-Language'],
      });
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    if (__DEV__)
      console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const data = error.response?.data as any;
    let message = error.message;
    if (data?.message) {
      message = Array.isArray(data.message) ? data.message.join('; ') : data.message;
    } else if (data?.error) {
      message = data.error;
    }

    if (__DEV__)
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message,
      });

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
          if (!refreshToken) {
            throw new Error('No refresh token');
          }

          const response = await axios.post<{
            token: string;
            refreshToken: string;
          }>(`${API_BASE_URL}/auth/refresh`, { refreshToken });

          const { token: newAccessToken, refreshToken: newRefreshToken } =
            response.data;

          await SecureStore.setItemAsync(AUTH_TOKEN_KEY, newAccessToken);
          await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);

          isRefreshing = false;
          onRefreshed(newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch {
          isRefreshing = false;
          refreshSubscribers = [];

          await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);

          if (!isRedirecting) {
            isRedirecting = true;
            router.replace('/auth/login');
            setTimeout(() => {
              isRedirecting = false;
            }, 2000);
            showGlobalError(i18n.t('session.expired'));
          }

          (error as any).userMessage = message;
          error.message = message;
          return Promise.reject(error);
        }
      }

      return new Promise<AxiosResponse>((resolve, reject) => {
        addRefreshSubscriber((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    if (
      error.response?.status &&
      error.response.status >= 400 &&
      error.response.status !== 401
    ) {
      showGlobalError(message);
    }

    (error as any).userMessage = message;
    error.message = message;
    return Promise.reject(error);
  },
);

export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const apiPost = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const apiPatch = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await api.patch<T>(url, data, config);
  return response.data;
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.delete<T>(url, config);
  return response.data;
};

export default api;
