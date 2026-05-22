import { useTranslation } from 'react-i18next';
import React from 'react';
import { View, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../stores/themeStore';
import { Text } from '../../../components/ui/text';
import { formatCurrency, getDaysRemaining } from '../../utils/formatters';
import type { WishlistItem, WishlistStatus } from '../../types';

interface WishlistCardProps {
  item: WishlistItem;
  onPurchase?: (id: string) => void;
  onReject?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

const statusConfig: Record<string, { labelKey: string; bgClass: string; textClass: string }> = {
  PENDING: { labelKey: 'wishlist.cooling', bgClass: 'bg-warning-600/20', textClass: 'text-warning-400' },
  READY: { labelKey: 'wishlist.ready', bgClass: 'bg-success-600/20', textClass: 'text-success-400' },
  REJECTED: { labelKey: 'wishlist.rejected', bgClass: 'bg-error-600/20', textClass: 'text-error-400' },
  PURCHASED: { labelKey: 'wishlist.purchased', bgClass: 'bg-[rgba(255,255,255,0.06)]', textClass: 'text-typography-400' },
  EXPIRED: { labelKey: 'wishlist.expired', bgClass: 'bg-[rgba(255,255,255,0.06)]', textClass: 'text-typography-400' },
};

export const WishlistCard: React.FC<WishlistCardProps> = React.memo(
  ({ item, onPurchase, onReject, style }) => {
    const { t } = useTranslation();
  const C = useTheme();
    const sc = statusConfig[item.status] || statusConfig.PENDING;
    const daysLeft = item.status === 'PENDING' ? getDaysRemaining(item.cooldownEnds) : 0;

    return (
      <View className="bg-background-50 rounded-2xl border border-outline-200 p-6" style={style}>
        <View className="flex-row justify-between items-start mb-2">
          <Text className="text-lg font-semibold flex-1 mr-3" numberOfLines={1}>{item.name}</Text>
          <View className={`${sc.bgClass} px-2.5 py-1 rounded-full`}>
            <Text className={`text-xs font-medium ${sc.textClass}`}>{t(sc.labelKey)}</Text>
          </View>
        </View>
        <Text className="text-xl font-bold mb-2">{formatCurrency(item.price)}</Text>
        {item.status === 'PENDING' && (
          <Text className="text-xs text-warning-400 mb-3">
            {t('wishlist.daysLeft', { days: daysLeft })}
          </Text>
        )}
        {item.status === 'READY' && (
          <View className="flex-row gap-2">
            <Pressable
              className="flex-1 py-2 rounded-lg bg-[rgba(52,211,153,0.12)] items-center justify-center"
              onPress={() => onReject?.(item.id)}
            >
              <Text className="text-sm font-semibold text-success-400 text-center">{t("wishlist.regretted")}</Text>
            </Pressable>
            <Pressable
              className="flex-1 py-2 rounded-lg bg-[rgba(248,113,113,0.12)] items-center justify-center"
              onPress={() => onPurchase?.(item.id)}
            >
              <Text className="text-sm font-semibold text-error-400 text-center">{t("wishlist.bought")}</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  },
);
