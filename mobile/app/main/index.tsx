import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../src/stores/dataStore';
import { useTheme } from '../../src/stores/themeStore';
import { Text } from '../../components/ui/text';
import { ReceiptScannerButton } from '../../src/components/ui/ReceiptScanner';
import { AiTransactionPreview } from '../../src/components/ui/AiTransactionPreview';
import type { AiTransactionResult, AiReceiptResult } from '../../src/services/ai';
import { Loading } from '../../src/components/ui/Loading';
import { formatCurrency } from '../../src/utils/formatters';
import { AddTransactionModal } from '../../src/components/ui/AddTransactionModal';
import { TransactionType as TransactionTypeEnum } from '../../src/types';
import { getTransactionCurrency } from '../../src/utils/transactionUtils';
import { useSubscriptionStore } from '../../src/stores/subscriptionStore';
import { PremiumBadge } from '../../src/components/ui/PremiumBadge';
import { useToast } from '../../src/components/ui/Toast';
import { CategoryIcon } from '../../src/components/ui/CategoryIcon';
import { useNotificationsStore } from '../../src/stores/notificationsStore';
import type { FeatureKey } from '../../src/types';

function formatHours(hours: number, t: (key: string, opts?: any) => string): string {
  if (hours < 1) return `${Math.round(hours * 60)} ${t('common.min')}`;
  if (hours < 100) return `${hours.toFixed(1)} ${t('common.workUnit')}`;
  return `${Math.round(hours)} ${t('common.workUnit')}`;
}

