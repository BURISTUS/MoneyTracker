import { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useSecurityStore } from '../src/stores/securityStore';
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
      if (!isAuthenticated) {
        router.replace('/auth/login');
        return;
      }

      const { isLockEnabled, backgroundedAt } = useSecurityStore.getState();
      if (isLockEnabled && backgroundedAt) {
        const elapsed = Date.now() - backgroundedAt;
        if (elapsed > 30 * 1000) {
          router.replace('/lock');
          return;
        }
      }

      router.replace('/main');
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
