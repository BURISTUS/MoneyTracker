import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import i18n from '../i18n';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/api';

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
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      hasToken: !!token,
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
    console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;
      await SecureStore.deleteItemAsync('authToken');
      console.log('🔄 Token expired, redirecting to login');
      router.replace('/auth/login');
      setTimeout(() => { isRedirecting = false; }, 2000);
    }
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
