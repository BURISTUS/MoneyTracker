import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Card } from '../../../src/components/ui/Card';
import { Icon } from '../../../src/components/ui/Icon';
import { Header } from '../../../src/components/layout/Header';
import { useTheme } from '../../../src/theme';

type SalaryPeriod = 'hour' | 'week' | 'month' | 'year';

const PERIOD_LABELS: Record<SalaryPeriod, string> = {
  hour: 'В час',
  week: 'В неделю',
  month: 'В месяц',
  year: 'В год',
};

const HOURS_IN_PERIOD: Record<SalaryPeriod, number> = {
  hour: 1,
  week: 40,
  month: 164,
  year: 1971,
};

export default function LifeCostScreen() {
  const { spacing } = useTheme();
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);
  const setHourlyRate = useDataStore((s) => s.setHourlyRate);
  const hourlyRate = getHourlyRate();

  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('month');
  const [salaryInput, setSalaryInput] = useState('');

  const calculatedHourlyRate = useMemo(() => {
    const salary = parseFloat(salaryInput);
    if (!salary || salary <= 0) return null;
    const hourly = salary / HOURS_IN_PERIOD[salaryPeriod];
    return Math.round(hourly * 100) / 100;
  }, [salaryInput, salaryPeriod]);

  const handleSaveRate = useMemo(() => {
    if (!calculatedHourlyRate || calculatedHourlyRate <= 0) return null;
    return async () => {
      await setHourlyRate(calculatedHourlyRate);
      Alert.alert('Сохранено', `Ставка ${calculatedHourlyRate.toFixed(0)} ₽/час сохранена`);
    };
  }, [calculatedHourlyRate, setHourlyRate]);

  return (
    <Screen scroll header={<Header title="Life Cost" showBack />}>
      <View style={{ gap: spacing.xl }}>

        <View style={{
          backgroundColor: hourlyRate > 0 ? 'rgba(244, 114, 182, 0.08)' : 'rgba(255,255,255,0.04)',
          borderRadius: 16,
          padding: 20,
          alignItems: 'center',
        }}>
          <Text size="sm" style={{ color: '#71717A', marginBottom: 4 }}>Ваша часовая ставка</Text>
          <Text size="xxxl" weight="bold" style={{ color: hourlyRate > 0 ? '#F472B6' : '#52525B' }}>
            {hourlyRate > 0 ? `${hourlyRate.toFixed(0)} ₽` : 'Не указана'}
          </Text>
          {hourlyRate > 0 && (
            <Text size="xs" style={{ color: '#71717A', marginTop: 4 }}>
              ≈ {Math.round(hourlyRate * 164).toLocaleString('ru')} ₽/мес · {Math.round(hourlyRate * 1971).toLocaleString('ru')} ₽/год
            </Text>
          )}
        </View>

        <Card variant="glass" padding="xxl">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <Icon name="time" size={20} color="#F472B6" />
            <Text size="md" weight="semibold">
              Рассчитать ставку
            </Text>
          </View>

          <View style={{ flexDirection: 'row', gap: 6, marginBottom: spacing.md }}>
            {(Object.keys(PERIOD_LABELS) as SalaryPeriod[]).map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => { setSalaryPeriod(key); setSalaryInput(''); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderRadius: 10,
                  backgroundColor: salaryPeriod === key ? 'rgba(244, 114, 182, 0.15)' : 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: salaryPeriod === key ? '#F472B6' : 'transparent',
                }}
              >
                <Text size="xs" weight={salaryPeriod === key ? 'semibold' : 'regular'} style={{ color: salaryPeriod === key ? '#F472B6' : '#8E8E93' }}>
                  {PERIOD_LABELS[key]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={salaryInput}
            onChangeText={setSalaryInput}
            placeholder={`Зарплата ${PERIOD_LABELS[salaryPeriod].toLowerCase()} (₽)`}
            placeholderTextColor="#8E8E93"
            keyboardType="decimal-pad"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: 10,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: '#FFFFFF',
              fontSize: 18,
            }}
          />

          {calculatedHourlyRate !== null && (
            <View style={{
              marginTop: 16,
              backgroundColor: 'rgba(244, 114, 182, 0.1)',
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}>
              <Text size="sm" style={{ color: '#71717A', marginBottom: 4 }}>Это</Text>
              <Text size="xxxl" weight="bold" style={{ color: '#F472B6' }}>
                {calculatedHourlyRate.toFixed(0)} ₽/час
              </Text>

              <TouchableOpacity
                onPress={handleSaveRate!}
                style={{
                  marginTop: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 32,
                  borderRadius: 12,
                  backgroundColor: '#F472B6',
                }}
              >
                <Text size="md" weight="bold" style={{ color: '#FFFFFF' }}>
                  Применить эту ставку
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>
      </View>
    </Screen>
  );
}
