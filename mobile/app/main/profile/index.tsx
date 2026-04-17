import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../../src/stores/authStore';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Card } from '../../../src/components/ui/Card';
import { Avatar } from '../../../src/components/ui/Avatar';
import { Icon } from '../../../src/components/ui/Icon';
import { XPBar } from '../../../src/components/features/XPBar';
import { Badge } from '../../../src/components/ui/Badge';
import { Divider } from '../../../src/components/ui/Divider';
import { useTheme } from '../../../src/theme';
import { GAMIFICATION_STATUS_LABELS } from '../../../src/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { spacing } = useTheme();
  const gamification = useDataStore((s) => s.gamification);

  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;
  const status = gamification?.status ?? 'CONSUMER_DRONE';
  const statusLabel = GAMIFICATION_STATUS_LABELS[status as keyof typeof GAMIFICATION_STATUS_LABELS] || 'Потребитель';

  const menuItems = [
    { icon: 'wallet', label: 'Счета', path: '/main/accounts', color: '#6366F1' },
    { icon: 'grid', label: 'Категории', path: '/main/categories', color: '#5AC8FA' },
    { icon: 'pie-chart', label: 'Бюджеты', path: '/main/budget', color: '#FBBF24' },
    { icon: 'flag', label: 'Цели', path: '/main/goals', color: '#34D399' },
    { icon: 'time', label: 'Life Cost', path: '/main/life-cost', color: '#F472B6' },
  ];

  return (
    <Screen
      header={
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <Text preset="h2">Профиль</Text>
        </View>
      }
    >
      <View style={{ gap: spacing.xl }}>
        <Card variant="glass" padding="xxl">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.xl }}>
            <Avatar name={user?.name || 'U'} size={56} />
            <View style={{ flex: 1 }}>
              <Text size="xl" weight="bold">
                {user?.name || 'Пользователь'}
              </Text>
              <Text size="sm" style={{ color: '#71717A', marginTop: 2 }}>
                {user?.email}
              </Text>
            </View>
            <Badge label={statusLabel} variant="primary" />
          </View>
          <XPBar xp={xp} level={level} />
        </Card>

        <View style={{ gap: spacing.sm }}>
          {menuItems.map((item) => (
            <Pressable
              key={item.path}
              onPress={() => router.push(item.path as any)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.lg,
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: `${item.color}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={item.icon as any} size={18} color={item.color} />
              </View>
              <Text size="md" weight="medium" style={{ flex: 1 }}>
                {item.label}
              </Text>
              <Icon name="chevron-forward" size={18} color="#71717A" />
            </Pressable>
          ))}
        </View>

        <Divider />

        <Pressable
          onPress={async () => {
            await logout();
            router.replace('/auth/login');
          }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingVertical: spacing.lg,
            paddingHorizontal: spacing.lg,
            backgroundColor: 'rgba(248, 113, 113, 0.06)',
            borderRadius: 12,
          }}
        >
          <Icon name="log-out-outline" size={20} color="#F87171" />
          <Text size="md" weight="medium" style={{ color: '#F87171' }}>
            Выйти
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
