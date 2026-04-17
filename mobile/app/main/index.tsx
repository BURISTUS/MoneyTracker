import React, { useEffect, useCallback, useState } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../src/stores/dataStore';
import { Screen } from '../../src/components/ui/Screen';
import { Text } from '../../src/components/ui/Text';
import { Icon } from '../../src/components/ui/Icon';
import { Loading } from '../../src/components/ui/Loading';
import { formatCurrency } from '../../src/utils/formatters';
import { useTheme } from '../../src/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { spacing, colors } = useTheme();
  const initializeData = useDataStore((s) => s.initializeData);
  const accounts = useDataStore((s) => s.accounts);
  const transactions = useDataStore((s) => s.transactions);
  const isLoading = useDataStore((s) => s.isLoadingTransactions);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  }, []);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyIncome = transactions
    .filter((t) => t.type === 'INCOME' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  const recentTransactions = transactions.slice(0, 4);

  const handleTransactionPress = useCallback(
    (id: string) => {
      router.push('/main/transactions');
    },
    [router],
  );

  const handleAddExpense = useCallback(() => {
    router.push('/main/transactions/create?expense');
  }, [router]);

  const handleAddIncome = useCallback(() => {
    router.push('/main/transactions/create?income');
  }, [router]);

  if (isLoading && transactions.length === 0) {
    return (
      <Screen scroll={false}>
        <View style={{ paddingTop: 60 }}>
          <Loading message="Загрузка..." />
        </View>
      </Screen>
    );
  }

  return (
    <Screen
      refreshing={refreshing}
      onRefresh={onRefresh}
    >
      <View style={{ gap: 24, paddingBottom: 20 }}>
        {/* Заголовок */}
        <View>
          <Text size="md" style={{ color: '#71717A' }}>
            Мой баланс
          </Text>
        </View>

        {/* Большой баланс - 30% экрана */}
        <View style={{ alignItems: 'center', paddingVertical: 40 }}>
          <Text
            size="xxxl"
            weight="bold"
            style={{ color: '#6366F1', lineHeight: 70 }}
          >
            {formatCurrency(totalBalance)}
          </Text>
          <Text size="sm" style={{ color: '#71717A', marginTop: 12 }}>
            Все на всех счетах
          </Text>
        </View>

        {/* Только 2 быстрых действия - Траты и Доходы */}
        <View style={{ gap: 12 }}>
          <Text size="md" weight="medium" style={{ color: '#A1A1AA' }}>
            За месяц
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={() => router.push('/main/transactions?type=expense')}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(248, 113, 113, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text size="xxxl" style={{ color: '#F87171' }}>
                  −
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text size="lg" weight="semibold" style={{ color: '#F4F4F5' }}>
                  Траты
                </Text>
                <Text size="md" style={{ color: '#71717A', marginTop: 4 }}>
                  {formatCurrency(monthlyExpenses)}
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={() => router.push('/main/transactions?type=income')}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text size="xxxl" style={{ color: '#34D399' }}>
                  +
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text size="lg" weight="semibold" style={{ color: '#F4F4F5' }}>
                  Доходы
                </Text>
                <Text size="md" style={{ color: '#71717A', marginTop: 4 }}>
                  {formatCurrency(monthlyIncome)}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Быстрые действия - виджеты для добавления (1money стиль) */}
        <View style={{ gap: 12 }}>
          <Text size="md" weight="medium" style={{ color: '#A1A1AA' }}>
            Быстрые действия
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={handleAddExpense}
              style={{
                flex: 1,
                backgroundColor: 'rgba(248, 113, 113, 0.12)',
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Text
                size="xxxl"
                weight="bold"
                style={{ color: '#F87171', lineHeight: 44 }}
              >
                −
              </Text>
              <Text size="lg" weight="semibold" style={{ color: '#F4F4F5' }}>
                Добавить расход
              </Text>
            </Pressable>

            <Pressable
              onPress={handleAddIncome}
              style={{
                flex: 1,
                backgroundColor: 'rgba(52, 211, 153, 0.12)',
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Text
                size="xxxl"
                weight="bold"
                style={{ color: '#34D399', lineHeight: 44 }}
              >
                +
              </Text>
              <Text size="lg" weight="semibold" style={{ color: '#F4F4F5' }}>
                Добавить доход
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Последние операции - только 4 шт */}
        {recentTransactions.length > 0 && (
          <View style={{ gap: 16 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text size="lg" weight="semibold">
                Последние операции
              </Text>
              <Pressable onPress={() => router.push('/main/transactions')}>
                <Text size="md" weight="medium" style={{ color: '#6366F1' }}>
                  Все
                </Text>
              </Pressable>
            </View>

            <View
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 16,
                padding: 16,
                gap: 12,
              }}
            >
              {recentTransactions.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => handleTransactionPress(t.id)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor:
                          t.type === 'INCOME'
                            ? 'rgba(52, 211, 153, 0.15)'
                            : 'rgba(248, 113, 113, 0.15)',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        size="xxxl"
                        style={{
                          color: t.type === 'INCOME' ? '#34D399' : '#F87171',
                          lineHeight: 48,
                        }}
                      >
                        {t.type === 'INCOME' ? '+' : '−'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text size="lg" weight="medium">
                        {t.description || t.category?.name || 'Без категории'}
                      </Text>
                      <Text size="md" style={{ color: '#71717A', marginTop: 2 }}>
                        {new Date(t.date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                  <Text
                    size="xl"
                    weight="bold"
                    style={{
                      color: t.type === 'INCOME' ? '#34D399' : '#F87171',
                    }}
                  >
                    {t.type === 'INCOME' ? '+' : '−'}
                    {formatCurrency(t.amount)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Если нет операций */}
        {recentTransactions.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 60,
              gap: 16,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: 'rgba(39, 39, 42, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <Text size="xxxl" style={{ color: '#71717A' }}>
                📋
              </Text>
            </View>
            <Text
              size="lg"
              style={{ color: '#F4F4F5', textAlign: 'center' }}
            >
              У вас пока нет операций
            </Text>
            <Text
              size="md"
              style={{ color: '#71717A', textAlign: 'center', marginTop: 8 }}
            >
              Добавьте первую операцию, чтобы начать
            </Text>
            <Pressable onPress={handleAddExpense}>
              <View
                style={{
                  backgroundColor: '#6366F1',
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                }}
              >
                <Text size="md" weight="semibold" style={{ color: '#FFFFFF' }}>
                  Добавить первую операцию
                </Text>
              </View>
            </Pressable>
          </View>
        )}
      </View>

      {/* FAB для быстрого добавления - Monobank стиль */}
      <Pressable
        onPress={handleAddExpense}
        style={{
          position: 'absolute',
          bottom: 100,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#6366F1',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#6366F1',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Text size="xxxl" weight="bold" style={{ color: '#FFFFFF', lineHeight: 56 }}>
          +
        </Text>
      </Pressable>
    </Screen>
  );
}
