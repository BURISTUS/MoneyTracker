import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  TouchableOpacity,
  PanResponder,
  Animated,
  Modal as RNModal,
  Platform,
  Text as RNText,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { AddTransactionModal } from '../../../src/components/ui/AddTransactionModal';
import { TransactionActionModal } from '../../../src/components/ui/TransactionActionModal';
import { DateRangePickerModal } from '../../../src/components/ui/DateRangePickerModal';
import type { DateRange } from '../../../src/components/ui/DateRangePickerModal';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';
import { formatCurrency, formatDate } from '../../../src/utils/formatters';
import type { TransactionType, Transaction } from '../../../src/types';
import { TransactionType as TransactionTypeEnum } from '../../../src/types';

type TimePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';

const MONTHS_NOMINATIVE = [
  'январь', 'февраль', 'март', 'апрель', 'май', 'июнь',
  'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь',
];

const MONTHS_GENITIVE = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

function formatLifeHours(amountKopecks: number, hourlyRateRubles: number): string | null {
  if (hourlyRateRubles <= 0) return null;
  const rubles = amountKopecks / 100;
  const hours = rubles / hourlyRateRubles;
  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  if (hours < 24) return `${hours.toFixed(1)} ч`;
  return `${(hours / 24).toFixed(1)} дн`;
}

function getRange(period: TimePeriod, offset: number, customRange: DateRange | null): { startDate: Date; endDate: Date } {
  const now = new Date();

  if (period === 'CUSTOM' && customRange) {
    const duration = customRange.endDate.getTime() - customRange.startDate.getTime();
    const baseStart = new Date(customRange.startDate.getTime() + duration * offset);
    const baseEnd = new Date(customRange.endDate.getTime() + duration * offset);
    return { startDate: baseStart, endDate: baseEnd };
  }

  switch (period) {
    case 'DAY': {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      return { startDate: d, endDate: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59) };
    }
    case 'WEEK': {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dayOfWeek = today.getDay() || 7;
      const thisMonday = new Date(today.getTime() - (dayOfWeek - 1) * 86400000);
      const start = new Date(thisMonday.getTime() + offset * 7 * 86400000);
      const end = new Date(start.getTime() + 6 * 86400000);
      return { startDate: start, endDate: new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59) };
    }
    case 'MONTH': {
      const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0, 23, 59, 59);
      return { startDate: start, endDate: end };
    }
    case 'YEAR': {
      const start = new Date(now.getFullYear() + offset, 0, 1);
      const end = new Date(now.getFullYear() + offset, 11, 31, 23, 59, 59);
      return { startDate: start, endDate: end };
    }
    default: {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { startDate: d, endDate: new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59) };
    }
  }
}

function getRangeLabel(period: TimePeriod, offset: number, customRange: DateRange | null): string {
  const now = new Date();

  switch (period) {
    case 'DAY': {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
      if (offset === 0) return 'Сегодня';
      if (offset === -1) return 'Вчера';
      if (offset === -2) return 'Позавчера';
      return `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`;
    }
    case 'WEEK': {
      if (offset === 0) return 'Эта неделя';
      if (offset === -1) return 'Прошлая неделя';
      const range = getRange('WEEK', offset, null);
      return `${range.startDate.getDate()} ${MONTHS_GENITIVE[range.startDate.getMonth()]} — ${range.endDate.getDate()} ${MONTHS_GENITIVE[range.endDate.getMonth()]}`;
    }
    case 'MONTH': {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      return `${MONTHS_NOMINATIVE[d.getMonth()]} ${d.getFullYear()}`;
    }
    case 'YEAR': {
      return `${now.getFullYear() + offset}`;
    }
    default: {
      if (customRange) {
        const s = customRange.startDate;
        const e = customRange.endDate;
        return `${s.getDate()} ${MONTHS_GENITIVE[s.getMonth()]} — ${e.getDate()} ${MONTHS_GENITIVE[e.getMonth()]}`;
      }
      return 'Период';
    }
  }
}

