import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components/ui/text';
import { formatCurrency, getDaysRemaining } from '../../utils/formatters';
import type { Goal } from '../../types';

interface GoalCardProps {
  goal: Goal;
  style?: StyleProp<ViewStyle>;
}

export const GoalCard: React.FC<GoalCardProps> = React.memo(({ goal, style }) => {
  const { t } = useTranslation();
  const progress = goal.progress ?? (goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0);
  const daysLeft = getDaysRemaining(goal.deadline);
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View className="bg-background-50 rounded-2xl border border-outline-200 p-6" style={style}>
      <View className="flex-row justify-between mb-2">
        <Text className="text-base font-medium flex-1" numberOfLines={1}>{goal.name}</Text>
        {goal.isCompleted ? (
          <Text className="text-sm font-semibold text-success-400">{t('components.achieved')}</Text>
        ) : (
          <Text className="text-xs text-typography-400">{daysLeft} {t('components.daysShort')}</Text>
        )}
      </View>
      <View className="mb-2">
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-typography-400">{Math.round(clampedProgress)}%</Text>
        </View>
        <View className="h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
          <View
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${clampedProgress}%` }}
          />
        </View>
      </View>
      <View className="flex-row justify-between">
        <Text className="text-xs text-typography-400">{formatCurrency(goal.currentAmount)}</Text>
        <Text className="text-xs text-typography-400">{t('goalCard.of')} {formatCurrency(goal.targetAmount)}</Text>
      </View>
    </View>
  );
});
