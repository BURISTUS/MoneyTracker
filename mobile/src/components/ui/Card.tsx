/**
 * Money Tracker — Modern Card Component
 * 
 * Features:
 * - Glassmorphism variant
 * - Gradient variant
 * - Subtle shadows
 * - Pressable with spring animation
 */

import React, { memo, useCallback } from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../utils/ThemeContext';
import { borderRadius, shadows, spacing } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  padding?: keyof typeof spacing;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Card = memo(function Card({ 
  children, 
  style, 
  variant = 'default',
  padding = 'md',
  onPress,
}: CardProps) {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 200 });
    }
  }, [onPress, scale]);

  const handlePressOut = useCallback(() => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    }
  }, [onPress, scale]);

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      padding: spacing[padding],
      borderRadius: borderRadius.xl,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: isDark 
            ? 'rgba(255, 255, 255, 0.05)' 
            : 'rgba(255, 255, 255, 0.8)',
          borderWidth: 1,
          borderColor: isDark 
            ? 'rgba(255, 255, 255, 0.1)' 
            : 'rgba(0, 0, 0, 0.05)',
        };

      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: colors.primary + '20',
          borderWidth: 1,
          borderColor: colors.primary + '30',
        };

      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          ...shadows.md,
        };

      case 'default':
      default:
        return {
          ...baseStyle,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[getCardStyle(), animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );
});

// ============================================
// BALANCE CARD — Hero component for home screen
// ============================================

interface BalanceCardProps {
  balance: number;
  income?: number;
  expense?: number;
  lifeCostMonths?: number;
  onPress?: () => void;
}

export function BalanceCard({ 
  balance, 
  income = 0, 
  expense = 0, 
  lifeCostMonths,
  onPress 
}: BalanceCardProps) {
  const { colors } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card variant="gradient" padding="lg" style={styles.balanceCard} onPress={onPress}>
      <Animated.View style={styles.balanceHeader}>
        <Animated.Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.7)' }]}>
          Общий баланс
        </Animated.Text>
        {lifeCostMonths !== undefined && lifeCostMonths > 0 && (
          <Animated.Text style={[styles.lifeCostBadge, { color: '#F472B6' }]}>
            ~{lifeCostMonths.toFixed(1)} мес. работы
          </Animated.Text>
        )}
      </Animated.View>
      
      <Animated.Text style={styles.balanceValue}>
        {formatCurrency(balance)}
      </Animated.Text>
      
      <Animated.View style={styles.balanceStats}>
        <Animated.View style={styles.statItem}>
          <Animated.Text style={[styles.statIcon, { color: '#34D399' }]}>↑</Animated.Text>
          <Animated.Text style={[styles.statText, { color: '#34D399' }]}>
            {formatCurrency(income)}
          </Animated.Text>
        </Animated.View>
        
        <Animated.View style={styles.statItem}>
          <Animated.Text style={[styles.statIcon, { color: '#F87171' }]}>↓</Animated.Text>
          <Animated.Text style={[styles.statText, { color: '#F87171' }]}>
            {formatCurrency(expense)}
          </Animated.Text>
        </Animated.View>
      </Animated.View>
    </Card>
  );
}

// ============================================
// STAT CARD — Small stat for bento grid
// ============================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down' | 'neutral';
  onPress?: () => void;
}

export function StatCard({ 
  label, 
  value, 
  icon, 
  color,
  trend,
  onPress 
}: StatCardProps) {
  const { colors } = useTheme();

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return '#34D399';
      case 'down': return '#F87171';
      default: return colors.textSecondary;
    }
  };

  return (
    <Card variant="default" padding="md" style={styles.statCard} onPress={onPress}>
      {icon && (
        <View style={[styles.statIconContainer, { backgroundColor: (color || colors.primary) + '15' }]}>
          {icon}
        </View>
      )}
      <Animated.Text style={[styles.statCardValue, { color: colors.text }]}>
        {value}
      </Animated.Text>
      <Animated.Text style={[styles.statCardLabel, { color: colors.textSecondary }]}>
        {label}
      </Animated.Text>
      {trend && (
        <Animated.Text style={[styles.trendIndicator, { color: getTrendColor() }]}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
        </Animated.Text>
      )}
    </Card>
  );
}

// ============================================
// ACCOUNT CARD — For accounts list
// ============================================

interface AccountCardProps {
  name: string;
  type: string;
  balance: number;
  icon?: React.ReactNode;
  isDefault?: boolean;
  onPress?: () => void;
}

export function AccountCard({ 
  name, 
  type, 
  balance, 
  icon,
  isDefault,
  onPress 
}: AccountCardProps) {
  const { colors } = useTheme();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card variant="glass" padding="md" style={styles.accountCard} onPress={onPress}>
      <View style={styles.accountHeader}>
        <View style={[styles.accountIconContainer, { backgroundColor: colors.primary + '20' }]}>
          {icon || <Animated.Text>💳</Animated.Text>}
        </View>
        <View style={styles.accountInfo}>
          <Animated.Text style={[styles.accountName, { color: colors.text }]}>
            {name}
          </Animated.Text>
          <Animated.Text style={[styles.accountType, { color: colors.textSecondary }]}>
            {type}
          </Animated.Text>
        </View>
        {isDefault && (
          <View style={[styles.defaultBadge, { backgroundColor: colors.primary + '20' }]}>
            <Animated.Text style={[styles.defaultBadgeText, { color: colors.primary }]}>
              По умолчанию
            </Animated.Text>
          </View>
        )}
      </View>
      <Animated.Text style={[
        styles.accountBalance, 
        { color: balance >= 0 ? colors.success : colors.danger }
      ]}>
        {formatCurrency(balance)}
      </Animated.Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  // Balance Card
  balanceCard: {
    marginBottom: spacing.md,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  lifeCostBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.md,
    letterSpacing: -1,
  },
  balanceStats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIcon: {
    fontSize: 14,
    fontWeight: '600',
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Stat Card
  statCard: {
    flex: 1,
    alignItems: 'center',
    minWidth: 100,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statCardValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.xxs,
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  trendIndicator: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
  },

  // Account Card
  accountCard: {
    marginBottom: spacing.sm,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  accountIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  accountType: {
    fontSize: 13,
  },
  defaultBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'right',
  },
});