export default function TransactionsDashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const transactions = useDataStore((s) => s.transactions);
  const categories = useDataStore((s) => s.categories);
  const accounts = useDataStore((s) => s.accounts);
  const budgets = useDataStore((s) => s.budgets);
  const fetchTransactions = useDataStore((s) => s.fetchTransactions);
  const isLoading = useDataStore((s) => s.isLoadingTransactions);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [period, setPeriod] = useState<TimePeriod>('MONTH');
  const [offset, setOffset] = useState(0);
  const [type, setType] = useState<TransactionType>(TransactionTypeEnum.EXPENSE);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [currentAccountId, setCurrentAccountId] = useState<string | null>(accounts.length > 0 ? accounts[0].id : null);

  const range = useMemo(() => getRange(period, offset, customRange), [period, offset, customRange]);

  const periodSummary = useMemo(() => {
    const inRange = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= range.startDate && d <= range.endDate;
    });
    const income = inRange
      .filter((t) => t.type === 'INCOME')
      .filter((t) => !currentAccountId || t.accountId === currentAccountId)
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = inRange
      .filter((t) => t.type === 'EXPENSE')
      .filter((t) => !currentAccountId || t.accountId === currentAccountId)
      .reduce((s, t) => s + Number(t.amount), 0);
    return { income, expense, balance: income - expense };
  }, [transactions, range, currentAccountId]);

  const filteredTransactions = useMemo(() => {
    const filtered = transactions
      .filter((t) => t.type === type)
      .filter((t) => !currentAccountId || t.accountId === currentAccountId)
      .filter((t) => {
        const d = new Date(t.date);
        return d >= range.startDate && d <= range.endDate;
      });

    if (selectedCategory) {
      return filtered.filter((t) => t.categoryId === selectedCategory);
    }
    return filtered;
  }, [transactions, type, range, selectedCategory, currentAccountId]);

  const totalAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const totalLifeHours = useMemo(() => {
    return formatLifeHours(totalAmount, getHourlyRate());
  }, [totalAmount, getHourlyRate]);

  const categoryData = useMemo(() => {
    const categoryTotals = new Map<string, number>();
    filteredTransactions.forEach((t) => {
      const current = categoryTotals.get(t.categoryId) || 0;
      categoryTotals.set(t.categoryId, current + Number(t.amount));
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
    setOffset(0);
    setSelectedCategory(null);
  }, []);

  const changePeriodType = useCallback((newPeriod: TimePeriod) => {
    setPeriod(newPeriod);
    setOffset(0);
  }, []);

  const swipeRef = useRef({ startX: 0 });
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const isAnimatingOffset = useRef(false);

  const animateOffset = useCallback((delta: number) => {
    if (isAnimatingOffset.current) return;
    isAnimatingOffset.current = true;

    Animated.timing(contentOpacity, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setOffset((o) => Math.min(0, o + delta));
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        isAnimatingOffset.current = false;
      });
    });
  }, [contentOpacity]);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 30 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,
    onPanResponderRelease: (_, gs) => {
      if (Math.abs(gs.dx) < 40) return;
      if (gs.dx > 0) animateOffset(-1);
      else animateOffset(1);
    },
  }), [animateOffset]);

  const rangeLabel = getRangeLabel(period, offset, customRange);

  return (
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <View className="flex-1">
        <View className="px-4 pb-2 pt-2">
          <TouchableOpacity
            onPress={() => setShowAccountPicker(true)}
            activeOpacity={0.6}
            className="self-start flex-row items-center gap-1.5 bg-[#1C1C1E] rounded-full px-3 py-1.5"
          >
            <Text className="text-sm font-medium text-[#F5F5F5]">
              {currentAccountId
                ? accounts.find((a) => a.id === currentAccountId)?.name || 'Счёт'
                : 'Все счета'}
            </Text>
            {currentAccountId && (
              <Text className="text-sm text-[#F5F5F5]">
                {' • '}
                {formatCurrency(accounts.find((a) => a.id === currentAccountId)?.balance || 0)}
              </Text>
            )}
            <Ionicons name="chevron-down" size={14} color="#A1A1AA" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center px-4 mb-2 gap-2">
          <TouchableOpacity
            onPress={() => animateOffset(-1)}
            className="w-9 h-9 items-center justify-center rounded-full bg-background-50/40"
          >
            <Ionicons name="chevron-back" size={22} color="#818CF8" />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 6 }}
            className="flex-1"
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
                onPress={() => {
                  if (item.key === 'CUSTOM') {
                    setShowRangePicker(true);
                  }
                  changePeriodType(item.key as TimePeriod);
                }}
                className={`px-3 h-7 items-center justify-center rounded-lg border ${
                  period === item.key
                    ? 'bg-primary-500/20 border-primary-400'
                    : 'bg-background-50/30 border-outline-200'
                }`}
              >
                <Text
                  className={`text-[11px] ${period === item.key ? 'font-semibold text-primary-400' : 'text-typography-400'}`}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={() => animateOffset(1)}
            disabled={offset >= 0}
            className="w-9 h-9 items-center justify-center rounded-full bg-background-50/40"
            style={{ opacity: offset >= 0 ? 0.2 : 1 }}
          >
            <Ionicons name="chevron-forward" size={22} color="#818CF8" />
          </TouchableOpacity>
        </View>

        <View className="items-center mb-1">
            <Text className="text-sm font-medium text-typography-400">
              {rangeLabel}
            </Text>
        </View>

        <Animated.View
          className="flex-1"
          style={{ opacity: contentOpacity }}
          {...panResponder.panHandlers}
        >
          <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
            <View className="px-4 py-4">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setType('EXPENSE' as TransactionType);
                    setSelectedCategory(null);
                  }}
                  activeOpacity={0.7}
                  className="flex-1 rounded-2xl p-4 border-2"
                  style={{
                    backgroundColor: type === 'EXPENSE' ? 'rgba(255, 59, 48, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: type === 'EXPENSE' ? 'rgba(255, 59, 48, 0.4)' : 'transparent',
                  }}
                >
                  <RNText style={{ fontSize: 13, color: '#FF6B6B', fontWeight: '600' }}>РАСХОДЫ</RNText>
                  <RNText style={{ fontSize: 32, fontWeight: 'bold', color: '#FF3B30', marginTop: 4 }}>
                    {formatCurrency(periodSummary.expense)}
                  </RNText>
                  {type === 'EXPENSE' && totalLifeHours && (
                    <RNText style={{ fontSize: 16, color: '#FF9500', marginTop: 6 }}>⏱ {totalLifeHours}</RNText>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setType('INCOME' as TransactionType);
                    setSelectedCategory(null);
                  }}
                  activeOpacity={0.7}
                  className="flex-1 rounded-2xl p-4 border-2"
                  style={{
                    backgroundColor: type === 'INCOME' ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: type === 'INCOME' ? 'rgba(52, 199, 89, 0.4)' : 'transparent',
                  }}
                >
                  <RNText style={{ fontSize: 13, color: '#5ED98A', fontWeight: '600' }}>ДОХОДЫ</RNText>
                  <RNText style={{ fontSize: 32, fontWeight: 'bold', color: '#34C759', marginTop: 4 }}>
                    {formatCurrency(periodSummary.income)}
                  </RNText>
                </TouchableOpacity>
              </View>
            </View>

            {categoryData.length > 0 && (
              <View className="flex-row flex-wrap justify-center gap-2.5 mt-5">
                {categoryData.slice(0, 6).map((item) => {
                  const isSelected = selectedCategory === item.category.id;
                  return (
                      <Pressable
                        key={item.category.id}
                        onPress={() => handleCategoryPress(item.category.id)}
                        className={`flex-row items-center gap-2 px-3.5 py-2 rounded-full border ${
                          isSelected
                            ? 'bg-background-50/80'
                            : 'bg-background-50/30 border-transparent'
                        }`}
                        style={isSelected ? { borderColor: item.category.color || '#6366F1' } : undefined}
                      >
                        <CategoryIcon
                          icon={item.category.icon}
                          color={item.category.color || '#6366F1'}
                          size={16}
                        />
                      <Text className={`text-sm ${isSelected ? 'text-typography-white' : 'text-typography-400'}`}>
                        {item.category.name}
                      </Text>
                      <Text className="text-sm font-semibold text-typography-white">
                        {Math.round(item.percentage)}%
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}

            <View className="px-4">
            <Text className="text-base font-semibold text-typography-400 mb-5 uppercase">
              Операции
            </Text>

            {isLoading ? (
              <View className="items-center py-16">
                <Text className="text-base text-typography-400">Загрузка...</Text>
              </View>
            ) : Object.keys(groupedTransactions).length === 0 ? (
              <View className="items-center py-20">
                <Ionicons name="receipt-outline" size={64} color="#3A3A3C" />
                <Text className="text-base text-typography-400 mt-4">Нет операций</Text>
              </View>
            ) : (
              Object.entries(groupedTransactions).map(([date, items]) => (
                <View key={date} className="mb-6">
                  <Text className="text-sm font-medium text-typography-400 mb-3 uppercase">
                    {date}
                  </Text>

                  <View className="gap-2.5">
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
                           className="flex-row items-center bg-background-50/30 rounded-[16px] p-4 gap-4"
                        >
                           <CategoryIcon
                            icon={category?.icon || ''}
                            color={category?.color || (type === 'EXPENSE' ? '#FF3B30' : '#34C759')}
                            size={28}
                          />

                           <View className="flex-1">
                             <View className="flex-row items-center gap-2">
                               {transaction.type === 'EXPENSE' && category && (() => {
                                 const budget = budgets.find((b) => b.categoryId === category.id);
                                 if (!budget) return null;
                                 const percent = budget.percentUsed || budget.progress || 0;
                                 const threshold = budget.alertThreshold || 80;
                                 const dotColor = percent > 100 ? '#F87171' : percent >= threshold ? '#FBBF24' : '#34D399';
                                 return (
                                   <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dotColor }} />
                                 );
                               })()}
                               <Text className="text-lg font-medium text-typography-white">
                                 {category?.name || 'Без категории'}
                               </Text>
                             </View>
                            {transaction.description && (
                              <Text className="text-sm text-typography-400">
                                {transaction.description}
                              </Text>
                            )}
                            {transaction.type === 'EXPENSE' && (() => {
                              const hours = formatLifeHours(transaction.amount, getHourlyRate());
                              return hours ? (
                                <Text className="text-sm text-warning-400">
                                  ⏱ {hours} работы
                                </Text>
                              ) : null;
                            })()}
                            {account && (
                              <Text className="text-sm text-typography-400">
                                {account.name}
                              </Text>
                            )}
                          </View>

                      <Text
                        className="text-lg font-bold"
                        style={{ color: type === 'EXPENSE' ? '#FF3B30' : '#34C759' }}
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
        </Animated.View>

        <TouchableOpacity
          onPress={handleAddTransaction}
          className="absolute right-5 w-14 h-14 rounded-full bg-primary-500 items-center justify-center"
          style={{ bottom: 90, shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 }}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onComplete={handleTransactionComplete}
        initialType={type}
      />

      <TransactionActionModal
        visible={!!selectedTransaction}
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
      />

      <DateRangePickerModal
        visible={showRangePicker}
        currentRange={customRange}
        onSelect={(r) => {
          setCustomRange(r);
          changePeriodType('CUSTOM');
          setShowRangePicker(false);
        }}
        onClose={() => setShowRangePicker(false)}
      />

      <RNModal visible={showAccountPicker} animationType="slide" onRequestClose={() => setShowAccountPicker(false)} transparent>
        <View className="flex-1 bg-[rgba(0,0,0,0.5)] justify-end">
          <Pressable className="flex-1" onPress={() => setShowAccountPicker(false)} />
          <View
            className="bg-[#1C1C1E] rounded-t-3xl"
            style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16 }}
          >
            <View className="w-9 h-1 bg-[#3A3A3C] rounded-full self-center mt-2 mb-4" />

            <View className="px-5">
              <View className="flex-row items-center justify-between mb-4">
                <Text bold className="text-lg text-white">Выбрать счёт</Text>
                <Pressable onPress={() => setShowAccountPicker(false)} hitSlop={12}>
                  <Ionicons name="close" size={22} color="#71717A" />
                </Pressable>
              </View>

              <TouchableOpacity
                key="__all__"
                onPress={() => {
                  setCurrentAccountId(null);
                  setShowAccountPicker(false);
                }}
                className={`flex-row items-center justify-between py-3.5 px-4 rounded-xl border mb-2 ${
                  !currentAccountId ? 'bg-primary-500/10 border-primary-400' : 'bg-background-50/30 border-transparent'
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-full bg-primary-500/20 items-center justify-center">
                    <Ionicons name="layers" size={20} color="#818CF8" />
                  </View>
                  <View>
                    <Text bold className="text-base text-white">Все счета</Text>
                    <Text className="text-sm text-typography-400">{formatCurrency(accounts.reduce((sum, a) => sum + Number(a.balance), 0))}</Text>
                  </View>
                </View>
                {!currentAccountId && <Ionicons name="checkmark" size={20} color="#818CF8" />}
              </TouchableOpacity>

              {accounts.map((account) => {
                const isSelected = account.id === currentAccountId;
                return (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => {
                      setCurrentAccountId(account.id);
                      setShowAccountPicker(false);
                    }}
                    className={`flex-row items-center justify-between py-3.5 px-4 rounded-xl border mb-2 ${
                      isSelected ? 'bg-primary-500/10 border-primary-400' : 'bg-background-50/30 border-transparent'
                    }`}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-11 h-11 rounded-full bg-primary-500/20 items-center justify-center">
                        <Ionicons name="card" size={20} color="#818CF8" />
                      </View>
                      <View>
                        <Text bold className="text-base text-white">{account.name}</Text>
                        <Text className="text-sm text-typography-400">{formatCurrency(account.balance)}</Text>
                      </View>
                    </View>
                    {isSelected && <Ionicons name="checkmark" size={20} color="#818CF8" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </RNModal>
    </View>
  );
}
