import React from 'react';
import { View, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../stores/themeStore';
import { Text } from '../../../components/ui/text';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import type { FeatureKey } from '../../types';

const FEATURE_INFO: Record<string, { icon: string; titleKey: string; descKey: string }> = {
  AI_CHAT: { icon: 'sparkles', titleKey: 'paywall.aiAssistant', descKey: 'paywall.aiDesc' },
  AI_VOICE: { icon: 'mic', titleKey: 'paywall.voiceInput', descKey: 'paywall.voiceDesc' },
  AI_RECEIPT: { icon: 'camera', titleKey: 'paywall.receiptScan', descKey: 'paywall.receiptDesc' },
  GOALS: { icon: 'flag', titleKey: 'paywall.financialGoals', descKey: 'paywall.goalsDesc' },
  LIFE_COST: { icon: 'hourglass', titleKey: 'paywall.lifeCost', descKey: 'paywall.lifeCostDesc' },
  ANALYTICS_COMPARISON: { icon: 'swap-vertical', titleKey: 'paywall.periodComparison', descKey: 'paywall.comparisonDesc' },
  ANALYTICS_TRENDS: { icon: 'trending-up', titleKey: 'paywall.trends', descKey: 'paywall.trendsDesc' },
  EXPORT: { icon: 'download', titleKey: 'paywall.dataExport', descKey: 'paywall.exportDesc' },
  ACCOUNT_CREDIT: { icon: 'card', titleKey: 'paywall.creditCards', descKey: 'paywall.creditDesc' },
  ACCOUNT_INVESTMENT: { icon: 'trending-up', titleKey: 'paywall.investments', descKey: 'paywall.investDesc' },
  ACCOUNT_DEBT: { icon: 'people', titleKey: 'paywall.debts', descKey: 'paywall.debtsDesc' },
  WISHLIST_INCUBATOR: { icon: 'heart', titleKey: 'paywall.incubator', descKey: 'paywall.incubatorDesc' },
  FAMILY: { icon: 'people', titleKey: 'paywall.familyBudget', descKey: 'paywall.familyDesc' },
  PERSONAL_CATEGORIES: { icon: 'pricetag', titleKey: 'paywall.customCategories', descKey: 'paywall.customDesc' },
};

export function PaywallModal() {
  const { t } = useTranslation();
  const C = useTheme();
  const paywallFeature = useSubscriptionStore(s => s.paywallFeature);
  const closePaywall = useSubscriptionStore(s => s.closePaywall);
  const info = paywallFeature ? FEATURE_INFO[paywallFeature] : null;

  const handleUpgrade = () => {
    closePaywall();
    // Navigate to premium screen — we'll use a small delay to let modal close
    const { router } = require('expo-router');
    setTimeout(() => {
      router.push('/main/profile/premium');
    }, 300);
  };

  if (!info) return null;

  return (
    <Modal visible={!!paywallFeature} transparent animationType="fade" onRequestClose={closePaywall}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }} onPress={closePaywall}>
        <Pressable style={{ width: '85%', maxWidth: 380, backgroundColor: C.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border }} onPress={e => e.stopPropagation()}>
          {/* Icon */}
          <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#F59E0B15', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name={info.icon as any} size={28} color="#F59E0B" />
          </View>

          {/* Badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <View style={{ backgroundColor: '#F59E0B', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF' }}>{t('components.pro')}</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.textMain, marginBottom: 8 }}>{t(info.titleKey)}</Text>

          {/* Description */}
          <Text style={{ fontSize: 14, lineHeight: 20, color: C.textSec, marginBottom: 24 }}>{t(info.descKey)}</Text>

          {/* Upgrade button */}
          <Pressable
            onPress={handleUpgrade}
            style={{ backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="diamond" size={18} color="#FFF" />
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>{t('paywall.unlockPremium')}</Text>
            </View>
          </Pressable>

          {/* Skip */}
          <Pressable onPress={closePaywall} style={{ paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: C.textMuted }}>{t('paywall.notNow')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Hook: show paywall for a feature. Returns true if locked (and shows paywall), false if allowed. */
export function usePaywall() {
  const [visible, setVisible] = React.useState(false);
  const [feature, setFeature] = React.useState<FeatureKey | null>(null);
  const checkAccess = useSubscriptionStore(s => s.checkAccess);

  const showPaywall = (feat: FeatureKey): boolean => {
    const access = checkAccess(feat);
    if (!access?.allowed) {
      setFeature(feat);
      setVisible(true);
      return true;
    }
    return false;
  };

  const close = () => { setVisible(false); setFeature(null); };

  return { showPaywall, paywallVisible: visible, paywallFeature: feature, closePaywall: close };
}