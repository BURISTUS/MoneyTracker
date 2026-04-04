/**
 * Money Tracker — Modern Design System (2024-2026)
 * 
 * Principles:
 * - Dark mode first
 * - Minimalism with personality
 * - Glassmorphism accents
 * - Typography-driven hierarchy
 * - Micro-animations for delight
 */

// ============================================
// TOKENS
// ============================================

export const spacing = {
  /** 4px */
  xxs: 4,
  /** 8px */
  xs: 8,
  /** 12px */
  sm: 12,
  /** 16px */
  md: 16,
  /** 20px */
  lg: 20,
  /** 24px */
  xl: 24,
  /** 32px */
  xxl: 32,
  /** 48px */
  xxxl: 48,
} as const;

export const borderRadius = {
  /** 8px — small elements */
  sm: 8,
  /** 12px — buttons, inputs */
  md: 12,
  /** 16px — cards */
  lg: 16,
  /** 20px — large cards */
  xl: 20,
  /** 24px — modals */
  xxl: 24,
  /** full — pills, avatars */
  full: 9999,
} as const;

export const fontSize = {
  /** 11px — micro labels */
  micro: 11,
  /** 12px — captions */
  caption: 12,
  /** 14px — secondary text */
  small: 14,
  /** 16px — body */
  body: 16,
  /** 18px — subheadings */
  h3: 18,
  /** 22px — headings */
  h2: 22,
  /** 28px — large headings */
  h1: 28,
  /** 36px — display */
  display: 36,
  /** 48px — hero numbers */
  hero: 48,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ============================================
// SHADOWS
// ============================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
} as const;

// ============================================
// COLORS — DARK THEME (Primary)
// ============================================

export const darkColors = {
  // Backgrounds
  background: '#09090B', // zinc-950
  surface: '#18181B', // zinc-900
  surfaceElevated: '#27272A', // zinc-800
  surfaceHighlight: '#3F3F46', // zinc-700

  // Brand
  primary: '#6366F1', // indigo-500
  primaryLight: '#818CF8', // indigo-400
  primaryDark: '#4F46E5', // indigo-600

  // Accent (for Life Cost emphasis)
  accent: '#F472B6', // pink-400
  accentLight: '#F9A8D4', // pink-300
  accentDark: '#EC4899', // pink-500

  // Semantic
  success: '#34D399', // emerald-400
  successDark: '#10B981', // emerald-500
  warning: '#FBBF24', // amber-400
  danger: '#F87171', // red-400
  dangerDark: '#EF4444', // red-500
  info: '#38BDF8', // sky-400

  // Text
  text: '#FAFAFA', // zinc-50
  textSecondary: '#A1A1AA', // zinc-400
  textTertiary: '#71717A', // zinc-500
  textDisabled: '#52525B', // zinc-600

  // Border
  border: '#3F3F46', // zinc-700
  borderLight: '#27272A', // zinc-800

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',

  // Gradients (subtle mesh)
  gradientPrimary: ['#6366F1', '#8B5CF6'] as [string, string], // indigo → violet
  gradientSuccess: ['#10B981', '#34D399'] as [string, string],
  gradientAccent: ['#EC4899', '#F472B6'] as [string, string], // pink
  gradientHero: ['#6366F1', '#A855F7', '#EC4899'] as [string, string, string],

  // Glows
  glowPrimary: 'rgba(99, 102, 241, 0.4)',
  glowAccent: 'rgba(244, 114, 182, 0.4)',
  glowSuccess: 'rgba(52, 211, 153, 0.4)',

  // Life Cost specific
  lifeCost: '#F472B6', // accent pink
  lifeCostBg: 'rgba(244, 114, 182, 0.15)',

  // Gamification
  xpGold: '#FFD700',
  streakFire: '#FF6B35',
  tierBronze: '#CD7F32',
  tierSilver: '#C0C0C0',
  tierGold: '#FFD700',
  tierPlatinum: '#E5E4E2',
} as const;

// ============================================
// COLORS — LIGHT THEME
// ============================================

export const lightColors = {
  // Backgrounds
  background: '#FAFAFA', // zinc-50
  surface: '#FFFFFF',
  surfaceElevated: '#F4F4F5', // zinc-100
  surfaceHighlight: '#E4E4E7', // zinc-200

  // Brand
  primary: '#4F46E5', // indigo-600
  primaryLight: '#6366F1', // indigo-500
  primaryDark: '#4338CA', // indigo-700

  // Accent
  accent: '#DB2777', // pink-600
  accentLight: '#EC4899', // pink-500
  accentDark: '#BE185D', // pink-700

  // Semantic
  success: '#059669', // emerald-600
  successDark: '#047857', // emerald-700
  warning: '#D97706', // amber-600
  danger: '#DC2626', // red-600
  dangerDark: '#B91C1C', // red-700
  info: '#0284C7', // sky-600

  // Text
  text: '#18181B', // zinc-900
  textSecondary: '#52525B', // zinc-600
  textTertiary: '#A1A1AA', // zinc-400
  textDisabled: '#D4D4D8', // zinc-300

  // Border
  border: '#E4E4E7', // zinc-200
  borderLight: '#F4F4F5', // zinc-100

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Gradients
  gradientPrimary: ['#4F46E5', '#7C3AED'] as [string, string],
  gradientSuccess: ['#059669', '#10B981'] as [string, string],
  gradientAccent: ['#DB2777', '#EC4899'] as [string, string],
  gradientHero: ['#4F46E5', '#9333EA', '#DB2777'] as [string, string, string],

  // Glows
  glowPrimary: 'rgba(79, 70, 229, 0.2)',
  glowAccent: 'rgba(219, 39, 119, 0.2)',
  glowSuccess: 'rgba(5, 150, 105, 0.2)',

  // Life Cost
  lifeCost: '#DB2777',
  lifeCostBg: 'rgba(219, 39, 119, 0.1)',

  // Gamification
  xpGold: '#CA8A04',
  streakFire: '#EA580C',
  tierBronze: '#B45309',
  tierSilver: '#6B7280',
  tierGold: '#CA8A04',
  tierPlatinum: '#9CA3AF',
} as const;

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ThemeColors = typeof darkColors;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type FontSize = typeof fontSize;

