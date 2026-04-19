import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import '../src/i18n';
import { loadTranslationsFromServer } from '../src/i18n';
import { apiGet } from '../src/services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0A0A0F',
    card: '#111118',
    border: 'rgba(255, 255, 255, 0.06)',
  },
};

export default function RootLayout() {
  useEffect(() => {
    loadTranslationsFromServer(apiGet);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={customDarkTheme}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: '#0A0A0F',
            },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth" />
          <Stack.Screen
            name="main"
            options={{ animation: 'fade' }}
          />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
