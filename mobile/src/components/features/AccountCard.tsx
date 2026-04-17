import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { formatCurrency } from '../../utils/formatters';
import type { Account, AccountType } from '../../types';

interface AccountCardProps {
  account: Account;
  style?: StyleProp<ViewStyle>;
}

const accountIcons: Record<AccountType, { icon: React.ComponentProps<typeof Icon>['name']; color: string }> = {
  CASH: { icon: 'wallet', color: '#34D399' },
  BANK: { icon: 'card', color: '#6366F1' },
  CREDIT: { icon: 'card-outline', color: '#F87171' },
  INVESTMENT: { icon: 'trending-up', color: '#FBBF24' },
  DEBT: { icon: 'alert-circle', color: '#FB923C' },
};

export const AccountCard: React.FC<AccountCardProps> = React.memo(({ account, style }) => {
  const { spacing, borderRadius: br } = useTheme();
  const config = accountIcons[account.type] || accountIcons.CASH;

  return (
    <Card variant="glass" padding="md" style={[{ gap: spacing.sm }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: br.md,
            backgroundColor: `${config.color}15`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={config.icon} size={18} color={config.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text size="sm" weight="medium" numberOfLines={1}>
            {account.name}
          </Text>
          <Text size="xs" style={{ color: '#71717A' }}>
            {account.type}
          </Text>
        </View>
      </View>
      <Text size="xl" weight="bold">
        {formatCurrency(account.balance)}
      </Text>
    </Card>
  );
});
