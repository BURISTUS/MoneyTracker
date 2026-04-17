import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatCurrency, getDaysRemaining } from '../../utils/formatters';
import type { WishlistItem, WishlistStatus } from '../../types';

interface WishlistCardProps {
  item: WishlistItem;
  onPurchase?: (id: string) => void;
  onReject?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'primary' | 'success' | 'danger' | 'warning' }> = {
  PENDING: { label: 'Охлаждение', variant: 'warning' },
  READY: { label: 'Готово', variant: 'success' },
  REJECTED: { label: 'Отклонено', variant: 'danger' },
  PURCHASED: { label: 'Куплено', variant: 'default' },
  EXPIRED: { label: 'Истекло', variant: 'default' },
};

export const WishlistCard: React.FC<WishlistCardProps> = React.memo(
  ({ item, onPurchase, onReject, style }) => {
    const { spacing } = useTheme();
    const sc = statusConfig[item.status] || statusConfig.PENDING;
    const daysLeft = item.status === 'PENDING' ? getDaysRemaining(item.cooldownEnds) : 0;

    return (
      <Card variant="glass" padding="lg" style={style}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
          <Text size="lg" weight="semibold" numberOfLines={1} style={{ flex: 1, marginRight: spacing.md }}>
            {item.name}
          </Text>
          <Badge label={sc.label} variant={sc.variant} />
        </View>
        <Text size="xl" weight="bold" style={{ marginBottom: spacing.sm }}>
          {formatCurrency(item.price)}
        </Text>
        {item.status === 'PENDING' && (
          <Text size="xs" style={{ color: '#FBBF24', marginBottom: spacing.md }}>
            Осталось {daysLeft} дн. до решения
          </Text>
        )}
        {item.status === 'READY' && (
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Text
                size="sm"
                weight="semibold"
                onPress={() => onReject?.(item.id)}
                style={{ color: '#34D399', textAlign: 'center', paddingVertical: spacing.sm, backgroundColor: 'rgba(52, 211, 153, 0.12)', borderRadius: 8 }}
              >
                Пожалел
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                size="sm"
                weight="semibold"
                onPress={() => onPurchase?.(item.id)}
                style={{ color: '#F87171', textAlign: 'center', paddingVertical: spacing.sm, backgroundColor: 'rgba(248, 113, 113, 0.12)', borderRadius: 8 }}
              >
                Купил
              </Text>
            </View>
          </View>
        )}
      </Card>
    );
  },
);
