import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import type { User } from '../src/types';

const DEMO_USER: User = {
  id: 'demo-1',
  email: 'demo@moneytracker.app',
  name: 'Демо Пользователь',
  hourlyRate: 1500,
  monthlyHours: 160,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function IndexScreen() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Auto-login as demo user for testing
    const loginDemo = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setUser(DEMO_USER);
      router.replace('/main/');
    };
    loginDemo();
  }, [router, setUser]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Money Tracker</Text>
        <Text style={styles.subtitle}>Авторизация...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
});
