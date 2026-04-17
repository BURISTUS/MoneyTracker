import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency } from '../../utils/formatters';
import type { Budget } from '../../types';

interface BudgetCardProps {
  budget: Budget;
  style?: StyleProp<ViewStyle>;
}

export const BudgetCard: React.FC<BudgetCardProps> = React.memo(({ budget, style }) => {
  const { spacing } = useTheme();
  const progress = budget.progress ?? 0;
  const isOverBudget = progress > 100;
  const isNearLimit = progress >= (budget.alertThreshold ?? 80);

  const progressColor = isOverBudget
    ? '#F87171'
    : isNearLimit
      ? '#FBBF24'
      : '#34D399';

  return (
    <Card variant="glass" padding="lg" style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <Text size="md" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
          {budget.category?.name || 'Категория'}
        </Text>
        <Text size="sm" weight="semibold" style={{ color: progressColor }}>
          {Math.round(progress)}%
        </Text>
      </View>
      <ProgressBar
        progress={Math.min(progress, 100)}
        color={progressColor}
        height={6}
        style={{ marginBottom: spacing.sm }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text size="xs" style={{ color: '#71717A' }}>
          Потрачено: {formatCurrency(budget.spent ?? 0)}
        </Text>
        <Text size="xs" style={{ color: '#71717A' }}>
          Лимит: {formatCurrency(budget.amount)}
        </Text>
      </View>
    </Card>
  );
});
