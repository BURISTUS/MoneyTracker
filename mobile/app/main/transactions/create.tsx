import { useState, useMemo, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, useColorScheme, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { useDataStore } from '../../../src/stores/dataStore';
import { TransactionType, CategoryType } from '../../../src/types';
import { lightTheme, darkTheme } from '../../../src/utils/theme';
import { LifeCostBadge } from '../../../src/components/gamification/LifeCostBadge';

const TRANSACTION_TYPES = [
  { id: TransactionType.INCOME, label: 'Доход', icon: 'arrow-down-circle', color: '#34C759' },
  { id: TransactionType.EXPENSE, label: 'Расход', icon: 'arrow-up-circle', color: '#FF3B30' },
  { id: TransactionType.TRANSFER, label: 'Перевод', icon: 'swap-horizontal', color: '#007AFF' },
];

export default function CreateTransactionScreen() {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  const { categories, accounts, addTransaction, calculateLifeCost, fetchAccounts, fetchCategories } = useDataStore();

  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);

  // Fetch accounts and categories on mount
  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, [fetchAccounts, fetchCategories]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [accountId, setAccountId] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return categories.filter(c => {
      if (type === TransactionType.INCOME) return c.type === CategoryType.INCOME;
      if (type === TransactionType.EXPENSE) return c.type === CategoryType.EXPENSE;
      return true;
    });
  }, [categories, type]);

  const numericAmount = useMemo(() => {
    const val = parseFloat(amount.replace(',', '.'));
    return isNaN(val) ? 0 : val;
  }, [amount]);

  const lifeCost = useMemo(() => {
    return calculateLifeCost(numericAmount * 100); // Конвертируем в копейки
  }, [numericAmount, calculateLifeCost]);

  const handleSubmit = () => {
    if (!amount || numericAmount <= 0) {
      Alert.alert('Ошибка', 'Введите сумму');
      return;
    }
    if (!categoryId) {
      Alert.alert('Ошибка', 'Выберите категорию');
      return;
    }
    if (!accountId) {
      Alert.alert('Ошибка', 'Выберите счет');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      userId: '1',
      accountId,
      categoryId,
      amount: numericAmount * 100, // В копейках
      type,
      description: description || undefined,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTransaction(newTransaction as any);
    Alert.alert('Успех', 'Транзакция добавлена!', [{ text: 'OK', onPress: () => {} }]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(300)} style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => {}} style={styles.backButton}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Новая транзакция</Text>
          <View style={styles.placeholder} />
        </View>
      </Animated.View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Type Selector */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.typeSelector}>
          {TRANSACTION_TYPES.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.typeButton,
                { backgroundColor: colors.backgroundTertiary },
                type === t.id && { backgroundColor: t.color + '20' },
              ]}
              onPress={() => {
                setType(t.id);
                setCategoryId(null);
              }}
            >
              <Ionicons 
                name={t.icon as any} 
                size={24} 
                color={type === t.id ? t.color : colors.textSecondary} 
              />
              <Text style={[
                styles.typeLabel,
                { color: type === t.id ? t.color : colors.textSecondary },
              ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Amount Input */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.amountSection}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Сумма</Text>
          <View style={styles.amountInputContainer}>
            <Text style={[styles.currencySymbol, { color: type === TransactionType.INCOME ? '#34C759' : colors.primary }]}>₽</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              autoFocus
            />
          </View>
          
          {/* Life Cost Badge */}
          {numericAmount > 0 && (
            <Animated.View entering={SlideInUp.duration(300)} style={styles.lifeCostContainer}>
              <LifeCostBadge amount={numericAmount * 100} size="large" />
            </Animated.View>
          )}
        </Animated.View>

        {/* Category Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Категория</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
            {filteredCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  { backgroundColor: colors.backgroundTertiary },
                  categoryId === category.id && { backgroundColor: (category.color || colors.primary) + '20' },
                ]}
                onPress={() => setCategoryId(category.id)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: (category.color || colors.primary) + '20' }]}>
                  <Ionicons name={(category.icon || 'help') as any} size={16} color={category.color || colors.primary} />
                </View>
                <Text style={[
                  styles.categoryLabel,
                  { color: categoryId === category.id ? (category.color || colors.primary) : colors.textSecondary },
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Account Selection */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Счет</Text>
          <View style={styles.accountsList}>
            {accounts.map((account) => (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountItem,
                  { backgroundColor: colors.backgroundTertiary },
                  accountId === account.id && { backgroundColor: colors.primary + '15' },
                ]}
                onPress={() => setAccountId(account.id)}
              >
                <View style={styles.accountInfo}>
                  <Ionicons 
                    name={account.type === 'CASH' ? 'cash' : account.type === 'BANK' ? 'card' : 'wallet'} 
                    size={20} 
                    color={accountId === account.id ? colors.primary : colors.textSecondary} 
                  />
                  <View style={styles.accountText}>
                    <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
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
        <Animated.View entering={FadeInDown.duration(400).delay(500)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Описание (необязательно)</Text>
          <TextInput
            style={[styles.descriptionInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]}
            placeholder="Куда ушли деньги?"
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
          />
        </Animated.View>

        {/* Submit Button */}
        <Animated.View entering={FadeInDown.duration(400).delay(600)} style={styles.submitSection}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: type === TransactionType.INCOME ? '#34C759' : '#FF3B30' },
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>
              {type === TransactionType.INCOME ? 'Добавить доход' : type === TransactionType.EXPENSE ? 'Добавить расход' : 'Перевести'}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  amountSection: {
    marginBottom: 24,
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
    paddingBottom: 8,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
  },
  lifeCostContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  accountsList: {
    gap: 10,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountText: {
    gap: 2,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 13,
  },
  descriptionInput: {
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
  },
  submitSection: {
    marginTop: 8,
  },
  submitButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
