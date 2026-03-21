import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '../../src/utils/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Главные табы - простые пути без вложенности
const TABS = [
  { name: 'index', label: 'Главная', icon: 'home' },
  { name: 'transactions', label: 'Транзакции', icon: 'swap-horizontal' },
  { name: 'wishlist', label: 'Инкубатор', icon: 'bulb' },
];

// Drawer меню - только нужные пункты
const DRAWER_ITEMS = [
  { label: 'Бюджет', icon: 'pie-chart', href: '/main/budget', color: '#1E3A5F' },
  { label: 'Цели', icon: 'flag', href: '/main/goals', color: '#2DD4BF' },
  { label: 'Профиль', icon: 'person', href: '/main/profile', color: '#1E3A5F' },
];

function CustomHeader({ onMenuPress }: { onMenuPress: () => void }) {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === 'android' ? 16 : 0) }]}>
        <LinearGradient
          colors={['#1E3A5F', '#2DD4BF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={onMenuPress}
            >
              <Ionicons name="menu" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Money Tracker</Text>
            <TouchableOpacity 
              style={styles.notificationButton}
              onPress={() => router.push('/main/profile')}
            >
              <Ionicons name="notifications" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </>
  );
}

function CustomTabBar({ state }: { state: any }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom + 8, backgroundColor: colors.surface }]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route: any, index: number) => {
          const tab = TABS[index];
          if (!tab) return null;
          
          const isFocused = state.index === index;

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabButton}
              onPress={() => {
                if (!isFocused) {
                  router.push(`/main/${tab.name}` as any);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[
                styles.tabIconContainer,
                isFocused && { backgroundColor: colors.primary + '15' }
              ]}>
                <Ionicons 
                  name={tab.icon as any} 
                  size={24} 
                  color={isFocused ? colors.primary : colors.textSecondary} 
                />
              </View>
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? colors.primary : colors.textSecondary }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MainLayoutContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const { colors } = useTheme();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  const navigateTo = (href: string) => {
    closeMenu();
    router.push(href as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CustomHeader onMenuPress={toggleMenu} />
      
      {/* Drawer Overlay */}
      {menuOpen && (
        <Pressable 
          style={styles.drawerOverlay} 
          onPress={closeMenu}
        >
          <View style={styles.drawerBackdrop} />
        </Pressable>
      )}
      
      {/* Drawer Menu */}
      <View style={[
        styles.drawerContainer, 
        menuOpen ? styles.drawerOpen : styles.drawerClosed,
        { backgroundColor: colors.surface }
      ]}>
        <LinearGradient
          colors={['#1E3A5F', '#2DD4BF']}
          style={styles.drawerHeader}
        >
          <View style={styles.drawerAvatar}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.drawerUserName}>Money Tracker</Text>
          </View>
        </LinearGradient>
        
        <View style={styles.drawerContent}>
          {DRAWER_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.href}
              style={styles.drawerItem}
              onPress={() => navigateTo(item.href)}
              activeOpacity={0.7}
            >
              <View style={[styles.drawerItemIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={[styles.drawerItemText, { color: colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} style={{ marginLeft: 'auto' }} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.drawerFooter, { borderTopColor: colors.divider }]}>
          <View style={styles.drawerVersion}>
            <Ionicons name="wallet" size={16} color={colors.textSecondary} />
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>v1.0</Text>
          </View>
        </View>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
          }}
          tabBar={(props) => <CustomTabBar {...props} />}
        >
          {TABS.map((tab) => (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{ title: tab.label }}
            />
          ))}
        </Tabs>
      </View>
    </View>
  );
}

export default function MainLayout() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <MainLayoutContent />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 100,
  },
  headerGradient: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuButton: {
    padding: 8,
  },
  notificationButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
    zIndex: 201,
  },
  drawerOpen: {
    transform: [{ translateX: 0 }],
  },
  drawerClosed: {
    transform: [{ translateX: -280 }],
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 48,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  drawerAvatar: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  drawerUserName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  drawerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '500',
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
  },
  drawerVersion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionText: {
    fontSize: 13,
    marginLeft: 8,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    zIndex: 50,
  },
  tabBarInner: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  tabIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
});
