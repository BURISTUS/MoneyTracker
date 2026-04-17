import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Card } from '../../../src/components/ui/Card';
import { Input } from '../../../src/components/ui/Input';
import { Icon } from '../../../src/components/ui/Icon';
import { Header } from '../../../src/components/layout/Header';
import { useTheme } from '../../../src/theme';

export default function LifeCostScreen() {
  const { spacing } = useTheme();
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);
  const hourlyRate = getHourlyRate();

  const [amount, setAmount] = useState('');

  const calculation = useMemo(() => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0 || hourlyRate <= 0) return null;
    const amountKopecks = Math.round(amountNum * 100);
    const hours = amountKopecks / hourlyRate;
    const days = hours / 8;
    return { hours, days };
  }, [amount, hourlyRate]);

  const investment = useMemo(() => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return null;
    const rubles = amountNum;
    const rate = 0.12;
    const years = 10;
    const futureValue = rubles * Math.pow(1 + rate, years);
    return { initial: rubles, future: Math.round(futureValue), profit: Math.round(futureValue - rubles) };
  }, [amount]);

  const examples = [
    { label: 'iPhone 15', price: '80000' },
    { label: 'MacBook Air', price: '130000' },
    { label: 'Отпуск', price: '150000' },
    { label: 'Кроссовки', price: '15000' },
  ];

  return (
    <Screen scroll header={<Header title="Life Cost" showBack />}>
      <View style={{ gap: spacing.xl }}>
        <Card variant="glass" padding="xxl">
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg }}>
            <Icon name="time" size={20} color="#F472B6" />
            <Text size="md" weight="semibold">
              Стоимость в часах жизни
            </Text>
          </View>
          <Text size="sm" style={{ color: '#71717A', marginBottom: spacing.md }}>
            Ваша ставка: {hourlyRate > 0 ? `${(hourlyRate / 100).toFixed(0)} руб/час` : 'не указана'}
          </Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            placeholder="Введите сумму (руб)"
            keyboardType="decimal-pad"
          />
        </Card>

        {calculation && (
          <Card variant="elevated" padding="xxl">
            <View style={{ gap: spacing.lg }}>
              <View>
                <Text size="sm" style={{ color: '#71717A' }}>Часов работы</Text>
                <Text preset="h1" style={{ color: '#F472B6' }}>
                  {calculation.hours.toFixed(1)}
                </Text>
              </View>
              {calculation.days >= 1 && (
                <View>
                  <Text size="sm" style={{ color: '#71717A' }}>Рабочих дней</Text>
                  <Text preset="h2" style={{ color: '#F472B6' }}>
                    {calculation.days.toFixed(1)}
                  </Text>
                </View>
              )}
              {calculation.days >= 20 && (
                <Text size="sm" style={{ color: '#FBBF24' }}>
                  Готов провести месяц в офисе ради этого?
                </Text>
              )}
            </View>
          </Card>
        )}

        {investment && (
          <Card variant="glass" padding="lg">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
              <Icon name="trending-up" size={18} color="#34D399" />
              <Text size="md" weight="semibold">
                Если инвестировать на 10 лет (12% годовых)
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: spacing.xxl }}>
              <View>
                <Text size="xs" style={{ color: '#71717A' }}>Вложите</Text>
                <Text size="lg" weight="bold">{investment.initial.toLocaleString('ru')} ₽</Text>
              </View>
              <View>
                <Text size="xs" style={{ color: '#71717A' }}>Получите</Text>
                <Text size="lg" weight="bold" style={{ color: '#34D399' }}>
                  {investment.future.toLocaleString('ru')} ₽
                </Text>
              </View>
            </View>
            <Text size="sm" style={{ color: '#34D399', marginTop: spacing.sm }}>
              Прибыль: +{investment.profit.toLocaleString('ru')} ₽
            </Text>
          </Card>
        )}

        <View style={{ gap: spacing.sm }}>
          <Text size="sm" weight="medium" style={{ color: '#A1A1AA' }}>
            Примеры
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {examples.map((ex) => (
              <Card key={ex.label} variant="outlined" padding="md" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text size="sm" weight="medium">{ex.label}</Text>
                <Text size="xs" style={{ color: '#71717A' }}>{parseInt(ex.price).toLocaleString('ru')} ₽</Text>
              </Card>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}
