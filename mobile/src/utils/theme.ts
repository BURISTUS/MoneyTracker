// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  backgroundTertiary: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
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

// Theme definitions - Dark Blue (#1E3A5F) + Turquoise (#2DD4BF)
export const lightTheme: ThemeColors = {
  primary: '#1E3A5F',
  secondary: '#2DD4BF',
  background: '#F8FAFC',
  backgroundTertiary: '#E2E8F0',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  error: '#DC2626',
  success: '#059669',
  successLight: 'rgba(5, 150, 105, 0.15)',
  warning: '#D97706',
  info: '#0284C7',
  danger: '#DC2626',
  xpGold: '#EAB308',
  streakFire: '#EA580C',
  gradientPrimary: ['#1E3A5F', '#2DD4BF'],
};

export const darkTheme: ThemeColors = {
  primary: '#2DD4BF',
  secondary: '#5EEAD4',
  background: '#0F172A',
  backgroundTertiary: '#1E293B',
  surface: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  divider: '#1E293B',
  error: '#F87171',
  success: '#34D399',
  successLight: 'rgba(52, 211, 153, 0.15)',
  warning: '#FBBF24',
  info: '#38BDF8',
  danger: '#F87171',
  xpGold: '#FFD700',
  streakFire: '#FF8A50',
  gradientPrimary: ['#2DD4BF', '#5EEAD4'],
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

// Type colors for achievements
export const typeColors = {
  milestone: '#667eea',
  streak: '#FF6B35',
  challenge: '#FFD700',
  special: '#9D7BBD',
};

// Type icons for achievements
export const typeIcons = {
  milestone: 'flag',
  streak: 'flame',
  challenge: 'trophy',
  special: 'star',
};
