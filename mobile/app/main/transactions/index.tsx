import { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, TextInput, Modal, Pressable, ActivityIndicator, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn, SlideInRight, Layout } from 'react-native-reanimated';
import { Calendar } from 'react-native-calendars';
import { useAuthStore } from '../../../src/stores/authStore';
import { useDataStore } from '../../../src/stores/dataStore';
import { useTheme } from '../../../src/utils/ThemeContext';
import { format, parseISO, differenceInDays, addDays, eachDayOfInterval, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { TransactionType, Category as ApiCategory } from '../../../src/types';

// Transform API categories to UI format
function transformCategories(categories: ApiCategory[]) {
  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: (cat.icon as string) || 'help',
    color: cat.color || '#8E8E93',
    bgColor: (cat.color || '#8E8E93') + '20',
    preset: cat.isSystem,
    amount: 0,
  }));
}

// Transform API transactions to UI format
function transformTransactions(txs: any[]) {
  return txs.map(tx => ({
    id: tx.id,
    title: tx.description || tx.category?.name || 'Транзакция',
    categoryId: tx.categoryId,
    amount: tx.type === 'INCOME' ? Number(tx.amount) : -Number(tx.amount),
    date: new Date(tx.date),
    icon: (tx.category?.icon as string) || 'help',
    note: tx.description || '',
    type: tx.type === 'INCOME' ? 'income' as const : 'expense' as const,
  }));
}

type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  preset: boolean;
  amount?: number;
};

type Transaction = {
  id: string;
  title: string;
  categoryId: string;
  amount: number;
  date: Date;
  icon: string;
  note?: string;
  type: 'income' | 'expense';
};

type DateFilter = 'today' | 'week' | 'month' | 'year' | 'all' | 'custom';

