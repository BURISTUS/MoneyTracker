import * as SecureStore from 'expo-secure-store';
import { apiGet, apiPost, apiDelete } from './api';
import type { User, AuthResponse, LoginDto, RegisterDto } from '../types';

const AUTH_TOKEN_KEY = 'authToken';

export const authService = {
  // Login
  async login(data: LoginDto): Promise<AuthResponse> {
    console.log('🔐 API login request:', data);
    const response = await apiPost<AuthResponse>('/auth/login', data);
    console.log('✅ API login response:', response);
    console.log('💾 Saving token to SecureStore');
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    console.log('✅ Token saved');
    return response;
  },

  // Register
  async register(data: RegisterDto): Promise<AuthResponse> {
    console.log('🔐 API register request:', data);
    const response = await apiPost<AuthResponse>('/auth/register', data);
    console.log('✅ API register response:', response);
    console.log('💾 Saving token to SecureStore');
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, response.token);
    console.log('✅ Token saved');
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
    console.log('👤 API get current user request');
    const user = await apiGet<User>('/auth/me');
    console.log('✅ API get current user response:', user);
    return user;
  },

  // Check if logged in
  async isLoggedIn(): Promise<boolean> {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    console.log('🔑 Token exists:', !!token);
    return !!token;
  },

  // Get token
  async getToken(): Promise<string | null> {
    const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
    console.log('🔑 Retrieved token:', !!token);
    return token;
  },

  // Clear auth data
  async clearAuth(): Promise<void> {
    await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  },
};

export default authService;
