import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface BalanceHeroProps {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  lifeCostMonths?: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const BalanceHero: React.FC<BalanceHeroProps> = React.memo(
  ({ balance, monthlyIncome, monthlyExpense, lifeCostMonths, compact = false, style }) => {
    const { spacing } = useTheme();

    if (compact) {
      return (
        <Card variant="glass" padding="lg" style={style}>
          <Text size="sm" style={{ color: '#A1A1AA', marginBottom: spacing.xs }}>
            Баланс
          </Text>
          <Text preset="h1" style={{ marginBottom: spacing.md }}>
            {formatCurrency(balance)}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xxl }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34D399' }} />
              <Text size="sm" style={{ color: '#34D399' }}>
                +{formatCurrency(monthlyIncome)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#F87171' }} />
              <Text size="sm" style={{ color: '#F87171' }}>
                -{formatCurrency(monthlyExpense)}
              </Text>
            </View>
          </View>
        </Card>
      );
    }

    return (
      <Card variant="glass" padding="xxl" style={style}>
        <Text size="sm" weight="medium" style={{ color: '#A1A1AA', marginBottom: spacing.sm }}>
          Общий баланс
        </Text>
        <Text preset="display" style={{ marginBottom: spacing.lg }}>
          {formatCurrency(balance)}
        </Text>
        {lifeCostMonths !== undefined && lifeCostMonths > 0 && (
          <Text size="sm" style={{ color: '#A1A1AA', marginBottom: spacing.lg }}>
            {lifeCostMonths.toFixed(1)} месяцев без работы
          </Text>
        )}
        <View style={{ flexDirection: 'row', gap: spacing.xxl }}>
          <View style={{ flex: 1 }}>
            <Text size="xs" style={{ color: '#71717A', marginBottom: 2 }}>
              Доход
            </Text>
            <Text size="lg" weight="semibold" style={{ color: '#34D399' }}>
              +{formatCurrency(monthlyIncome)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text size="xs" style={{ color: '#71717A', marginBottom: 2 }}>
              Расход
            </Text>
            <Text size="lg" weight="semibold" style={{ color: '#F87171' }}>
              -{formatCurrency(monthlyExpense)}
            </Text>
          </View>
        </View>
      </Card>
    );
  },
);
