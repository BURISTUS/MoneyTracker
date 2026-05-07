import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useTheme } from '../src/stores/themeStore';

export default function IndexScreen() {
  const router = useRouter();
  const C = useTheme();
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const hasNavigated = useRef(false);

  useEffect(() => {
    const init = async () => {
      await checkAuth();
      if (hasNavigated.current) return;
      hasNavigated.current = true;

      const { isAuthenticated } = useAuthStore.getState();
      if (isAuthenticated) {
        router.replace('/main');
      } else {
        router.replace('/auth/login');
      }
    };

    init();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator size="large" color="#6366F1" />
    </View>
  );
}
