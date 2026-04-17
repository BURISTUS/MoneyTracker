import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { formatCurrency } from '../../../src/utils/formatters';

type ViewMode = 'EXPENSE' | 'INCOME';

export default function CategoriesChartScreen() {
  const transactions = useDataStore((s) => s.transactions);
  const categories = useDataStore((s) => s.categories);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [mode, setMode] = useState<ViewMode>('EXPENSE');

  const hourlyRate = useMemo(() => getHourlyRate(), [getHourlyRate]);

  const categoryTotals = useMemo(() => {
    const filtered = transactions.filter((t) => t.type === mode);
    const totals = new Map<string, number>();

    filtered.forEach((t) => {
      const current = totals.get(t.categoryId) || 0;
      totals.set(t.categoryId, current + t.amount);
    });

    return Array.from(totals.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return { categoryId, amount, category };
      })
      .filter((item) => item.category)
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories, mode]);

  const totalAmount = useMemo(
    () => categoryTotals.reduce((sum, item) => sum + item.amount, 0),
    [categoryTotals],
  );

  const totalLifeHours = useMemo(() => {
    if (mode !== 'EXPENSE' || hourlyRate <= 0 || totalAmount <= 0) return null;
    const rubles = totalAmount / 100;
    const hours = rubles / hourlyRate;
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 24) return `${hours.toFixed(1)} ч`;
    return `${(hours / 24).toFixed(1)} дн`;
  }, [mode, totalAmount, hourlyRate]);

  const formatItemLifeHours = (amountKopecks: number): string | null => {
    if (mode !== 'EXPENSE' || hourlyRate <= 0) return null;
    const rubles = amountKopecks / 100;
    const hours = rubles / hourlyRate;
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 24) return `${hours.toFixed(1)} ч`;
    return `${(hours / 24).toFixed(1)} дн`;
  };

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}>
          <Text size="xl" weight="bold" style={{ color: '#FFFFFF', marginBottom: 12 }}>
            Структура расходов
          </Text>

          {/* Mode toggle */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { key: 'EXPENSE' as const, label: 'Расходы', color: '#FF3B30' },
              { key: 'INCOME' as const, label: 'Доходы', color: '#34C759' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setMode(tab.key)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: mode === tab.key ? tab.color + '20' : 'transparent',
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: mode === tab.key ? tab.color : 'rgba(255,255,255,0.1)',
                }}
              >
                <Text
                  size="sm"
                  weight="semibold"
                  style={{ color: mode === tab.key ? tab.color : '#8E8E93' }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        {totalAmount > 0 && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16, alignItems: 'center' }}>
            <Text size="xxl" weight="bold" style={{ color: '#FFFFFF' }}>
              {formatCurrency(totalAmount)}
            </Text>
            {totalLifeHours && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: 6,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                paddingHorizontal: 14,
                paddingVertical: 4,
                borderRadius: 20,
              }}>
                <Text size="xs">⏱</Text>
                <Text size="xs" style={{ color: '#FBBF24' }}>{totalLifeHours} работы</Text>
              </View>
            )}
          </View>
        )}

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          {categoryTotals.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text size="lg" style={{ color: '#3A3A3C' }}>📊</Text>
              <Text size="md" style={{ color: '#8E8E93', marginTop: 12 }}>
                Нет данных за период
              </Text>
            </View>
          ) : (
            categoryTotals.map((item, index) => {
              const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;

              return (
                <View
                  key={item.categoryId}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderRadius: 14,
                    padding: 14,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <View style={{
                      width: 42,
                      height: 42,
                      borderRadius: 21,
                      backgroundColor: item.category!.color || (mode === 'EXPENSE' ? '#FF3B30' : '#34C759'),
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Text size="xl">{item.category!.icon || '💰'}</Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text size="md" weight="medium" style={{ color: '#FFFFFF' }}>
                        {item.category!.name}
                      </Text>
                      {mode === 'EXPENSE' && formatItemLifeHours(item.amount) && (
                        <Text size="xs" style={{ color: '#FBBF24' }}>
                          ⏱ {formatItemLifeHours(item.amount)}
                        </Text>
                      )}
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text size="md" weight="bold" style={{ color: '#FFFFFF' }}>
                        {formatCurrency(item.amount)}
                      </Text>
                      <Text size="xs" style={{ color: '#8E8E93' }}>
                        {percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={{
                    height: 6,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      height: '100%',
                      width: `${Math.max(percentage, 1)}%`,
                      backgroundColor: item.category!.color || (mode === 'EXPENSE' ? '#FF3B30' : '#34C759'),
                      borderRadius: 3,
                    }} />
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </Screen>
  );
}
