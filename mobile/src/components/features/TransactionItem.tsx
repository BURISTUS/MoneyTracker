import React from 'react';
import { Pressable, type StyleProp, type ViewStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
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
  'Зарплата': 'card-outline',
  'Фриланс': 'laptop-outline',
  'Инвестиции': 'trending-up-outline',
  'Подарки': 'gift-outline',
  'Продукты': 'cart-outline',
  'Транспорт': 'bus-outline',
  'Жильё': 'home-outline',
  'Коммунальные': 'flash-outline',
  'Связь': 'call-outline',
  'Здоровье': 'heart-outline',
  'Развлечения': 'game-controller-outline',
  'Одежда': 'shirt-outline',
  'Рестораны': 'restaurant-outline',
  Другое: 'ellipsis-horizontal',
};

export const TransactionItem: React.FC<TransactionItemProps> = React.memo(
  ({ transaction, onPress, style }) => {
    const color = typeColors[transaction.type];
    const sign = typeSigns[transaction.type];
    const iconName = (transaction.category?.name && categoryIcons[transaction.category.name]) || 'ellipsis-horizontal';

    return (
      <Pressable
        onPress={() => onPress?.(transaction.id)}
        className={`flex-row items-center gap-3 py-3 ${style ? '' : ''}`}
        style={style}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Ionicons name={iconName as React.ComponentProps<typeof Ionicons>['name']} size={18} color={color} />
        </View>
        <View className="flex-1 gap-0.5">
          <Text className="text-base font-medium" numberOfLines={1}>
            {transaction.description || transaction.category?.name || 'Операция'}
          </Text>
          <Text className="text-xs text-typography-400">
            {transaction.category?.name} · {getRelativeTime(transaction.date)}
          </Text>
        </View>
        <Text className="text-base font-semibold" style={{ color }}>
          {sign}{formatCurrency(Math.abs(transaction.amount), transaction.account?.currency)}
        </Text>
      </Pressable>
    );
  },
);
