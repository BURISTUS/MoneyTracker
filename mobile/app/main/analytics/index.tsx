import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Pressable, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { SpendingChart } from '../../../src/components/ui/SpendingChart';
import { useDataStore } from '../../../src/stores/dataStore';
import { useTheme } from '../../../src/stores/themeStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { formatCurrency } from '../../../src/utils/formatters';
import transactionsService from '../../../src/services/transactions';
import { exportService } from '../../../src/services/export';
import { useToast } from '../../../src/components/ui/Toast';

type TabKey = 'overview' | 'comparison' | 'trends' | 'export';

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
function getYearBounds(date: Date) {
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}

export default function AnalyticsScreen() {
  const C = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDemo = useAuthStore((s) => s.isDemoMode);
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  const checkAccess = useSubscriptionStore((s) => s.checkAccess);

  const [tab, setTab] = useState<TabKey>('overview');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<'MONTH' | 'YEAR'>('MONTH');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json'>('csv');
  const [exportType, setExportType] = useState<'transactions' | 'analytics'>('transactions');
  const toast = useToast();

  const MONTHS = useMemo(() => MONTH_KEYS.map(k => t(`months.${k}`)), [t]);
  const MONTHS_GEN = useMemo(() => MONTH_KEYS.map(k => t(`monthsGen.${k}`)), [t]);
  const MONTHS_SHORT = useMemo(() => MONTH_KEYS.map(k => t(`monthsShort.${k}`)), [t]);

  const bounds = useMemo(
    () => (mode === 'MONTH' ? getMonthBounds(currentDate) : getYearBounds(currentDate)),
    [currentDate, mode],
  );

  const navigate = (dir: -1 | 1) => {
    setCurrentDate((d) => {
      const next = new Date(d);
      mode === 'MONTH' ? next.setMonth(next.getMonth() + dir) : next.setFullYear(next.getFullYear() + dir);
      return next;
    });
  };

  const load = useCallback(async () => {
    if (isDemo) { setData(null); setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const r = await transactionsService.getAnalytics(bounds.start.toISOString(), bounds.end.toISOString());
      setData(r);
    } catch (e: any) { setError(e?.message || t('analytics.loadError')); } finally { setLoading(false); }
  }, [bounds, isDemo, t]);

  useEffect(() => { load(); }, [load]);

  const periodLabel = mode === 'MONTH'
    ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    : `${currentDate.getFullYear()}`;

  const prevLabel = useMemo(() => {
    if (!data?.comparison) return '';
    const s = new Date(data.comparison.prevPeriod.startDate);
    const e = new Date(data.comparison.prevPeriod.endDate);
    return `${s.getDate()} ${MONTHS_GEN[s.getMonth()]} — ${e.getDate()} ${MONTHS_GEN[e.getMonth()]}`;
  }, [data]);

  const chg = (v: number) => {
    if (v === 0) return { text: '0%', color: C.textSec };
    const sign = v > 0 ? '+' : '';
    return { text: `${sign}${v.toFixed(1)}%`, color: v > 0 ? C.red : C.green };
  };

  const dayData = useMemo(() => {
    if (!data?.byDay) return [];
    return data.byDay.map((d: any) => ({
      day: parseInt(d.date.split('-')[2], 10),
      expense: d.expense, income: d.income,
    }));
  }, [data]);

  const topExpenseCat = useMemo(() => {
    if (!data?.byCategory) return [];
    return data.byCategory.filter((c: any) => c.amount > 0).sort((a: any, b: any) => b.amount - a.amount);
  }, [data]);

  const maxCatAmount = topExpenseCat.length > 0 ? topExpenseCat[0].amount : 1;

  const handleExport = useCallback(async () => {
    if (showPaywall('EXPORT')) return;
    setExporting(true);
    try {
      if (exportType === 'transactions') {
        await exportService.exportTransactions(exportFormat, bounds.start.toISOString(), bounds.end.toISOString());
      } else {
        await exportService.exportAnalytics(exportFormat, bounds.start.toISOString(), bounds.end.toISOString());
      }
    } catch (e: any) {
      toast.showError(e.message || t('analytics.exportError'));
    } finally {
      setExporting(false);
    }
  }, [exportFormat, exportType, bounds]);

  // ── 6-month trend data (derived from multiple analytics calls) ──
  const [trendData, setTrendData] = useState<{ month: string; expense: number; income: number }[]>([]);
  const [trendLoading, setTrendLoading] = useState(false);

  const loadTrends = useCallback(async () => {
    if (!checkAccess('ANALYTICS_TRENDS')?.allowed) return;
    setTrendLoading(true);
    try {
      const now = new Date();
      const months: { month: string; expense: number; income: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
        const r = await transactionsService.getAnalytics(start.toISOString(), end.toISOString());
        months.push({
          month: MONTHS_SHORT[d.getMonth()],
          expense: r.totals.expense / 100,
          income: r.totals.income / 100,
        });
      }
      setTrendData(months);
    } catch { setTrendData([]); } finally { setTrendLoading(false); }
  }, [checkAccess, MONTHS_SHORT]);

  useEffect(() => { if (tab === 'trends') loadTrends(); }, [tab, loadTrends]);

  const S = StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingBottom: 8 },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: C.textMain, letterSpacing: -0.3 },
    tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 12, gap: 4 },
    tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
    tabActive: { backgroundColor: C.primaryBg },
    tabText: { fontSize: 13, fontWeight: '600' },
    periodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10, gap: 6 },
    periodBtn: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    periodText: { fontSize: 15, fontWeight: '600', color: C.textMain, minWidth: 120, textAlign: 'center' },
    kpiRow: { flexDirection: 'row', gap: 8 },
    kpiCard: { flex: 1, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center' },
    kpiIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    kpiValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
    kpiLabel: { fontSize: 11, color: C.textSec, marginTop: 2, fontWeight: '500' },
    kpiChange: { fontSize: 10, fontWeight: '600', marginTop: 4 },
    section: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 },
    sectionTitle: { fontSize: 13, fontWeight: '600', color: C.textSec, textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.3 },
    barTrack: { height: 4, borderRadius: 2, backgroundColor: C.inputBg, overflow: 'hidden' },
    barFill: { height: 4, borderRadius: 2 },
    center: { alignItems: 'center', paddingVertical: 60 },
    locked: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32 },
    comparisonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border },
    trendRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.border },
  });

  const tabs: { key: TabKey; label: string; icon: string; feature?: string }[] = [
    { key: 'overview', label: t('analytics.overviewTab'), icon: 'bar-chart-outline' },
    { key: 'comparison', label: t('analytics.comparisonTab'), icon: 'swap-vertical-outline', feature: 'ANALYTICS_COMPARISON' },
    { key: 'trends', label: t('analytics.trendsTab'), icon: 'trending-up-outline', feature: 'ANALYTICS_TRENDS' },
    { key: 'export', label: t('analytics.exportTab'), icon: 'download-outline', feature: 'EXPORT' },
  ];

  const renderTabContent = () => {
    if (tab === 'overview') return renderOverview();
    if (tab === 'comparison') return renderComparison();
    if (tab === 'trends') return renderTrends();
    if (tab === 'export') return renderExport();
    return null;
  };

  const renderOverview = () => {
    if (loading) return <View style={S.center}><ActivityIndicator color={C.primary} size="large" /></View>;
    if (error) return <View style={S.center}><Ionicons name="warning-outline" size={40} color={C.red} /><Text style={{ color: C.red, marginTop: 8 }}>{error}</Text></View>;
    if (!data) return <View style={S.center}><Ionicons name="bar-chart-outline" size={48} color="#3F3F46" /><Text style={{ color: C.textSec, marginTop: 12 }}>{isDemo ? t('analytics.notAvailableDemo') : t('analytics.noDataPeriod')}</Text></View>;

    return (
      <View style={{ gap: 12 }}>
        <View style={S.kpiRow}>
          <View style={S.kpiCard}>
            <View style={[S.kpiIcon, { backgroundColor: C.redBg }]}><Ionicons name="arrow-down" size={14} color={C.red} /></View>
            <Text style={[S.kpiValue, { color: C.red }]} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(data.totals.expense)}</Text>
            <Text style={S.kpiLabel}>{t('analytics.expenses')}</Text>
            {data.comparison && <Text style={[S.kpiChange, { color: chg(data.comparison.expenseChange).color }]}>{chg(data.comparison.expenseChange).text} {t('analytics.vsPrev')}</Text>}
          </View>
          <View style={S.kpiCard}>
            <View style={[S.kpiIcon, { backgroundColor: 'rgba(52,211,153,0.1)' }]}><Ionicons name="arrow-up" size={14} color={C.green} /></View>
            <Text style={[S.kpiValue, { color: C.green }]} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(data.totals.income)}</Text>
            <Text style={S.kpiLabel}>{t('analytics.income')}</Text>
            {data.comparison && <Text style={[S.kpiChange, { color: chg(data.comparison.incomeChange).color }]}>{chg(data.comparison.incomeChange).text} {t('analytics.vsPrev')}</Text>}
          </View>
          <View style={S.kpiCard}>
            <View style={[S.kpiIcon, { backgroundColor: C.primaryBg }]}><Ionicons name="wallet-outline" size={14} color={C.primary} /></View>
            <Text style={[S.kpiValue, { color: data.totals.balance >= 0 ? C.green : C.red }]} numberOfLines={1} adjustsFontSizeToFit>{data.totals.balance >= 0 ? '+' : ''}{formatCurrency(Math.abs(data.totals.balance))}</Text>
            <Text style={S.kpiLabel}>{t('analytics.balance')}</Text>
          </View>
        </View>

        {dayData.length > 1 && (
          <View style={S.section}><SpendingChart data={dayData} monthLabel={t('analytics.expensesIncomeDaily')} /></View>
        )}

        {topExpenseCat.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>{t('analytics.expenseCategories')}</Text>
            {topExpenseCat.slice(0, 8).map((cat: any) => {
              const barW = maxCatAmount > 0 ? (cat.amount / maxCatAmount) * 100 : 0;
              return (
                <View key={cat.category.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.border, gap: 10 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cat.category.color || C.primary }} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: C.textMain }}>{cat.category.name}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.textSec }}>{cat.percentage.toFixed(1)}%</Text>
                    </View>
                    <View style={S.barTrack}><View style={[S.barFill, { width: `${Math.max(barW, 2)}%`, backgroundColor: cat.category.color || C.primary }]} /></View>
                    <Text style={{ fontSize: 11, color: C.textMuted }}>{formatCurrency(cat.amount)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  const renderLocked = (feature: string, title: string, desc: string) => (
    <View style={S.locked}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F59E0B15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Ionicons name="lock-closed" size={28} color="#F59E0B" />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '700', color: C.textMain, marginBottom: 8 }}>{title}</Text>
      <Text style={{ fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>{desc}</Text>
      <Pressable onPress={() => showPaywall(feature as any)} style={{ backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Ionicons name="diamond" size={18} color="#FFF" />
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>{t('analytics.unlockPremium')}</Text>
      </Pressable>
    </View>
  );

  const renderComparison = () => {
    if (!checkAccess('ANALYTICS_COMPARISON')?.allowed) {
      return renderLocked('ANALYTICS_COMPARISON', t('analytics.periodComparisonTitle'), t('analytics.periodComparisonDesc'));
    }
    if (!data?.comparison) return <View style={S.center}><Text style={{ color: C.textSec }}>{t('analytics.noDataComparison')}</Text></View>;

    const prev = data.comparison;
    const incColor = prev.incomeChange > 0 ? C.green : prev.incomeChange < 0 ? C.red : C.textSec;
    const expColor = prev.expenseChange > 0 ? C.red : prev.expenseChange < 0 ? C.green : C.textSec;
    const balColor = prev.balanceChange > 0 ? C.green : prev.balanceChange < 0 ? C.red : C.textSec;

    return (
      <View style={{ gap: 12 }}>
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t('analytics.vsPrevPeriod')}</Text>
          <Text style={{ fontSize: 12, color: C.textMuted, marginBottom: 12 }}>{prevLabel}</Text>
          <View style={S.comparisonRow}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMain }}>{t('analytics.incomeLabel')}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: incColor }}>{prev.incomeChange > 0 ? '+' : ''}{prev.incomeChange.toFixed(1)}%</Text>
          </View>
          <View style={S.comparisonRow}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMain }}>{t('analytics.expensesLabel')}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: expColor }}>{prev.expenseChange > 0 ? '+' : ''}{prev.expenseChange.toFixed(1)}%</Text>
          </View>
          <View style={S.comparisonRow}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.textMain }}>{t('analytics.balanceLabel')}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: balColor }}>{prev.balanceChange > 0 ? '+' : ''}{prev.balanceChange.toFixed(1)}%</Text>
          </View>
        </View>
        {topExpenseCat.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>{t('analytics.topCategoriesCurrent')}</Text>
            {topExpenseCat.slice(0, 5).map((cat: any) => (
              <View key={cat.category.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: cat.category.color || C.primary, marginRight: 10 }} />
                <Text style={{ flex: 1, fontSize: 13, color: C.textMain }}>{cat.category.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.textSec }}>{formatCurrency(cat.amount)}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderTrends = () => {
    if (!checkAccess('ANALYTICS_TRENDS')?.allowed) {
      return renderLocked('ANALYTICS_TRENDS', t('analytics.trendsTitle'), t('analytics.trendsDesc'));
    }

    if (trendLoading) return <View style={S.center}><ActivityIndicator color={C.primary} size="large" /></View>;
    if (trendData.length === 0) return <View style={S.center}><Text style={{ color: C.textSec }}>{t('analytics.noData6Months')}</Text></View>;

    const maxExpense = Math.max(...trendData.map(m => m.expense), 1);
    return (
      <View style={{ gap: 12 }}>
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t('analytics.dynamics6Months')}</Text>
          {trendData.map((m, i) => {
            const w = maxExpense > 0 ? (m.expense / maxExpense) * 100 : 0;
            return (
              <View key={i} style={S.trendRow}>
                <Text style={{ width: 32, fontSize: 12, fontWeight: '600', color: C.textMain }}>{m.month}</Text>
                <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: C.inputBg, overflow: 'hidden', marginHorizontal: 10 }}>
                  <View style={{ height: 6, borderRadius: 3, width: `${Math.max(w, 2)}%`, backgroundColor: C.red }} />
                </View>
                <Text style={{ width: 70, fontSize: 12, color: C.textSec, textAlign: 'right' }}>{formatCurrency(m.expense * 100)}</Text>
              </View>
            );
          })}
        </View>
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t('analytics.income6Months')}</Text>
          {trendData.map((m, i) => {
            const maxIncome = Math.max(...trendData.map(m => m.income), 1);
            const w = maxIncome > 0 ? (m.income / maxIncome) * 100 : 0;
            return (
              <View key={i} style={S.trendRow}>
                <Text style={{ width: 32, fontSize: 12, fontWeight: '600', color: C.textMain }}>{m.month}</Text>
                <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: C.inputBg, overflow: 'hidden', marginHorizontal: 10 }}>
                  <View style={{ height: 6, borderRadius: 3, width: `${Math.max(w, 2)}%`, backgroundColor: C.green }} />
                </View>
                <Text style={{ width: 70, fontSize: 12, color: C.textSec, textAlign: 'right' }}>{formatCurrency(m.income * 100)}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderExport = () => {
    if (!checkAccess('EXPORT')?.allowed) {
      return renderLocked('EXPORT', t('analytics.exportDataTitle'), t('analytics.exportDataDesc'));
    }

    const formats: { key: 'csv' | 'xlsx' | 'json'; label: string; icon: string }[] = [
      { key: 'csv', label: 'CSV', icon: 'document-text-outline' },
      { key: 'xlsx', label: 'XLSX', icon: 'grid-outline' },
      { key: 'json', label: 'JSON', icon: 'code-outline' },
    ];

    const types: { key: 'transactions' | 'analytics'; label: string; icon: string }[] = [
      { key: 'transactions', label: t('analytics.transactionsLabel'), icon: 'list-outline' },
      { key: 'analytics', label: t('analytics.analyticsLabel'), icon: 'pie-chart-outline' },
    ];

    return (
      <View style={{ gap: 16 }}>
        <View style={S.section}>
          <Text style={S.sectionTitle}>{t('analytics.whatExport')}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {types.map(t => (
              <Pressable key={t.key} onPress={() => setExportType(t.key)} style={[S.kpiCard, exportType === t.key && { borderColor: C.primary, backgroundColor: C.primaryBg }]}>
                <Ionicons name={t.icon as any} size={20} color={exportType === t.key ? C.primary : C.textSec} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: exportType === t.key ? C.primary : C.textMain, marginTop: 4 }}>{t.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>{t('analytics.formatLabel')}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {formats.map(f => (
              <Pressable key={f.key} onPress={() => setExportFormat(f.key)} style={[S.kpiCard, exportFormat === f.key && { borderColor: C.primary, backgroundColor: C.primaryBg }]}>
                <Ionicons name={f.icon as any} size={20} color={exportFormat === f.key ? C.primary : C.textSec} />
                <Text style={{ fontSize: 13, fontWeight: '600', color: exportFormat === f.key ? C.primary : C.textMain, marginTop: 4 }}>{f.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={S.section}>
          <Text style={S.sectionTitle}>{t('analytics.periodLabel')}</Text>
          <View style={S.periodRow}>
            <Pressable onPress={() => navigate(-1)} style={S.periodBtn}><Ionicons name="chevron-back" size={18} color={C.textSec} /></Pressable>
            <Text style={S.periodText}>{periodLabel}</Text>
            <Pressable onPress={() => navigate(1)} style={S.periodBtn}><Ionicons name="chevron-forward" size={18} color={C.textSec} /></Pressable>
          </View>
        </View>

        <Pressable
          onPress={handleExport}
          disabled={exporting}
          style={{ backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, opacity: exporting ? 0.6 : 1 }}
        >
          <Ionicons name="download-outline" size={20} color="#FFF" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>{exporting ? t('analytics.exporting') : t('analytics.downloadBtn')}</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[S.screen, { paddingTop: insets.top }]}>
      <View style={S.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={S.backBtn}><Ionicons name="chevron-back" size={28} color={C.textSec} /></Pressable>
        <Text style={S.headerTitle}>{t('analytics.title')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={S.tabRow}>
        {tabs.map(tp => {
          const locked = tp.feature && !checkAccess(tp.feature as any)?.allowed;
          return (
            <Pressable key={tp.key} onPress={() => setTab(tp.key as any)} style={[S.tab, tab === tp.key && S.tabActive]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons name={tp.icon as any} size={14} color={tab === tp.key ? C.primary : locked ? C.textMuted : C.textSec} />
                <Text style={[S.tabText, { color: tab === tp.key ? C.primary : locked ? C.textMuted : C.textSec }]}>{tp.label}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false}>
        {(tab === 'overview' || tab === 'comparison') && (
          <View style={S.periodRow}>
            <Pressable onPress={() => navigate(-1)} style={S.periodBtn}><Ionicons name="chevron-back" size={18} color={C.textSec} /></Pressable>
            <Text style={S.periodText}>{periodLabel}</Text>
            <Pressable onPress={() => navigate(1)} style={S.periodBtn}><Ionicons name="chevron-forward" size={18} color={C.textSec} /></Pressable>
            <Pressable onPress={() => { setMode(mode === 'MONTH' ? 'YEAR' : 'MONTH'); setCurrentDate(new Date()); }} style={[S.periodBtn, { backgroundColor: C.primaryBg }]}>
              <Text style={{ fontSize: 10, fontWeight: '800', color: C.primary }}>{mode === 'MONTH' ? t('analytics.yearUc') : t('analytics.monthUc')}</Text>
            </Pressable>
          </View>
        )}
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}