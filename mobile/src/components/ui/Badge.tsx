/**
 * Money Tracker — Modern Badge Components
 * 
 * Features:
 * - Status badges
 * - Life Cost badges
 * - Tier badges
 * - XP badges
 */

import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../utils/ThemeContext';
import { borderRadius, spacing, fontSize } from '../../utils/theme';
import { STATUS_LABELS, WISHLIST_STATUS_LABELS } from '../../utils/theme';

// ============================================
// STATUS BADGE — Gamification status display
// ============================================

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const StatusBadge = memo(function StatusBadge({ 
  status, 
  size = 'md',
  showLabel = true,
}: StatusBadgeProps) {
  const { colors } = useTheme();
  const statusInfo = STATUS_LABELS[status];

  if (!statusInfo) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.xxs,
          paddingHorizontal: spacing.sm,
          fontSize: fontSize.micro,
          iconSize: 12,
        };
      case 'lg':
        return {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          fontSize: fontSize.body,
          iconSize: 24,
        };
      case 'md':
      default:
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.md,
          fontSize: fontSize.small,
          iconSize: 18,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[
      styles.statusBadge,
      { 
        backgroundColor: statusInfo.color + '20',
        paddingVertical: sizeStyles.paddingVertical,
        paddingHorizontal: sizeStyles.paddingHorizontal,
      }
    ]}>
      <Text style={[styles.statusEmoji, { fontSize: sizeStyles.iconSize }]}>
        {statusInfo.emoji}
      </Text>
      {showLabel && (
        <Text style={[
          styles.statusLabel, 
          { color: statusInfo.color, fontSize: sizeStyles.fontSize }
        ]}>
          {statusInfo.name}
        </Text>
      )}
    </View>
  );
});

// ============================================
// LIFE COST BADGE — Shows hours/days of life cost
// ============================================

interface LifeCostBadgeProps {
  amount: number; // in kopecks
  size?: 'sm' | 'md' | 'lg';
  hourlyRate?: number; // in kopecks
  showMessage?: boolean;
}

export const LifeCostBadge = memo(function LifeCostBadge({ 
  amount, 
  size = 'md',
  hourlyRate = 150000, // default 1500 RUB/hour
  showMessage = true,
}: LifeCostBadgeProps) {
  const { colors } = useTheme();

  const hours = Math.round((amount / 100) / (hourlyRate / 100) * 10) / 10;
  const days = Math.round(hours / 8 * 10) / 10;

  let message = '';
  if (days >= 20) {
    message = `${Math.round(days)} рабочих дней`;
  } else if (days >= 10) {
    message = `${Math.round(days)} рабочих дня`;
  } else if (days >= 5) {
    message = `${Math.round(days)} рабочих дня`;
  } else if (days >= 1) {
    message = `${Math.round(hours)} часов`;
  } else {
    message = `${Math.round(hours * 60)} минут`;
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: spacing.xs,
          iconSize: 12,
          fontSize: fontSize.caption,
          subtextSize: fontSize.micro,
        };
      case 'lg':
        return {
          padding: spacing.md,
          iconSize: 28,
          fontSize: fontSize.h1,
          subtextSize: fontSize.small,
        };
      case 'md':
      default:
        return {
          padding: spacing.sm,
          iconSize: 18,
          fontSize: fontSize.h3,
          subtextSize: fontSize.caption,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[
      styles.lifeCostBadge,
      { 
        backgroundColor: colors.lifeCostBg,
        padding: sizeStyles.padding,
      }
    ]}>
      <View style={styles.lifeCostHeader}>
        <Ionicons name="time" size={sizeStyles.iconSize} color={colors.lifeCost} />
        <Text style={[
          styles.lifeCostHours, 
          { color: colors.lifeCost, fontSize: sizeStyles.fontSize }
        ]}>
          {hours}ч
        </Text>
      </View>
      {showMessage && (
        <Text style={[
          styles.lifeCostMessage, 
          { color: colors.textSecondary, fontSize: sizeStyles.subtextSize }
        ]}>
          = {message} вашей жизни
        </Text>
      )}
    </View>
  );
});

// ============================================
// INLINE LIFE COST — For transaction list items
// ============================================

interface LifeCostInlineProps {
  amount: number;
  hourlyRate?: number;
}

