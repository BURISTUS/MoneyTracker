import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../src/stores/dataStore';
import { Text } from '../../components/ui/text';
import { Loading } from '../../src/components/ui/Loading';
import { formatCurrency } from '../../src/utils/formatters';
import { ToastContainer } from '../../src/components/ui/Toast';
import { AddTransactionModal } from '../../src/components/ui/AddTransactionModal';
import { TransactionType as TransactionTypeEnum } from '../../src/types';

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  if (hours < 100) return `${hours.toFixed(1)} ч`;
  return `${Math.round(hours)} ч`;
}

const C = {
  bg: '#0A0A0F',
  card: '#141418',
  border: 'rgba(255,255,255,0.08)',
  textMain: '#F5F5F5',
  textSec: '#8C8C8C',
  indigo: '#6366F1',
  orange: '#FF9500',
  green: '#34D399',
  red: '#FF3B30',
  blue: '#4F6EF7',
};

const S = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingBottom: 120 },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tabText: { fontSize: 14, fontWeight: '600' },

  heroCard: {
    backgroundColor: C.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
    alignItems: 'center',
    marginTop: 4,
  },
  heroLabel: { fontSize: 13, color: C.textSec, fontWeight: '500', marginBottom: 6 },
  heroValue: { fontSize: 48, fontWeight: '800', color: C.textMain, letterSpacing: -1.5 },
  heroSub: { fontSize: 13, color: C.textSec, marginTop: 4 },
  heroRate: { fontSize: 12, color: C.indigo, marginTop: 8, fontWeight: '600' },

  alertCard: {
    backgroundColor: 'rgba(255,149,0,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.2)',
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  alertCount: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertCountText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  alertTitle: { fontSize: 15, fontWeight: '700', color: C.textMain },
  alertSub: { fontSize: 13, color: C.textSec, marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: C.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: C.textMain },
  statLabel: { fontSize: 11, color: C.textSec, marginTop: 4, fontWeight: '500' },

  pulseCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  pulseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  pulseLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  pulseLabel: { fontSize: 13, color: C.textSec },
  pulseValue: { fontSize: 14, fontWeight: '700', color: C.textMain },

  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  actionBtn: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  actionText: { fontSize: 12, fontWeight: '600', marginTop: 6 },

  articleCard: {
    backgroundColor: C.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
    marginBottom: 10,
  },
  articleTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99,102,241,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  articleTagText: { fontSize: 11, fontWeight: '700', color: C.indigo },
  articleTitle: { fontSize: 16, fontWeight: '700', color: C.textMain, lineHeight: 22 },
  articleSub: { fontSize: 13, color: C.textSec, marginTop: 6, lineHeight: 18 },
  articleTime: { fontSize: 11, color: C.textSec, marginTop: 12 },
});

