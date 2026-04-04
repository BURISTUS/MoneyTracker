/**
 * Money Tracker — Modern Create Transaction Screen (2024-2026 Design)
 * 
 * Features:
 * - Life Cost prominently displayed (always visible)
 * - Large amount input with currency
 * - Modern category picker
 * - Spring animations
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { TransactionType, CategoryType } from '../../../src/types';
import { useTheme } from '../../../src/utils/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight } from '../../../src/utils/theme';
import { Button, LifeCostBadge } from '../../../src/components/ui';

const TRANSACTION_TYPES = [
  { 
    id: TransactionType.EXPENSE, 
    label: 'Расход', 
    icon: 'arrow-up-circle' as const, 
    color: '#F87171',
    bgColor: 'rgba(248,113,113,0.15)',
    sign: '-' as const,
  },
  { 
    id: TransactionType.INCOME, 
    label: 'Доход', 
    icon: 'arrow-down-circle' as const, 
    color: '#34D399',
    bgColor: 'rgba(52,211,153,0.15)',
    sign: '+' as const,
  },
  { 
    id: TransactionType.TRANSFER, 
    label: 'Перевод', 
    icon: 'swap-horizontal' as const, 
    color: '#38BDF8',
    bgColor: 'rgba(56,189,248,0.15)',
    sign: '' as const,
  },
];

export default function CreateTransactionScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const { 
    categories, 
    accounts, 
    addTransaction, 
    calculateLifeCost, 
    fetchAccounts, 
    fetchCategories,
    gamification,
  } = useDataStore();

  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const amountScale = useSharedValue(1);
  const lifeCostOpacity = useSharedValue(0);

  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, [fetchAccounts, fetchCategories]);

  // Filter categories by type
  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      if (type === TransactionType.INCOME) return c.type === CategoryType.INCOME;
      if (type === TransactionType.EXPENSE) return c.type === CategoryType.EXPENSE;
      return true;
    });
  }, [categories, type]);

  // Parse amount
  const numericAmount = useMemo(() => {
    const val = parseFloat(amount.replace(',', '.'));
    return isNaN(val) ? 0 : val;
  }, [amount]);

  // Calculate life cost
  const lifeCost = useMemo(() => {
    return calculateLifeCost(numericAmount * 100);
  }, [numericAmount, calculateLifeCost]);

  // Current transaction type config
  const currentTypeConfig = TRANSACTION_TYPES.find(t => t.id === type) || TRANSACTION_TYPES[0];

  // Show life cost when there's a meaningful amount
  const showLifeCost = numericAmount >= 100; // Show for 100+ rubles

  useEffect(() => {
    if (showLifeCost) {
      lifeCostOpacity.value = withTiming(1, { duration: 300 });
    } else {
      lifeCostOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [showLifeCost, lifeCostOpacity]);

  const handleAmountChange = useCallback((text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.,]/g, '');
    const parts = cleaned.split(/[.,]/);
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    
    setAmount(cleaned);
    amountScale.value = withSpring(1.02, { damping: 10, stiffness: 200 }, () => {
      amountScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    });
  }, [amountScale]);

  const handleTypeChange = useCallback((newType: TransactionType) => {
    setType(newType);
    setCategoryId(null);
  }, []);

  const handleCategorySelect = useCallback((id: string) => {
    setCategoryId(id);
  }, []);

  const handleAccountSelect = useCallback((id: string) => {
    setAccountId(id);
  }, []);

  const handleSubmit = async () => {
    if (!amount || numericAmount <= 0) {
      Alert.alert('Ошибка', 'Введите сумму');
      return;
    }
    if (!categoryId) {
      Alert.alert('Ошибка', 'Выберите категорию');
      return;
    }
    if (!accountId) {
      Alert.alert('Ошибка', 'Выберите счёт');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTransaction = {
        id: Date.now().toString(),
        userId: '1',
        accountId,
        categoryId,
        amount: numericAmount * 100,
        type,
        description: description || undefined,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addTransaction(newTransaction as any);
      Alert.alert('Успех', 'Транзакция добавлена!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить транзакцию');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Animated styles
  const amountAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: amountScale.value }],
  }));

  const lifeCostAnimatedStyle = useAnimatedStyle(() => ({
    opacity: lifeCostOpacity.value,
    transform: [{ 
      translateY: interpolate(
        lifeCostOpacity.value,
        [0, 1],
        [10, 0],
        Extrapolation.CLAMP
      ),
    }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Новая транзакция</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Type Selector */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.typeSelector}>
          {TRANSACTION_TYPES.map((t, index) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.typeButton,
                { backgroundColor: colors.surface },
                type === t.id && { backgroundColor: t.bgColor, borderColor: t.color },
              ]}
              onPress={() => handleTypeChange(t.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.typeIconContainer,
                { backgroundColor: type === t.id ? t.color + '20' : colors.surfaceHighlight }
              ]}>
                <Ionicons 
                  name={t.icon} 
                  size={24} 
                  color={type === t.id ? t.color : colors.textSecondary} 
                />
              </View>
              <Text style={[
                styles.typeLabel,
                { color: type === t.id ? t.color : colors.textSecondary },
              ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Amount Input - Hero Section */}
        <Animated.View 
          entering={FadeInDown.duration(400).delay(100)} 
          style={[styles.amountSection, { backgroundColor: colors.surface }]}
        >
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
            Сумма
          </Text>
          
          <View style={styles.amountRow}>
            <Text style={[styles.currencySymbol, { color: currentTypeConfig.color }]}>
              ₽
            </Text>
            <Animated.View style={amountAnimatedStyle}>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                autoFocus
                maxLength={12}
              />
            </Animated.View>
          </View>

          {/* Life Cost Display - PROMINENT */}
          <Animated.View style={[styles.lifeCostSection, lifeCostAnimatedStyle]}>
            <View style={[styles.lifeCostCard, { backgroundColor: colors.lifeCostBg }]}>
              <View style={styles.lifeCostHeader}>
                <Ionicons name="time" size={20} color={colors.lifeCost} />
                <Text style={[styles.lifeCostTitle, { color: colors.lifeCost }]}>
                  Цена покупки
                </Text>
              </View>
              
              {showLifeCost ? (
                <>
                  <Text style={[styles.lifeCostHours, { color: colors.lifeCost }]}>
                    {lifeCost.hours} часов
                  </Text>
                  <Text style={[styles.lifeCostDays, { color: colors.textSecondary }]}>
                    = {lifeCost.days} рабочих дней
                  </Text>
                  <Text style={[styles.lifeCostMessage, { color: colors.textSecondary }]}>
                    "{lifeCost.message}"
                  </Text>
                </>
              ) : (
                <Text style={[styles.lifeCostHint, { color: colors.textTertiary }]}>
                  Введите сумму от 100₽ для расчёта
                </Text>
              )}
            </View>
          </Animated.View>
        </Animated.View>

        {/* Category Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Категория
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.surface },
                  categoryId === category.id && { 
                    backgroundColor: (category.color || colors.primary) + '15',
                    borderColor: category.color || colors.primary,
                  },
                ]}
                onPress={() => handleCategorySelect(category.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.categoryIcon,
                  { backgroundColor: (category.color || colors.primary) + '15' }
                ]}>
                  <Ionicons 
                    name={(category.icon || 'help') as any} 
                    size={18} 
                    color={category.color || colors.primary} 
                  />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  { color: categoryId === category.id 
                    ? (category.color || colors.primary) 
                    : colors.textSecondary 
                  },
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Account Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Счёт
          </Text>
          
          <View style={styles.accountsList}>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountItem,
                  { backgroundColor: colors.surface },
                  accountId === account.id && { 
                    backgroundColor: colors.primary + '10',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => handleAccountSelect(account.id)}
                activeOpacity={0.7}
              >
                <View style={styles.accountLeft}>
                  <View style={[
                    styles.accountIcon,
                    { backgroundColor: colors.primary + '15' }
                  ]}>
                    <Ionicons 
                      name={account.type === 'CASH' ? 'cash' : account.type === 'BANK' ? 'card' : 'wallet'} 
                      size={20} 
                      color={accountId === account.id ? colors.primary : colors.textSecondary} 
                    />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={[styles.accountName, { color: colors.text }]}>
                      {account.name}
                    </Text>
                    <Text style={[styles.accountBalance, { color: colors.textSecondary }]}>
                      {account.balance.toLocaleString('ru-RU')} ₽
                    </Text>
                  </View>
                </View>
                {accountId === account.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Description */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Описание <Text style={{ color: colors.textTertiary }}>(необязательно)</Text>
          </Text>
          <TextInput
            style={[
              styles.descriptionInput, 
              { 
                backgroundColor: colors.surface, 
                color: colors.text,
                borderColor: colors.border,
              }
            ]}
            placeholder="Куда ушли деньги?"
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
            maxLength={100}
          />
        </Animated.View>

        {/* Submit Button */}
        <Animated.View 
          entering={FadeInUp.duration(400).delay(500)} 
          style={styles.submitSection}
        >
          <Button
            title={
              type === TransactionType.INCOME 
                ? `Добавить ${currentTypeConfig.sign}${amount || '0'} ₽`
                : type === TransactionType.EXPENSE 
                  ? `Добавить ${currentTypeConfig.sign}${amount || '0'} ₽`
                  : 'Перевести'
            }
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            size="lg"
            icon={type === TransactionType.INCOME ? 'arrow-down' : type === TransactionType.EXPENSE ? 'arrow-up' : 'swap-horizontal'}
            style={{ backgroundColor: currentTypeConfig.color }}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.semibold,
  },
  headerPlaceholder: {
    width: 40,
  },
  
  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  
  // Type Selector
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
  },
  
  // Amount Section
  amountSection: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  amountLabel: {
    fontSize: fontSize.small,
    marginBottom: spacing.sm,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 40,
    fontWeight: fontWeight.bold,
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 48,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -1,
    padding: 0,
  },
  
  // Life Cost
  lifeCostSection: {
    marginTop: spacing.lg,
  },
  lifeCostCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  lifeCostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  lifeCostTitle: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
  },
  lifeCostHours: {
    fontSize: fontSize.h1,
    fontWeight: fontWeight.extrabold,
  },
  lifeCostDays: {
    fontSize: fontSize.body,
    marginTop: spacing.xxs,
  },
  lifeCostMessage: {
    fontSize: fontSize.small,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  lifeCostHint: {
    fontSize: fontSize.small,
    textAlign: 'center',
  },
  
  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.md,
  },
  
  // Categories
  categoriesContainer: {
    gap: spacing.sm,
    paddingRight: spacing.lg,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: spacing.sm,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
  },
  
  // Accounts
  accountsList: {
    gap: spacing.sm,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    gap: 2,
  },
  accountName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
  },
  accountBalance: {
    fontSize: fontSize.small,
  },
  
  // Description
  descriptionInput: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    fontSize: fontSize.body,
    borderWidth: 1,
  },
  
  // Submit
  submitSection: {
    marginTop: spacing.md,
  },
});
