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

export default function RegisterScreen() {
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
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      alert('Ошибка регистрации: ' + (error.response?.data?.message || error.message || 'Неизвестная ошибка'));
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
              Создайте аккаунт
            </Text>
          </View>

          <View style={{ gap: 16 }}>
            <Button onPress={handleDemo} fullWidth size="lg" variant="success">
              <Icon name="play" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              Начать (демо)
            </Button>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
              <Text size="sm" style={{ color: '#71717A', paddingHorizontal: 16 }}>
                или заполните форму
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            </View>

            <Input
              label="Имя"
              value={name}
              onChangeText={setName}
              placeholder="Как вас зовут?"
            />

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

            <Input
              label="Часовая ставка (₽/час)"
              value={hourlyRate}
              onChangeText={setHourlyRate}
              placeholder="Например: 500"
              keyboardType="number-pad"
            />

            <Button onPress={handleRegister} loading={isLoading} fullWidth size="lg">
              Зарегистрироваться
            </Button>
          </View>

          <View style={{ alignItems: 'center', marginTop: 32 }}>
            <Text size="sm" style={{ color: '#71717A' }}>
              Уже есть аккаунт?
            </Text>
            <Text
              size="sm"
              weight="semibold"
              style={{ color: '#6366F1', marginTop: 4 }}
              onPress={() => router.push('/auth/login')}
            >
              Войти
            </Text>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
