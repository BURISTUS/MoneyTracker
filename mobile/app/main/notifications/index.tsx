import React, { useEffect, useCallback } from 'react';
import {
  View,
  Pressable,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../src/stores/themeStore';
import { Text } from '../../../components/ui/text';
import { useNotificationsStore } from '../../../src/stores/notificationsStore';
import { getRelativeTime } from '../../../src/utils/formatters';
import type { Notification } from '../../../src/types';

function getNotificationIcon(type: string): { name: string; color: string } {
  switch (type) {
    case 'WISHLIST_READY':
      return { name: 'snow-outline', color: '#FB9554' };
    case 'BUDGET_ALERT':
      return { name: 'warning-outline', color: '#FF3B30' };
    case 'GOAL_COMPLETED':
      return { name: 'trophy-outline', color: '#34C759' };
    case 'MONTHLY_SUMMARY':
      return { name: 'bar-chart-outline', color: '#6366F1' };
    default:
      return { name: 'notifications-outline', color: '#8E8E93' };
  }
}

export default function NotificationsScreen() {
  const C = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const notifications = useNotificationsStore((s: { notifications: Notification[] }) => s.notifications);
  const isLoading = useNotificationsStore((s: { isLoading: boolean }) => s.isLoading);
  const fetchNotifications = useNotificationsStore((s: { fetchNotifications: (page?: number) => Promise<void> }) => s.fetchNotifications);
  const fetchUnreadCount = useNotificationsStore((s: { fetchUnreadCount: () => Promise<void> }) => s.fetchUnreadCount);
  const markAsRead = useNotificationsStore((s: { markAsRead: (id: string) => Promise<void> }) => s.markAsRead);
  const markAllAsRead = useNotificationsStore((s: { markAllAsRead: () => Promise<void> }) => s.markAllAsRead);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, []);

  const handlePress = useCallback(
    (item: Notification) => {
      if (!item.isRead) {
        markAsRead(item.id);
      }
    },
    [markAsRead],
  );

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead();
  }, [markAllAsRead]);

  const renderItem = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <Pressable
        onPress={() => handlePress(item)}
        style={[
          S.card,
          {
            backgroundColor: item.isRead ? C.card : `${C.primary}08`,
            borderColor: item.isRead ? C.border : `${C.primary}20`,
          },
        ]}
      >
        <View style={[S.iconWrap, { backgroundColor: `${icon.color}15` }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={S.content}>
          <Text style={[S.title, { color: C.textMain }]}>{item.title}</Text>
          <Text style={[S.body, { color: C.textSec }]}>{item.body}</Text>
          <Text style={[S.time, { color: C.textMuted }]}>
            {getRelativeTime(item.sentAt)}
          </Text>
        </View>
        {!item.isRead && <View style={[S.dot, { backgroundColor: C.primary }]} />}
      </Pressable>
    );
  };

  const S = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 8,
    },
    headerTitle: { fontSize: 22, fontWeight: '700', color: C.textMain },
    markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: C.primaryBg },
    markAllText: { fontSize: 12, fontWeight: '600', color: C.primary },
    list: { paddingHorizontal: 16 },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 14,
      borderRadius: 16,
      borderWidth: 1,
      marginBottom: 8,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { flex: 1 },
    title: { fontSize: 14, fontWeight: '600' },
    body: { fontSize: 13, marginTop: 2, lineHeight: 18 },
    time: { fontSize: 11, marginTop: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    empty: { alignItems: 'center', paddingVertical: 60 },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: C.textSec, marginTop: 16 },
    emptySub: { fontSize: 13, color: C.textMuted, marginTop: 4 },
  });

  return (
    <View style={[S.container, { paddingTop: insets.top }]}>
      <View style={S.header}>
        <Text style={S.headerTitle}>{t('notifications.title')}</Text>
        {notifications.some((n: Notification) => !n.isRead) && (
          <Pressable onPress={handleMarkAllRead} style={S.markAllBtn}>
            <Text style={S.markAllText}>{t('notifications.markAllRead')}</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[S.list, { paddingBottom: insets.bottom + 80 }]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={C.primary} />
        }
        ListEmptyComponent={
          <View style={S.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={C.textMuted} />
            <Text style={S.emptyTitle}>{t('notifications.empty')}</Text>
            <Text style={S.emptySub}>{t('notifications.emptySub')}</Text>
          </View>
        }
      />
    </View>
  );
}
