import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDataStore } from '../../../src/stores/dataStore';
import { useTheme } from '../../../src/utils/ThemeContext';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { gamification, user } = useDataStore();

  const settings = [
    { id: 'notifications', title: 'Push-уведомления', icon: 'notifications', color: '#FF9500' },
    { id: 'budget_alerts', title: 'Алерты бюджета', icon: 'pie-chart', color: '#007AFF' },
    { id: 'wishlist_reminders', title: 'Напоминания о wishlist', icon: 'bulb', color: '#FFD700' },
    { id: 'dark_mode', title: 'Темная тема', icon: 'moon', color: '#9D7BBD', hasSwitch: true, onSwitch: toggleTheme, switchValue: isDark },
  ];

  const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 20, paddingTop: 24 },
    profileHeader: { alignItems: 'center', marginBottom: 32 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    userName: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
    userEmail: { fontSize: 14, marginBottom: 12 },
    levelBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFD70020', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
    levelText: { fontSize: 14, fontWeight: '600', color: '#FFD700' },
    sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, padding: 16, marginBottom: 8 },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    settingIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    settingTitle: { fontSize: 16, fontWeight: '500' },
    menuItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 8, gap: 12 },
    menuItemText: { fontSize: 16, fontWeight: '500' },
    version: { marginTop: 24, alignItems: 'center' },
    versionText: { fontSize: 13 },
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#FFFFFF" />
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Пользователь'}</Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email || 'user@example.com'}</Text>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={14} color={colors.xpGold} />
            <Text style={styles.levelText}>Уровень {gamification?.level || 1}</Text>
          </View>
        </Animated.View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Настройки</Text>
        {settings.map((item, index) => (
          <Animated.View key={item.id} entering={FadeInDown.duration(300).delay(index * 50)} style={[styles.settingItem, { backgroundColor: colors.surface }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
            </View>
            {item.hasSwitch ? (
              <Switch value={item.switchValue || false} onValueChange={item.onSwitch || (() => {})} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            )}
          </Animated.View>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Аккаунт</Text>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
          <Ionicons name="create" size={20} color={colors.primary} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>Редактировать профиль</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>Безопасность</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
          <Ionicons name="help-circle" size={20} color={colors.info} />
          <Text style={[styles.menuItemText, { color: colors.text }]}>Помощь</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface }]}>
          <Ionicons name="log-out" size={20} color={colors.danger} />
          <Text style={[styles.menuItemText, { color: colors.danger }]}>Выйти</Text>
        </TouchableOpacity>

        <View style={styles.version}>
          <Text style={[styles.versionText, { color: colors.textTertiary }]}>Money Tracker v1.0</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
