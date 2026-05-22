import React from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../src/stores/themeStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { useTranslation } from 'react-i18next';
import { Text } from '../../../components/ui/text';
import { useRouter } from 'expo-router';
import { PremiumBadge } from '../../../src/components/ui/PremiumBadge';

const SECTIONS = [
  {
    titleKey: 'premium.aiSectionTitle',
    items: [
      { key: 'AI_CHAT', icon: 'sparkles' as const, titleKey: 'premium.aiAssistant', descKey: 'premium.aiDesc' },
      { key: 'AI_VOICE', icon: 'mic' as const, titleKey: 'premium.voiceInput', descKey: 'premium.voiceDesc' },
      { key: 'AI_RECEIPT', icon: 'camera' as const, titleKey: 'premium.receiptScan', descKey: 'premium.receiptDesc' },
    ],
  },
  {
    titleKey: 'premium.accountsSectionTitle',
    items: [
      { key: 'ACCOUNTS', icon: 'wallet' as const, titleKey: 'premium.accountsTitle', descKey: 'premium.accountsDesc' },
      { key: 'ACCOUNT_CREDIT', icon: 'card' as const, titleKey: 'premium.creditCards', descKey: 'premium.creditDesc' },
      { key: 'ACCOUNT_INVESTMENT', icon: 'trending-up' as const, titleKey: 'premium.investments', descKey: 'premium.investDesc' },
      { key: 'ACCOUNT_DEBT', icon: 'people' as const, titleKey: 'premium.debts', descKey: 'premium.debtsDesc' },
      { key: 'GOALS', icon: 'flag' as const, titleKey: 'premium.financialGoals', descKey: 'premium.goalsDesc' },
      { key: 'LIFE_COST', icon: 'hourglass' as const, titleKey: 'premium.lifeCost', descKey: 'premium.lifeCostDesc' },
    ],
  },
  {
    titleKey: 'premium.wishlistSection',
    items: [
      { key: 'WISHLIST_INCUBATOR', icon: 'heart' as const, titleKey: 'premium.incubator', descKey: 'premium.incubatorDesc' },
    ],
  },
  {
    titleKey: 'premium.analyticsSection',
    items: [
      { key: 'ANALYTICS_BASIC', icon: 'bar-chart' as const, titleKey: 'premium.basicAnalytics', descKey: 'premium.basicDesc' },
      { key: 'ANALYTICS_COMPARISON', icon: 'swap-vertical' as const, titleKey: 'premium.periodComparison', descKey: 'premium.comparisonDesc' },
      { key: 'ANALYTICS_TRENDS', icon: 'trending-up' as const, titleKey: 'premium.trends', descKey: 'premium.trendsDesc' },
      { key: 'EXPORT', icon: 'download' as const, titleKey: 'premium.dataExport', descKey: 'premium.exportDesc' },
    ],
  },
  {
    titleKey: 'premium.contentSection',
    items: [
      { key: 'ARTICLES', icon: 'book' as const, titleKey: 'premium.articles', descKey: 'premium.articlesDesc' },
    ],
  },
];

export default function PremiumScreen() {
  const C = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const isPremium = useSubscriptionStore(s => s.isPremium());
  const togglePlan = useSubscriptionStore(s => s.togglePlan);
  const checkAccess = useSubscriptionStore(s => s.checkAccess);
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={C.textMain} />
        </Pressable>
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.textMain }}>{t('premium.premiumTitle')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100, gap: 24 }}>
        {/* Hero */}
        <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#F59E0B30', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F59E0B15', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="diamond" size={32} color="#F59E0B" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.textMain, textAlign: 'center' }}>
            {isPremium ? t('premium.youHavePremium') : t('premium.unlockFeatures')}
          </Text>
          <Text style={{ fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 20 }}>
            {isPremium ? t('premium.allFeaturesUnlocked') : t('premium.premiumDescription')}
          </Text>
          {!isPremium && (
            <Pressable onPress={togglePlan} style={{ backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>{t('premium.tryButton')}</Text>
            </Pressable>
          )}
        </View>

        {/* Family link */}
        <Pressable
          onPress={() => router.push('/main/profile/family' as any)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: '#F59E0B30' }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F59E0B15', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="people" size={22} color="#F59E0B" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.textMain }}>{t('premium.familyAccess')}</Text>
              <PremiumBadge />
            </View>
            <Text style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{t('premium.familyShareDesc')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
        </Pressable>

        {/* Feature sections */}
        {SECTIONS.map((section) => (
          <View key={section.titleKey} style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.textSec, marginBottom: 4 }}>{t(section.titleKey)}</Text>
            {section.items.map((item) => {
              const access = checkAccess(item.key as any);
              const locked = !access?.allowed;
              return (
                <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: locked ? C.border : '#F59E0B30', opacity: locked ? 0.7 : 1 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: locked ? C.inputBg : '#F59E0B15', alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name={item.icon} size={18} color={locked ? C.textMuted : '#F59E0B'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: locked ? C.textMuted : C.textMain }}>{t(item.titleKey)}</Text>
                      {locked && <PremiumBadge />}
                    </View>
                    <Text style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{t(item.descKey)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: locked ? C.textMuted : '#F59E0B' }}>{t('premium.freePlan')}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}