import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../../src/utils/formatters';
import { useToast } from '../../../src/components/ui/Toast';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { WishlistStatus as WishlistStatusEnum } from '../../../src/types';
import wishlistService from '../../../src/services/wishlist';
import type { WishlistItem } from '../../../src/types';

/* ─── Helpers ─── */

function formatLifeHours(amountKopecks: number, hourlyRateRubles: number): string | null {
  if (hourlyRateRubles <= 0) return null;
  const rubles = amountKopecks / 100;
  const hours = rubles / hourlyRateRubles;

  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  if (hours < 100) return `${hours.toFixed(1)} ч`;
  return `${Math.round(hours)} ч`;
}

function getDaysLeft(cooldownEndsAt: string): number {
  return Math.max(
    0,
    Math.ceil(
      (new Date(cooldownEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
}

function getDaysPassed(createdAt: string, cooldownDays: number): number {
  const end = new Date(createdAt);
  end.setDate(end.getDate() + cooldownDays);
  const passedMs = new Date().getTime() - new Date(createdAt).getTime();
  const passedDays = passedMs / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.min(cooldownDays, Math.floor(passedDays)));
}

/* ─── Colors ─── */

const C = {
  bg: '#0A0A0F',
  card: '#141418',
  cardBorder: 'rgba(255,255,255,0.08)',
  indigo: '#6366F1',
  orange: '#FB9554',
  green: '#489768',
  red: '#EF4444',
  yellow: '#FBBF24',
  textMain: '#F5F5F5',
  textSec: '#8C8C8C',
  textDark: '#52525B',
  pendingCardBg: '#141418',
  pendingBorder: 'rgba(79,110,247,0.18)',
  readyCardBg: '#1A1510',
  readyBorder: 'rgba(251,149,84,0.25)',
};

/* ─── Status Config ─── */

const STATUS_CONFIG = {
  PENDING: {
    label: 'В процессе',
    icon: 'snow' as const,
    color: C.indigo,
    bg: 'rgba(99,102,241,0.12)',
    cardBg: C.pendingCardBg,
    border: C.pendingBorder,
  },
  READY: {
    label: 'Готово',
    icon: 'flame' as const,
    color: C.orange,
    bg: 'rgba(251,149,84,0.12)',
    cardBg: C.readyCardBg,
    border: C.readyBorder,
  },
  REJECTED: {
    label: 'Отказ',
    icon: 'trending-up' as const,
    color: C.green,
    bg: 'rgba(72,151,104,0.12)',
    cardBg: C.card,
    border: 'rgba(72,151,104,0.25)',
  },
  PURCHASED: {
    label: 'Куплено',
    icon: 'cart' as const,
    color: C.red,
    bg: 'rgba(239,68,68,0.12)',
    cardBg: C.card,
    border: 'rgba(239,68,68,0.25)',
  },
  EXPIRED: {
    label: 'Просрочено',
    icon: 'time' as const,
    color: C.textSec,
    bg: 'rgba(255,255,255,0.06)',
    cardBg: C.card,
    border: C.cardBorder,
  },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.EXPIRED;
}

type FilterTab = 'all' | 'PENDING' | 'READY' | 'REJECTED' | 'PURCHASED';

/* ─── Styles ─── */

const S = StyleSheet.create({
  flex: { flex: 1 },
  screen: { backgroundColor: C.bg },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textMain },
  headerSub: { fontSize: 13, color: C.textSec, marginTop: 0 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.indigo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterScroll: { paddingHorizontal: 16, gap: 4, paddingVertical: 0 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  filterChipActive: {},
  filterLabel: { fontSize: 11, fontWeight: '600', color: C.textMain, lineHeight: 13 },
  filterCount: {
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  filterCountText: { fontSize: 9, fontWeight: '700', color: C.textSec, lineHeight: 11 },
  listContent: { paddingTop: 0, paddingBottom: 120 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  statusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: C.textMain },
  cardDesc: { fontSize: 14, color: '#C4C4C4', marginTop: 4, fontStyle: 'italic', lineHeight: 20 },
  heroBlock: {
    backgroundColor: 'rgba(251,149,84,0.08)',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  heroLabel: { fontSize: 13, color: C.textSec },
  heroValue: { fontSize: 28, fontWeight: '800', color: C.orange, letterSpacing: -0.5 },
  heroPrice: { fontSize: 14, color: C.textSec, marginTop: 4 },
  timeline: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 4 },
  timelineSegment: { flex: 1, height: 6, borderRadius: 3 },
  statusRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  btnReject: {
    flex: 1.25,
    backgroundColor: C.green,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  btnRejectRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  btnRejectText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  btnRejectSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  btnBuy: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  btnBuyText: { fontSize: 15, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  metaText: { fontSize: 12, color: C.textSec },
  metaDot: { fontSize: 12, color: C.textDark },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  xpText: { fontSize: 12, color: '#FFD700', fontWeight: '700' },
  emptyWrap: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99,102,241,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.15)',
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: C.textMain, marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyCta: {
    backgroundColor: C.indigo,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyCtaText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
});

/* ─── Components ─── */

function StatusIcon({ status, size = 22 }: { status: keyof typeof STATUS_CONFIG; size?: number }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[S.statusIconWrap, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon as any} size={size} color={cfg.color} />
    </View>
  );
}

function HeroLifeCost({ hoursCost, price }: { hoursCost: string | null; price: number }) {
  const { t } = useTranslation();
  return (
    <View style={S.heroBlock}>
      <View style={S.heroLabelRow}>
        <Ionicons name="time-outline" size={14} color={C.orange} />
        <Text style={S.heroLabel}>{t("wishlist.hoursOfWork")}</Text>
      </View>
      <Text style={S.heroValue}>{hoursCost ?? '—'}</Text>
      <Text style={S.heroPrice}>{formatCurrency(price)}</Text>
    </View>
  );
}

function Timeline({ daysPassed, totalDays }: { daysPassed: number; totalDays: number }) {
  return (
    <View style={S.timeline}>
      {Array.from({ length: totalDays }).map((_, i) => {
        const filled = i < daysPassed;
        const isLast = i === totalDays - 1;
        return (
          <View
            key={i}
            style={[
              S.timelineSegment,
              {
                backgroundColor: filled ? (isLast ? C.orange : C.indigo) : 'rgba(255,255,255,0.06)',
                opacity: filled ? 1 : 0.5,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function FilterChips({
  counts,
  active,
  onChange,
}: {
  counts: Record<FilterTab, number>;
  active: FilterTab;
  onChange: (f: FilterTab) => void;
}) {
  const tabs: { key: FilterTab; label: string; icon: string; color: string }[] = [
    { key: 'all', label: 'Все', icon: 'grid-outline', color: C.textSec },
    { key: 'PENDING', label: 'В процессе', icon: 'snow', color: C.indigo },
    { key: 'READY', label: 'Готово', icon: 'flame', color: C.orange },
    { key: 'REJECTED', label: 'Отказы', icon: 'trending-up', color: C.green },
    { key: 'PURCHASED', label: 'Куплено', icon: 'cart', color: C.red },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={S.filterScroll}>
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const count = counts[tab.key];
        if (count === 0 && tab.key !== 'all') return null;

        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[
              S.filterChip,
              isActive && { backgroundColor: tab.color, borderColor: tab.color },
            ]}
          >
            <Ionicons name={tab.icon as any} size={12} color={isActive ? '#FFF' : tab.color} />
            <Text style={[S.filterLabel, { color: isActive ? '#FFF' : C.textMain }]}>{tab.label}</Text>
            <View style={[S.filterCount, { backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)' }]}>
              <Text style={[S.filterCountText, { color: isActive ? '#FFF' : C.textSec }]}>{count}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

/* ─── Add Modal ─── */

type AddWishlistModalProps = {
  visible: boolean;
  onClose: () => void;
  hourlyRate: number;
  userId?: string;
  insetsTop: number;
};

const MS = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: C.bg },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalClose: { padding: 4 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: C.textMain },
  form: { padding: 16, paddingBottom: 320 },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, color: C.textSec, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: C.textMain,
    fontSize: 17,
  },
  inputMultiline: {
    backgroundColor: C.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.cardBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: C.textMain,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top' as any,
  },
  previewBox: {
    backgroundColor: 'rgba(251,149,84,0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewText: { fontSize: 13, color: C.orange },
  charCount: { fontSize: 12 },
  submitBtn: {
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitText: { fontSize: 17, fontWeight: '800' },
  lockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10 },
  lockText: { fontSize: 12, color: C.textSec },
});

function AddWishlistModal({ visible, onClose, hourlyRate, userId, insetsTop }: AddWishlistModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const nameRef = useRef<TextInput>(null);
  const { showError } = useToast();

  useEffect(() => {
    if (visible) {
      setName('');
      setPrice('');
      setDescription('');
      const t = setTimeout(() => nameRef.current?.focus(), 500);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const lifePreview = useMemo(
    () => (price && hourlyRate > 0 ? formatLifeHours(Math.round(parseFloat(price) * 100), hourlyRate) : null),
    [price, hourlyRate],
  );

  const canSubmit = name && price && description.trim().length >= 10;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    const priceNum = Math.round(parseFloat(price) * 100);
    if (isNaN(priceNum) || priceNum <= 0) {
      showError('Введите корректную цену');
      return;
    }

    const cooldownDays = 7;
    const ends = new Date();
    ends.setDate(ends.getDate() + cooldownDays);

    await useDataStore.getState().addWishlistItem({
      id: `wish_${Date.now()}`,
      userId: userId || '',
      name,
      price: priceNum,
      description: description.trim(),
      imageUrl: null,
      category: null,
      status: WishlistStatusEnum.PENDING,
      cooldownDays,
      createdAt: new Date().toISOString(),
      cooldownEnds: ends.toISOString(),
      decidedAt: null,
      purchasedAt: null,
    });

    onClose();
  }, [canSubmit, name, price, description, userId, onClose]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={[MS.modalOverlay, { paddingTop: insetsTop }]}>
        <View style={MS.modalHeader}>
          <TouchableOpacity onPress={onClose} style={MS.modalClose}>
            <Ionicons name="close" size={26} color={C.textSec} />
          </TouchableOpacity>
          <Text style={MS.modalTitle}>{t("wishlist.newWish")}</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView contentContainerStyle={MS.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={MS.field}>
            <Text style={MS.fieldLabel}>{t("wishlist.whatDoYouWant")}</Text>
            <TextInput
              ref={nameRef}
              value={name}
              onChangeText={setName}
              placeholder="Например: AirPods Pro"
              placeholderTextColor="#3F3F46"
              returnKeyType="next"
              style={MS.input}
            />
          </View>

          <View style={MS.field}>
            <Text style={MS.fieldLabel}>{t("wishlist.howMuch")}</Text>
            <TextInput
              value={price}
              onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
              placeholder="25000"
              placeholderTextColor="#3F3F46"
              keyboardType="decimal-pad"
              returnKeyType="next"
              style={MS.input}
            />
            {lifePreview && (
              <View style={MS.previewBox}>
                <Ionicons name="time-outline" size={14} color={C.orange} />
                <Text style={MS.previewText}>{t('wishlist.thisIsWorkValue', { hours: lifePreview })}</Text>
              </View>
            )}
          </View>

          <View style={MS.field}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={MS.fieldLabel}>{t("wishlist.whyYouNeed")}</Text>
              <Text style={[MS.charCount, { color: description.trim().length < 10 ? C.red : C.textSec }]}>
                {description.trim().length}/200 {t('wishlist.minLengthSuffix')}
              </Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Объясни, почему эта покупка важна. Через 7 дней ты перечитаешь это..."
              placeholderTextColor="#3F3F46"
              multiline
              numberOfLines={4}
              maxLength={200}
              style={MS.inputMultiline}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
            style={[MS.submitBtn, { backgroundColor: canSubmit ? C.indigo : 'rgba(99,102,241,0.2)' }]}
          >
            <Text style={[MS.submitText, { color: canSubmit ? '#FFF' : 'rgba(255,255,255,0.3)' }]}>{t("wishlist.freezeFor7Days")}</Text>
          </TouchableOpacity>
          <View style={MS.lockRow}>
            <Ionicons name="lock-closed" size={12} color={C.textSec} />
            <Text style={MS.lockText}>{t("wishlist.decisionCountdown")}</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ─── Main Screen ─── */

export default function WishlistScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const wishlist = useDataStore((s) => s.wishlist);
  const updateWishlistItem = useDataStore((s) => s.updateWishlistItem);
  const user = useAuthStore((s) => s.user);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [decisionItem, setDecisionItem] = useState<WishlistItem | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<WishlistItem | null>(null);
  const [buyConfirm, setBuyConfirm] = useState<WishlistItem | null>(null);

  const [rewardItem, setRewardItem] = useState<WishlistItem | null>(null);
  const rewardFade = useRef(new Animated.Value(0)).current;
  const rewardSlide = useRef(new Animated.Value(20)).current;
  const rewardScale = useRef(new Animated.Value(0.6)).current;

  const { showError } = useToast();

  const hourlyRate = useMemo(() => {
    const rate = getHourlyRate();
    return rate > 0 ? rate : (user?.hourlyRate ?? 0);
  }, [getHourlyRate, user?.hourlyRate]);

  const counts = useMemo(() => {
    return {
      all: wishlist.length,
      PENDING: wishlist.filter((i) => i.status === 'PENDING').length,
      READY: wishlist.filter((i) => i.status === 'READY').length,
      REJECTED: wishlist.filter((i) => i.status === 'REJECTED').length,
      PURCHASED: wishlist.filter((i) => i.status === 'PURCHASED').length,
    };
  }, [wishlist]);

  const filteredItems = useMemo(() => {
    const now = Date.now();
    const isExpired = (i: WishlistItem) => new Date(i.cooldownEnds).getTime() <= now;

    const ready = wishlist.filter(i => (i.status === 'READY' || (i.status === 'PENDING' && isExpired(i))));
    const pending = wishlist.filter(i => i.status === 'PENDING' && !isExpired(i));
    const history = wishlist.filter(i => i.status === 'REJECTED' || i.status === 'PURCHASED');

    if (activeFilter === 'READY') return ready;
    if (activeFilter === 'PENDING') return pending;
    if (activeFilter === 'REJECTED') return wishlist.filter(i => i.status === 'REJECTED');
    if (activeFilter === 'PURCHASED') return wishlist.filter(i => i.status === 'PURCHASED');

    return [...ready, ...pending, ...history];
  }, [wishlist, activeFilter]);

  /* ─── Actions ─── */

  const runRewardAnimation = useCallback((item: WishlistItem) => {
    setRewardItem(item);
    rewardFade.setValue(0);
    rewardSlide.setValue(20);
    rewardScale.setValue(0.6);

    Animated.parallel([
      Animated.timing(rewardFade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.timing(rewardSlide, { toValue: 0, duration: 350, useNativeDriver: true }),
      Animated.spring(rewardScale, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [rewardFade, rewardSlide, rewardScale]);

  const handleBuy = useCallback(
    async (item: WishlistItem) => {
      setBuyConfirm(null);
      try {
        const isDemoMode = useAuthStore.getState().isDemoMode;
        if (!isDemoMode) await wishlistService.purchase(item.id);
        updateWishlistItem(item.id, {
          status: WishlistStatusEnum.PURCHASED,
          purchasedAt: new Date().toISOString(),
          decidedAt: new Date().toISOString(),
        });
      } catch {
        showError('Не удалось отметить покупку');
      }
    },
    [updateWishlistItem, showError],
  );

  const handleReject = useCallback(
    async (item: WishlistItem) => {
      setRejectConfirm(null);
      try {
        const isDemoMode = useAuthStore.getState().isDemoMode;
        if (!isDemoMode) await wishlistService.reject(item.id);
        runRewardAnimation(item);
        setTimeout(() => {
          updateWishlistItem(item.id, {
            status: WishlistStatusEnum.REJECTED,
            decidedAt: new Date().toISOString(),
          });
        }, 400);
      } catch {
        showError('Не удалось обновить');
      }
    },
    [updateWishlistItem, runRewardAnimation, showError],
  );

  /* ─── Renderers ─── */

  const renderItem = useCallback(
    ({ item }: { item: WishlistItem }) => {
      const hoursCost = formatLifeHours(item.price, hourlyRate);
      const daysLeft = getDaysLeft(item.cooldownEnds);
      const isReady = item.status === 'READY' || (item.status === 'PENDING' && daysLeft === 0);
      const isPending = item.status === 'PENDING';
      const isRejected = item.status === 'REJECTED';
      const isPurchased = item.status === 'PURCHASED';
      const daysPassed = getDaysPassed(item.createdAt, item.cooldownDays);

      const cfg = getStatusConfig(isReady && isPending ? 'READY' : item.status);
      const isActive = item.status === 'PENDING' || item.status === 'READY';

      return (
        <View
          style={[
            S.card,
            {
              backgroundColor: cfg.cardBg,
              borderColor: cfg.border,
              opacity: isPurchased ? 0.7 : 1,
            },
          ]}
        >
          <View style={S.cardHeader}>
            <StatusIcon status={(isReady && isPending ? 'READY' : item.status) as keyof typeof STATUS_CONFIG} size={20} />
            <View style={S.flex}>
              <Text style={S.cardTitle} numberOfLines={1}>{item.name}</Text>
              {item.description ? (
                <Text style={S.cardDesc}>"{item.description}"</Text>
              ) : null}
            </View>
          </View>

          <HeroLifeCost hoursCost={hoursCost} price={item.price} />

          {isActive && <Timeline daysPassed={daysPassed} totalDays={item.cooldownDays} />}

          <View style={S.statusRow}>
            <Ionicons name={cfg.icon as any} size={12} color={cfg.color} />
            <Text style={[S.statusText, { color: cfg.color }]}>
              {isReady && isPending
                ? t('wishlist.coolingComplete')
                : isPending
                  ? t('wishlist.coolingDaysLeft', { days: daysLeft })
                  : cfg.label}
            </Text>
          </View>

          {isActive && (
            <View style={S.btnRow}>
              <TouchableOpacity onPress={() => setRejectConfirm(item)} style={S.btnReject}>
                <View style={S.btnRejectRow}>
                  <Ionicons name="close-circle" size={16} color="#FFF" />
                  <Text style={S.btnRejectText}>{t("wishlist.reject")}</Text>
                </View>
                <Text style={S.btnRejectSub}>{t("wishlist.saveMoneyColon")} {formatCurrency(item.price)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => (isReady ? setDecisionItem(item) : undefined)}
                disabled={!isReady}
                style={[
                  S.btnBuy,
                  {
                    backgroundColor: isReady ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                    borderWidth: isReady ? 1 : 0,
                    borderColor: isReady ? 'rgba(239,68,68,0.3)' : 'transparent',
                    opacity: isReady ? 1 : 0.35,
                  },
                ]}
              >
                <Ionicons name="cart-outline" size={16} color={isReady ? C.red : C.textSec} />
                <Text style={[S.btnBuyText, { color: isReady ? C.red : C.textSec }]}>{t("wishlist.buy")}</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isActive && (
            <View style={S.metaRow}>
              <Text style={S.metaText}>{formatCurrency(item.price)}</Text>
              <Text style={S.metaDot}>·</Text>
              <Text style={S.metaText}>{hoursCost}</Text>
            </View>
          )}
        </View>
      );
    },
    [handleReject, hourlyRate],
  );

  /* ─── Decision Modal ─── */

  const DS = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: C.bg,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 16,
      maxHeight: '92%',
    },
    drag: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 },
    badge: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: C.orange,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 6,
      marginBottom: 16,
    },
    badgeText: { fontSize: 11, fontWeight: '800', color: '#FFF', letterSpacing: 0.5 },
    title: { fontSize: 24, fontWeight: '800', color: C.textMain, textAlign: 'center', marginBottom: 8 },
    desc: { fontSize: 16, color: C.textSec, textAlign: 'center', fontStyle: 'italic', marginBottom: 20, lineHeight: 22 },
    hero: {
      backgroundColor: 'rgba(251,149,84,0.08)',
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
    },
    heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
    heroLabel: { fontSize: 13, color: C.orange },
    heroValue: { fontSize: 36, fontWeight: '800', color: C.orange },
    heroPrice: { fontSize: 16, color: C.textSec, marginTop: 8 },
    btnReject: {
      backgroundColor: C.green,
      borderRadius: 16,
      paddingVertical: 18,
      alignItems: 'center',
      marginBottom: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    btnRejectText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
    btnBuy: {
      backgroundColor: 'transparent',
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.35)',
      marginBottom: 4,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    btnBuyText: { fontSize: 16, fontWeight: '600', color: C.red },
    subText: { fontSize: 12, color: C.textSec, textAlign: 'center', marginBottom: 8 },
    cancel: { alignSelf: 'center', marginTop: 8, padding: 8 },
    cancelText: { fontSize: 14, color: C.textSec },
  });

  const DecisionModal = useCallback(() => {
    if (!decisionItem) return null;
    const item = decisionItem;
    const hoursCost = formatLifeHours(item.price, hourlyRate);
    const daysPassed = getDaysPassed(item.createdAt, item.cooldownDays);

    return (
      <Modal visible transparent animationType="slide" onRequestClose={() => setDecisionItem(null)}>
        <View style={DS.overlay}>
          <Pressable style={S.flex} onPress={() => setDecisionItem(null)} />
          <View style={[DS.sheet, { paddingBottom: Math.max(insets.bottom, 24) + 20 }]}>
            <View style={DS.drag} />
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={DS.badge}>
                <Ionicons name="flame" size={12} color="#FFF" />
                <Text style={DS.badgeText}>{t("wishlist.readyToDecide")}</Text>
              </View>

              <Timeline daysPassed={daysPassed} totalDays={item.cooldownDays} />
              <Text style={[S.statusText, { textAlign: 'center', marginTop: 8, marginBottom: 20, color: C.textSec }]}>
                {t("wishlist.frozenDaysAgo", { days: daysPassed })}
              </Text>

              <Text style={DS.title}>{item.name}</Text>
              {item.description ? <Text style={DS.desc}>"{item.description}"</Text> : null}

              <View style={DS.hero}>
                <View style={DS.heroLabelRow}>
                  <Ionicons name="time-outline" size={14} color={C.orange} />
                  <Text style={DS.heroLabel}>{t("wishlist.thisTakes")}</Text>
                </View>
                <Text style={DS.heroValue}>{hoursCost ?? '—'}</Text>
                <Text style={DS.heroPrice}>{formatCurrency(item.price)}</Text>
              </View>

              <TouchableOpacity
                onPress={() => { setDecisionItem(null); setRejectConfirm(item); }}
                style={DS.btnReject}
              >
                <Ionicons name="close-circle" size={20} color="#FFF" />
                <Text style={DS.btnRejectText}>{t("wishlist.reject")}</Text>
              </TouchableOpacity>
              <Text style={DS.subText}>{t("wishlist.saveMoneyColon")} {formatCurrency(item.price)} · +50 XP</Text>

              <TouchableOpacity
                onPress={() => { setDecisionItem(null); setBuyConfirm(item); }}
                style={DS.btnBuy}
              >
                <Ionicons name="cart-outline" size={18} color={C.red} />
                <Text style={DS.btnBuyText}>{t("wishlist.buy")}</Text>
              </TouchableOpacity>
              <Text style={DS.subText}>{t("wishlist.spendLabel")} {hoursCost ?? "—"}</Text>

              <TouchableOpacity onPress={() => setDecisionItem(null)} style={DS.cancel}>
                <Text style={DS.cancelText}>{t("common.cancel")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }, [decisionItem, hourlyRate, insets.bottom, handleReject, handleBuy]);

  /* ─── Reward Modal ─── */

  const RS = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(10,10,15,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    checkWrap: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: 'rgba(72,151,104,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderWidth: 2,
      borderColor: 'rgba(72,151,104,0.3)',
    },
    title: { fontSize: 24, fontWeight: '800', color: C.green, marginBottom: 6 },
    sub: { fontSize: 15, color: C.textSec, textAlign: 'center', marginBottom: 24 },
    cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    card: {
      backgroundColor: C.card,
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      minWidth: 130,
      borderWidth: 1,
      borderColor: C.cardBorder,
    },
    cardLabel: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    cardLabelText: { fontSize: 11, color: C.textSec },
    cardValue: { fontSize: 18, fontWeight: '800' },
    xpBox: {
      backgroundColor: 'rgba(255,215,0,0.08)',
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 24,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    xpText: { fontSize: 18, fontWeight: '800', color: '#FFD700' },
    investBox: {
      backgroundColor: C.card,
      borderRadius: 16,
      padding: 18,
      marginTop: 6,
      borderWidth: 1,
      borderColor: C.cardBorder,
      alignItems: 'center',
    },
    closeBtn: {
      backgroundColor: C.indigo,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 40,
      alignItems: 'center',
      marginTop: 24,
      minWidth: 200,
    },
    closeText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  });

  const RewardModal = useCallback(() => {
    if (!rewardItem) return null;
    const item = rewardItem;
    const hoursCost = formatLifeHours(item.price, hourlyRate);

    return (
      <Modal visible transparent animationType="fade" onRequestClose={() => setRewardItem(null)}>
        <Animated.View style={[RS.overlay, { opacity: rewardFade }]}>
          <Animated.View style={{ alignItems: 'center', transform: [{ translateY: rewardSlide }] }}>
            <Animated.View style={{ transform: [{ scale: rewardScale }] }}>
              <View style={RS.checkWrap}>
                <Ionicons name="checkmark-circle" size={44} color={C.green} />
              </View>
            </Animated.View>

            <Text style={RS.title}>{t("wishlist.consciousChoice")}</Text>
            <Text style={RS.sub}>{t("wishlist.youSaved")} {formatCurrency(item.price)}</Text>

            <View style={RS.cardsRow}>
              <View style={RS.card}>
                <View style={RS.cardLabel}>
                  <Ionicons name="wallet-outline" size={12} color={C.textSec} />
                  <Text style={RS.cardLabelText}>{t("goals.amount")}</Text>
                </View>
                <Text style={[RS.cardValue, { color: C.green }]}>{formatCurrency(item.price)}</Text>
              </View>
              <View style={RS.card}>
                <View style={RS.cardLabel}>
                  <Ionicons name="time-outline" size={12} color={C.textSec} />
                  <Text style={RS.cardLabelText}>{t("wishlist.time")}</Text>
                </View>
                <Text style={[RS.cardValue, { color: C.orange }]}>{hoursCost}</Text>
              </View>
            </View>

            <View style={RS.xpBox}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={RS.xpText}>+50 XP</Text>
            </View>

            <TouchableOpacity onPress={() => setRewardItem(null)} style={RS.closeBtn}>
              <Text style={RS.closeText}>{t("common.continue")}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    );
  }, [rewardItem, rewardFade, rewardSlide, rewardScale, hourlyRate]);

  /* ─── Empty state ─── */

  const EmptyState = useCallback(
    () => (
      <View style={S.emptyWrap}>
        <View style={S.emptyIconWrap}>
          <Ionicons name="snow" size={36} color={C.indigo} />
        </View>
        <Text style={S.emptyTitle}>{t("wishlist.emptyIncubator")}</Text>
        <Text style={S.emptySub}>{t("wishlist.freezeDescription")}</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} style={S.emptyCta}>
          <Ionicons name="add-circle" size={18} color="#FFF" />
          <Text style={S.emptyCtaText}>{t("wishlist.freezeFirstWish")}</Text>
        </TouchableOpacity>
      </View>
    ),
    [],
  );

  /* ─── Main render ─── */

  return (
    <View style={[S.flex, S.screen, { paddingTop: insets.top }]}>
      <View style={{ position: 'relative' }}>
        <View style={S.headerRow}>
          <View>
            <Text style={S.headerTitle}>{t("wishlist.incubatorTitle")}</Text>
            <Text style={S.headerSub}>{t("wishlist.freezeImpulse")}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAddModal(true)} style={S.addBtn}>
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={<FilterChips counts={counts} active={activeFilter} onChange={setActiveFilter} />}
          contentContainerStyle={S.listContent}
        />
      )}

      <AddWishlistModal visible={showAddModal} onClose={() => setShowAddModal(false)} hourlyRate={hourlyRate} userId={user?.id} insetsTop={insets.top} />
      <DecisionModal />
      <RewardModal />
      <ConfirmModal
        visible={rejectConfirm !== null}
        title="Отказаться от покупки?"
        message={rejectConfirm ? `${rejectConfirm.name} — ${formatCurrency(rejectConfirm.price)}` : ''}
        variant="confirm"
        confirmText="Отказаться"
        onConfirm={() => rejectConfirm && handleReject(rejectConfirm)}
        onCancel={() => setRejectConfirm(null)}
      />
      <ConfirmModal
        visible={buyConfirm !== null}
        title={t('wishlist.confirmPurchaseTitle')}
        message={
          buyConfirm
            ? t('wishlist.spendConfirm', {
                hours: formatLifeHours(buyConfirm.price, hourlyRate) ?? formatCurrency(buyConfirm.price),
                price: formatCurrency(buyConfirm.price),
                name: buyConfirm.name,
              })
            : ''
        }
        variant="destructive"
        confirmText={t('wishlist.buy')}
        onConfirm={() => buyConfirm && handleBuy(buyConfirm)}
        onCancel={() => setBuyConfirm(null)}
      />
    </View>
  );
}
