import React from 'react';
import { View, FlatList } from 'react-native';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Card } from '../../../src/components/ui/Card';
import { ProgressBar } from '../../../src/components/ui/ProgressBar';
import { Icon } from '../../../src/components/ui/Icon';
import { Header } from '../../../src/components/layout/Header';
import { useTheme } from '../../../src/theme';
import { formatCurrency } from '../../../src/utils/formatters';

export default function BudgetScreen() {
  const { spacing } = useTheme();
  const budgets = useDataStore((s) => s.budgets);
  const transactions = useDataStore((s) => s.transactions);
  const accounts = useDataStore((s) => s.accounts);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const free = totalBudget - monthlyExpenses;

  const budgetsWithProgress = budgets.map((b) => {
    const spent = transactions
      .filter(
        (t) =>
          t.type === 'EXPENSE' &&
          t.categoryId === b.categoryId &&
          new Date(t.date) >= new Date(b.startDate) &&
          new Date(t.date) <= new Date(b.endDate),
      )
      .reduce((sum, t) => sum + t.amount, 0);
    const progress = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    return { ...b, spent, progress };
  });

  return (
    <Screen scroll header={<Header title="Бюджеты" showBack />}>
      <View style={{ gap: spacing.xl }}>
        <Card variant="glass" padding="xxl">
          <Text size="sm" style={{ color: '#71717A', marginBottom: 8 }}>
            Свободно в этом месяце
          </Text>
          <Text
            preset="h1"
            style={{ color: free >= 0 ? '#34D399' : '#F87171' }}
          >
            {free >= 0 ? '+' : ''}
            {formatCurrency(free)}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.xxl, marginTop: spacing.lg }}>
            <View>
              <Text size="xs" style={{ color: '#71717A' }}>Лимит</Text>
              <Text size="md" weight="semibold">{formatCurrency(totalBudget)}</Text>
            </View>
            <View>
              <Text size="xs" style={{ color: '#71717A' }}>Потрачено</Text>
              <Text size="md" weight="semibold" style={{ color: '#F87171' }}>
                {formatCurrency(monthlyExpenses)}
              </Text>
            </View>
          </View>
        </Card>

        <Text preset="h3">По категориям</Text>

        <FlatList
          data={budgetsWithProgress}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isOver = item.progress > 100;
            const isNear = item.progress >= (item.alertThreshold ?? 80);
            const color = isOver ? '#F87171' : isNear ? '#FBBF24' : '#34D399';
            return (
              <Card variant="glass" padding="lg" style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm }}>
                  <Text size="md" weight="medium" numberOfLines={1} style={{ flex: 1 }}>
                    {item.category?.name || 'Категория'}
                  </Text>
                  <Text size="sm" weight="semibold" style={{ color }}>
                    {Math.round(item.progress)}%
                  </Text>
                </View>
                <ProgressBar progress={Math.min(item.progress, 100)} color={color} height={6} style={{ marginBottom: spacing.sm }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text size="xs" style={{ color: '#71717A' }}>
                    {formatCurrency(item.spent)}
                  </Text>
                  <Text size="xs" style={{ color: '#A1A1AA' }}>
                    из {formatCurrency(item.amount)}
                  </Text>
                </View>
              </Card>
            );
          }}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <Icon name="pie-chart-outline" size={48} color="#52525B" />
              <Text size="md" style={{ color: '#71717A', marginTop: 12 }}>
                Нет бюджетов
              </Text>
            </View>
          }
        />
      </View>
    </Screen>
  );
}
