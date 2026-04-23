import React, { useState, useCallback } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../src/stores/authStore';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { CurrencyPicker } from '../../../src/components/ui/CurrencyPicker';
import { XPBar } from '../../../src/components/features/XPBar';
import { useTranslation } from 'react-i18next';
import { GAMIFICATION_STATUS_LABELS } from '../../../src/types';
import type { ExchangeRate } from '../../../src/services/currency';

const IconButton = ({ name, size = 22, color = '#A1A1AA' }: { name: React.ComponentProps<typeof Ionicons>['name']; size?: number; color?: string }) => (
  <Ionicons name={name} size={size} color={color} />
);

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { t } = useTranslation();
  const gamification = useDataStore((s) => s.gamification);
  const userCurrency = useDataStore((s) => s.userCurrency);
  const currencySymbol = useDataStore((s) => s.currencySymbol);
  const setUserCurrency = useDataStore((s) => s.setUserCurrency);

  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;
  const status = gamification?.status ?? 'CONSUMER_DRONE';
  const statusLabel = GAMIFICATION_STATUS_LABELS[status as keyof typeof GAMIFICATION_STATUS_LABELS] || 'Потребитель';

  const handleCurrencySelect = useCallback(
    (currency: ExchangeRate) => {
      setUserCurrency(currency.code);
    },
    [setUserCurrency],
  );

  const menuItems = [
    { icon: 'wallet' as const, label: 'Счета', path: '/main/accounts', color: '#6366F1' },
    { icon: 'grid' as const, label: 'Категории', path: '/main/categories', color: '#5AC8FA' },
    { icon: 'pie-chart' as const, label: 'Бюджеты', path: '/main/budget', color: '#FBBF24' },
    { icon: 'flag' as const, label: 'Цели', path: '/main/goals', color: '#34D399' },
    { icon: 'time' as const, label: 'Life Cost', path: '/main/life-cost', color: '#F472B6' },
  ];

  return (
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-bold text-typography-white">{t('profile.title', 'Профиль')}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-5">
          <View className="bg-background-50 rounded-2xl border border-outline-200 p-6">
            <View className="flex-row items-center gap-4 mb-5">
              <View className="w-14 h-14 rounded-full bg-primary-500/20 items-center justify-center">
                <Text className="text-xl font-bold text-primary-400">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-typography-white">
                  {user?.name || 'Пользователь'}
                </Text>
                <Text className="text-sm text-typography-400 mt-0.5">
                  {user?.email}
                </Text>
              </View>
              <View className="bg-primary-500/15 px-2.5 py-1 rounded-md border border-primary-500/30">
                <Text className="text-xs font-semibold text-primary-400">
                  {statusLabel}
                </Text>
              </View>
            </View>
            <XPBar xp={xp} level={level} />
          </View>

          <Pressable
            onPress={() => setShowCurrencyPicker(true)}
            className="flex-row items-center gap-3 py-4 px-4 bg-primary-500/8 rounded-xl border border-primary-500/15"
          >
            <View className="w-9 h-9 rounded-[10px] bg-primary-500/15 items-center justify-center">
              <IconButton name="cash-outline" size={18} color="#818CF8" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-typography-white">
                {t('profile.currency', 'Основная валюта')}
              </Text>
              <Text className="text-sm text-typography-400 mt-0.5">
                {userCurrency} · {currencySymbol}
              </Text>
            </View>
            <Text className="text-lg font-bold text-primary-400 mr-1">
              {currencySymbol}
            </Text>
            <IconButton name="chevron-forward" size={18} color="#71717A" />
          </Pressable>

          <View className="gap-2">
            {menuItems.map((item) => (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path as never)}
                className="flex-row items-center gap-3 py-4 px-4 bg-background-50/50 rounded-xl"
              >
                <View
                  className="w-9 h-9 rounded-[10px] items-center justify-center"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <IconButton name={item.icon} size={18} color={item.color} />
                </View>
                <Text className="text-base font-medium text-typography-white flex-1">
                  {item.label}
                </Text>
                <IconButton name="chevron-forward" size={18} color="#71717A" />
              </Pressable>
            ))}
          </View>

          <View className="h-px bg-outline-200" />

          <Pressable
            onPress={async () => {
              await logout();
              router.replace('/auth/login');
            }}
            className="flex-row items-center gap-3 py-4 px-4 bg-error-500/6 rounded-xl"
          >
            <IconButton name="log-out-outline" size={20} color="#F87171" />
            <Text className="text-base font-medium text-error-500">
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
    </View>
  );
}
