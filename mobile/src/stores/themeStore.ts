import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../utils/safeAsyncStorage';

// ============================================================
// Color palettes
// ============================================================

const DARK = {
  bg: '#0A0A0F',
  card: '#141418',
  border: 'rgba(255,255,255,0.08)',
  textMain: '#F5F5F5',
  textSec: '#8C8C8C',
  textMuted: '#52525B',
  primary: '#6366F1',
  primaryBg: 'rgba(99,102,241,0.1)',
  primaryBorder: 'rgba(99,102,241,0.2)',
  red: '#FF3B30',
  redBg: 'rgba(255,59,48,0.08)',
  redBorder: 'rgba(255,59,48,0.15)',
  green: '#34C759',
  greenBg: 'rgba(52,199,89,0.1)',
  greenBorder: 'rgba(52,199,89,0.2)',
  orange: '#FB9554',
  orangeBg: 'rgba(251,149,84,0.12)',
  orangeBorder: 'rgba(251,149,84,0.2)',
  yellow: '#FBBF24',
  amber: '#FF9500',
  inputBg: 'rgba(255,255,255,0.05)',
  sheet: '#13131A',
  overlay: 'rgba(0,0,0,0.7)',
  handle: 'rgba(255,255,255,0.15)',
  divider: 'rgba(255,255,255,0.06)',
  heroRate: '#6366F1',
  expenseBar: { track: 'rgba(255,255,255,0.08)', over: '#F87171', warn: '#FBBF24', ok: '#34D399' },
  tabBar: 'rgba(17,17,24,0.92)',
  tabBarBorder: 'rgba(255,255,255,0.06)',
  tabActive: '#818CF8',
  tabInactive: '#71717A',
};

const LIGHT = {
  bg: '#F5F1EB',
  card: '#FFFFFF',
  border: 'rgba(0,0,0,0.08)',
  textMain: '#1C1917',
  textSec: '#78716C',
  textMuted: '#A8A29E',
  primary: '#D97706',
  primaryBg: 'rgba(217,119,6,0.08)',
  primaryBorder: 'rgba(217,119,6,0.2)',
  red: '#DC2626',
  redBg: 'rgba(220,38,38,0.06)',
  redBorder: 'rgba(220,38,38,0.15)',
  green: '#059669',
  greenBg: 'rgba(5,150,105,0.08)',
  greenBorder: 'rgba(5,150,105,0.2)',
  orange: '#D97706',
  orangeBg: 'rgba(217,119,6,0.08)',
  orangeBorder: 'rgba(217,119,6,0.2)',
  yellow: '#B45309',
  amber: '#D97706',
  inputBg: 'rgba(0,0,0,0.04)',
  sheet: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.3)',
  handle: 'rgba(0,0,0,0.12)',
  divider: 'rgba(0,0,0,0.06)',
  heroRate: '#D97706',
  expenseBar: { track: 'rgba(0,0,0,0.06)', over: '#DC2626', warn: '#D97706', ok: '#059669' },
  tabBar: 'rgba(255,255,255,0.92)',
  tabBarBorder: 'rgba(0,0,0,0.08)',
  tabActive: '#D97706',
  tabInactive: '#A8A29E',
};

export type ThemeColors = typeof DARK;

interface ThemeState {
  isDark: boolean;
  colors: ThemeColors;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      colors: DARK,
      toggle: () =>
        set((s) => ({
          isDark: !s.isDark,
          colors: !s.isDark ? DARK : LIGHT,
        })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({ isDark: state.isDark }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.colors = state.isDark ? DARK : LIGHT;
        }
      },
    },
  ),
);

// Convenience hook
export function useTheme() {
  return useThemeStore((s) => s.colors);
}