// Empty arrays - data should come from API
const DEFAULT_CATEGORIES: Category[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateHeader(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Сегодня';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  }
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

interface CalendarDateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelectRange: (start: Date, end: Date) => void;
  maxDate?: Date;
  onClose: () => void;
}

function CalendarDateRangePicker({ 
  startDate, 
  endDate, 
  onSelectRange, 
  maxDate,
  onClose 
}: CalendarDateRangePickerProps) {
  const { colors, isDark } = useTheme();
  const [tempStartDate, setTempStartDate] = useState<Date | null>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(endDate);

  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    if (tempStartDate) {
      const startStr = format(tempStartDate, 'yyyy-MM-dd');
      marks[startStr] = {
        startingDay: true,
        endingDay: tempEndDate ? true : false,
        color: '#1E3A5F',
        textColor: '#FFFFFF',
      };
    }

    if (tempEndDate && tempStartDate && tempEndDate > tempStartDate) {
      const days = eachDayOfInterval({ start: tempStartDate, end: tempEndDate });
      days.forEach((day, index) => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const isFirst = index === 0;
        const isLast = index === days.length - 1;
        marks[dateStr] = {
          color: '#1E3A5F' + '40',
          textColor: isFirst || isLast ? '#FFFFFF' : '#1C1C1E',
          startingDay: isFirst,
          endingDay: isLast,
        };
      });
    } else if (tempEndDate && !tempStartDate) {
      const endStr = format(tempEndDate, 'yyyy-MM-dd');
      marks[endStr] = {
        endingDay: true,
        color: '#1E3A5F',
        textColor: '#FFFFFF',
      };
    }

    return marks;
  }, [tempStartDate, tempEndDate]);

  const handleDayPress = (day: any) => {
    const selected = parseISO(day.dateString);

    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      setTempStartDate(selected);
      setTempEndDate(null);
    } else if (tempStartDate && !tempEndDate) {
      if (selected < tempStartDate) {
        setTempEndDate(tempStartDate);
        setTempStartDate(selected);
      } else {
        setTempEndDate(selected);
      }
    }
  };

  const handleApply = () => {
    if (tempStartDate && tempEndDate) {
      const start = tempStartDate < tempEndDate ? tempStartDate : tempEndDate;
      const end = tempEndDate > tempStartDate ? tempEndDate : tempStartDate;
      onSelectRange(start, end);
    } else if (tempStartDate) {
      onSelectRange(tempStartDate, tempStartDate);
    }
    onClose();
  };

  const selectionText = useMemo(() => {
    if (tempStartDate && tempEndDate) {
      const start = tempStartDate < tempEndDate ? tempStartDate : tempEndDate;
      const end = tempEndDate > tempStartDate ? tempEndDate : tempStartDate;
      return `${format(start, 'd MMM yyyy', { locale: ru })} — ${format(end, 'd MMM yyyy', { locale: ru })}`;
    } else if (tempStartDate) {
      return `С ${format(tempStartDate, 'd MMM yyyy', { locale: ru })}...`;
    }
    return 'Выберите даты';
  }, [tempStartDate, tempEndDate]);

  const instructionText = !tempStartDate 
    ? 'Нажмите на первую дату'
    : !tempEndDate 
    ? 'Нажмите на последнюю дату'
    : 'Нажмите "Применить" или выберите заново';

  return (
    <View style={styles.calendarModalContainer}>
      <Pressable style={styles.calendarModalOverlay} onPress={onClose}>
        <Pressable style={[styles.calendarModalContent, { backgroundColor: colors.surface }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.calendarHeader}>
            <Text style={[styles.calendarTitle, { color: colors.text }]}>Выберите период</Text>
            <TouchableOpacity onPress={onClose} style={styles.calendarCloseButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.calendarInstruction, { color: colors.textSecondary }]}>
            {instructionText}
          </Text>

          <Calendar
            current={tempStartDate ? format(tempStartDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
            minDate={format(new Date(2020, 0, 1), 'yyyy-MM-dd')}
            maxDate={maxDate ? format(maxDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType="period"
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: colors.textSecondary,
              selectedDayBackgroundColor: '#1E3A5F',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#1E3A5F',
              dayTextColor: colors.text,
              textDisabledColor: colors.textSecondary + '60',
              arrowColor: '#1E3A5F',
              monthTextColor: colors.text,
              indicatorColor: '#1E3A5F',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />

          <View style={[styles.calendarSelectedInfo, { backgroundColor: colors.backgroundTertiary }]}>
            <Ionicons name="calendar-sharp" size={20} color={colors.primary} />
            <Text style={[styles.calendarSelectedText, { color: colors.text }]}>{selectionText}</Text>
          </View>

          <View style={styles.calendarButtons}>
            <TouchableOpacity 
              style={[styles.calendarButton, { backgroundColor: colors.backgroundTertiary }]} 
              onPress={onClose}
            >
              <Text style={[styles.calendarButtonText, { color: colors.textSecondary }]}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.calendarButton, { backgroundColor: tempStartDate && tempEndDate ? colors.primary : colors.textSecondary + '60' }]} 
              onPress={handleApply}
              disabled={!tempStartDate || !tempEndDate}
            >
              <Text style={[styles.calendarButtonText, { color: tempStartDate && tempEndDate ? '#FFFFFF' : colors.textSecondary }]}>Применить</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </View>
  );
}

function SpendingChart({ data, type }: { data: Category[]; type: 'income' | 'expense' | 'all' }) {
  const filteredData = type === 'all' 
    ? data 
    : type === 'income'
    ? data.filter(c => c.id === '11')
    : data.filter(c => c.id !== '11');
    
  const total = filteredData.reduce((sum, item) => sum + Math.abs(item.amount || 0), 0);
  const maxAmount = Math.max(...filteredData.map(item => Math.abs(item.amount || 0)), 1);

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.chartContainer}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>
          {type === 'income' ? 'Доходы' : type === 'expense' ? 'Расходы' : 'Все операции'}
        </Text>
        <Text style={styles.chartTotal}>{formatCurrency(total)}</Text>
      </View>
      
      <View style={styles.chartBars}>
        {filteredData.filter(c => (c.amount || 0) > 0).map((item, index) => {
          const amount = Math.abs(item.amount || 0);
          const percent = (amount / maxAmount) * 100;
          
          return (
            <Animated.View 
              key={item.id} 
              entering={FadeInDown.delay(index * 100).duration(300)}
              style={styles.chartBarRow}
            >
              <View style={styles.chartBarLabel}>
                <View style={[styles.chartBarIcon, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon as any} size={14} color={item.color} />
                </View>
                <Text style={styles.chartBarName}>{item.name}</Text>
              </View>
              <View style={styles.chartBarContainer}>
                <Animated.View 
                  style={[
                    styles.chartBar, 
                    { width: `${percent}%`, backgroundColor: item.color }
                  ]}
                />
                <Text style={styles.chartBarValue}>{formatCurrency(amount)}</Text>
              </View>
            </Animated.View>
          );
        })}
      </View>
    </Animated.View>
  );
}