const ARTICLES = [
  {
    id: '1',
    tag: 'Life-Cost',
    title: 'Что такое цена вашей жизни',
    sub: 'Каждая трата — это часы работы. Узнайте, сколько часов стоит ваша следующая покупка.',
    time: '3 мин',
  },
  {
    id: '2',
    tag: 'Психология',
    title: 'Правило 7 дней перед покупкой',
    sub: 'Как заморозить импульс и принять осознанное решение о трате денег.',
    time: '4 мин',
  },
  {
    id: '3',
    tag: 'Практика',
    title: 'Бюджет за 5 минут',
    sub: 'Простой способ контролировать расходы без сложных таблиц и приложений.',
    time: '5 мин',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const initializeData = useDataStore((s) => s.initializeData);
  const transactions = useDataStore((s) => s.transactions);
  const wishlist = useDataStore((s) => s.wishlist);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);
  const isLoading = useDataStore((s) => s.isLoadingTransactions);

  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'overview' | 'read'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<TransactionTypeEnum>(TransactionTypeEnum.EXPENSE);

  useEffect(() => {
    initializeData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  }, []);

  const hourlyRate = useMemo(() => getHourlyRate(), [getHourlyRate]);

  const categories = useDataStore((s) => s.categories);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const excludedIds = useMemo(
    () => new Set(categories.filter((c) => c.excludeFromTotal).map((c) => c.id)),
    [categories],
  );

  const todayExpenses = useMemo(
    () => transactions
      .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= today && !excludedIds.has(t.categoryId))
      .reduce((sum, t) => sum + t.amount, 0),
    [transactions, excludedIds],
  );

  const todayHours = useMemo(() => {
    if (hourlyRate <= 0) return 0;
    return (todayExpenses / 100) / hourlyRate;
  }, [todayExpenses, hourlyRate]);

  const savedHours = useMemo(() => {
    if (hourlyRate <= 0) return 0;
    const rejected = wishlist.filter((w) => w.status === 'REJECTED');
    const total = rejected.reduce((s, w) => s + w.price, 0);
    return (total / 100) / hourlyRate;
  }, [wishlist, hourlyRate]);

  const readyCount = useMemo(
    () => wishlist.filter((w) => w.status === 'READY').length,
    [wishlist],
  );

  const topCategoryToday = useMemo(() => {
    const map = new Map<string, number>();
    transactions
      .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= today)
      .forEach((t) => {
        map.set(t.categoryId || 'none', (map.get(t.categoryId || 'none') || 0) + t.amount);
      });
    let top = '';
    let max = 0;
    map.forEach((val, key) => {
      if (val > max) { max = val; top = key; }
    });
    return { id: top, amount: max };
  }, [transactions]);

  const biggestToday = useMemo(() => {
    const todayTx = transactions.filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= today);
    if (todayTx.length === 0) return null;
    return todayTx.reduce((max, t) => (t.amount > max.amount ? t : max), todayTx[0]);
  }, [transactions]);

  const topCategoryName = useMemo(() => {
    if (!topCategoryToday.id) return null;
    return categories.find((c) => c.id === topCategoryToday.id)?.name || null;
  }, [topCategoryToday, categories]);

  return (
    <View style={[S.flex, S.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={S.flex}
        contentContainerStyle={[S.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.indigo} />
        }
      >
        {/* Header Switcher */}
        <View style={S.header}>
          <Pressable
            onPress={() => setTab('overview')}
            style={[S.tabPill, { backgroundColor: tab === 'overview' ? C.indigo : 'transparent' }]}
          >
            <Text style={[S.tabText, { color: tab === 'overview' ? '#FFF' : C.textSec }]}>Обзор</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('read')}
            style={[S.tabPill, { backgroundColor: tab === 'read' ? C.indigo : 'transparent' }]}
          >
            <Text style={[S.tabText, { color: tab === 'read' ? '#FFF' : C.textSec }]}>Читать</Text>
          </Pressable>
        </View>

        <ToastContainer />

        {tab === 'overview' ? (
          <View style={{ gap: 12 }}>
            {/* Life-Cost Hero */}
            <View style={S.heroCard}>
              <Text style={S.heroLabel}>Потрачено сегодня</Text>
              <Text style={S.heroValue}>{todayHours > 0 ? formatHours(todayHours) : '—'}</Text>
              <Text style={S.heroSub}>
                {todayExpenses > 0 ? formatCurrency(todayExpenses) : 'Нет трат'}
              </Text>
              {hourlyRate > 0 && (
                <Text style={S.heroRate}>{hourlyRate.toFixed(0)} ₽/час</Text>
              )}
            </View>

            {/* Incubator Alert */}
            {readyCount > 0 && (
              <TouchableOpacity
                onPress={() => router.push('/main/wishlist/' as never)}
                style={S.alertCard}
              >
                <View style={S.alertCount}>
                  <Text style={S.alertCountText}>{readyCount}</Text>
                </View>
                <View style={S.flex}>
                  <Text style={S.alertTitle}>Требуется решение</Text>
                  <Text style={S.alertSub}>Желания остыли — примите решение</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={C.orange} />
              </TouchableOpacity>
            )}

            {/* Stats Row */}
            <View style={S.statsRow}>
              <View style={S.statCard}>
                <View style={[S.statIconWrap, { backgroundColor: 'rgba(52,211,153,0.12)' }]}>
                  <Ionicons name="trending-up" size={18} color={C.green} />
                </View>
                <Text style={[S.statValue, { color: C.green }]}>
                  {savedHours > 0 ? formatHours(savedHours) : '—'}
                </Text>
                <Text style={S.statLabel}>Сэкономлено</Text>
              </View>
              <View style={S.statCard}>
                <View style={[S.statIconWrap, { backgroundColor: 'rgba(255,149,0,0.12)' }]}>
                  <Ionicons name="snow" size={18} color={C.orange} />
                </View>
                <Text style={[S.statValue, { color: C.orange }]}>
                  {wishlist.filter((w) => w.status === 'PENDING').length}
                </Text>
                <Text style={S.statLabel}>В инкубаторе</Text>
              </View>
            </View>

            {/* Daily Pulse */}
            <View style={S.pulseCard}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.textMain, marginBottom: 4 }}>
                Сегодня
              </Text>
              <View style={S.pulseRow}>
                <Text style={S.pulseLabel}>Самая крупная трата</Text>
                <Text style={S.pulseValue}>
                  {biggestToday ? formatCurrency(biggestToday.amount) : '—'}
                </Text>
              </View>
              <View style={S.pulseRow}>
                <Text style={S.pulseLabel}>Топ-категория</Text>
                <Text style={S.pulseValue}>{topCategoryName ?? '—'}</Text>
              </View>
              <View style={S.pulseLast}>
                <Text style={S.pulseLabel}>Транзакций</Text>
                <Text style={S.pulseValue}>
                  {transactions.filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= today).length}
                </Text>
              </View>
            </View>

            {/* Quick Actions */}
            <View style={S.actionsRow}>
              <TouchableOpacity
                onPress={() => { setAddType(TransactionTypeEnum.EXPENSE); setShowAddModal(true); }}
                style={[S.actionBtn, { backgroundColor: 'rgba(255,59,48,0.08)', borderColor: 'rgba(255,59,48,0.15)' }]}
              >
                <Ionicons name="remove-circle" size={22} color={C.red} />
                <Text style={[S.actionText, { color: C.red }]}>Трата</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/main/wishlist/' as never)}
                style={[S.actionBtn, { backgroundColor: 'rgba(79,110,247,0.08)', borderColor: 'rgba(79,110,247,0.15)' }]}
              >
                <Ionicons name="snow" size={22} color={C.blue} />
                <Text style={[S.actionText, { color: C.blue }]}>Заморозить</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setAddType(TransactionTypeEnum.INCOME); setShowAddModal(true); }}
                style={[S.actionBtn, { backgroundColor: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.15)' }]}
              >
                <Ionicons name="add-circle" size={22} color={C.green} />
                <Text style={[S.actionText, { color: C.green }]}>Доход</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Read Tab */
          <View style={{ gap: 10, paddingTop: 4 }}>
            {ARTICLES.map((article) => (
              <TouchableOpacity key={article.id} style={S.articleCard}>
                <View style={S.articleTag}>
                  <Text style={S.articleTagText}>{article.tag}</Text>
                </View>
                <Text style={S.articleTitle}>{article.title}</Text>
                <Text style={S.articleSub}>{article.sub}</Text>
                <Text style={S.articleTime}>{article.time} чтения</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onComplete={() => setShowAddModal(false)}
        initialType={addType}
      />
    </View>
  );
}
