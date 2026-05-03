import React, { useEffect, useCallback, useState, useMemo } from 'react';
import {
  View,
  Pressable,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../src/stores/dataStore';
import { Text } from '../../components/ui/text';
// import { VoiceInputModal } from '../../src/components/ui/VoiceInputButton';
import { ReceiptScannerButton } from '../../src/components/ui/ReceiptScanner';
import { AiTransactionPreview } from '../../src/components/ui/AiTransactionPreview';
import type { AiTransactionResult, AiReceiptResult } from '../../src/services/ai';
import { Loading } from '../../src/components/ui/Loading';
import { formatCurrency } from '../../src/utils/formatters';
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
    titleKey: 'home.article1Title',
    subKey: 'home.article1Desc',
    timeKey: 'home.article1Time',
  },
  {
    id: '2',
    tag: 'Психология',
    titleKey: 'home.article2Title',
    subKey: 'home.article2Desc',
    timeKey: 'home.article2Time',
  },
  {
    id: '3',
    tag: 'Практика',
    titleKey: 'home.article3Title',
    subKey: 'home.article3Desc',
    timeKey: 'home.article3Time',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const initializeData = useDataStore((s) => s.initializeData);
  const transactions = useDataStore((s) => s.transactions);
  const wishlist = useDataStore((s) => s.wishlist);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);
  const isLoading = useDataStore((s) => s.isLoadingTransactions);

  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'overview' | 'read'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<TransactionTypeEnum>(TransactionTypeEnum.EXPENSE);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [aiResult, setAiResult] = useState<AiTransactionResult | AiReceiptResult | null>(null);

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
            <Text style={[S.tabText, { color: tab === 'overview' ? '#FFF' : C.textSec }]}>{t('home.tabOverview')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('read')}
            style={[S.tabPill, { backgroundColor: tab === 'read' ? C.indigo : 'transparent' }]}
          >
            <Text style={[S.tabText, { color: tab === 'read' ? '#FFF' : C.textSec }]}>{t('home.tabRead')}</Text>
          </Pressable>
        </View>


        {tab === 'overview' ? (
          <View style={{ gap: 12 }}>
            {/* Life-Cost Hero */}
            <View style={S.heroCard}>
              <Text style={S.heroLabel}>{t('home.spentToday')}</Text>
              <Text style={S.heroValue}>{todayHours > 0 ? formatHours(todayHours) : '—'}</Text>
              <Text style={S.heroSub}>
                {todayExpenses > 0 ? formatCurrency(todayExpenses) : t('home.noExpenses')}
              </Text>
              {hourlyRate > 0 && (
                <Text style={S.heroRate}>{t('home.ratePerHour', { rate: hourlyRate.toFixed(0) })}</Text>
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
                  {savedHours > 0 ? formatHours(savedHours) : '—'}
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

            {/* Daily Pulse */}
            <View style={S.pulseCard}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.textMain, marginBottom: 4 }}>
                {t('home.todayTitle')}
              </Text>
              <View style={S.pulseRow}>
                <Text style={S.pulseLabel}>{t("home.biggestExpense")}</Text>
                <Text style={S.pulseValue}>
                  {biggestToday ? formatCurrency(biggestToday.amount) : '—'}
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
                onPress={() => setShowVoiceModal(true)}
                style={[S.actionBtn, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.15)' }]}
              >
                <Ionicons name="mic" size={22} color="#6366F1" />
                <Text style={[S.actionText, { color: '#6366F1' }]}>{t("home.voiceInput")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  try {
                    const ImagePicker = require('expo-image-picker');
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                      Alert.alert('Нет доступа', 'Разрешите доступ к камере');
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
                    Alert.alert('Ошибка', 'Не удалось распознать чек');
                  }
                }}
                style={[S.actionBtn, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.15)' }]}
              >
                <Ionicons name="camera" size={22} color="#818CF8" />
                <Text style={[S.actionText, { color: '#818CF8' }]}>{t("home.receiptScan")}</Text>
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
          /* Read Tab */
          <View style={{ gap: 10, paddingTop: 4 }}>
            {ARTICLES.map((article) => (
              <TouchableOpacity key={article.id} style={S.articleCard}>
                <View style={S.articleTag}>
                  <Text style={S.articleTagText}>{article.tag}</Text>
                </View>
                <Text style={S.articleTitle}>{t(article.titleKey as any)}</Text>
                <Text style={S.articleSub}>{t(article.subKey as any)}</Text>
                <Text style={S.articleTime}>{t(article.timeKey as any)}</Text>
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

      {/* <VoiceInputModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onResult={(result) => {
          setAiResult(result);
          setShowVoiceModal(false);
          setShowAiPreview(true);
        }}
      /> */}

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