// ============================================
// ANIMATION CONSTANTS
// ============================================

export const animation = {
  /** Fast — button press */
  fast: 100,
  /** Normal — transitions */
  normal: 200,
  /** Slow — reveals */
  slow: 300,
  /** Very slow — modals */
  verySlow: 400,
} as const;

// Spring config for Reanimated
export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
} as const;

export const springConfigBouncy = {
  damping: 10,
  stiffness: 200,
  mass: 0.8,
} as const;

// ============================================
// STATUS LABELS (Gamification)
// ============================================

export const STATUS_LABELS: Record<string, { 
  name: string; 
  emoji: string; 
  description: string;
  color: string;
}> = {
  CONSUMER_DRONE: { 
    name: 'Хомяк в колесе', 
    emoji: '🐹',
    description: 'Тратишь больше, чем зарабатываешь. Но это можно изменить!',
    color: '#EF4444',
  },
  AWAKENED: { 
    name: 'Просыпающийся', 
    emoji: '🌱',
    description: 'Ты начал осознавать свои финансовые привычки.',
    color: '#F59E0B',
  },
  ASCETIC: { 
    name: 'Аскет', 
    emoji: '🧘',
    description: 'Отказался от импульсивных покупок. Сила воли растёт!',
    color: '#10B981',
  },
  STRATEGIST: { 
    name: 'Стратег', 
    emoji: '♟️',
    description: 'У тебя есть подушка безопасности и планы.',
    color: '#3B82F6',
  },
  CAPITALIST: { 
    name: 'Капиталист', 
    emoji: '💎',
    description: 'Пассивный доход покрывает часть трат.',
    color: '#8B5CF6',
  },
  FINANCIAL_ARCHITECT: { 
    name: 'Архитектор', 
    emoji: '🏛️',
    description: 'Ты свободен от финансовых цепей. Поздравляем!',
    color: '#FFD700',
  },
} as const;

// ============================================
// WISHLIST STATUS LABELS
// ============================================

export const WISHLIST_STATUS_LABELS: Record<string, {
  name: string;
  color: string;
  bgColor: string;
}> = {
  PENDING: {
    name: 'В ожидании',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.15)',
  },
  READY: {
    name: 'Готов к решению',
    color: '#34D399',
    bgColor: 'rgba(52, 211, 153, 0.15)',
  },
  REJECTED: {
    name: 'Отклонено ✓',
    color: '#6366F1',
    bgColor: 'rgba(99, 102, 241, 0.15)',
  },
  PURCHASED: {
    name: 'Куплено',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
  },
  EXPIRED: {
    name: 'Истёк срок',
    color: '#71717A',
    bgColor: 'rgba(113, 113, 122, 0.15)',
  },
} as const;

// ============================================
// TRANSACTION TYPE CONFIG
// ============================================

export const TRANSACTION_TYPE_CONFIG = {
  INCOME: {
    name: 'Доход',
    icon: 'arrow-down-circle' as const,
    color: '#34D399', // success
    bgColor: 'rgba(52, 211, 153, 0.15)',
    sign: '+' as const,
  },
  EXPENSE: {
    name: 'Расход',
    icon: 'arrow-up-circle' as const,
    color: '#F87171', // danger
    bgColor: 'rgba(248, 113, 113, 0.15)',
    sign: '-' as const,
  },
  TRANSFER: {
    name: 'Перевод',
    icon: 'swap-horizontal' as const,
    color: '#38BDF8', // info
    bgColor: 'rgba(56, 189, 248, 0.15)',
    sign: '' as const,
  },
} as const;

// ============================================
// ACCOUNT TYPE CONFIG
// ============================================

export const ACCOUNT_TYPE_CONFIG = {
  CASH: {
    name: 'Наличные',
    icon: 'cash' as const,
    color: '#34D399',
  },
  BANK: {
    name: 'Банковская карта',
    icon: 'card' as const,
    color: '#3B82F6',
  },
  CREDIT: {
    name: 'Кредит',
    icon: 'card-outline' as const,
    color: '#F59E0B',
  },
  INVESTMENT: {
    name: 'Инвестиции',
    icon: 'trending-up' as const,
    color: '#8B5CF6',
  },
  DEBT: {
    name: 'Долг',
    icon: 'alert-circle' as const,
    color: '#EF4444',
  },
} as const;
