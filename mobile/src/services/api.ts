import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import i18n from '../i18n';
import { showGlobalError } from '../components/ui/Toast';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || (__DEV__ ? 'http://10.0.2.2:3001/api' : '');

let isRedirecting = false;

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
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    updateLanguageHeader(config);
    if (__DEV__) console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      lang: config.headers['Accept-Language'],
    });
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => {
    if (__DEV__) console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  async (error: AxiosError) => {
    // Extract human-readable message from NestJS error format
    const data = error.response?.data as any;
    let message = error.message;
    if (data?.message) {
      message = Array.isArray(data.message) ? data.message.join('; ') : data.message;
    } else if (data?.error) {
      message = data.error;
    }

      if (__DEV__) console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message,
    });

    // Show toast for 4xx/5xx errors (except 401 which is handled separately)
    if (error.response?.status && error.response.status >= 400 && error.response.status !== 401) {
      showGlobalError(message);
    }

    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      await SecureStore.deleteItemAsync('authToken');
      if (__DEV__) console.log('🔄 Token expired, redirecting to login');
      router.replace('/auth/login');
      setTimeout(() => { isRedirecting = false; }, 2000);
      showGlobalError(i18n.t('session.expired'));
    }

    // Enrich error with parsed message — so catch(e) blocks see readable text
    (error as any).userMessage = message;
    error.message = message;
    return Promise.reject(error);
  }
);

// Helper functions for API calls
export const apiGet = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const apiPost = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const apiPatch = async <T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> => {
  const response = await api.patch<T>(url, data, config);
  return response.data;
};

export const apiDelete = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.delete<T>(url, config);
  return response.data;
};

export default api;
