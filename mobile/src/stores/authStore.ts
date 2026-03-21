import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import authService from '../services/auth';
import type { User, UserGamification } from '../types';

interface AuthState {
  user: User | null;
  gamification: UserGamification | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setGamification: (gamification: UserGamification | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Auth actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; hourlyRate?: number }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateHourlyRate: (hourlyRate: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      gamification: null,
      isLoading: false,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setGamification: (gamification) => set({ gamification }),
      setLoading: (isLoading) => set({ isLoading }),
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user } = await authService.login({ email, password });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async ({ email, password, name, hourlyRate }) => {
        set({ isLoading: true });
        try {
          const { user } = await authService.register({ email, password, name, hourlyRate });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } finally {
          set({ user: null, gamification: null, isAuthenticated: false, isLoading: false });
        }
      },
      
      checkAuth: async () => {
        const isLoggedIn = await authService.isLoggedIn();
        if (!isLoggedIn) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          await authService.clearAuth();
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
      
      updateHourlyRate: (hourlyRate) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, hourlyRate } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => {
          const item = await SecureStore.getItemAsync(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: async (name, value) => {
          await SecureStore.setItemAsync(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await SecureStore.deleteItemAsync(name);
        },
      })),
    }
  )
);

export default useAuthStore;
