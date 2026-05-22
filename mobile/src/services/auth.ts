import * as SecureStore from 'expo-secure-store';
import { apiGet, apiPost } from './api';
import type { User, AuthResponse, LoginDto, RegisterDto } from '../types';

const AUTH_TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const authService = {
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>('/auth/login', data);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
    return response;
  },

  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>('/auth/register', data);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
    return response;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      await apiPost('/auth/logout', { refreshToken });
    } finally {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  },

  async refreshTokens(): Promise<AuthResponse | null> {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return null;

    try {
      const response = await apiPost<AuthResponse>('/auth/refresh', {
        refreshToken,
      });
      await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.refreshToken);
      return response;
    } catch {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      return null;
    }
  },

  async getCurrentUser(): Promise<User> {
    const user = await apiGet<User>('/auth/me');
    return user;
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return !!token;
  },

  async getToken(): Promise<string | null> {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return token;
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async clearAuth(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};

export default authService;
