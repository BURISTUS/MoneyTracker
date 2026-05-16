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
    title: 'AI и умный ассистент',
    items: [
      { key: 'AI_CHAT', icon: 'sparkles' as const, title: 'AI-ассистент', desc: 'Задавай вопросы о финансах, проси отчёты', limit: { free: '—', premium: '50/день' } },
      { key: 'AI_VOICE', icon: 'mic' as const, title: 'Голосовой ввод', desc: 'Говори «Купил кофе за 200» — трата добавится', limit: { free: '—', premium: '20/день' } },
      { key: 'AI_RECEIPT', icon: 'camera' as const, title: 'Сканирование чеков', desc: 'Фотографируй чек — позиции добавятся', limit: { free: '—', premium: '10/день' } },
    ],
  },
  {
    title: 'Счета и финансы',
    items: [
      { key: 'ACCOUNTS', icon: 'wallet' as const, title: 'Счета', desc: 'Наличные и банковские карты (до 3 на Free)', limit: { free: '3 шт.', premium: '∞' } },
      { key: 'ACCOUNT_CREDIT', icon: 'card' as const, title: 'Кредитные карты', desc: 'Учитывай кредитный лимит и долг', limit: { free: '—', premium: '✓' } },
      { key: 'ACCOUNT_INVESTMENT', icon: 'trending-up' as const, title: 'Инвестиции', desc: 'Брокерские счета, крипто-портфели', limit: { free: '—', premium: '✓' } },
      { key: 'ACCOUNT_DEBT', icon: 'people' as const, title: 'Долги', desc: '«Я должен» / «Мне должны»', limit: { free: '—', premium: '✓' } },
      { key: 'GOALS', icon: 'flag' as const, title: 'Финансовые цели', desc: 'Ставь цели, отслеживай прогресс', limit: { free: '—', premium: '✓' } },
      { key: 'LIFE_COST', icon: 'hourglass' as const, title: 'Стоимость жизни', desc: 'Сколько часов ты работаешь за покупку', limit: { free: '—', premium: '✓' } },
    ],
  },
  {
    title: 'Вишлист',
    items: [
      { key: 'WISHLIST_INCUBATOR', icon: 'heart' as const, title: 'Инкубатор желаний', desc: 'Заморозь покупку на 7 дней', limit: { free: '5 желаний', premium: '∞' } },
    ],
  },
  {
    title: 'Аналитика',
    items: [
      { key: 'ANALYTICS_BASIC', icon: 'bar-chart' as const, title: 'Базовая аналитика', desc: 'Сводка за месяц, топ категорий', limit: { free: '✓', premium: '✓' } },
      { key: 'ANALYTICS_COMPARISON', icon: 'swap-vertical' as const, title: 'Сравнение периодов', desc: 'MoM / YoY: дельта в % и рублях', limit: { free: '—', premium: '✓' } },
      { key: 'ANALYTICS_TRENDS', icon: 'trending-up' as const, title: 'Тренды', desc: 'Графики расходов по категориям', limit: { free: '—', premium: '✓' } },
      { key: 'EXPORT', icon: 'download' as const, title: 'Экспорт данных', desc: 'Скачивай транзакции в CSV/PDF', limit: { free: '—', premium: '✓' } },
    ],
  },
  {
    title: 'Контент',
    items: [
      { key: 'ARTICLES', icon: 'book' as const, title: 'Статьи', desc: 'Читай финансовые статьи', limit: { free: '3/день', premium: '∞' } },
    ],
  },
];

export default function PremiumScreen() {
  const C = useTheme();
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
        <Text style={{ fontSize: 22, fontWeight: '800', color: C.textMain }}>Premium ✦</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100, gap: 24 }}>
        {/* Hero */}
        <View style={{ backgroundColor: C.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#F59E0B30', alignItems: 'center', gap: 12 }}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F59E0B15', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="diamond" size={32} color="#F59E0B" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.textMain, textAlign: 'center' }}>
            {isPremium ? 'У тебя Premium ✦' : 'Разблокируй все фичи'}
          </Text>
          <Text style={{ fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 20 }}>
            {isPremium ? 'Все возможности без ограничений' : 'AI-ассистент, цели, кредитки, аналитика и больше'}
          </Text>
          {!isPremium && (
            <Pressable onPress={togglePlan} style={{ backgroundColor: '#F59E0B', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFF' }}>Попробовать</Text>
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
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.textMain }}>Семейный доступ</Text>
              <PremiumBadge />
            </View>
            <Text style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>Поделись Premium с ещё одним человеком</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={C.textMuted} />
        </Pressable>

        {/* Feature sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.textSec, marginBottom: 4 }}>{section.title}</Text>
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
                      <Text style={{ fontSize: 14, fontWeight: '600', color: locked ? C.textMuted : C.textMain }}>{item.title}</Text>
                      {locked && <PremiumBadge />}
                    </View>
                    <Text style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{item.desc}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: locked ? C.textMuted : '#F59E0B' }}>{item.limit.free}</Text>
                    <Text style={{ fontSize: 9, color: C.textMuted }}>Free</Text>
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