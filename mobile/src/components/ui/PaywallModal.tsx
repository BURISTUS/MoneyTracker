import React from 'react';
import { View, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../stores/themeStore';
import { Text } from '../../../components/ui/text';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import type { FeatureKey } from '../../types';

const FEATURE_INFO: Record<string, { icon: string; title: string; desc: string }> = {
  AI_CHAT: { icon: 'sparkles', title: 'AI-ассистент', desc: 'Задавай вопросы о финансах, проси отчёты и советы' },
  AI_VOICE: { icon: 'mic', title: 'Голосовой ввод', desc: 'Говори «Купил кофе за 200» — трата добавится автоматически' },
  AI_RECEIPT: { icon: 'camera', title: 'Сканирование чеков', desc: 'Фотографируй чек — позиции добавятся как транзакции' },
  GOALS: { icon: 'flag', title: 'Финансовые цели', desc: 'Ставьте цели, отслеживайте прогресс, делайте накопления' },
  LIFE_COST: { icon: 'hourglass', title: 'Стоимость жизни', desc: 'Считайте покупки в часах работы, симулируйте инвестиции' },
  ANALYTICS_COMPARISON: { icon: 'swap-vertical', title: 'Сравнение периодов', desc: 'MoM и YoY дельты, детальный разбор по категориям' },
  ANALYTICS_TRENDS: { icon: 'trending-up', title: 'Тренды', desc: 'Графики расходов по категориям за полгода-год' },
  EXPORT: { icon: 'download', title: 'Экспорт данных', desc: 'Скачивайте транзакции в CSV и PDF' },
  ACCOUNT_CREDIT: { icon: 'card', title: 'Кредитные карты', desc: 'Учитывайте кредитные карты с лимитами и долгами' },
  ACCOUNT_INVESTMENT: { icon: 'trending-up', title: 'Инвестиции', desc: 'Брокерские счета, крипто-портфели, переоценка активов' },
  ACCOUNT_DEBT: { icon: 'people', title: 'Долги', desc: '«Я должен» / «Мне должны» — полный контроль долгов' },
  WISHLIST_INCUBATOR: { icon: 'heart', title: 'Инкубатор желаний', desc: 'Замораживай покупки на 7 дней, чтобы избежать импульсов' },
  FAMILY: { icon: 'people', title: 'Семейный бюджет', desc: 'Общий доступ для двоих, двойные AI-лимиты' },
};

export function PaywallModal() {
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
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFF' }}>PRO</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.textMain, marginBottom: 8 }}>{info.title}</Text>

          {/* Description */}
          <Text style={{ fontSize: 14, lineHeight: 20, color: C.textSec, marginBottom: 24 }}>{info.desc}</Text>

          {/* Upgrade button */}
          <Pressable
            onPress={handleUpgrade}
            style={{ backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="diamond" size={18} color="#FFF" />
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>Разблокировать Premium</Text>
            </View>
          </Pressable>

          {/* Skip */}
          <Pressable onPress={closePaywall} style={{ paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: C.textMuted }}>Не сейчас</Text>
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