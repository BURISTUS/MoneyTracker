import React from 'react';
import { Pressable, type StyleProp, type ViewStyle, View } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
import { formatCurrency, getRelativeTime } from '../../utils/formatters';
import type { Transaction, TransactionType } from '../../types';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (id: string) => void;
  style?: StyleProp<ViewStyle>;
}

const typeColors: Record<TransactionType, string> = {
  INCOME: '#34D399',
  EXPENSE: '#F87171',
  TRANSFER: '#38BDF8',
};

const typeSigns: Record<TransactionType, string> = {
  INCOME: '+',
  EXPENSE: '-',
  TRANSFER: '',
};

const categoryIcons: Record<string, string> = {
  'Зарплата': 'card',
  'Фриланс': 'laptop',
  'Инвестиции': 'trending-up',
  'Подарки': 'gift',
  'Продукты': 'cart',
  'Транспорт': 'bus',
  'Жильё': 'home',
  'Коммунальные': 'flash',
  'Связь': 'call',
  'Здоровье': 'heart',
  'Развлечения': 'game-controller',
  'Одежда': 'shirt',
  'Рестораны': 'restaurant',
  Другое: 'ellipsis-horizontal',
};

export const TransactionItem: React.FC<TransactionItemProps> = React.memo(
  ({ transaction, onPress, style }) => {
    const { spacing, borderRadius: br } = useTheme();
    const color = typeColors[transaction.type];
    const sign = typeSigns[transaction.type];
    const iconName = (transaction.category?.name && categoryIcons[transaction.category.name]) || 'ellipsis-horizontal';

    return (
      <Pressable
        onPress={() => onPress?.(transaction.id)}
        style={[{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md }, style]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: br.md,
            backgroundColor: `${color}15`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={iconName as any} size={18} color={color} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text size="md" weight="medium" numberOfLines={1}>
            {transaction.description || transaction.category?.name || 'Операция'}
          </Text>
          <Text size="xs" style={{ color: '#71717A' }}>
            {transaction.category?.name} · {getRelativeTime(transaction.date)}
          </Text>
        </View>
        <Text size="md" weight="semibold" style={{ color }}>
          {sign}{formatCurrency(Math.abs(transaction.amount))}
        </Text>
      </Pressable>
    );
  },
);
