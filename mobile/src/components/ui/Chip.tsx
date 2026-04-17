import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from './Text';

interface ChipProps extends Omit<PressableProps, 'style'> {
  label: string;
  selected?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'danger';
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
}

export const Chip: React.FC<ChipProps> = React.memo(
  ({ label, selected = false, variant = 'default', size = 'md', style, onPress, ...rest }) => {
    const { spacing, borderRadius: br, colors } = useTheme();

    const isSm = size === 'sm';
    const paddingHorizontal = isSm ? spacing.sm : spacing.md;
    const paddingVertical = isSm ? spacing.xs : spacing.sm;

    const getColors = () => {
      if (selected) {
        const map = {
          default: { bg: 'rgba(99, 102, 241, 0.15)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
          primary: { bg: 'rgba(99, 102, 241, 0.2)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.4)' },
          success: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34D399', border: 'rgba(52, 211, 153, 0.3)' },
          danger: { bg: 'rgba(248, 113, 113, 0.15)', text: '#F87171', border: 'rgba(248, 113, 113, 0.3)' },
        };
        return map[variant];
      }
      return {
        bg: 'rgba(255, 255, 255, 0.04)',
        text: colors.text.secondary,
        border: 'rgba(255, 255, 255, 0.06)',
      };
    };

    const cs = getColors();

    return (
      <Pressable
        style={[
          {
            paddingHorizontal,
            paddingVertical,
            borderRadius: br.sm,
            backgroundColor: cs.bg,
            borderWidth: 1,
            borderColor: cs.border,
          },
          style,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        {...rest}
      >
        <Text size={isSm ? 'xs' : 'sm'} weight={selected ? 'semibold' : 'medium'} style={{ color: cs.text }}>
          {label}
        </Text>
      </Pressable>
    );
  },
);
