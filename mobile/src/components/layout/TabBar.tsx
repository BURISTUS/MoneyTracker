import React from 'react';
import { View, Pressable, type StyleProp, type ViewStyle, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Text } from '../ui/Text';
import { Icon } from '../ui/Icon';
import { useRouter, usePathname } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabItem {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Icon>['name'];
  iconActive: React.ComponentProps<typeof Icon>['name'];
  path: string;
}

const tabs: TabItem[] = [
  { key: 'home', label: 'Главная', icon: 'home-outline', iconActive: 'home', path: '/main' },
  { key: 'transactions', label: 'Операции', icon: 'swap-horizontal-outline', iconActive: 'swap-horizontal', path: '/main/transactions' },
  { key: 'wishlist', label: 'Желания', icon: 'heart-outline', iconActive: 'heart', path: '/main/wishlist' },
  { key: 'profile', label: 'Профиль', icon: 'person-outline', iconActive: 'person', path: '/main/profile' },
];

export const TabBar: React.FC = React.memo(() => {
  const { spacing, borderRadius: br } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (tab: TabItem) => {
    if (tab.key === 'home') return pathname === '/main';
    return pathname.startsWith(tab.path);
  };

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(17, 17, 24, 0.92)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.06)',
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        paddingTop: spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          paddingHorizontal: spacing.xs,
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab);
          return (
            <Pressable
              key={tab.key}
              onPress={() => router.replace(tab.path as any)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                paddingVertical: spacing.xs,
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <View
                style={{
                  width: 40,
                  height: 28,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: br.sm,
                  backgroundColor: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                }}
              >
                <Icon
                  name={active ? tab.iconActive : tab.icon}
                  size={22}
                  color={active ? '#818CF8' : '#71717A'}
                />
              </View>
              <Text
                size="xs"
                weight={active ? 'semibold' : 'regular'}
                style={{ color: active ? '#818CF8' : '#71717A' }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
});
