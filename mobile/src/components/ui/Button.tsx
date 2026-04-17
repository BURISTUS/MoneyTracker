import React from 'react';
import {
  TouchableOpacity,
  type TouchableOpacityProps,
  type StyleProp,
  type ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const sizeConfig = {
  sm: { height: 36, paddingHorizontal: 12, fontSize: 13, borderRadius: 8 },
  md: { height: 44, paddingHorizontal: 16, fontSize: 15, borderRadius: 12 },
  lg: { height: 52, paddingHorizontal: 20, fontSize: 17, borderRadius: 14 },
} as const;

const variantConfig: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary: { bg: '#6366F1', text: '#FFFFFF' },
  secondary: {
    bg: 'rgba(255, 255, 255, 0.06)',
    text: '#F4F4F5',
    border: 'rgba(255, 255, 255, 0.10)',
  },
  ghost: { bg: 'transparent', text: '#A1A1AA' },
  danger: { bg: 'rgba(248, 113, 113, 0.15)', text: '#F87171', border: 'rgba(248, 113, 113, 0.25)' },
  success: { bg: 'rgba(52, 211, 153, 0.15)', text: '#34D399', border: 'rgba(52, 211, 153, 0.25)' },
};

export const Button: React.FC<ButtonProps> = React.memo(
  ({ variant = 'primary', size = 'md', loading = false, icon, fullWidth = false, disabled, onPress, children, style, ...rest }) => {
    const cfg = sizeConfig[size];
    const vc = variantConfig[variant];

    const containerStyle: StyleProp<ViewStyle> = {
      height: cfg.height,
      paddingHorizontal: cfg.paddingHorizontal,
      backgroundColor: vc.bg,
      borderRadius: cfg.borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
      ...(fullWidth && { width: '100%' }),
      ...(vc.border && { borderWidth: 1, borderColor: vc.border }),
      ...(disabled && { opacity: 0.4 }),
    };

    return (
      <TouchableOpacity
        style={[containerStyle, style]}
        onPress={disabled || loading ? undefined : onPress}
        activeOpacity={0.8}
        disabled={disabled || loading}
        accessibilityRole="button"
        {...rest}
      >
        {loading ? (
          <ActivityIndicator color={vc.text} size="small" />
        ) : (
          <>
            {icon}
            <Text size={size === 'sm' ? 'sm' : 'md'} weight="semibold" style={{ color: vc.text }}>
              {children}
            </Text>
          </>
        )}
      </TouchableOpacity>
    );
  },
);
