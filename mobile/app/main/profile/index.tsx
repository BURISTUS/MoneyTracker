import React, { useState, useCallback } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/stores/authStore';
import { useDataStore } from '../../../src/stores/dataStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { Text } from '../../../components/ui/text';
import { CurrencyPicker } from '../../../src/components/ui/CurrencyPicker';
import { LanguagePicker, getNativeName } from '../../../src/components/ui/LanguagePicker';
import { PremiumBadge } from '../../../src/components/ui/PremiumBadge';
import { useTranslation } from 'react-i18next';
import { useTheme, useThemeStore } from '../../../src/stores/themeStore';
import type { FeatureKey } from '../../../src/types';
import type { ExchangeRate } from '../../../src/services/currency';

export default function ProfileScreen() {
  const C = useTheme();
  const S = {
    card: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.border, padding: 20 },
    row: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border },
    iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const },
    logoutBtn: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: C.redBg, borderRadius: 16, borderWidth: 1, borderColor: C.redBorder },
    divider: { height: 1, backgroundColor: C.border },
    sectionTitle: { fontSize: 13, fontWeight: '600' as const, color: C.textSec, marginBottom: 8, marginTop: 4 },
    statCard: { flex: 1, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center' as const },
    statValue: { fontSize: 18, fontWeight: '800' as const, color: C.textMain },
    statLabel: { fontSize: 11, color: C.textSec, marginTop: 4, fontWeight: '500' as const },
  };
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { t, i18n } = useTranslation();
  const wishlist = useDataStore((s) => s.wishlist);
  const userCurrency = useDataStore((s) => s.userCurrency);
  const currencySymbol = useDataStore((s) => s.currencySymbol);
  const setUserCurrency = useDataStore((s) => s.setUserCurrency);

  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggle);

  const isPremium = useSubscriptionStore((s) => s.isPremium());
  const isFamily = useSubscriptionStore((s) => s.isFamily());
  const fetchStatus = useSubscriptionStore((s) => s.fetchStatus);
  const togglePlan = useSubscriptionStore((s) => s.togglePlan);
  const planLabel = isFamily ? t('profile.planToggle', 'Premium Family ✦') : isPremium ? t('profile.premiumLabel', 'Premium ✦') : 'Free';
  const planDesc = isFamily ? t('profile.planDesc2members') : isPremium ? t('profile.planDescAll') : t('profile.planToggle');

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const showPaywallFn = useSubscriptionStore((s) => s.showPaywall);
  const checkAccess = useSubscriptionStore((s) => s.checkAccess);

  const rejectedCount = wishlist.filter((w) => w.status === 'REJECTED').length;
  const totalSavedKopecks = wishlist.filter((w) => w.status === 'REJECTED').reduce((s, w) => s + w.price, 0);

  const handleCurrencySelect = useCallback(
    (currency: ExchangeRate) => {
      setUserCurrency(currency.code);
    },
    [setUserCurrency],
  );

  const handleMenuPress = useCallback((item: { path: string; feature?: FeatureKey }) => {
    if (item.feature) {
      const locked = showPaywallFn(item.feature);
      if (locked) return;
    }
    router.push(item.path as never);
  }, [showPaywallFn, router]);

  const menuItems = [
    { icon: 'wallet' as const, label: t('profile.accounts'), path: '/main/accounts', color: C.primary },
    { icon: 'grid' as const, label: t('profile.categories'), path: '/main/categories', color: '#5AC8FA' },
    { icon: 'flag' as const, label: t('profile.goals'), path: '/main/goals', color: C.green, feature: 'GOALS' as FeatureKey },
    { icon: 'bar-chart' as const, label: t('profile.analytics'), path: '/main/analytics', color: '#A78BFA' },
    { icon: 'time' as const, label: t('profile.lifeCost'), path: '/main/life-cost', color: '#F472B6' },
  ];

  return (
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 }}>
        <Text className="text-2xl font-bold" style={{ color: C.textMain }}>{t('profile.title', 'Профиль')}</Text>
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
              <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: C.primary }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: C.textMain }}>
                  {user?.name || t('profile.user', 'User')}
                </Text>
                <Text style={{ fontSize: 13, color: C.textSec, marginTop: 2 }}>
                  {user?.email}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={S.statCard}>
              <Text style={[S.statValue, { color: C.green }]}>{rejectedCount}</Text>
              <Text style={S.statLabel}>{t("profile.refusals")}</Text>
            </View>
            <View style={S.statCard}>
              <Text style={[S.statValue, { color: C.green }]}>
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
              onPress={() => handleMenuPress(item)}
              style={S.row}
            >
              <View style={[S.iconWrap, { backgroundColor: `${item.color}15` }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: C.textMain }}>
                {item.label}
              </Text>
              {item.feature && !checkAccess(item.feature)?.allowed && <PremiumBadge />}
              <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
            </Pressable>
          ))}

          {/* Settings */}
          {/* Family Access */}
          <Pressable
            onPress={() => {
              if (!isFamily) {
                router.push('/main/profile/family' as never);
              } else {
                router.push('/main/profile/family' as never);
              }
            }}
            style={[S.row, { backgroundColor: isFamily ? '#F59E0B10' : C.card, borderColor: isFamily ? '#F59E0B30' : C.border }]}
          >
            <View style={[S.iconWrap, { backgroundColor: '#F59E0B15' }]}>
              <Ionicons name="people" size={18} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: C.textMain }}>{t('profile.familyAccess')}</Text>
              </View>
              <Text style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>
                {isFamily ? t('profile.familyManage') : t('profile.familyEnterCode')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </Pressable>

          {/* Premium Features */}
          <Pressable
            onPress={() => router.push('/main/profile/premium' as never)}
            style={[S.row, { backgroundColor: '#F59E0B10', borderColor: '#F59E0B30' }]}
          >
            <View style={[S.iconWrap, { backgroundColor: '#F59E0B15' }]}>
              <Ionicons name="diamond" size={18} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#F59E0B' }}>{isPremium ? t('profile.premiumLabel', 'Premium ✦') : t('profile.unlockPremium')}</Text>
              <Text style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>{isPremium ? t('profile.premiumDescAll') : t('profile.premiumDescList')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#F59E0B" />
          </Pressable>

          <Text style={S.sectionTitle}>{t("profile.settings")}</Text>
          <Pressable
            onPress={() => setShowCurrencyPicker(true)}
            style={S.row}
          >
            <View style={[S.iconWrap, { backgroundColor: C.primaryBg }]}>
              <Ionicons name="cash-outline" size={18} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: C.textMain }}>{t("profile.currency")}</Text>
              <Text style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>{userCurrency} · {currencySymbol}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => setShowLanguagePicker(true)}
            style={S.row}
          >
            <View style={[S.iconWrap, { backgroundColor: C.greenBg }]}>
              <Ionicons name="language" size={18} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: C.textMain }}>{t("profile.language")}</Text>
              <Text style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>
                {getNativeName(i18n.language)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
          </Pressable>

          {/* Premium Toggle */}
          <Pressable
            onPress={async () => {
              try {
                await togglePlan();
                await useDataStore.getState().initializeData();
              } catch (e) {
                console.error('Toggle premium error:', e);
              }
            }}
            style={S.row}
          >
            <View style={[S.iconWrap, { backgroundColor: isPremium ? '#F59E0B15' : C.primaryBg }]}>
              <Ionicons name={isPremium ? 'diamond' : 'diamond-outline'} size={18} color={isPremium ? '#F59E0B' : C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: C.textMain }}>{planLabel}</Text>
              <Text style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>{planDesc}</Text>
            </View>
            <View style={{ width: 44, height: 28, borderRadius: 14, backgroundColor: isPremium ? '#F59E0B' : '#D1D5DB', justifyContent: 'center', paddingHorizontal: 2 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', alignSelf: isPremium ? 'flex-end' as const : 'flex-start' as const, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 }} />
            </View>
          </Pressable>

          <Pressable
            onPress={toggleTheme}
            style={S.row}
          >
            <View style={[S.iconWrap, { backgroundColor: C.primaryBg }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '500', color: C.textMain }}>{t('profile.theme', 'Тема')}</Text>
              <Text style={{ fontSize: 12, color: C.textSec, marginTop: 1 }}>
                {isDark ? t('profile.dark', 'Тёмная') : t('profile.light', 'Светлая')}
              </Text>
            </View>
            <View style={{ width: 44, height: 28, borderRadius: 14, backgroundColor: isDark ? C.primary : '#D1D5DB', justifyContent: 'center', paddingHorizontal: 2 }}>
              <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', alignSelf: isDark ? 'flex-end' as const : 'flex-start' as const, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 }} />
            </View>
          </Pressable>

          <View style={S.divider} />

          <Pressable
            onPress={async () => {
              await logout();
              router.replace('/auth/login');
            }}
            style={S.logoutBtn}
          >
            <Ionicons name="log-out-outline" size={20} color={C.red} />
            <Text style={{ fontSize: 15, fontWeight: '500', color: C.red }}>
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