export default function HomeScreen() {
  const C = useTheme();
  const S = useMemo(() => ({
    flex: { flex: 1 },
    screen: { backgroundColor: C.bg },
    scroll: { paddingHorizontal: 16, paddingBottom: 120 },
    header: { flexDirection: 'row' as const, justifyContent: 'center' as const, alignItems: 'center' as const, paddingVertical: 10, gap: 4 },
    tabPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
    tabText: { fontSize: 14, fontWeight: '600' as const },
    heroCard: { backgroundColor: C.card, borderRadius: 24, borderWidth: 1, borderColor: C.border, padding: 24, alignItems: 'center' as const, marginTop: 4 },
    heroLabel: { fontSize: 13, color: C.textSec, fontWeight: '500' as const, marginBottom: 6 },
    heroValue: { fontSize: 48, fontWeight: '800' as const, color: C.textMain, letterSpacing: -1.5 },
    heroSub: { fontSize: 13, color: C.textSec, marginTop: 4 },
    heroRate: { fontSize: 12, color: C.primary, marginTop: 8, fontWeight: '600' as const },
    alertCard: { backgroundColor: C.orangeBg, borderRadius: 20, borderWidth: 1, borderColor: C.orangeBorder, padding: 18, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14 },
    alertCount: { width: 44, height: 44, borderRadius: 14, backgroundColor: C.orange, alignItems: 'center' as const, justifyContent: 'center' as const },
    alertCountText: { fontSize: 18, fontWeight: '800' as const, color: '#FFF' },
    alertTitle: { fontSize: 15, fontWeight: '700' as const, color: C.textMain },
    alertSub: { fontSize: 13, color: C.textSec, marginTop: 2 },
    statsRow: { flexDirection: 'row' as const, gap: 10 },
    statCard: { flex: 1, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 16, alignItems: 'center' as const },
    statIconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 8 },
    statValue: { fontSize: 18, fontWeight: '800' as const, color: C.textMain },
    statLabel: { fontSize: 11, color: C.textSec, marginTop: 4, fontWeight: '500' as const },
    pulseCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 18 },
    pulseRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border },
    pulseLast: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingVertical: 10 },
    pulseLabel: { fontSize: 13, color: C.textSec },
    pulseValue: { fontSize: 14, fontWeight: '700' as const, color: C.textMain },
    actionsRow: { flexDirection: 'row' as const, gap: 10, marginTop: 2 },
    actionBtn: { flex: 1, borderRadius: 18, paddingVertical: 16, alignItems: 'center' as const, borderWidth: 1 },
    actionText: { fontSize: 12, fontWeight: '600' as const, marginTop: 6 },
    monthCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 18 },
    monthTitle: { fontSize: 15, fontWeight: '700' as const, color: C.textMain, marginBottom: 12 },
    monthRow: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginBottom: 8 },
    monthLabel: { fontSize: 13, color: C.textSec },
    monthValue: { fontSize: 14, fontWeight: '700' as const, color: C.textMain },
    barTrack: { height: 6, borderRadius: 3, backgroundColor: C.divider, marginBottom: 4 },
    barFill: { height: 6, borderRadius: 3 },
    articleCard: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 10 },
    articleTag: { alignSelf: 'flex-start' as const, backgroundColor: C.primaryBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 10 },
    articleTagText: { fontSize: 11, fontWeight: '700' as const, color: C.primary },
    articleTitle: { fontSize: 16, fontWeight: '700' as const, color: C.textMain, lineHeight: 22 },
    articleSub: { fontSize: 13, color: C.textSec, marginTop: 6, lineHeight: 18 },
    articleFooter: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, marginTop: 12 },
    articleTime: { fontSize: 11, color: C.textSec },
    articleViews: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
    articleViewsText: { fontSize: 11, color: C.textSec },
    emptyState: { alignItems: 'center' as const, paddingVertical: 40 },
    emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: C.inputBg, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 16 },
    emptyTitle: { fontSize: 15, fontWeight: '600' as const, color: C.textSec },
    emptySub: { fontSize: 13, color: C.textMuted, marginTop: 4 },
  }), [C]);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const initializeData = useDataStore((s) => s.initializeData);
  const transactions = useDataStore((s) => s.transactions);
  const wishlist = useDataStore((s) => s.wishlist);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);
  const currencySymbol = useDataStore((s) => s.currencySymbol);
  const convertToUserCurrency = useDataStore((s) => s.convertToUserCurrency);
  const isLoading = useDataStore((s) => s.isLoadingTransactions);
  const articles = useDataStore((s) => s.articles);
  const isLoadingArticles = useDataStore((s) => s.isLoadingArticles);
  const fetchArticles = useDataStore((s) => s.fetchArticles);
  const budgets = useDataStore((s) => s.budgets);
  const fetchBudgets = useDataStore((s) => s.fetchBudgets);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const fetchUnreadCount = useNotificationsStore((s) => s.fetchUnreadCount);

  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'overview' | 'read'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<TransactionTypeEnum>(TransactionTypeEnum.EXPENSE);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [aiResult, setAiResult] = useState<AiTransactionResult | AiReceiptResult | null>(null);
  const showPaywallFn = useSubscriptionStore((s) => s.showPaywall);
  const checkAccess = useSubscriptionStore((s) => s.checkAccess);
  const isPremiumUser = useSubscriptionStore((s) => s.isPremium());
  const toast = useToast();

  useEffect(() => {
    initializeData();
    fetchUnreadCount();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  }, []);

  const onArticlePress = useCallback(async (id: string) => {
    router.push(`/main/articles/${id}` as never);
  }, [router]);

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
      .reduce((sum, t) => {
        const accCur = getTransactionCurrency(t);
        return sum + convertToUserCurrency(Number(t.amount), accCur);
      }, 0),
    [transactions, excludedIds, convertToUserCurrency],
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
    return todayTx.reduce((max, t) => {
      const a = convertToUserCurrency(Number(t.amount), getTransactionCurrency(t));
      const maxA = convertToUserCurrency(Number(max.amount), getTransactionCurrency(max));
      return a > maxA ? t : max;
    }, todayTx[0]);
  }, [transactions, convertToUserCurrency]);

  const topCategoryName = useMemo(() => {
    if (!topCategoryToday.id) return null;
    return categories.find((c) => c.id === topCategoryToday.id)?.name || null;
  }, [topCategoryToday, categories]);

  // Month summary
  const monthSummary = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthTx = transactions.filter((t) => new Date(t.date) >= startOfMonth && !excludedIds.has(t.categoryId));
    const income = monthTx
      .filter((t) => t.type === 'INCOME')
      .reduce((s, t) => s + convertToUserCurrency(Number(t.amount), getTransactionCurrency(t)), 0);
    const expense = monthTx
      .filter((t) => t.type === 'EXPENSE')
      .reduce((s, t) => s + convertToUserCurrency(Number(t.amount), getTransactionCurrency(t)), 0);
    const balance = income - expense;
    return { income, expense, balance };
  }, [transactions, excludedIds, convertToUserCurrency]);

  return (
    <View style={[S.flex, S.screen, { paddingTop: insets.top }]}>
      <ScrollView
        style={S.flex}
        contentContainerStyle={[S.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
        }
      >
        {/* Header Switcher */}
        <View style={S.header}>
          <Pressable
            onPress={() => setTab('overview')}
            style={[S.tabPill, { backgroundColor: tab === 'overview' ? C.primary : 'transparent' }]}
          >
            <Text style={[S.tabText, { color: tab === 'overview' ? '#FFF' : C.textSec }]}>{t('home.tabOverview')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('read')}
            style={[S.tabPill, { backgroundColor: tab === 'read' ? C.primary : 'transparent' }]}
          >
            <Text style={[S.tabText, { color: tab === 'read' ? '#FFF' : C.textSec }]}>{t('home.tabRead')}</Text>
          </Pressable>
          <TouchableOpacity
            onPress={() => router.push('/main/notifications/' as never)}
            style={{ marginLeft: 'auto', padding: 6, position: 'relative' }}
          >
            <Ionicons name="notifications-outline" size={22} color={C.textMain} />
            {unreadCount > 0 && (
              <View style={{
                position: 'absolute',
                top: 2, right: 2,
                minWidth: 16, height: 16,
                borderRadius: 8,
                backgroundColor: C.red,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFF', lineHeight: 16 }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {tab === 'overview' ? (
          <View style={{ gap: 12 }}>
            {/* Life-Cost Hero */}
            <View style={S.heroCard}>
              <Text style={S.heroLabel}>{t('home.spentToday')}</Text>
              <Text style={S.heroValue}>{todayHours > 0 ? formatHours(todayHours, t) : '—'}</Text>
              <Text style={S.heroSub}>
                {todayExpenses > 0 ? formatCurrency(todayExpenses) : t('home.noExpenses')}
              </Text>
              {hourlyRate > 0 && (
                <Text style={S.heroRate}>{currencySymbol}{hourlyRate.toFixed(0)}/{t('common.workUnit')}</Text>
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
                  <Text style={S.alertTitle}>{t('home.decisionRequired')}</Text>
                  <Text style={S.alertSub}>{t('home.wishesCooledDown')}</Text>
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
                  {savedHours > 0 ? formatHours(savedHours, t) : '—'}
                </Text>
                <Text style={S.statLabel}>{t("home.saved")}</Text>
              </View>
              <View style={S.statCard}>
                <View style={[S.statIconWrap, { backgroundColor: 'rgba(255,149,0,0.12)' }]}>
                  <Ionicons name="snow" size={18} color={C.orange} />
                </View>
                <Text style={[S.statValue, { color: C.orange }]}>
                  {wishlist.filter((w) => w.status === 'PENDING').length}
                </Text>
                <Text style={S.statLabel}>{t("home.inIncubator")}</Text>
              </View>
            </View>

            {/* Month Summary */}
            <View style={S.monthCard}>
              <Text style={S.monthTitle}>{t('home.monthSummary')}</Text>
              <View style={S.monthRow}>
                <Text style={S.monthLabel}>{t('home.incomeLabel')}</Text>
                <Text style={[S.monthValue, { color: C.green }]}>
                  {monthSummary.income > 0 ? formatCurrency(monthSummary.income) : '—'}
                </Text>
              </View>
              <View style={S.monthRow}>
                <Text style={S.monthLabel}>{t('home.expenseLabel')}</Text>
                <Text style={[S.monthValue, { color: C.red }]}>
                  {monthSummary.expense > 0 ? formatCurrency(monthSummary.expense) : '—'}
                </Text>
              </View>
              {monthSummary.income > 0 && monthSummary.expense > 0 && (
                <>
                  <View style={S.barTrack}>
                    <View style={[S.barFill, {
                      width: `${Math.min((monthSummary.expense / monthSummary.income) * 100, 100)}%`,
                      backgroundColor: monthSummary.balance >= 0 ? C.green : C.red,
                    }]} />
                  </View>
                  <View style={S.monthRow}>
                    <Text style={S.monthLabel}>{t('accounts.balance')}</Text>
                    <Text style={[S.monthValue, { color: monthSummary.balance >= 0 ? C.green : C.red }]}>
                      {formatCurrency(monthSummary.balance)}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Budgets Widget */}
            {isPremiumUser && (
              <View style={S.monthCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={S.monthTitle}>{t('budget.title')} · {t(`months.${today.getMonth()}`)}</Text>
                  {budgets.length > 0 && (
                    <TouchableOpacity onPress={() => router.push('/main/categories/' as never)}>
                      <Text style={{ fontSize: 12, color: C.primary, fontWeight: '600' }}>{t('budget.editLimit')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                {budgets.length === 0 ? (
                  <TouchableOpacity
                    onPress={() => router.push('/main/categories/' as never)}
                    style={{ paddingVertical: 16, alignItems: 'center' }}
                  >
                    <Ionicons name="pie-chart-outline" size={28} color={C.textMuted} />
                    <Text style={{ fontSize: 13, color: C.textSec, marginTop: 8 }}>{t('budget.noBudgets')}</Text>
                    <Text style={{ fontSize: 13, color: C.primary, fontWeight: '600', marginTop: 4 }}>{t('budget.setLimits')}</Text>
                  </TouchableOpacity>
                ) : (
                  budgets.slice(0, 5).map((budget) => {
                    const percent = budget.percentUsed;
                    const barColor = percent >= 100 ? C.red : percent >= 80 ? C.orange : C.green;
                    return (
                      <View key={budget.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: `${budget.category?.color || C.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
                          <CategoryIcon icon={budget.category?.icon || null} color={budget.category?.color || C.primary} size={16} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.textMain }}>{budget.category?.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              {budget.isOverBudget && <Ionicons name="warning" size={12} color={C.red} />}
                              <Text style={{ fontSize: 11, color: budget.isOverBudget ? C.red : C.textSec }}>
                                {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                              </Text>
                            </View>
                          </View>
                          <View style={{ height: 4, borderRadius: 2, backgroundColor: C.divider }}>
                            <View style={{ height: 4, borderRadius: 2, width: `${Math.min(percent, 100)}%`, backgroundColor: barColor }} />
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
                {budgets.length > 5 && (
                  <Text style={{ fontSize: 12, color: C.textSec, marginTop: 4 }}>
                    {t('budget.more', { count: budgets.length - 5 })}
                  </Text>
                )}
              </View>
            )}

            {/* Daily Pulse */}
            <View style={S.pulseCard}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.textMain, marginBottom: 4 }}>{t('home.todayTitle')}</Text>
              <View style={S.pulseRow}>
                <Text style={S.pulseLabel}>{t("home.biggestExpense")}</Text>
                <Text style={S.pulseValue}>
                  {biggestToday ? formatCurrency(convertToUserCurrency(biggestToday.amount, getTransactionCurrency(biggestToday))) : '—'}
                </Text>
              </View>
              <View style={S.pulseRow}>
                <Text style={S.pulseLabel}>{t("home.topCategory")}</Text>
                <Text style={S.pulseValue}>{topCategoryName ?? '—'}</Text>
              </View>
              <View style={S.pulseLast}>
                <Text style={S.pulseLabel}>{t("home.transactionsCount")}</Text>
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
                <Text style={[S.actionText, { color: C.red }]}>{t("home.addExpense")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (showPaywallFn('AI_VOICE')) return;
                  setShowVoiceModal(true);
                }}
                style={[S.actionBtn, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.15)' }]}
              >
                <Ionicons name="mic" size={22} color="#6366F1" />
                <Text style={[S.actionText, { color: '#6366F1' }]}>{t("home.voiceInput")}</Text>
                {!checkAccess('AI_VOICE')?.allowed && <PremiumBadge size="sm" />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/main/wishlist/' as never)}
                style={[S.actionBtn, { backgroundColor: 'rgba(251,149,84,0.1)', borderColor: 'rgba(251,149,84,0.2)' }]}
              >
                <Ionicons name="snow" size={22} color={C.orange} />
                <Text style={[S.actionText, { color: C.orange }]}>{t("home.incubateWish")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  if (showPaywallFn('AI_RECEIPT')) return;
                  try {
                    const ImagePicker = require('expo-image-picker');
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                      toast.showError(`${t('home.noCameraAccess')} ${t('home.allowCamera')}`);
                      return;
                    }
                    const result = await ImagePicker.launchCameraAsync({
                      mediaTypes: ['images'],
                      quality: 0.7,
                      base64: true,
                      allowsEditing: true,
                    });
                    if (!result.canceled && result.assets?.[0]?.base64) {
                      const asset = result.assets[0];
                      const aiService = require('../../src/services/ai').aiService;
                      const receiptResult = await aiService.parseReceipt(
                        asset.base64,
                        asset.mimeType || 'image/jpeg',
                      );
                      setAiResult(receiptResult);
                      setShowAiPreview(true);
                    }
                  } catch (error) {
                    console.error('Receipt scan error:', error);
                    toast.showError(`${t('home.receiptError')} ${t('home.receiptNotRecognized')}`);
                  }
                }}
                style={[S.actionBtn, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.15)' }]}
              >
                <Ionicons name="camera" size={22} color="#818CF8" />
                <Text style={[S.actionText, { color: '#818CF8' }]}>{t("home.receiptScan")}</Text>
                {!checkAccess('AI_RECEIPT')?.allowed && <PremiumBadge size="sm" />}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setAddType(TransactionTypeEnum.INCOME); setShowAddModal(true); }}
                style={[S.actionBtn, { backgroundColor: 'rgba(52,211,153,0.08)', borderColor: 'rgba(52,211,153,0.15)' }]}
              >
                <Ionicons name="add-circle" size={22} color={C.green} />
                <Text style={[S.actionText, { color: C.green }]}>{t("home.addIncome")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Read Tab — Dynamic Articles */
          <View style={{ gap: 10, paddingTop: 4 }}>
            {isLoadingArticles ? (
              <View style={S.emptyState}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={[S.emptyTitle, { marginTop: 16 }]}>{t('home.articlesLoading')}</Text>
              </View>
            ) : articles.length === 0 ? (
              <View style={S.emptyState}>
                <View style={S.emptyIcon}>
                  <Ionicons name="book-outline" size={28} color={C.textSec} />
                </View>
                <Text style={S.emptyTitle}>{t('home.noArticles')}</Text>
                <Text style={S.emptySub}>{t('home.articlesLoading')}</Text>
              </View>
            ) : (
              articles.map((article) => (
                <TouchableOpacity
                  key={article.id}
                  style={S.articleCard}
                  onPress={() => {
                    if (article.isPremium && !isPremiumUser) {
                      showPaywallFn('ARTICLES');
                      return;
                    }
                    onArticlePress(article.id);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <View style={S.articleTag}>
                      <Text style={S.articleTagText}>{article.tag}</Text>
                    </View>
                    {article.isPremium && !isPremiumUser && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#F59E0B15', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Ionicons name="lock-closed" size={10} color="#F59E0B" />
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#F59E0B' }}>PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text style={S.articleTitle}>{article.title}</Text>
                  <Text style={S.articleSub} numberOfLines={2}>{article.content}</Text>
                  <View style={S.articleFooter}>
                    <Text style={S.articleTime}>{article.readTime}</Text>
                    <View style={S.articleViews}>
                      <Ionicons name="eye-outline" size={12} color={C.textSec} />
                      <Text style={S.articleViewsText}>
                        {t('home.views', { count: article.viewCount })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onComplete={() => setShowAddModal(false)}
        initialType={addType}
      />

      <AiTransactionPreview
        visible={showAiPreview}
        onClose={() => setShowAiPreview(false)}
        onComplete={() => {
          setShowAiPreview(false);
          initializeData();
        }}
        result={aiResult}
      />
    </View>
  );
}
