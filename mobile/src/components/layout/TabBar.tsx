import React from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { useRouter, usePathname } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabItem {
  key: string;
  label: string;
  icon: string;
  iconActive: string;
  path: string;
}

const tabs: TabItem[] = [
  { key: 'home', label: 'Главная', icon: 'home-outline', iconActive: 'home', path: '/main' },
  { key: 'transactions', label: 'Операции', icon: 'swap-horizontal-outline', iconActive: 'swap-horizontal', path: '/main/transactions' },
  { key: 'wishlist', label: 'Желания', icon: 'heart-outline', iconActive: 'heart', path: '/main/wishlist' },
  { key: 'profile', label: 'Профиль', icon: 'person-outline', iconActive: 'person', path: '/main/profile' },
];

export const TabBar: React.FC = React.memo(() => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tab: TabItem) => {
    if (tab.key === 'home') return pathname === '/main';
    return pathname.startsWith(tab.path);
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-[rgba(17,17,24,0.92)] border-t border-[rgba(255,255,255,0.06)]"
      style={{ paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8 }}
    >
      <View className="flex-row justify-around items-center px-1">
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Pressable
              key={tab.key}
              onPress={() => router.replace(tab.path as never)}
              className="flex-1 items-center justify-center gap-0.5 p-1"
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Ionicons
                name={(active ? tab.iconActive : tab.icon) as React.ComponentProps<typeof Ionicons>['name']}
                size={22}
                color={active ? '#818CF8' : '#71717A'}
              />
              <Text bold={active} className={`text-[10px] ${active ? 'text-primary-300' : 'text-typography-400'}`}>
                {tab.label}
              </Text>
              {active && (
                <View className="w-1 h-1 rounded-full bg-primary-400 mt-0.5" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
