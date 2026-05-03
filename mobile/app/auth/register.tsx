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
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { Text } from '../../components/ui/text';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { register, loginMock, isLoading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const handleRegister = useCallback(async () => {
    if (!name || !email || !password) {
      return;
    }
    try {
      console.log('📝 Registering user:', { name, email, hourlyRate });
      const result = await register({ email, password, name, hourlyRate: hourlyRate ? parseInt(hourlyRate) : undefined });
      console.log('✅ Registration successful:', result);
      router.replace('/main');
    } catch (error: unknown) {
      console.error('❌ Registration failed:', error);
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(t('auth.registrationError') + ': ' + (err.response?.data?.message || err.message || t('common.unknownError')));
    }
  }, [name, email, password, hourlyRate, register, router]);

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
            <Text className="text-sm text-typography-400 mt-2">{t("auth.createAccount")}</Text>
          </View>

          <View className="gap-4">
            <Pressable
              onPress={handleDemo}
              className="w-full h-12 rounded-xl bg-success-500 items-center justify-center flex-row"
            >
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text className="text-base font-semibold text-typography-white ml-2">{t("auth.demo")}</Text>
            </Pressable>

            <View className="flex-row items-center my-2">
              <View className="flex-1 h-px bg-outline-200" />
              <Text className="text-sm text-typography-400 px-4">{t("auth.orFillForm")}</Text>
              <View className="flex-1 h-px bg-outline-200" />
            </View>

            <View>
              <Text className="text-sm font-medium text-typography-400 mb-1.5">{t("auth.name")}</Text>
              <TextInput
                className="bg-background-0/50 rounded-xl border border-outline-200 px-4 h-12 text-base text-typography-white"
                value={name}
                onChangeText={setName}
                placeholder="Как вас зовут?"
                placeholderTextColor="#71717A"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-typography-400 mb-1.5">{t("auth.email")}</Text>
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
              <Text className="text-sm font-medium text-typography-400 mb-1.5">{t("auth.password")}</Text>
              <TextInput
                className="bg-background-0/50 rounded-xl border border-outline-200 px-4 h-12 text-base text-typography-white"
                value={password}
                onChangeText={setPassword}
                placeholder="Минимум 6 символов"
                placeholderTextColor="#71717A"
                secureTextEntry
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-typography-400 mb-1.5">{t("auth.hourlyRateLabel")}</Text>
              <TextInput
                className="bg-background-0/50 rounded-xl border border-outline-200 px-4 h-12 text-base text-typography-white"
                value={hourlyRate}
                onChangeText={setHourlyRate}
                placeholder="Например: 500"
                placeholderTextColor="#71717A"
                keyboardType="number-pad"
              />
            </View>

            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              className={`w-full h-12 rounded-xl items-center justify-center ${isLoading ? 'bg-primary-500/40' : 'bg-primary-500'}`}
            >
              <Text className="text-base font-semibold text-typography-white">{t("auth.registerAction")}</Text>
            </Pressable>
          </View>

          <View className="items-center mt-8">
            <Text className="text-sm text-typography-400">{t("auth.haveAccount")}</Text>
            <Pressable onPress={() => router.push('/auth/login')}>
              <Text className="text-sm font-semibold text-primary-400 mt-1">{t("auth.loginAction")}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
