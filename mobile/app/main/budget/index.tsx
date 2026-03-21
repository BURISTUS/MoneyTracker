import { View, Text, ScrollView, StyleSheet, SafeAreaView, useColorScheme, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDataStore } from '../../../src/stores/dataStore';
import { lightTheme, darkTheme } from '../../../src/utils/theme';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function BudgetCard({ budget }: { budget: any }) {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  
  const progress = budget.progress || 0;
  const isOverBudget = progress > 100;
  const isNearLimit = progress >= 80 && progress < 100;
  
  const getProgressColor = () => {
    if (isOverBudget) return colors.danger;
    if (isNearLimit) return colors.warning;
    return colors.success;
  };

  return (
    <View style={[styles.budgetCard, { backgroundColor: colors.surface }]}>
      <View style={styles.budgetHeader}>
        <View style={styles.budgetIcon}>
          <Ionicons name={budget.category?.icon as any || 'pie-chart'} size={20} color={budget.category?.color || colors.primary} />
        </View>
        <View style={styles.budgetInfo}>
          <Text style={[styles.budgetName, { color: colors.text }]}>{budget.category?.name || 'Бюджет'}</Text>
          <Text style={[styles.budgetPeriod, { color: colors.textSecondary }]}>
            {budget.period === 'MONTHLY' ? 'Этот месяц' : 'Период'}
          </Text>
        </View>
        {isOverBudget && (
          <View style={[styles.overBudgetBadge, { backgroundColor: colors.danger + '15' }]}>
            <Ionicons name="warning" size={14} color={colors.danger} />
            <Text style={[styles.overBudgetText, { color: colors.danger }]}>Превышен</Text>
          </View>
        )}
      </View>

      <View style={styles.budgetAmounts}>
        <View style={styles.amountItem}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Потрачено</Text>
          <Text style={[styles.amountValue, { color: isOverBudget ? colors.danger : colors.text }]}>
            {formatCurrency(budget.spent || 0)}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Бюджет</Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>
            {formatCurrency(budget.amount)}
          </Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Осталось</Text>
          <Text style={[styles.amountValue, { color: isOverBudget ? colors.danger : colors.success }]}>
            {formatCurrency(budget.remaining || 0)}
          </Text>
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
        <LinearGradient
          colors={[getProgressColor(), getProgressColor() + '80']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]}
        />
      </View>

      <View style={styles.budgetFooter}>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          {Math.round(progress)}% использовано
        </Text>
        {isNearLimit && !isOverBudget && (
          <View style={[styles.warningBadge, { backgroundColor: colors.warning + '15' }]}>
            <Text style={[styles.warningText, { color: colors.warning }]}>Осталось {formatCurrency(budget.remaining || 0)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function BudgetScreen() {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  const { budgets, getMonthlyIncome, getMonthlyExpenses } = useDataStore();

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.headerCard, { backgroundColor: colors.surface }]}>
          <View style={styles.headerRow}>
            <View style={styles.headerItem}>
              <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>Доход за месяц</Text>
              <Text style={[styles.headerValue, { color: colors.success }]}>{formatCurrency(monthlyIncome)}</Text>
            </View>
            <View style={styles.headerItem}>
              <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>Расход за месяц</Text>
              <Text style={[styles.headerValue, { color: colors.danger }]}>{formatCurrency(monthlyExpenses)}</Text>
            </View>
          </View>
          <View style={[styles.headerDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.headerRow}>
            <View style={styles.headerItem}>
              <Text style={[styles.headerLabel, { color: colors.textSecondary }]}>Свободно</Text>
              <Text style={[styles.headerValue, { color: monthlyIncome - monthlyExpenses >= 0 ? colors.success : colors.danger }]}>
                {formatCurrency(monthlyIncome - monthlyExpenses)}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={[styles.overallCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.overallLabel}>Общий бюджет</Text>
          <View style={styles.overallRow}>
            <Text style={styles.overallSpent}>{formatCurrency(totalSpent)}</Text>
            <Text style={styles.overallTotal}>/ {formatCurrency(totalBudget)}</Text>
          </View>
          <View style={[styles.overallProgressBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
            <View style={[styles.overallProgressFill, { width: `${Math.min(overallProgress, 100)}%`, backgroundColor: '#FFFFFF' }]} />
          </View>
          <Text style={styles.overallRemaining}>
            {totalRemaining >= 0 ? 'Осталось' : 'Превышено'} {formatCurrency(Math.abs(totalRemaining))}
          </Text>
        </Animated.View>

        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.surface }]} 
          onPress={() => Alert.alert('Информация', 'Создание нового бюджета')}
        >
          <Ionicons name="add" size={24} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Создать бюджет</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Бюджеты по категориям</Text>
        {budgets.map((budget, index) => (
          <Animated.View key={budget.id} entering={FadeInDown.duration(300).delay((index + 2) * 50)}>
            <BudgetCard budget={budget} />
          </Animated.View>
        ))}

        {budgets.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="pie-chart-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Нет бюджетов</Text>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>Создайте бюджет для отслеживания расходов</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },
  headerCard: { borderRadius: 20, padding: 20, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between' },
  headerItem: { flex: 1 },
  headerLabel: { fontSize: 13, marginBottom: 4 },
  headerValue: { fontSize: 20, fontWeight: '700' },
  headerDivider: { height: 1, marginVertical: 16 },
  overallCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  overallLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  overallRow: { flexDirection: 'row', alignItems: 'baseline' },
  overallSpent: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  overallTotal: { fontSize: 16, color: 'rgba(255,255,255,0.7)', marginLeft: 4 },
  overallProgressBar: { height: 8, borderRadius: 4, marginTop: 16, marginBottom: 8 },
  overallProgressFill: { height: '100%', borderRadius: 4 },
  overallRemaining: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8, marginBottom: 24 },
  addButtonText: { fontSize: 16, fontWeight: '600' },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  budgetCard: { borderRadius: 20, padding: 16, marginBottom: 12 },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  budgetIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  budgetInfo: { flex: 1 },
  budgetName: { fontSize: 16, fontWeight: '600' },
  budgetPeriod: { fontSize: 12, marginTop: 2 },
  overBudgetBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  overBudgetText: { fontSize: 12, fontWeight: '600' },
  budgetAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  amountItem: { alignItems: 'center' },
  amountLabel: { fontSize: 11, marginBottom: 4 },
  amountValue: { fontSize: 14, fontWeight: '600' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 4 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressText: { fontSize: 12 },
  warningBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  warningText: { fontSize: 12, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  emptyText: { fontSize: 14, marginTop: 4 },
});
