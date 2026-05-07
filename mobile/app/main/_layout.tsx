import { View } from 'react-native';
import { Stack } from 'expo-router';
import { TabBar } from '../../src/components/layout/TabBar';
import { ToastProvider, ToastContainer } from '../../src/components/ui/Toast';
import { useTheme } from '../../src/stores/themeStore';

export default function MainLayout() {
  const C = useTheme();

  return (
    <ToastProvider>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: C.bg,
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="transactions/index" />
          <Stack.Screen name="transactions/create" />
          <Stack.Screen name="categories/index" />
          <Stack.Screen name="categories/create" />
          <Stack.Screen name="categories/chart" />
          <Stack.Screen name="wishlist/index" />
          <Stack.Screen name="profile/index" />
          <Stack.Screen name="accounts/index" />
          <Stack.Screen name="goals/index" />
          <Stack.Screen name="life-cost/index" />
          <Stack.Screen name="chat/index" />
          <Stack.Screen name="analytics/index" />
          <Stack.Screen name="articles/[id]" />
        </Stack>
        <ToastContainer />
        <TabBar />
      </View>
    </ToastProvider>
  );
}
