export const colors = {
  bg: {
    primary: '#0A0A0F',
    secondary: '#111118',
    tertiary: '#1A1A24',
    elevated: '#22222E',
  },
  surface: {
    default: 'rgba(255, 255, 255, 0.04)',
    hover: 'rgba(255, 255, 255, 0.08)',
    active: 'rgba(255, 255, 255, 0.12)',
    glass: 'rgba(255, 255, 255, 0.06)',
    glassBorder: 'rgba(255, 255, 255, 0.10)',
  },
  brand: {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    primaryMuted: 'rgba(99, 102, 241, 0.15)',
    primaryGlow: 'rgba(99, 102, 241, 0.25)',
  },
  semantic: {
    success: '#34D399',
    successMuted: 'rgba(52, 211, 153, 0.15)',
    danger: '#F87171',
    dangerMuted: 'rgba(248, 113, 113, 0.15)',
    warning: '#FBBF24',
    warningMuted: 'rgba(251, 191, 36, 0.15)',
    info: '#38BDF8',
    infoMuted: 'rgba(56, 189, 248, 0.15)',
  },
  text: {
    primary: '#F4F4F5',
    secondary: '#A1A1AA',
    tertiary: '#71717A',
    disabled: '#52525B',
    inverse: '#0A0A0F',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.06)',
    subtle: 'rgba(255, 255, 255, 0.03)',
    strong: 'rgba(255, 255, 255, 0.12)',
  },
  income: '#34D399',
  expense: '#F87171',
  transfer: '#38BDF8',
  xp: '#FFD700',
  streak: '#FF6B35',
};

export type ColorToken = typeof colors;
