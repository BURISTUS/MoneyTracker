import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';

export default function IndexScreen() {
  const router = useRouter();
  const { checkAuth, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const init = async () => {
      await checkAuth();
    };
    init();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isAuthenticated) {
      router.replace('/main');
    } else {
      router.replace('/auth/login');
    }
  }, [mounted, isAuthenticated]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Money Tracker</Text>
        <Text style={styles.subtitle}>Загрузка...</Text>
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
