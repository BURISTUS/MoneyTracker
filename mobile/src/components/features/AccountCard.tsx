import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../utils/formatters';
import type { Account, AccountType } from '../../types';

interface AccountCardProps {
  account: Account;
  style?: StyleProp<ViewStyle>;
}

const accountIcons: Record<AccountType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  CASH: { icon: 'wallet-outline', color: '#34D399' },
  BANK: { icon: 'card-outline', color: '#6366F1' },
  CREDIT: { icon: 'card-outline', color: '#F87171' },
  INVESTMENT: { icon: 'trending-up-outline', color: '#FBBF24' },
  DEBT: { icon: 'alert-circle-outline', color: '#FB923C' },
};

export const AccountCard: React.FC<AccountCardProps> = React.memo(({ account, style }) => {
  const config = accountIcons[account.type] || accountIcons.CASH;

  return (
    <View className="bg-background-50 rounded-2xl border border-outline-200 p-4 gap-2" style={style}>
      <View className="flex-row items-center gap-2">
        <View
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Ionicons name={config.icon} size={18} color={config.color} />
        </View>
        <View className="flex-1">
          <Text className="text-sm font-medium" numberOfLines={1}>{account.name}</Text>
          <Text className="text-xs text-typography-400">{account.type}</Text>
        </View>
      </View>
      <Text className="text-xl font-bold">{formatCurrency(account.balance)}</Text>
    </View>
  );
});
