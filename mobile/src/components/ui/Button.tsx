/**
 * Money Tracker — Modern Button Components
 * 
 * Features:
 * - Primary, Secondary, Ghost, Danger variants
 * - Icon buttons
 * - Press animation with spring
 * - Loading state
 */

import React, { memo, useCallback } from 'react';
import { 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/ThemeContext';
import { borderRadius, spacing, fontSize } from '../../utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button = memo(function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 200 });
    }
  }, [disabled, loading, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [scale]);

  const getBackgroundColor = (): string => {
    if (disabled) return colors.surfaceHighlight;
    
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return 'transparent';
      case 'ghost': return 'transparent';
      case 'danger': return colors.danger;
      case 'success': return colors.success;
      default: return colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.textTertiary;
    
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return colors.primary;
      case 'ghost': return colors.text;
      case 'danger': return '#FFFFFF';
      case 'success': return '#FFFFFF';
      default: return '#FFFFFF';
    }
  };

  const getBorderStyle = (): ViewStyle => {
    if (variant === 'secondary') {
      return {
        borderWidth: 1.5,
        borderColor: disabled ? colors.border : colors.primary,
      };
    }
    return {};
  };

  const getPadding = (): { paddingVertical: number; paddingHorizontal: number } => {
    switch (size) {
      case 'sm': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'md': return { paddingVertical: spacing.md, paddingHorizontal: spacing.lg };
      case 'lg': return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm': return fontSize.small;
      case 'md': return fontSize.body;
      case 'lg': return fontSize.h3;
    }
  };

  const content = loading ? (
    <ActivityIndicator color={getTextColor()} size="small" />
  ) : (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons 
          name={icon} 
          size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
          color={getTextColor()} 
          style={styles.iconLeft}
        />
      )}
      <Text style={[
        styles.text, 
        { color: getTextColor(), fontSize: getFontSize() },
        textStyle
      ]}>
        {title}
      </Text>
      {icon && iconPosition === 'right' && (
        <Ionicons 
          name={icon} 
          size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} 
          color={getTextColor()} 
          style={styles.iconRight}
        />
      )}
    </>
  );

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
        getBorderStyle(),
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
});

// ============================================
// ICON BUTTON
// ============================================

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'primary' | 'ghost';
  color?: string;
  disabled?: boolean;
}

export const IconButton = memo(function IconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'default',
  color,
  disabled = false,
}: IconButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(0.9, { damping: 15, stiffness: 200 });
    }
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [scale]);

  const getSize = (): number => {
    switch (size) {
      case 'sm': return 36;
      case 'md': return 44;
      case 'lg': return 56;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'sm': return 18;
      case 'md': return 22;
      case 'lg': return 28;
    }
  };

  const getBackgroundColor = (): string => {
    if (disabled) return colors.surfaceHighlight;
    
    switch (variant) {
      case 'primary': return colors.primary;
      case 'ghost': return 'transparent';
      case 'default':
      default: return colors.surface;
    }
  };

  const getIconColor = (): string => {
    if (disabled) return colors.textTertiary;
    if (color) return color;
    
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'ghost': return colors.text;
      case 'default':
      default: return colors.text;
    }
  };

  const buttonSize = getSize();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[
        styles.iconButton,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: getBackgroundColor(),
        },
        animatedStyle,
      ]}
    >
      <Ionicons name={icon} size={getIconSize()} color={getIconColor()} />
    </AnimatedPressable>
  );
});

// ============================================
// FLOATING ACTION BUTTON (FAB)
// ============================================

interface FABProps {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FAB({ 
  icon = 'add', 
  onPress, 
  color,
  size = 'lg' 
}: FABProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 200 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  }, [scale]);

  const getSize = (): number => {
    switch (size) {
      case 'sm': return 48;
      case 'md': return 56;
      case 'lg': return 64;
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'sm': return 22;
      case 'md': return 26;
      case 'lg': return 30;
    }
  };

  const buttonSize = getSize();

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.fab,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor: color || colors.primary,
        },
        animatedStyle,
      ]}
    >
      <Ionicons name={icon} size={getIconSize()} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  text: {
    fontWeight: '600',
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },

  // Icon Button
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
