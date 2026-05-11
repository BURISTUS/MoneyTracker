import React, { useState, useEffect } from 'react';
import { View, Pressable, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { useRouter, usePathname } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../stores/themeStore';

interface TabItem {
  key: string;
  label: string;
  icon: string;
  iconActive: string;
  path: string;
}

const tabs: TabItem[] = [
  { key: 'home', label: 'tabs.home', icon: 'home-outline', iconActive: 'home', path: '/main' },
  { key: 'transactions', label: 'tabs.transactions', icon: 'swap-horizontal-outline', iconActive: 'swap-horizontal', path: '/main/transactions' },
  { key: 'chat', label: 'tabs.chat', icon: 'chatbubbles-outline', iconActive: 'chatbubbles', path: '/main/chat' },
  { key: 'wishlist', label: 'tabs.wishlist', icon: 'heart-outline', iconActive: 'heart', path: '/main/wishlist' },
  { key: 'profile', label: 'tabs.profile', icon: 'person-outline', iconActive: 'person', path: '/main/profile' },
];

export const TabBar: React.FC = React.memo(() => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation();
  const C = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  if (keyboardVisible) return null;

  const isActive = (tab: TabItem) => {
    if (tab.key === 'home') return pathname === '/main';
    return pathname.startsWith(tab.path);
  };

  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8, backgroundColor: C.tabBar, borderTopWidth: 1, borderTopColor: C.tabBarBorder }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 4 }}>
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Pressable
              key={tab.key}
              onPress={() => router.replace(tab.path as never)}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 4 }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Ionicons
                name={(active ? tab.iconActive : tab.icon) as React.ComponentProps<typeof Ionicons>['name']}
                size={22}
                color={active ? C.tabActive : C.tabInactive}
              />
              <Text bold={active} style={{ fontSize: 10, color: active ? C.tabActive : C.tabInactive }}>
                {t(tab.label)}
              </Text>
              {active && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C.tabActive, marginTop: 2 }} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});