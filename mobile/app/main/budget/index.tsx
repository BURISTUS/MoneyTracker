import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../../src/utils/formatters';

const BORDER = 'rgba(255,255,255,0.08)';
const CARD_BG = '#141418';

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const budgets = useDataStore((s) => s.budgets);
  const transactions = useDataStore((s) => s.transactions);

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
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Ionicons name="wallet-outline" size={22} color="#6366F1" />
        <Text style={s.headerTitle}>Бюджеты</Text>
      </View>

      <View style={s.content}>
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Ionicons name="pie-chart-outline" size={18} color="#6366F1" />
          </View>
          <Text style={s.cardLabel}>Свободно в этом месяце</Text>
          <Text style={[s.freeValue, { color: free >= 0 ? '#34D399' : '#F87171' }]}>
            {free >= 0 ? '+' : ''}{formatCurrency(free)}
          </Text>
          <View style={s.statsRow}>
            <View>
              <Text style={s.statsLabel}>Лимит</Text>
              <Text style={s.statsValue}>{formatCurrency(totalBudget)}</Text>
            </View>
            <View style={s.statsDivider} />
            <View>
              <Text style={s.statsLabel}>Потрачено</Text>
              <Text style={[s.statsValue, { color: '#F87171' }]}>{formatCurrency(monthlyExpenses)}</Text>
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>По категориям</Text>

        <FlatList
          data={budgetsWithProgress}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isOver = item.progress > 100;
            const isNear = item.progress >= (item.alertThreshold ?? 80);
            const color = isOver ? '#F87171' : isNear ? '#FBBF24' : '#34D399';
            return (
              <View style={s.card}>
                <View style={s.budgetHeader}>
                  <Text style={s.budgetName} numberOfLines={1}>
                    {item.category?.name || 'Категория'}
                  </Text>
                  <Text style={[s.budgetPct, { color }]}>{Math.round(item.progress)}%</Text>
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: `${Math.min(item.progress, 100)}%`, backgroundColor: color }]} />
                </View>
                <View style={s.budgetFooter}>
                  <Text style={s.budgetFooterText}>{formatCurrency(item.spent)}</Text>
                  <Text style={s.budgetFooterText}>из {formatCurrency(item.amount)}</Text>
                </View>
              </View>
            );
          }}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="pie-chart-outline" size={44} color="#3F3F46" />
              <Text style={s.emptyText}>Нет бюджетов</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    marginBottom: 10,
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  cardLabel: { fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 },
  freeValue: { fontSize: 32, fontWeight: '700', letterSpacing: -1, marginBottom: 14 },
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },
  statsLabel: { fontSize: 12, color: '#52525B', marginBottom: 3 },
  statsValue: { fontSize: 15, fontWeight: '600', color: '#D4D4D8' },
  statsDivider: { width: 1, backgroundColor: BORDER, marginHorizontal: 16, alignSelf: 'stretch' },

  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#A1A1AA', marginBottom: 10, marginTop: 4 },

  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  budgetName: { fontSize: 15, fontWeight: '600', color: '#E4E4E7', flex: 1 },
  budgetPct: { fontSize: 14, fontWeight: '700' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: 6, borderRadius: 3 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetFooterText: { fontSize: 12, color: '#52525B' },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#3F3F46', marginTop: 8 },
});
