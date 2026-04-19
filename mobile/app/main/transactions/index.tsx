import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { useAuthStore } from '../../../src/stores/authStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Icon } from '../../../src/components/ui/Icon';
import { AddTransactionModal } from '../../../src/components/ui/AddTransactionModal';
import { TransactionActionModal } from '../../../src/components/ui/TransactionActionModal';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';
import { formatCurrency, formatDate } from '../../../src/utils/formatters';
import type { TransactionType, Category, Transaction } from '../../../src/types';
import { TransactionType as TransactionTypeEnum } from '../../../src/types';

type TimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';

function formatLifeHours(amountKopecks: number, hourlyRateRubles: number): string | null {
  if (hourlyRateRubles <= 0) return null;
  const rubles = amountKopecks / 100;
  const hours = rubles / hourlyRateRubles;
  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  if (hours < 24) return `${hours.toFixed(1)} ч`;
  return `${(hours / 24).toFixed(1)} дн`;
}

export default function TransactionsDashboardScreen() {
  const router = useRouter();
  const transactions = useDataStore((s) => s.transactions);
  const categories = useDataStore((s) => s.categories);
  const accounts = useDataStore((s) => s.accounts);
  const isLoading = useDataStore((s) => s.isLoadingTransactions);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [period, setPeriod] = useState<TimePeriod>('MONTH');
  const [type, setType] = useState<TransactionType>(TransactionTypeEnum.EXPENSE);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((t) => t.type === type);

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'DAY':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'WEEK':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'MONTH':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'YEAR':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'CUSTOM':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    }

    filtered = filtered.filter((t) => new Date(t.date) >= startDate);

    if (selectedCategory) {
      filtered = filtered.filter((t) => t.categoryId === selectedCategory);
    }

    return filtered;
  }, [transactions, type, period, selectedCategory]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const totalLifeHours = useMemo(() => {
    return formatLifeHours(totalAmount, getHourlyRate());
  }, [totalAmount, getHourlyRate]);

  const categoryData = useMemo(() => {
    const categoryTotals = new Map<string, number>();

    filteredTransactions.forEach((t) => {
      const current = categoryTotals.get(t.categoryId) || 0;
      categoryTotals.set(t.categoryId, current + t.amount);
    });

    const data = Array.from(categoryTotals.entries()).map(([categoryId, amount]) => ({
      category: categories.find((c) => c.id === categoryId)!,
      amount,
      percentage: totalAmount > 0 ? (amount / totalAmount) * 100 : 0,
    }));

    data.sort((a, b) => b.amount - a.amount);

    return data.slice(0, 8);
  }, [filteredTransactions, categories, totalAmount]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof filteredTransactions> = {};
    filteredTransactions.forEach((t) => {
      const date = formatDate(new Date(t.date));
      if (!groups[date]) groups[date] = [];
      groups[date].push(t);
    });
    return groups;
  }, [filteredTransactions]);

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  }, []);

  const handleAddTransaction = useCallback(() => {
    setShowAddModal(true);
  }, []);

  const handleTransactionComplete = useCallback(() => {
    setPeriod('DAY');
    setSelectedCategory(null);
  }, []);

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            paddingBottom: 12,
            backgroundColor: '#0A0A0F',
          }}
        >
          {/* Account selector */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="wallet-outline" size={22} color="#6366F1" />
            </View>
            <View>
              <Text size="xs" style={{ color: '#8E8E93', marginBottom: 2 }}>
                Счет
              </Text>
              <Text size="sm" weight="semibold" style={{ color: '#FFFFFF' }}>
                {accounts.length > 0 ? accounts[0].name : 'Все счета'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Balance */}
          <View style={{ alignItems: 'flex-end' }}>
            <Text size="xs" style={{ color: '#8E8E93', marginBottom: 2 }}>
              Баланс
            </Text>
            <Text size="md" weight="bold" style={{ color: '#FFFFFF' }}>
              {accounts.length > 0
                ? formatCurrency(accounts.reduce((sum, a) => sum + a.balance, 0))
                : '0 ₽'}
            </Text>
          </View>
        </View>

        {/* Type toggle */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingBottom: 12,
            gap: 8,
          }}
        >
          {[
            { key: 'EXPENSE' as const, label: 'Расходы', color: '#FF3B30' },
            { key: 'INCOME' as const, label: 'Доходы', color: '#34C759' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => {
                setType(tab.key as any);
                setSelectedCategory(null);
              }}
              style={{
                flex: 1,
                paddingVertical: 12,
                alignItems: 'center',
                backgroundColor:
                  type === tab.key ? tab.color + '20' : 'transparent',
                borderRadius: 12,
                borderWidth: 2,
                borderColor: type === tab.key ? tab.color : 'transparent',
              }}
            >
              <Text
                size="md"
                weight="semibold"
                style={{
                  color: type === tab.key ? tab.color : '#8E8E93',
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Period selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{
            paddingHorizontal: 16,
            marginBottom: 8,
          }}
          contentContainerStyle={{ gap: 8 }}
        >
          {[
            { key: 'DAY', label: 'День' },
            { key: 'WEEK', label: 'Неделя' },
            { key: 'MONTH', label: 'Месяц' },
            { key: 'YEAR', label: 'Год' },
            { key: 'CUSTOM', label: 'Период' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setPeriod(item.key as TimePeriod)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                backgroundColor:
                  period === item.key ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                borderRadius: 16,
                borderWidth: 1,
                borderColor:
                  period === item.key ? '#6366F1' : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Text
                size="xs"
                weight={period === item.key ? 'semibold' : 'regular'}
                style={{
                  color:
                    period === item.key ? '#FFFFFF' : '#8E8E93',
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Summary */}
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' }}>
            <Text
              size="xxxl"
              weight="bold"
              style={{ color: type === 'EXPENSE' ? '#FF3B30' : '#34C759', lineHeight: 44 }}
            >
              {formatCurrency(totalAmount)}
            </Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8, alignItems: 'center' }}>
              <Text size="sm" style={{ color: '#8E8E93' }}>
                {type === 'EXPENSE' ? 'Расходы' : 'Доходы'} за период
              </Text>
              {type === 'EXPENSE' && totalLifeHours && (
                <>
                  <Text size="sm" style={{ color: '#8E8E93' }}>·</Text>
                  <Text size="sm" style={{ color: '#FBBF24' }}>⏱ {totalLifeHours}</Text>
                </>
              )}
            </View>

            {categoryData.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                {categoryData.slice(0, 6).map((item) => {
                  const isSelected = selectedCategory === item.category.id;
                  return (
                    <Pressable
                      key={item.category.id}
                      onPress={() => handleCategoryPress(item.category.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: isSelected ? (item.category.color || '#6366F1') : 'transparent',
                      }}
                    >
                      <CategoryIcon
                        icon={item.category.icon}
                        color={item.category.color || '#6366F1'}
                        size={14}
                      />
                      <Text size="xs" style={{ color: isSelected ? '#FFFFFF' : '#8E8E93' }}>
                        {item.category.name}
                      </Text>
                      <Text size="xs" weight="semibold" style={{ color: '#FFFFFF' }}>
                        {Math.round(item.percentage)}%
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Transactions list */}
          <View style={{ paddingHorizontal: 16 }}>
            <Text
              size="xs"
              weight="semibold"
              style={{
                color: '#8E8E93',
                marginBottom: 16,
                textTransform: 'uppercase',
              }}
            >
              Операции
            </Text>

            {isLoading ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 60,
                }}
              >
                <Text size="md" style={{ color: '#8E8E93' }}>
                  Загрузка...
                </Text>
              </View>
            ) : Object.keys(groupedTransactions).length === 0 ? (
              <View
                style={{
                  alignItems: 'center',
                  paddingVertical: 80,
                }}
              >
                <Icon name="receipt-outline" size={64} color="#3A3A3C" />
                <Text size="md" style={{ color: '#8E8E93', marginTop: 16 }}>
                  Нет операций
                </Text>
              </View>
            ) : (
              Object.entries(groupedTransactions).map(([date, items]) => (
                <View key={date} style={{ marginBottom: 24 }}>
                  <Text
                    size="xs"
                    weight="medium"
                    style={{
                      color: '#8E8E93',
                      marginBottom: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    {date}
                  </Text>

                  <View style={{ gap: 10 }}>
                    {items.map((transaction) => {
                      const category = categories.find(
                        (c) => c.id === transaction.categoryId,
                      );
                      const account = accounts.find(
                        (a) => a.id === transaction.accountId,
                      );

                      return (
                        <TouchableOpacity
                          key={transaction.id}
                          onPress={() => setSelectedTransaction(transaction)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.04)',
                            borderRadius: 14,
                            padding: 14,
                            gap: 14,
                          }}
                        >
                          {/* Category icon */}
                          <CategoryIcon
                            icon={category?.icon || ''}
                            color={category?.color || (type === 'EXPENSE' ? '#FF3B30' : '#34C759')}
                            size={24}
                          />

                          {/* Details */}
                          <View style={{ flex: 1 }}>
                            <Text
                              size="md"
                              weight="medium"
                              style={{ color: '#FFFFFF' }}
                            >
                              {category?.name || 'Без категории'}
                            </Text>
                            {transaction.description && (
                              <Text size="xs" style={{ color: '#8E8E93' }}>
                                {transaction.description}
                              </Text>
                            )}
                            {transaction.type === 'EXPENSE' && (() => {
                              const hours = formatLifeHours(transaction.amount, getHourlyRate());
                              return hours ? (
                                <Text size="xs" style={{ color: '#FBBF24' }}>
                                  ⏱ {hours} работы
                                </Text>
                              ) : null;
                            })()}
                            {account && (
                              <Text size="xs" style={{ color: '#8E8E93' }}>
                                {account.name}
                              </Text>
                            )}
                          </View>

                          {/* Amount */}
                          <Text
                            size="md"
                            weight="bold"
                            style={{
                              color:
                                type === 'EXPENSE' ? '#FF3B30' : '#34C759',
                            }}
                          >
                            {type === 'EXPENSE' ? '− ' : '+ '}
                            {formatCurrency(transaction.amount)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Add button */}
        <TouchableOpacity
          onPress={handleAddTransaction}
          style={{
            position: 'absolute',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            borderRadius: 32,
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
          <Icon name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Add transaction modal */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onComplete={handleTransactionComplete}
        initialType={type}
      />

      {/* Transaction action modal */}
      <TransactionActionModal
        visible={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />
    </Screen>
  );
}
