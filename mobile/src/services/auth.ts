import * as SecureStore from 'expo-secure-store';
import { apiGet, apiPost, apiDelete } from './api';
import type { User, AuthResponse, LoginDto, RegisterDto } from '../types';

const AUTH_TOKEN_KEY = 'authToken';

export const authService = {
  // Login
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>('/auth/login', data);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    return response;
  },

  // Register
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiPost<AuthResponse>('/auth/register', data);
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    return response;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await apiPost('/auth/logout');
    } finally {
      await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    return apiGet<User>('/auth/me');
  },

  // Check if logged in
  async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    return !!token;
  },

  // Get token
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },

  // Clear auth data
  async clearAuth(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  },
};

export default authService;
