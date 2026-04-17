import React from 'react';
import { View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type CardVariant = 'glass' | 'elevated' | 'outlined' | 'flat';

interface CardProps extends ViewProps {
  variant?: CardVariant;
  padding?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl' | 'huge' | 'massive' | number;
  style?: StyleProp<ViewStyle>;
}

export const Card: React.FC<CardProps> = React.memo(
  ({ variant = 'glass', padding = 'lg', style, children, ...rest }) => {
    const { spacing, borderRadius: br } = useTheme();
    const paddingValue = typeof padding === 'number' ? padding : spacing[padding as keyof typeof spacing];

    const variantStyles: Record<CardVariant, ViewStyle> = {
      glass: {
        backgroundColor: 'rgba(255, 255, 255, 0.04)',
        borderRadius: br.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        padding: paddingValue,
      },
      elevated: {
        backgroundColor: '#1A1A24',
        borderRadius: br.lg,
        padding: paddingValue,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
      },
      outlined: {
        backgroundColor: 'transparent',
        borderRadius: br.lg,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        padding: paddingValue,
      },
      flat: {
        backgroundColor: '#111118',
        borderRadius: br.lg,
        padding: paddingValue,
      },
    };

    return (
      <View style={[variantStyles[variant], style]} {...rest}>
        {children}
      </View>
    );
  },
);
