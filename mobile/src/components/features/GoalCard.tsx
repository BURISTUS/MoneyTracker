import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { formatCurrency, getDaysRemaining } from '../../utils/formatters';
import type { Goal } from '../../types';

interface GoalCardProps {
  goal: Goal;
  style?: StyleProp<ViewStyle>;
}

export const GoalCard: React.FC<GoalCardProps> = React.memo(({ goal, style }) => {
  const { spacing } = useTheme();
  const progress = goal.progress ?? (goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0);
  const daysLeft = getDaysRemaining(goal.deadline);

  return (
    <Card variant="glass" padding="lg" style={style}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
        <Text size="md" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
          {goal.name}
        </Text>
        {goal.isCompleted ? (
          <Text size="sm" weight="semibold" style={{ color: '#34D399' }}>
            Достигнута
          </Text>
        ) : (
          <Text size="xs" style={{ color: '#71717A' }}>
            {daysLeft} дн.
          </Text>
        )}
      </View>
      <ProgressBar
        progress={progress}
        gradient={['#6366F1', '#818CF8']}
        height={6}
        showPercent
        style={{ marginBottom: spacing.sm }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text size="xs" style={{ color: '#71717A' }}>
          {formatCurrency(goal.currentAmount)}
        </Text>
        <Text size="xs" style={{ color: '#A1A1AA' }}>
          из {formatCurrency(goal.targetAmount)}
        </Text>
      </View>
    </Card>
  );
});
