import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppState, Platform } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import '../global.css';
import '../src/i18n';
import i18n from '../src/i18n';
import { I18nextProvider } from 'react-i18next';
import { loadTranslationsFromServer, setApiGet } from '../src/i18n';
import { apiGet } from '../src/services/api';
import { GluestackUIProvider } from '../components/ui/gluestack-ui-provider';
import { useThemeStore } from '../src/stores/themeStore';
import { useSecurityStore } from '../src/stores/securityStore';
import { useAuthStore } from '../src/stores/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const warmLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F5F1EB',
    card: '#FFFFFF',
    border: 'rgba(0, 0, 0, 0.08)',
    text: '#1C1917',
    primary: '#D97706',
  },
};

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0A0A0F',
    card: '#111118',
    border: 'rgba(255, 255, 255, 0.06)',
  },
};

function ThemeWrapper() {
  const isDark = useThemeStore((s) => s.isDark);
  const bg = isDark ? '#0A0A0F' : '#F5F1EB';

  return (
    <GluestackUIProvider mode={isDark ? 'dark' : 'light'}>
      <ThemeProvider value={isDark ? customDarkTheme : warmLightTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen name="lock" options={{ animation: 'fade' }} />
          <Stack.Screen name="main" options={{ animation: 'fade' }} />
        </Stack>
      </ThemeProvider>
    </GluestackUIProvider>
  );
}

function LockMonitor() {
  const router = useRouter();
  const appState = useRef(AppState.currentState);
  const setBackgroundedAt = useSecurityStore((s) => s.setBackgroundedAt);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current === 'active' && nextState !== 'active') {
        const { isLockEnabled } = useSecurityStore.getState();
        if (isLockEnabled) {
          setBackgroundedAt(Date.now());
        }
      }

      if (appState.current !== 'active' && nextState === 'active') {
        const { isLockEnabled, backgroundedAt } = useSecurityStore.getState();
        const { isAuthenticated } = useAuthStore.getState();

        if (isLockEnabled && backgroundedAt && isAuthenticated) {
          const elapsed = Date.now() - backgroundedAt;
          if (elapsed > 30 * 1000) {
            router.replace('/lock');
          } else {
            setBackgroundedAt(null);
          }
        }
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    setApiGet(apiGet);
    loadTranslationsFromServer(apiGet);
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <LockMonitor />
        <ThemeWrapper />
      </QueryClientProvider>
    </I18nextProvider>
  );
}
