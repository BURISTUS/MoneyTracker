import { useState, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Input } from '../../src/components/ui/Input';
import { Button } from '../../src/components/ui/Button';
import { Text } from '../../src/components/ui/Text';
import { Icon } from '../../src/components/ui/Icon';

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
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      // Check if it's a registration error (user doesn't exist)
      if (error.response?.data?.message?.includes('not found') || 
          error.response?.status === 401) {
        alert('Пользователь не найден. Пожалуйста, зарегистрируйтесь.');
      } else {
        alert('Ошибка входа: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'));
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
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
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
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                backgroundColor: '#6366F1',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Icon name="wallet" size={32} color="#FFFFFF" />
            </View>
            <Text preset="h1" style={{ color: '#FFFFFF' }}>Money Tracker</Text>
            <Text size="sm" style={{ color: '#71717A', marginTop: 8 }}>
              Управляйте своими финансами
            </Text>
          </View>

          <View style={{ gap: 20 }}>
            <Button onPress={handleDemo} fullWidth size="lg" variant="success">
              <Icon name="play" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              Начать (демо)
            </Button>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <Text size="sm" style={{ color: '#71717A', paddingHorizontal: 16 }}>
                или войдите
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </View>

            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Пароль"
              value={password}
              onChangeText={setPassword}
              placeholder="Минимум 6 символов"
              secureTextEntry
            />

            <Button onPress={handleLogin} loading={isLoading} fullWidth size="lg">
              Войти
            </Button>

            <View style={{ alignItems: 'center', marginTop: 16 }}>
              <Text size="sm" style={{ color: '#71717A' }}>
                Нет аккаунта?
              </Text>
              <Text
                size="sm"
                weight="semibold"
                style={{ color: '#6366F1', marginTop: 4 }}
                onPress={() => router.push('/auth/register')}
              >
                Зарегистрироваться
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
