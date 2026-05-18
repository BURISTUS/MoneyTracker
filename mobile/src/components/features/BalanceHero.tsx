import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components/ui/text';
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
    const { t } = useTranslation();
    if (compact) {
      return (
        <View className="bg-background-50 rounded-2xl border border-outline-200 p-6" style={style}>
          <Text className="text-sm text-typography-400 mb-1">{t('components.balanceLabel')}</Text>
          <Text className="text-3xl font-bold mb-3">{formatCurrency(balance)}</Text>
          <View className="flex-row gap-8">
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-success-400" />
              <Text className="text-sm text-success-400">+{formatCurrency(monthlyIncome)}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <View className="w-2 h-2 rounded-full bg-error-400" />
              <Text className="text-sm text-error-400">-{formatCurrency(monthlyExpense)}</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View className="bg-background-50 rounded-2xl border border-outline-200 p-8" style={style}>
        <Text className="text-sm font-medium text-typography-400 mb-2">{t('components.totalBalance')}</Text>
        <Text className="text-4xl font-bold mb-4">{formatCurrency(balance)}</Text>
        {lifeCostMonths !== undefined && lifeCostMonths > 0 && (
          <Text className="text-sm text-typography-400 mb-4">
            {lifeCostMonths.toFixed(1)} {t('components.monthsNoWork')}
          </Text>
        )}
        <View className="flex-row gap-8">
          <View className="flex-1">
            <Text className="text-xs text-typography-400 mb-0.5">{t('components.incomeLabel')}</Text>
            <Text className="text-lg font-semibold text-success-400">+{formatCurrency(monthlyIncome)}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-typography-400 mb-0.5">{t('components.expenseLabel')}</Text>
            <Text className="text-lg font-semibold text-error-400">-{formatCurrency(monthlyExpense)}</Text>
          </View>
        </View>
      </View>
    );
  },
);