export const LifeCostInline = memo(function LifeCostInline({ 
  amount, 
  hourlyRate = 150000 
}: LifeCostInlineProps) {
  const { colors } = useTheme();
  const hours = Math.round((amount / 100) / (hourlyRate / 100) * 10) / 10;

  return (
    <View style={styles.inlineContainer}>
      <Ionicons name="time-outline" size={12} color={colors.lifeCost} />
      <Text style={[styles.inlineText, { color: colors.textSecondary }]}>
        {hours}ч
      </Text>
    </View>
  );
});

// ============================================
// WISHLIST STATUS BADGE
// ============================================

interface WishlistStatusBadgeProps {
  status: string;
}

export const WishlistStatusBadge = memo(function WishlistStatusBadge({ 
  status 
}: WishlistStatusBadgeProps) {
  const { colors } = useTheme();
  const statusInfo = WISHLIST_STATUS_LABELS[status];

  if (!statusInfo) return null;

  return (
    <View style={[
      styles.wishlistStatusBadge,
      { backgroundColor: statusInfo.bgColor }
    ]}>
      <Text style={[styles.wishlistStatusText, { color: statusInfo.color }]}>
        {statusInfo.name}
      </Text>
    </View>
  );
});

// ============================================
// XP BADGE
// ============================================

interface XPBadgeProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
}

export const XPBadge = memo(function XPBadge({ xp, size = 'md' }: XPBadgeProps) {
  const { colors } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { fontSize: fontSize.micro, iconSize: 10 };
      case 'lg':
        return { fontSize: fontSize.body, iconSize: 18 };
      default:
        return { fontSize: fontSize.caption, iconSize: 14 };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.xpBadge, { backgroundColor: colors.xpGold + '20' }]}>
      <Ionicons name="star" size={sizeStyles.iconSize} color={colors.xpGold} />
      <Text style={[styles.xpText, { color: colors.xpGold, fontSize: sizeStyles.fontSize }]}>
        +{xp} XP
      </Text>
    </View>
  );
});

// ============================================
// TIER BADGE — Achievement tier indicator
// ============================================

interface TierBadgeProps {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
}

export const TierBadge = memo(function TierBadge({ tier }: TierBadgeProps) {
  const { colors } = useTheme();

  const tierColors = {
    BRONZE: '#CD7F32',
    SILVER: '#C0C0C0',
    GOLD: '#FFD700',
    PLATINUM: '#E5E4E2',
  };

  const color = tierColors[tier];

  return (
    <View style={[styles.tierBadge, { backgroundColor: color + '15' }]}>
      <Text style={[styles.tierText, { color }]}>
        {tier}
      </Text>
    </View>
  );
});

// ============================================
// COOLDOWN BADGE — For wishlist timer
// ============================================

interface CooldownBadgeProps {
  daysRemaining: number;
  isReady?: boolean;
}

export const CooldownBadge = memo(function CooldownBadge({ 
  daysRemaining, 
  isReady = false 
}: CooldownBadgeProps) {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.cooldownBadge,
      { backgroundColor: isReady ? colors.success + '20' : colors.warning + '20' }
    ]}>
      <Ionicons 
        name={isReady ? 'checkmark-circle' : 'time'} 
        size={14} 
        color={isReady ? colors.success : colors.warning} 
      />
      <Text style={[
        styles.cooldownText, 
        { color: isReady ? colors.success : colors.warning }
      ]}>
        {isReady ? 'Готов!' : `${daysRemaining} дн.`}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  statusEmoji: {
    // fontSize set dynamically
  },
  statusLabel: {
    fontWeight: '600',
  },

  // Life Cost Badge
  lifeCostBadge: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  lifeCostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  lifeCostHours: {
    fontWeight: '700',
  },
  lifeCostMessage: {
    marginTop: spacing.xxs,
    textAlign: 'center',
  },

  // Inline
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  inlineText: {
    fontSize: fontSize.caption,
    fontWeight: '500',
  },

  // Wishlist Status
  wishlistStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  wishlistStatusText: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },

  // XP Badge
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    gap: spacing.xxs,
  },
  xpText: {
    fontWeight: '600',
  },

  // Tier Badge
  tierBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
  },
  tierText: {
    fontSize: fontSize.micro,
    fontWeight: '600',
  },

  // Cooldown
  cooldownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.sm,
    gap: spacing.xxs,
  },
  cooldownText: {
    fontSize: fontSize.caption,
    fontWeight: '600',
  },
});
