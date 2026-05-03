import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Pressable, ScrollView, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { SpendingChart } from '../../../src/components/ui/SpendingChart';
import { useDataStore } from '../../../src/stores/dataStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { formatCurrency } from '../../../src/utils/formatters';
import transactionsService from '../../../src/services/transactions';

const C = {
  bg: '#0A0A0F',
  card: '#141418',
  border: 'rgba(255,255,255,0.08)',
  text: '#F5F5F5',
  dim: '#8C8C8C',
  mute: '#52525B',
  indigo: '#6366F1',
  green: '#34D399',
  red: '#FF3B30',
  orange: '#FF9500',
};

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function getMonthBounds(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}
function getYearBounds(date: Date) {
  const start = new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  return { start, end };
}

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDemo = useAuthStore((s) => s.isDemoMode);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mode, setMode] = useState<'MONTH' | 'YEAR'>('MONTH');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    setLoading(true);
    setError(null);
    try {
      const r = await transactionsService.getAnalytics(bounds.start.toISOString(), bounds.end.toISOString());
      setData(r);
    } catch (e: any) {
      setError(e?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [bounds, isDemo]);

  useEffect(() => { load(); }, [load]);

  // ---- computed ----

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
    if (v === 0) return { text: '0%', color: C.dim };
    const sign = v > 0 ? '+' : '';
    const color = v > 0 ? C.red : C.green; // expenses up = red, income up = green... 
    return { text: `${sign}${v.toFixed(1)}%`, color };
  };
  const incChg = chg(data?.comparison?.incomeChange ?? 0);
  const expChg = chg(data?.comparison?.expenseChange ?? 0);
  // For expenses, up=bad=red. For income, up=good=green.
  const expChgFixed = useMemo(() => {
    if (!data?.comparison) return { text: '', color: C.dim };
    const v = data.comparison.expenseChange;
    const sign = v > 0 ? '+' : '';
    const color = v > 0 ? C.red : C.green;
    return { text: `${sign}${v.toFixed(1)}%`, color };
  }, [data]);

  const dayData = useMemo(() => {
    if (!data?.byDay) return [];
    return data.byDay.map((d: any) => ({
      day: parseInt(d.date.split('-')[2], 10),
      expense: d.expense,
      income: d.income,
    }));
  }, [data]);

  const topExpenseCat = useMemo(() => {
    if (!data?.byCategory) return [];
    return data.byCategory
      .filter((c: any) => c.amount > 0)
      .sort((a: any, b: any) => b.amount - a.amount);
  }, [data]);

  const maxCatAmount = topExpenseCat.length > 0 ? topExpenseCat[0].amount : 1;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Ionicons name="chevron-back" size={28} color={C.dim} />
        </Pressable>
        <Text style={s.headerTitle}>{t("analytics.title")}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Period selector */}
        <View style={s.periodRow}>
          <Pressable onPress={() => navigate(-1)} style={s.periodBtn}>
            <Ionicons name="chevron-back" size={18} color={C.dim} />
          </Pressable>
          <Text style={s.periodText}>{periodLabel}</Text>
          <Pressable onPress={() => navigate(1)} style={s.periodBtn}>
            <Ionicons name="chevron-forward" size={18} color={C.dim} />
          </Pressable>
          <Pressable
            onPress={() => { setMode(mode === 'MONTH' ? 'YEAR' : 'MONTH'); setCurrentDate(new Date()); }}
            style={[s.periodBtn, { backgroundColor: 'rgba(99,102,241,0.1)' }]}
          >
            <Text style={{ fontSize: 10, fontWeight: '800', color: C.indigo }}>
              {mode === 'MONTH' ? 'ГОД' : 'МЕС'}
            </Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={s.center}><ActivityIndicator color={C.indigo} size="large" /></View>
        ) : error ? (
          <View style={s.center}>
            <Ionicons name="warning-outline" size={40} color={C.red} />
            <Text style={{ color: C.red, marginTop: 8 }}>{error}</Text>
          </View>
        ) : !data ? (
          <View style={s.center}>
            <Ionicons name="bar-chart-outline" size={48} color="#3F3F46" />
            <Text style={{ color: C.dim, marginTop: 12 }}>
              {isDemo ? 'Недоступно в демо-режиме' : 'Нет данных за период'}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {/* === KPI CARDS === */}
            <View style={s.kpiRow}>
              {/* Расходы */}
              <View style={s.kpiCard}>
                <View style={[s.kpiIcon, { backgroundColor: 'rgba(255,59,48,0.1)' }]}>
                  <Ionicons name="arrow-down" size={14} color={C.red} />
                </View>
                <Text style={[s.kpiValue, { color: C.red }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(data.totals.expense)}
                </Text>
                <Text style={s.kpiLabel}>{t("analytics.expenses")}</Text>
                {data.comparison && (
                  <Text style={[s.kpiChange, { color: expChgFixed.color }]}>
                    {expChgFixed.text} vs {prevLabel}
                  </Text>
                )}
              </View>

              {/* Доходы */}
              <View style={s.kpiCard}>
                <View style={[s.kpiIcon, { backgroundColor: 'rgba(52,211,153,0.1)' }]}>
                  <Ionicons name="arrow-up" size={14} color={C.green} />
                </View>
                <Text style={[s.kpiValue, { color: C.green }]} numberOfLines={1} adjustsFontSizeToFit>
                  {formatCurrency(data.totals.income)}
                </Text>
                <Text style={s.kpiLabel}>{t("analytics.income")}</Text>
                {data.comparison && (
                  <Text style={[s.kpiChange, { color: incChg.color }]}>
                    {incChg.text} vs {prevLabel}
                  </Text>
                )}
              </View>

              {/* Баланс */}
              <View style={s.kpiCard}>
                <View style={[s.kpiIcon, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                  <Ionicons name="wallet-outline" size={14} color={C.indigo} />
                </View>
                <Text
                  style={[s.kpiValue, { color: data.totals.balance >= 0 ? C.green : C.red }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {data.totals.balance >= 0 ? '+' : ''}{formatCurrency(Math.abs(data.totals.balance))}
                </Text>
                <Text style={s.kpiLabel}>{t("analytics.balance")}</Text>
                {data.comparison && (
                  <Text style={[s.kpiChange, { color: C.dim }]}>
                    {chg(data.comparison.balanceChange).text}
                  </Text>
                )}
              </View>
            </View>

            {/* === ДИНАМИКА ПО ДНЯМ === */}
            {dayData.length > 1 && (
              <View style={s.section}>
                <SpendingChart data={dayData} monthLabel="Расходы / Доходы по дням" />
              </View>
            )}

            {/* === КАТЕГОРИИ === */}
            {topExpenseCat.length > 0 && (
              <View style={s.section}>
                <Text style={s.sectionTitle}>{t("analytics.expenseCategories")}</Text>
                <View style={{ gap: 0 }}>
                  {topExpenseCat.slice(0, 8).map((cat: any) => {
                    const barW = maxCatAmount > 0 ? (cat.amount / maxCatAmount) * 100 : 0;
                    return (
                      <View
                        key={cat.category.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: C.border,
                          gap: 10,
                        }}
                      >
                        {/* Color dot */}
                        <View
                          style={{
                            width: 8, height: 8, borderRadius: 4,
                            backgroundColor: cat.category.color || C.indigo,
                          }}
                        />
                        {/* Name + bar */}
                        <View style={{ flex: 1, gap: 4 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 13, fontWeight: '500', color: C.text }}>
                              {cat.category.name}
                            </Text>
                            <Text style={{ fontSize: 13, fontWeight: '600', color: C.dim }}>
                              {cat.percentage.toFixed(1)}%
                            </Text>
                          </View>
                          {/* Horizontal bar */}
                          <View style={s.barTrack}>
                            <View style={[s.barFill, {
                              width: `${Math.max(barW, 2)}%`,
                              backgroundColor: cat.category.color || C.indigo,
                            }]} />
                          </View>
                          <Text style={{ fontSize: 11, color: C.mute }}>
                            {formatCurrency(cat.amount)} · {cat.count} {cat.count === 1 ? 'операция' : cat.count < 5 ? 'операции' : 'операций'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {topExpenseCat.length === 0 && data?.totals?.expense > 0 && (
              <View style={[s.center, { paddingVertical: 24 }]}>
                <Text style={{ color: C.dim, fontSize: 13 }}>{t("analytics.noBreakdown")}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 8,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.text, letterSpacing: -0.3 },
  
  periodRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border,
    paddingVertical: 10, paddingHorizontal: 12, marginBottom: 10, gap: 6,
  },
  periodBtn: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  periodText: { fontSize: 15, fontWeight: '600', color: C.text, minWidth: 120, textAlign: 'center' },

  kpiRow: { flexDirection: 'row', gap: 8 },
  kpiCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 12, alignItems: 'center',
  },
  kpiIcon: {
    width: 28, height: 28, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  kpiValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  kpiLabel: { fontSize: 11, color: C.dim, marginTop: 2, fontWeight: '500' },
  kpiChange: { fontSize: 10, fontWeight: '600', marginTop: 4 },

  section: {
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: C.dim,
    textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.3,
  },
  barTrack: {
    height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.05)', overflow: 'hidden',
  },
  barFill: { height: 4, borderRadius: 2 },

  center: { alignItems: 'center', paddingVertical: 60 },
});
