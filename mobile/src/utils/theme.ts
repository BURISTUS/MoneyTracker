/**
 * Money Tracker — Theme System
 * 
 * Modern color palette (2024-2026) based on design-system.ts
 * Dark mode first with warm accents
 */

// Re-export new design system colors
export { darkColors, lightColors } from './design-system';
export { 
  spacing, 
  borderRadius, 
  fontSize, 
  fontWeight,
  shadows,
  animation,
  springConfig,
  springConfigBouncy,
  STATUS_LABELS,
  WISHLIST_STATUS_LABELS,
  TRANSACTION_TYPE_CONFIG,
  ACCOUNT_TYPE_CONFIG,
} from './design-system';

// Theme colors interface (backwards compatible + modern additions)
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  backgroundTertiary: string;
  surface: string;
  surfaceElevated: string;
  surfaceHighlight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  border: string;
  borderLight: string;
  divider: string;
  error: string;
  success: string;
  successLight: string;
  warning: string;
  info: string;
  danger: string;
  xpGold: string;
  streakFire: string;
  gradientPrimary: [string, string];
  // Modern accent colors
  accent: string;
  accentLight: string;
  // Glow colors
  glowPrimary: string;
  glowAccent: string;
  // Life Cost specific
  lifeCost: string;
  lifeCostBg: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'milestone' | 'streak' | 'challenge' | 'special';
  requirement: number;
  xpReward: number;
  icon: string;
}

// Backwards compatible theme exports
// These are now based on the new modern palette
export const lightTheme: ThemeColors = {
  primary: '#4F46E5', // indigo-600
  secondary: '#7C3AED', // violet
  background: '#FAFAFA',
  backgroundTertiary: '#F4F4F5',
  surface: '#FFFFFF',
  surfaceElevated: '#F4F4F5',
  surfaceHighlight: '#E4E4E7',
  text: '#18181B',
  textSecondary: '#52525B',
  textTertiary: '#A1A1AA',
  textDisabled: '#D4D4D8',
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  divider: '#F4F4F5',
  error: '#DC2626',
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.15)',
  warning: '#D97706',
  info: '#0284C7',
  danger: '#DC2626',
  xpGold: '#CA8A04',
  streakFire: '#EA580C',
  gradientPrimary: ['#4F46E5', '#7C3AED'],
  accent: '#DB2777',
  accentLight: '#EC4899',
  glowPrimary: 'rgba(79, 70, 229, 0.2)',
  glowAccent: 'rgba(219, 39, 119, 0.2)',
  lifeCost: '#DB2777',
  lifeCostBg: 'rgba(219, 39, 119, 0.1)',
};

export const darkTheme: ThemeColors = {
  primary: '#6366F1', // indigo-500
  secondary: '#8B5CF6', // violet-500
  background: '#09090B',
  backgroundTertiary: '#27272A',
  surface: '#18181B',
  surfaceElevated: '#27272A',
  surfaceHighlight: '#3F3F46',
  text: '#FAFAFA',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  textDisabled: '#52525B',
  border: '#3F3F46',
  borderLight: '#27272A',
  divider: '#27272A',
  error: '#F87171',
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.15)',
  warning: '#FBBF24',
  info: '#38BDF8',
  danger: '#F87171',
  xpGold: '#FFD700',
  streakFire: '#FF6B35',
  gradientPrimary: ['#6366F1', '#8B5CF6'],
  accent: '#F472B6',
  accentLight: '#F9A8D4',
  glowPrimary: 'rgba(99, 102, 241, 0.4)',
  glowAccent: 'rgba(244, 114, 182, 0.4)',
  lifeCost: '#F472B6',
  lifeCostBg: 'rgba(244, 114, 182, 0.15)',
};

// Gamification utilities
export function getLevelForXP(xp: number): number {
  // Each level requires 1000 XP
  return Math.floor(xp / 1000) + 1;
}

export function getXPForLevel(level: number, currentXP: number): { progress: number; next: number; current: number } {
  const xpForCurrentLevel = (level - 1) * 1000;
  const xpForNextLevel = level * 1000;
  const currentLevelXP = currentXP - xpForCurrentLevel;
  const nextLevelXP = xpForNextLevel - xpForCurrentLevel;
  
  return {
    progress: currentLevelXP / nextLevelXP,
    next: xpForNextLevel - currentXP,
    current: currentLevelXP,
  };
}

// Achievement data
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    title: 'Первый шаг',
    description: 'Добавьте первую транзакцию',
    type: 'milestone',
    requirement: 1,
    xpReward: 50,
    icon: 'flag',
  },
  {
    id: '2',
    title: 'Накопитель',
    description: 'Накопите 10 000 ₽',
    type: 'milestone',
    requirement: 10000,
    xpReward: 100,
    icon: 'wallet',
  },
  {
    id: '3',
    title: 'Недельная серия',
    description: 'Добавляйте транзакции 7 дней подряд',
    type: 'streak',
    requirement: 7,
    xpReward: 150,
    icon: 'flame',
  },
  {
    id: '4',
    title: 'Месячная серия',
    description: 'Добавляйте транзакции 30 дней подряд',
    type: 'streak',
    requirement: 30,
    xpReward: 500,
    icon: 'flame',
  },
  {
    id: '5',
    title: 'Мастер бюджета',
    description: 'Создайте 5 бюджетов',
    type: 'challenge',
    requirement: 5,
    xpReward: 200,
    icon: 'calculator',
  },
  {
    id: '6',
    title: 'Ранний пташка',
    description: 'Добавьте транзакцию до 9 утра',
    type: 'challenge',
    requirement: 1,
    xpReward: 75,
    icon: 'sunny',
  },
  {
    id: '7',
    title: 'Аналитик',
    description: 'Просмотрите 10 отчетов',
    type: 'challenge',
    requirement: 10,
    xpReward: 150,
    icon: 'chart-bar',
  },
  {
    id: '8',
    title: 'VIP',
    description: 'Пользователь приложения 1 год',
    type: 'special',
    requirement: 365,
    xpReward: 1000,
    icon: 'star',
  },
];

// Type colors for achievements (modernized)
export const typeColors = {
  milestone: '#6366F1', // indigo
  streak: '#F472B6', // pink
  challenge: '#FFD700', // gold
  special: '#8B5CF6', // violet
};

// Type icons for achievements
export const typeIcons = {
  milestone: 'flag',
  streak: 'flame',
  challenge: 'trophy',
  special: 'star',
};
