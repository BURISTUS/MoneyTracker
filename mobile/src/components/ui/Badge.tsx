import React from 'react';
import { View, type ViewStyle, type StyleProp } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from './Text';

type BadgeVariant = 'default' | 'primary' | 'success' | 'danger' | 'warning' | 'xp';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: string;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: 'rgba(255, 255, 255, 0.08)', text: '#A1A1AA' },
  primary: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8' },
  success: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34D399' },
  danger: { bg: 'rgba(248, 113, 113, 0.15)', text: '#F87171' },
  warning: { bg: 'rgba(251, 191, 36, 0.15)', text: '#FBBF24' },
  xp: { bg: 'rgba(255, 215, 0, 0.15)', text: '#FFD700' },
};

export const Badge: React.FC<BadgeProps> = React.memo(({ label, variant = 'default', icon, style }) => {
  const { borderRadius: br, spacing } = useTheme();
  const vs = variantStyles[variant];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.xs,
          backgroundColor: vs.bg,
          paddingHorizontal: spacing.sm,
          paddingVertical: spacing.xs,
          borderRadius: br.sm,
        },
        style,
      ]}
    >
      {icon && <Text size="xs">{icon}</Text>}
      <Text size="xs" weight="semibold" style={{ color: vs.text }}>
        {label}
      </Text>
    </View>
  );
});