function FilterChip({ label, icon, active, color, onPress }: { label: string; icon: string; active: boolean; color: string; onPress: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <TouchableOpacity 
        style={[
          styles.filterChip,
          active && { backgroundColor: color + '15', borderColor: color }
        ]}
        onPress={onPress}
      >
        <Ionicons name={icon as any} size={14} color={active ? color : '#8E8E93'} />
        <Text style={[
          styles.filterChipText,
          active && { color }
        ]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TransactionCard({ transaction, category, index }: { transaction: Transaction; category?: Category; index: number }) {
  return (
    <Animated.View 
      entering={SlideInRight.duration(300).delay(index * 50)}
      layout={Layout.duration(200)}
      style={styles.transactionCard}
    >
      <View style={styles.transactionLeft}>
        <Animated.View 
          style={[styles.transactionIcon, { backgroundColor: category?.bgColor || '#F8F9FA' }]}
          entering={FadeIn.duration(200).delay(index * 50 + 100)}
        >
          <Ionicons name={transaction.icon as any} size={20} color={category?.color || '#8E8E93'} />
        </Animated.View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          {transaction.note && (
            <Text style={styles.transactionNote} numberOfLines={1}>{transaction.note}</Text>
          )}
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionTime}>{formatTime(transaction.date)}</Text>
            <Text style={styles.transactionCategory}>{category?.name || 'Без категории'}</Text>
          </View>
        </View>
      </View>
      <Animated.Text 
        style={[
          styles.transactionAmount,
          { color: transaction.type === 'income' ? '#34C759' : '#1C1C1E' }
        ]}
        entering={FadeIn.duration(200).delay(index * 50 + 150)}
      >
        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
      </Animated.Text>
    </Animated.View>
  );
}

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { user, gamification } = useAuthStore();
  const { transactions: apiTransactions, categories: apiCategories, fetchTransactions, fetchCategories, isLoadingTransactions } = useDataStore();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>('month');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'income' | 'expense' | 'all'>('all');
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    amount: '',
    categoryId: '',
    type: 'expense' as 'income' | 'expense',
    note: '',
  });

  // Fetch data on mount
  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [fetchTransactions, fetchCategories]);

  // Transform API data to UI format
  const categories = useMemo(() => {
    if (apiCategories.length > 0) {
      return transformCategories(apiCategories);
    }
    return DEFAULT_CATEGORIES;
  }, [apiCategories]);

  const transactions = useMemo(() => {
    if (apiTransactions.length > 0) {
      return transformTransactions(apiTransactions);
    }
    return INITIAL_TRANSACTIONS;
  }, [apiTransactions]);

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    
    const now = new Date();
    switch (activeDateFilter) {
      case 'today':
        result = result.filter(t => t.date.toDateString() === now.toDateString());
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter(t => t.date >= weekAgo);
        break;
      case 'month':
        result = result.filter(t => 
          t.date.getMonth() === now.getMonth() && 
          t.date.getFullYear() === now.getFullYear()
        );
        break;
      case 'year':
        result = result.filter(t => t.date.getFullYear() === now.getFullYear());
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const start = customStartDate < customEndDate ? customStartDate : customEndDate;
          const end = customEndDate > customStartDate ? customEndDate : customStartDate;
          result = result.filter(t => t.date >= start && t.date <= end);
        }
        break;
      case 'all':
      default:
        break;
    }
    
    if (activeTypeFilter !== 'all') {
      result = result.filter(t => t.type === activeTypeFilter);
    }
    
    if (activeCategoryFilters.length > 0) {
      result = result.filter(t => activeCategoryFilters.includes(t.categoryId));
    }
    
    if (searchQuery) {
      result = result.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.note?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    result.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b.date.getTime() - a.date.getTime();
      } else {
        return a.date.getTime() - b.date.getTime();
      }
    });
    
    return result;
  }, [transactions, activeDateFilter, activeTypeFilter, activeCategoryFilters, searchQuery, sortOrder, customStartDate, customEndDate]);

  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    filteredTransactions.forEach(transaction => {
      const dateKey = transaction.date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });
    
    return groups;
  }, [filteredTransactions]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIncome - totalExpense;

  const toggleCategoryFilter = (categoryId: string) => {
    setActiveCategoryFilters(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const resetFilters = () => {
    setActiveDateFilter('all');
    setActiveTypeFilter('all');
    setActiveCategoryFilters([]);
    setSearchQuery('');
    setCustomStartDate(null);
    setCustomEndDate(null);
  };

  const hasActiveFilters = activeDateFilter !== 'all' || activeTypeFilter !== 'all' || activeCategoryFilters.length > 0 || searchQuery.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoadingTransactions && transactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Загрузка транзакций...</Text>
        </View>
      ) : (
        <>
          <Animated.View entering={FadeIn.duration(500)}>
            <LinearGradient colors={['#1E3A5F', '#2DD4BF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.greeting}>Транзакции</Text>
                  <Animated.Text 
                    style={styles.balance}
                    entering={FadeIn.duration(500).delay(200)}
                  >
                    {formatCurrency(balance)}
                  </Animated.Text>
                </View>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Animated.View entering={FadeIn.duration(200)}>
                    <Ionicons name="add" size={24} color="#667eea" />
                  </Animated.View>
                </TouchableOpacity>
              </View>

              {gamification && (
                <Animated.View 
                  style={styles.gamificationBadge}
                  entering={FadeIn.duration(300).delay(300)}
                >
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <Text style={styles.gamificationText}>Уровень {gamification.level} • {gamification.xp} XP</Text>
                </Animated.View>
              )}

              <Animated.View 
                style={styles.statsRow}
                entering={FadeIn.duration(400).delay(400)}
              >
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(52, 199, 89, 0.15)' }]}>
                    <Ionicons name="arrow-down" size={16} color="#34C759" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Доход</Text>
                    <Text style={[styles.statValue, { color: '#34C759' }]}>+{formatCurrency(totalIncome)}</Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                    <Ionicons name="arrow-up" size={16} color="#FF3B30" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Расход</Text>
                    <Text style={[styles.statValue, { color: '#FF3B30' }]}>-{formatCurrency(totalExpense)}</Text>
                  </View>
                </View>
              </Animated.View>
            </LinearGradient>
          </Animated.View>

          <Animated.ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            entering={FadeIn.duration(500).delay(200)}
          >
            <Animated.View entering={FadeIn.duration(300)} style={styles.searchContainer}>
              <View style={styles.searchInput}>
                <Ionicons name="search" size={18} color="#8E8E93" />
                <TextInput 
                  style={styles.searchText}
                  placeholder="Поиск..."
                  placeholderTextColor="#8E8E93"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color="#8E8E93" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            <Animated.ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.filterSection}
              entering={FadeIn.duration(300).delay(100)}
            >
              <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Период:</Text>
              {[
                { key: 'today', label: 'День', icon: 'today' },
                { key: 'week', label: 'Неделя', icon: 'calendar' },
                { key: 'month', label: 'Месяц', icon: 'calendar-outline' },
                { key: 'year', label: 'Год', icon: 'year' },
                { key: 'all', label: 'Все', icon: 'infinite' },
                { key: 'custom', label: '📅', icon: 'calendar-sharp' },
              ].map((filter) => (
                <FilterChip
                  key={filter.key}
                  label={filter.label}
                  icon={filter.icon}
                  active={activeDateFilter === filter.key}
                  color="#1E3A5F"
                  onPress={() => {
                    if (filter.key === 'custom') {
                      setShowDateRangePicker(true);
                    } else {
                      setActiveDateFilter(filter.key as DateFilter);
                    }
                  }}
                />
              ))}
            </Animated.ScrollView>

            {activeDateFilter === 'custom' && customStartDate && customEndDate && (
              <Animated.View entering={FadeIn.duration(200)} style={[styles.customDateRange, { backgroundColor: colors.surface }]}>
                <Ionicons name="calendar-sharp" size={16} color={colors.primary} />
                <Text style={[styles.customDateRangeText, { color: colors.text }]}>
                  {customStartDate.toLocaleDateString('ru-RU')} - {customEndDate.toLocaleDateString('ru-RU')}
                </Text>
                <TouchableOpacity onPress={() => {
                  setActiveDateFilter('month');
                  setCustomStartDate(null);
                  setCustomEndDate(null);
                }}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </Animated.View>
            )}

            <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
              <Text style={styles.filterLabel}>Тип:</Text>
              <FilterChip label="Все" icon="apps" active={activeTypeFilter === 'all'} color="#667eea" onPress={() => setActiveTypeFilter('all')} />
              <FilterChip label="Доходы" icon="arrow-down-circle" active={activeTypeFilter === 'income'} color="#34C759" onPress={() => setActiveTypeFilter('income')} />
              <FilterChip label="Расходы" icon="arrow-up-circle" active={activeTypeFilter === 'expense'} color="#FF3B30" onPress={() => setActiveTypeFilter('expense')} />
            </Animated.ScrollView>

            <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterSection}>
              <Text style={styles.filterLabel}>Категории:</Text>
              {categories.filter(c => c.preset).map((category) => (
                <FilterChip
                  key={category.id}
                  label={category.name}
                  icon={category.icon}
                  active={activeCategoryFilters.includes(category.id)}
                  color={category.color}
                  onPress={() => toggleCategoryFilter(category.id)}
                />
              ))}
            </Animated.ScrollView>

            {hasActiveFilters && (
              <Animated.View entering={FadeIn.duration(200)}>
                <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                  <Ionicons name="refresh" size={14} color="#667eea" />
                  <Text style={styles.resetButtonText}>Сбросить фильтры</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <SpendingChart data={categories} type={activeTypeFilter} />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Операции {activeDateFilter === 'month' && `• ${formatMonthYear(new Date())}`}
                </Text>
                <TouchableOpacity style={styles.sortButton} onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                  <Ionicons name="swap-vertical" size={16} color="#667eea" />
                  <Text style={styles.sortButtonText}>{sortOrder === 'desc' ? 'Новые' : 'Старые'}</Text>
                </TouchableOpacity>
              </View>

              {Object.entries(groupedTransactions).map(([dateKey, txs]) => (
                <Animated.View 
                  key={dateKey} 
                  style={styles.transactionGroup}
                  entering={FadeInDown.duration(300)}
                >
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupTitle}>{formatDateHeader(txs[0].date)}</Text>
                    <View style={styles.groupSummary}>
                      {txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0) > 0 && (
                        <Text style={styles.groupIncome}>+{formatCurrency(txs.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0))}</Text>
                      )}
                      {txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0) > 0 && (
                        <Text style={styles.groupExpense}>-{formatCurrency(txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0))}</Text>
                      )}
                    </View>
                  </View>
                  
                  <View style={styles.groupTransactions}>
                    {txs.map((transaction, index) => (
                      <TransactionCard key={transaction.id} transaction={transaction} category={categories.find(c => c.id === transaction.categoryId)} index={index} />
                    ))}
                  </View>
                </Animated.View>
              ))}

              {filteredTransactions.length === 0 && (
                <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>
                  <Ionicons name="file-tray-outline" size={48} color="#B8B8B8" />
                  <Text style={styles.emptyStateText}>Транзакции не найдены</Text>
                  <Text style={styles.emptyStateSubtext}>Попробуйте изменить фильтры</Text>
                </Animated.View>
              )}
            </View>

            <View style={{ height: 100 }} />
          </Animated.ScrollView>

          <Modal visible={showAddModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <Animated.View 
                style={styles.modalContent}
                entering={SlideInRight.duration(300)}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Новая транзакция</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <Ionicons name="close" size={24} color="#1C1C1E" />
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                  <Text style={styles.inputLabel}>Сумма</Text>
                  <TextInput style={styles.input} placeholder="0 ₽" keyboardType="numeric" placeholderTextColor="#8E8E93" value={newTransaction.amount} onChangeText={(text) => setNewTransaction(prev => ({ ...prev, amount: text }))} />

                  <Text style={styles.inputLabel}>Дата</Text>
                  <TouchableOpacity style={styles.dateButton}>
                    <Ionicons name="calendar" size={20} color="#667eea" />
                    <Text style={styles.dateButtonText}>{selectedDate.toLocaleDateString('ru-RU')}</Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>Тип</Text>
                  <View style={styles.typeToggle}>
                    <TouchableOpacity style={[styles.typeButton, newTransaction.type === 'expense' && { backgroundColor: '#FF3B30' }]} onPress={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}>
                      <Ionicons name="arrow-up" size={18} color={newTransaction.type === 'expense' ? '#FFF' : '#FF3B30'} />
                      <Text style={[styles.typeButtonText, newTransaction.type === 'expense' && { color: '#FFF' }]}>Расход</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.typeButton, newTransaction.type === 'income' && { backgroundColor: '#34C759' }]} onPress={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}>
                      <Ionicons name="arrow-down" size={18} color={newTransaction.type === 'income' ? '#FFF' : '#34C759'} />
                      <Text style={[styles.typeButtonText, newTransaction.type === 'income' && { color: '#FFF' }]}>Доход</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.inputLabel}>Категория</Text>
                  <View style={styles.categoryGrid}>
                    {categories.filter(c => c.preset).map((cat) => (
                      <TouchableOpacity key={cat.id} style={[styles.categoryChip, newTransaction.categoryId === cat.id && { borderColor: cat.color, backgroundColor: cat.bgColor }]} onPress={() => setNewTransaction(prev => ({ ...prev, categoryId: cat.id }))}>
                        <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                        <Text style={[styles.categoryChipName, newTransaction.categoryId === cat.id && { color: cat.color }]}>{cat.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>Описание</Text>
                  <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} placeholder="Добавьте заметку..." placeholderTextColor="#8E8E93" value={newTransaction.note} onChangeText={(text) => setNewTransaction(prev => ({ ...prev, note: text }))} multiline />

                  <TouchableOpacity style={styles.saveButton} onPress={() => setShowAddModal(false)}>
                    <Text style={styles.saveButtonText}>Сохранить (+50 XP)</Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </View>
          </Modal>

          <Modal visible={showAddCategoryModal} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <Animated.View style={styles.modalContent} entering={SlideInRight.duration(300)}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Новая категория</Text>
                  <TouchableOpacity onPress={() => setShowAddCategoryModal(false)}>
                    <Ionicons name="close" size={24} color="#1C1C1E" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalBody}>
                  <Text style={styles.inputLabel}>Название</Text>
                  <TextInput style={styles.input} placeholder="Название категории" placeholderTextColor="#8E8E93" />
                  <Text style={styles.inputLabel}>Иконка</Text>
                  <View style={styles.iconGrid}>
                    {['wallet', 'card', 'gift', 'heart', 'fitness', 'book', 'briefcase', 'sparkles', 'leaf', 'paw'].map((iconName) => (
                      <TouchableOpacity key={iconName} style={styles.iconChip}>
                        <Ionicons name={iconName as any} size={24} color="#1E3A5F" />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.inputLabel}>Цвет</Text>
                  <View style={styles.colorRow}>
                    {['#1E3A5F', '#EF4444', '#22C55E', '#F59E0B', '#3B82F6', '#EC4899'].map((color) => (
                      <TouchableOpacity key={color} style={[styles.colorChip, { backgroundColor: color }]} />
                    ))}
                  </View>
                  <TouchableOpacity style={styles.createButton} onPress={() => setShowAddCategoryModal(false)}>
                    <Text style={styles.createButtonText}>Создать категорию</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Modal>

          <Modal visible={showDateRangePicker} transparent animationType="fade">
            <CalendarDateRangePicker
              startDate={customStartDate}
              endDate={customEndDate}
              onSelectRange={(start, end) => {
                setCustomStartDate(start);
                setCustomEndDate(end);
                setActiveDateFilter('custom');
              }}
              maxDate={new Date()}
              onClose={() => {
                setShowDateRangePicker(false);
                if (!customStartDate || !customEndDate) {
                  setActiveDateFilter('month');
                }
              }}
            />
          </Modal>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  header: { paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16 },
  greeting: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)' },
  balance: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  addButton: { backgroundColor: '#FFFFFF', borderRadius: 25, padding: 14, shadowColor: '#667eea', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  gamificationBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, backgroundColor: 'rgba(255, 215, 0, 0.2)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, alignSelf: 'center' },
  gamificationText: { fontSize: 13, color: '#FFD700', fontWeight: '600', marginLeft: 6 },
  statsRow: { flexDirection: 'row', marginTop: 20, marginHorizontal: 20, backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: 20, padding: 16 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  statIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statDivider: { width: 1, backgroundColor: 'rgba(255, 255, 255, 0.2)', marginHorizontal: 16 },
  statLabel: { fontSize: 12, color: 'rgba(255, 255, 255, 0.7)' },
  statValue: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  scrollView: { flex: 1, backgroundColor: '#F5F5F5' },
  scrollContent: { padding: 20, paddingTop: 24 },
  searchContainer: { marginBottom: 12 },
  searchInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchText: { flex: 1, fontSize: 15, color: '#18181B', marginLeft: 10 },
  filterSection: { marginBottom: 8 },
  filterLabel: { fontSize: 13, color: '#71717A', marginRight: 8, alignSelf: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderWidth: 2, borderColor: 'transparent', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  filterChipText: { fontSize: 13, color: '#71717A', marginLeft: 6, fontWeight: '500' },
  resetButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, marginBottom: 12 },
  resetButtonText: { fontSize: 13, color: '#1E3A5F', marginLeft: 6 },
  chartContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, marginBottom: 24, shadowColor: '#1E3A5F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#18181B' },
  chartTotal: { fontSize: 14, fontWeight: '600', color: '#1E3A5F' },
  chartBars: { gap: 12 },
  chartBarRow: { flexDirection: 'row', alignItems: 'center' },
  chartBarLabel: { width: 100, flexDirection: 'row', alignItems: 'center' },
  chartBarIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  chartBarName: { fontSize: 13, color: '#18181B', marginLeft: 8 },
  chartBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  chartBar: { height: 24, borderRadius: 12, maxWidth: '80%' },
  chartBarValue: { fontSize: 13, fontWeight: '600', color: '#18181B', marginLeft: 8 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#18181B' },
  sortButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  sortButtonText: { fontSize: 13, color: '#1E3A5F', marginLeft: 6, fontWeight: '500' },
  transactionGroup: { marginBottom: 24 },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingHorizontal: 4 },
  groupTitle: { fontSize: 14, fontWeight: '600', color: '#71717A', textTransform: 'uppercase', letterSpacing: 0.5 },
  groupSummary: { flexDirection: 'row', gap: 12 },
  groupIncome: { fontSize: 13, fontWeight: '600', color: '#22C55E' },
  groupExpense: { fontSize: 13, fontWeight: '600', color: '#EF4444' },
  groupTransactions: { backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#FAFAFA' },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  transactionIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  transactionInfo: { flex: 1, marginLeft: 12 },
  transactionTitle: { fontSize: 15, fontWeight: '600', color: '#18181B' },
  transactionNote: { fontSize: 13, color: '#71717A', marginTop: 2 },
  transactionMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 8 },
  transactionTime: { fontSize: 12, color: '#A1A1AA' },
  transactionCategory: { fontSize: 12, color: '#A1A1AA' },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 40, backgroundColor: '#FFFFFF', borderRadius: 20 },
  emptyStateText: { fontSize: 16, fontWeight: '600', color: '#18181B', marginTop: 16 },
  emptyStateSubtext: { fontSize: 14, color: '#71717A', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F4F4F5' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#18181B' },
  modalBody: { padding: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#18181B', marginBottom: 8 },
  input: { backgroundColor: '#FAFAFA', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 16 },
  dateButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16 },
  dateButtonText: { fontSize: 16, color: '#18181B', marginLeft: 10 },
  typeToggle: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA', borderRadius: 16, paddingVertical: 14, gap: 8 },
  typeButtonText: { fontSize: 14, fontWeight: '600', color: '#71717A' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 2, borderColor: 'transparent' },
  categoryChipName: { fontSize: 13, color: '#18181B', marginLeft: 8, fontWeight: '500' },
  saveButton: { backgroundColor: '#1E3A5F', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 8, shadowColor: '#1E3A5F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  iconChip: { width: 48, height: 48, backgroundColor: '#FAFAFA', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  colorChip: { width: 40, height: 40, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  createButton: { backgroundColor: '#1E3A5F', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#1E3A5F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  createButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  
  customDateRange: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 12, gap: 8 },
  customDateRangeText: { fontSize: 14, fontWeight: '500', flex: 1 },
  
  calendarModalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarModalOverlay: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  calendarModalContent: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, width: '90%', maxWidth: 380 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calendarTitle: { fontSize: 20, fontWeight: '700' },
  calendarCloseButton: { padding: 4 },
  calendarInstruction: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  calendar: { marginBottom: 16 },
  calendarSelectedInfo: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 10, marginBottom: 16 },
  calendarSelectedText: { fontSize: 15, fontWeight: '600', flex: 1 },
  calendarButtons: { flexDirection: 'row', gap: 12 },
  calendarButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  calendarButtonText: { fontSize: 14, fontWeight: '600' },
});
