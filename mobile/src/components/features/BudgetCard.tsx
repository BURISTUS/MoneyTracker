import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../utils/formatters';
import type { Budget } from '../../types';

interface BudgetCardProps {
  budget: Budget;
  style?: StyleProp<ViewStyle>;
}

export const BudgetCard: React.FC<BudgetCardProps> = React.memo(({ budget, style }) => {
  const progress = budget.progress ?? 0;
  const isOverBudget = progress > 100;
  const isNearLimit = progress >= (budget.alertThreshold ?? 80);

  const progressColor = isOverBudget
    ? '#F87171'
    : isNearLimit
      ? '#FBBF24'
      : '#34D399';

  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View className="bg-background-50 rounded-2xl border border-outline-200 p-6" style={style}>
      <View className="flex-row justify-between mb-2">
        <Text className="text-base font-medium flex-1" numberOfLines={1}>
          {budget.category?.name || 'Категория'}
        </Text>
        <Text className="text-sm font-semibold" style={{ color: progressColor }}>
          {Math.round(progress)}%
        </Text>
      </View>
      <View className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden mb-2">
        <View
          className="h-full rounded-full"
          style={{ width: `${clampedProgress}%`, backgroundColor: progressColor }}
        />
      </View>
      <View className="flex-row justify-between">
        <Text className="text-xs text-typography-400">Потрачено: {formatCurrency(budget.spent ?? 0)}</Text>
        <Text className="text-xs text-typography-400">Лимит: {formatCurrency(budget.amount)}</Text>
      </View>
    </View>
  );
});
