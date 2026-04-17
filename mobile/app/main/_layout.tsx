import { View } from 'react-native';
import { Stack } from 'expo-router';
import { TabBar } from '../../src/components/layout/TabBar';

export default function MainLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#0A0A0F',
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
        <Stack.Screen name="budget/index" />
        <Stack.Screen name="goals/index" />
        <Stack.Screen name="life-cost/index" />
      </Stack>
      <TabBar />
    </View>
  );
}
