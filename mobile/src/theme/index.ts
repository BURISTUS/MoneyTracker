export { colors } from './colors';
export { spacing } from './spacing';
export { fontSize, fontWeight, lineHeight } from './typography';
export { shadows, glow, borderRadius } from './shadows';

import { colors } from './colors';
import { spacing } from './spacing';
import { fontSize, fontWeight, lineHeight } from './typography';
import { shadows, glow, borderRadius } from './shadows';

export const theme = {
  colors,
  spacing,
  fontSize,
  fontWeight,
  lineHeight,
  shadows,
  glow,
  borderRadius,
} as const;

export type Theme = typeof theme;

export const useTheme = () => theme;
