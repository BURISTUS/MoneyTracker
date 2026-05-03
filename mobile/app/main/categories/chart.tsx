import { useTranslation } from 'react-i18next';
import React, { useState, useMemo } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';
import { formatCurrency } from '../../../src/utils/formatters';

type ViewMode = 'EXPENSE' | 'INCOME';

export default function CategoriesChartScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-4 pb-3">
        <Text className="text-xl font-bold text-typography-white mb-3">{t("categories.expenseStructure")}</Text>

        <View className="flex-row gap-2">
          {[
            { key: 'EXPENSE' as const, label: 'Расходы', color: '#FF3B30' },
            { key: 'INCOME' as const, label: t("categories.income"), color: '#34C759' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setMode(tab.key)}
              className={`flex-1 py-2.5 items-center rounded-[10px] border ${
                mode === tab.key ? 'border-primary-400' : 'border-outline-200'
              }`}
              style={mode === tab.key ? { backgroundColor: tab.color + '20', borderColor: tab.color } : undefined}
            >
              <Text
                className={`text-sm font-semibold ${
                  mode === tab.key
                    ? tab.key === 'EXPENSE' ? 'text-error-400' : 'text-success-400'
                    : 'text-typography-400'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {totalAmount > 0 && (
        <View className="px-4 pb-4 items-center">
          <Text className="text-2xl font-bold text-typography-white">
            {formatCurrency(totalAmount)}
          </Text>
          {totalLifeHours && (
            <View className="flex-row items-center gap-1.5 mt-1.5 bg-background-50/50 px-3.5 py-1 rounded-full">
              <Text className="text-xs">⏱</Text>
              <Text className="text-xs text-warning-400">{t("categories.hoursOfWorkValue", { hours: totalLifeHours })}</Text>
            </View>
          )}
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {categoryTotals.length === 0 ? (
          <View className="items-center py-16">
            <Text className="text-lg text-typography-400">📊</Text>
            <Text className="text-base text-typography-400 mt-3">
              {t("categories.noData")}
            </Text>
          </View>
        ) : (
          categoryTotals.map((item) => {
            const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;

            return (
              <View
                key={item.categoryId}
                className="bg-background-50/20 rounded-[14px] p-3.5 mb-2"
              >
                <View className="flex-row items-center gap-3 mb-2.5">
                  <CategoryIcon
                    icon={item.category!.icon}
                    color={item.category!.color || (mode === 'EXPENSE' ? '#FF3B30' : '#34C759')}
                    size={22}
                  />

                  <View className="flex-1">
                    <Text className="text-base font-medium text-typography-white">
                      {item.category!.name}
                    </Text>
                    {mode === 'EXPENSE' && formatItemLifeHours(item.amount) && (
                      <Text className="text-xs text-warning-400">
                        ⏱ {formatItemLifeHours(item.amount)}
                      </Text>
                    )}
                  </View>

                  <View className="items-end">
                    <Text className="text-base font-bold text-typography-white">
                      {formatCurrency(item.amount)}
                    </Text>
                    <Text className="text-xs text-typography-400">
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <View className="h-1.5 bg-background-50/50 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(percentage, 1)}%`,
                      backgroundColor: item.category!.color || (mode === 'EXPENSE' ? '#FF3B30' : '#34C759'),
                    }}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
