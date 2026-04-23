import { useState, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { Text } from '../../components/ui/text';

export default function LoginScreen() {
  const router = useRouter();
  const { login, loginMock, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback(async () => {
    if (!email || !password) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    try {
      console.log('📝 Logging in:', { email });
      const result = await login(email, password);
      console.log('✅ Login successful:', result);
      router.replace('/main');
    } catch (error: unknown) {
      console.error('❌ Login failed:', error);
      const err = error as { response?: { data?: { message?: string }; status?: number }; message?: string };
      if (err.response?.data?.message?.includes('not found') ||
          err.response?.status === 401) {
        alert('Пользователь не найден. Пожалуйста, зарегистрируйтесь.');
      } else {
        alert('Ошибка входа: ' + (err.response?.data?.message || err.message || 'Неизвестная ошибка'));
      }
    }
  }, [email, password, login, router]);

  const handleDemo = useCallback(async () => {
    console.log('🎮 Starting demo mode');
    await loginMock();
    router.replace('/main');
  }, [loginMock, router]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background-0"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 80,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center mb-10">
            <View className="w-[72px] h-[72px] rounded-3xl bg-primary-500 items-center justify-center mb-5">
              <Ionicons name="wallet" size={32} color="#FFFFFF" />
            </View>
            <Text className="text-3xl font-bold text-typography-white">Money Tracker</Text>
            <Text className="text-sm text-typography-400 mt-2">
              Управляйте своими финансами
            </Text>
          </View>

          <View className="gap-5">
            <Pressable
              onPress={handleDemo}
              className="w-full h-12 rounded-xl bg-success-500 items-center justify-center flex-row"
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text className="text-base font-semibold text-typography-white ml-2">
                Начать (демо)
              </Text>
            </Pressable>

            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px bg-outline-200" />
              <Text className="text-sm text-typography-400 px-4">
                или войдите
              </Text>
              <View className="flex-1 h-px bg-outline-200" />
            </View>

            <View>
              <Text className="text-sm font-medium text-typography-400 mb-1.5">Email</Text>
              <TextInput
                className="bg-background-0/50 rounded-xl border border-outline-200 px-4 h-12 text-base text-typography-white"
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor="#71717A"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-typography-400 mb-1.5">Пароль</Text>
              <TextInput
                className="bg-background-0/50 rounded-xl border border-outline-200 px-4 h-12 text-base text-typography-white"
                value={password}
                onChangeText={setPassword}
                placeholder="Минимум 6 символов"
                placeholderTextColor="#71717A"
                secureTextEntry
              />
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className={`w-full h-12 rounded-xl items-center justify-center ${isLoading ? 'bg-primary-500/40' : 'bg-primary-500'}`}
            >
              <Text className="text-base font-semibold text-typography-white">Войти</Text>
            </Pressable>

            <View className="items-center mt-4">
              <Text className="text-sm text-typography-400">
                Нет аккаунта?
              </Text>
              <Pressable onPress={() => router.push('/auth/register')}>
                <Text className="text-sm font-semibold text-primary-400 mt-1">
                  Зарегистрироваться
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
