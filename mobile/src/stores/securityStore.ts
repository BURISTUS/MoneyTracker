import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

export type LockMethod = 'biometric' | 'pin' | 'none';

interface SecurityState {
  isLockEnabled: boolean;
  lockMethod: LockMethod;
  pinHash: string | null;
  backgroundedAt: number | null;

  setLockEnabled: (enabled: boolean) => void;
  setLockMethod: (method: LockMethod) => void;
  setPinHash: (hash: string | null) => void;
  setBackgroundedAt: (timestamp: number | null) => void;
}

export const useSecurityStore = create<SecurityState>()(
  persist(
    (set) => ({
      isLockEnabled: false,
      lockMethod: 'none' as LockMethod,
      pinHash: null,
      backgroundedAt: null,

      setLockEnabled: (enabled) => set({ isLockEnabled: enabled }),
      setLockMethod: (method) => set({ lockMethod: method }),
      setPinHash: (hash) => set({ pinHash: hash }),
      setBackgroundedAt: (timestamp) => set({ backgroundedAt: timestamp }),
    }),
    {
      name: 'security-storage',
      partialize: (state) => ({
        isLockEnabled: state.isLockEnabled,
        lockMethod: state.lockMethod,
        pinHash: state.pinHash,
      }),
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
    },
  ),
);

export default useSecurityStore;
