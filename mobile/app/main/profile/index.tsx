import React, { useState, useCallback } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/stores/authStore';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { CurrencyPicker } from '../../../src/components/ui/CurrencyPicker';
import { LanguagePicker, getNativeName } from '../../../src/components/ui/LanguagePicker';
import { useTranslation } from 'react-i18next';
import type { ExchangeRate } from '../../../src/services/currency';

const BORDER = 'rgba(255,255,255,0.08)';
const CARD_BG = '#141418';

const S = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(239,68,68,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  divider: { height: 1, backgroundColor: BORDER },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#8C8C8C', marginBottom: 8, marginTop: 4 },
  statCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: '#F5F5F5' },
  statLabel: { fontSize: 11, color: '#8C8C8C', marginTop: 4, fontWeight: '500' },
});

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const wishlist = useDataStore((s) => s.wishlist);
  const userCurrency = useDataStore((s) => s.userCurrency);
  const currencySymbol = useDataStore((s) => s.currencySymbol);
  const setUserCurrency = useDataStore((s) => s.setUserCurrency);

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);

  const rejectedCount = wishlist.filter((w) => w.status === 'REJECTED').length;
  const totalSavedKopecks = wishlist.filter((w) => w.status === 'REJECTED').reduce((s, w) => s + w.price, 0);

  const handleCurrencySelect = useCallback(
    (currency: ExchangeRate) => {
      setUserCurrency(currency.code);
    },
    [setUserCurrency],
  );

  const menuItems = [
    { icon: 'wallet' as const, label: t('profile.accounts'), path: '/main/accounts', color: '#6366F1' },
    { icon: 'grid' as const, label: t('profile.categories'), path: '/main/categories', color: '#5AC8FA' },
    { icon: 'pie-chart' as const, label: t('profile.budgets'), path: '/main/budget', color: '#FBBF24' },
    { icon: 'flag' as const, label: t('profile.goals'), path: '/main/goals', color: '#34D399' },
    { icon: 'bar-chart' as const, label: t('profile.analytics'), path: '/main/analytics', color: '#A78BFA' },
    { icon: 'time' as const, label: t('profile.lifeCost'), path: '/main/life-cost', color: '#F472B6' },
  ];

  return (
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
        <Text className="text-2xl font-bold text-typography-white">{t('profile.title', 'Профиль')}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 10 }}>
          {/* Hero Card */}
          <View style={S.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(99,102,241,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#6366F1' }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#F5F5F5' }}>
                  {user?.name || 'Пользователь'}
                </Text>
                <Text style={{ fontSize: 13, color: '#8C8C8C', marginTop: 2 }}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={S.statCard}>
              <Text style={[S.statValue, { color: '#34D399' }]}>{rejectedCount}</Text>
              <Text style={S.statLabel}>{t("profile.refusals")}</Text>
            </View>
            <View style={S.statCard}>
              <Text style={[S.statValue, { color: '#34D399' }]}>
                {totalSavedKopecks > 0 ? `${(totalSavedKopecks / 100).toLocaleString('ru-RU')} ₽` : '—'}
              </Text>
              <Text style={S.statLabel}>{t("profile.saved")}</Text>
            </View>
          </View>

          {/* Navigation */}
          <Text style={S.sectionTitle}>{t("profile.finances")}</Text>
          {menuItems.map((item) => (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path as never)}
              style={S.row}
            >
              <View style={[S.iconWrap, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: '#F5F5F5' }}>
                {item.label}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#71717A" />
            </Pressable>
          ))}

          {/* Settings */}
          <Text style={S.sectionTitle}>{t("profile.settings")}</Text>
          <Pressable
            onPress={() => setShowCurrencyPicker(true)}
            style={S.row}
          >
            <View style={[S.iconWrap, { backgroundColor: 'rgba(99,102,241,0.12)' }]}>
              <Ionicons name="cash-outline" size={18} color="#818CF8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#F5F5F5' }}>{t("profile.currency")}</Text>
              <Text style={{ fontSize: 12, color: '#8C8C8C', marginTop: 1 }}>{userCurrency} · {currencySymbol}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#71717A" />
          </Pressable>

          <Pressable
            onPress={() => setShowLanguagePicker(true)}
            style={S.row}
          >
            <View style={[S.iconWrap, { backgroundColor: 'rgba(52,211,153,0.12)' }]}>
              <Ionicons name="language" size={18} color="#34D399" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: '#F5F5F5' }}>{t("profile.language")}</Text>
              <Text style={{ fontSize: 12, color: '#8C8C8C', marginTop: 1 }}>
                {getNativeName(i18n.language)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#71717A" />
          </Pressable>

          <View style={S.divider} />

          <Pressable
            onPress={async () => {
              await logout();
              router.replace('/auth/login');
            }}
            style={S.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={20} color="#F87171" />
            <Text style={{ fontSize: 15, fontWeight: '500', color: '#EF4444' }}>
              {t('profile.logout', 'Выйти')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <CurrencyPicker
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={handleCurrencySelect}
        selectedCode={userCurrency}
        title={t('profile.currency', 'Основная валюта')}
      />

      <LanguagePicker
        visible={showLanguagePicker}
        onClose={() => setShowLanguagePicker(false)}
        currentLang={i18n.language}
      />
    </View>
  );
}
