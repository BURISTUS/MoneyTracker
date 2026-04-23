import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';
import type { TransactionType } from '../../../src/types';
import { TransactionType as TransactionTypeEnum } from '../../../src/types';

const EXPENSE_COLORS = {
  primary: '#FF3B30',
  background: 'rgba(255, 59, 48, 0.1)',
  light: 'rgba(255, 59, 48, 0.05)',
};

const INCOME_COLORS = {
  primary: '#34C759',
  background: 'rgba(52, 199, 89, 0.1)',
  light: 'rgba(52, 199, 89, 0.05)',
};

const AMOUNT_PRESETS = [100, 500, 1000, 5000, 10000, 50000];

export default function CreateTransactionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addTransaction = useDataStore((s) => s.addTransaction);
  const accounts = useDataStore((s) => s.accounts);
  const categories = useDataStore((s) => s.categories);

  const [type, setType] = useState<TransactionType>(TransactionTypeEnum.EXPENSE);
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>(
    accounts.length > 0 ? accounts[0].id : '',
  );
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayCategories = useMemo(() => {
    return categories.filter((c) =>
      type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE',
    );
  }, [categories, type]);

  const colors = type === 'EXPENSE' ? EXPENSE_COLORS : INCOME_COLORS;

  const handleNumberPress = useCallback((num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  }, [amount]);

  const handleDecimalPress = useCallback(() => {
    if (!amount.includes('.')) {
      setAmount(amount + '.');
    }
  }, [amount]);

  const handleDeletePress = useCallback(() => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('');
    }
  }, [amount]);

  const handleSubmit = useCallback(async () => {
    if (!amount || !selectedCategory || !selectedAccount) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setIsSubmitting(true);
    try {
      const amountNum = Math.round(parseFloat(amount) * 100);

      await addTransaction({
        id: `temp_${Date.now()}`,
        userId: '',
        accountId: selectedAccount,
        categoryId: selectedCategory,
        amount: amountNum,
        type,
        description: note || null,
        date: date.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Успешно!', 'Транзакция добавлена', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Ошибка', 'Не удалось добавить транзакцию');
      setIsSubmitting(false);
    }
  }, [amount, type, selectedCategory, selectedAccount, note, date, addTransaction, router]);

  const formattedAmount = amount ? parseFloat(amount).toLocaleString('ru-RU') : '0';

  return (
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <View className="flex-1">
        <View className="flex-row p-4 gap-3 border-b border-outline-200">
          <TouchableOpacity
            onPress={() => setType(TransactionTypeEnum.EXPENSE)}
            className={`flex-1 rounded-xl py-3 items-center border-2 ${
              type === 'EXPENSE' ? 'bg-error-500/10 border-error-400' : 'border-transparent'
            }`}
          >
            <Text className="text-lg font-semibold text-error-400">
              − Расход
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType(TransactionTypeEnum.INCOME)}
            className={`flex-1 rounded-xl py-3 items-center border-2 ${
              type === 'INCOME' ? 'bg-success-500/10 border-success-400' : 'border-transparent'
            }`}
          >
            <Text className="text-lg font-semibold text-success-400">
              + Доход
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 320 }}>
          <View className="items-center py-8 border-b border-outline-200">
            <Text
              className="font-bold text-[56px] leading-[64px] tracking-tight"
              style={{ color: colors.primary }}
            >
              {formattedAmount}
            </Text>
            <Text className="text-base text-typography-400 mt-2">
              рублей
            </Text>
          </View>

          <View className="p-4">
            <Text className="text-sm font-medium text-typography-400 mb-3">СЧЁТ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => setSelectedAccount(account.id)}
                    className={`px-4 py-3 rounded-xl border min-w-[120px] items-center ${
                      selectedAccount === account.id
                        ? 'bg-background-50/80 border-primary-400'
                        : 'bg-background-50/30 border-outline-200'
                    }`}
                    style={selectedAccount === account.id ? { backgroundColor: colors.background, borderColor: colors.primary } : undefined}
                  >
                    <Text className="text-sm text-typography-400 mb-1">
                      {account.name}
                    </Text>
                    <Text className="text-base font-semibold text-typography-white">
                      {(account.balance / 100).toLocaleString('ru-RU')} ₽
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="p-4">
            <Text className="text-sm font-medium text-typography-400 mb-3">КАТЕГОРИЯ</Text>
            <View className="flex-row flex-wrap gap-2">
              {displayCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  className={`w-[31%] rounded-xl py-4 px-2 items-center border-2 ${
                    selectedCategory === category.id
                      ? 'bg-background-50/80'
                      : 'bg-background-50/30 border-transparent'
                  }`}
                  style={selectedCategory === category.id ? { backgroundColor: colors.background, borderColor: colors.primary } : undefined}
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color || '#6366F1'}
                    size={24}
                  />
                  <Text
                    className={`text-xs font-medium mt-1 text-center ${
                      selectedCategory === category.id ? 'text-typography-white' : 'text-typography-white'
                    }`}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="p-4">
            <Text className="text-sm font-medium text-typography-400 mb-3">ЗАМЕТКА</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Добавить заметку..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
              className="bg-background-0/50 rounded-xl border border-outline-200 px-4 py-3 text-base text-typography-white min-h-[80px]"
              style={{ textAlignVertical: 'top' }}
            />
          </View>
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 bg-background-0 border-t border-outline-200"
          style={{ paddingBottom: insets.bottom }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-3">
            <View className="flex-row gap-2">
              {AMOUNT_PRESETS.map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setAmount(String(value))}
                  className="px-4 py-2 bg-background-50/50 rounded-lg border border-outline-200"
                >
                  <Text className="text-sm font-semibold text-typography-white">
                    {value} ₽
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View className="flex-row flex-wrap px-2 pb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  if (key === '⌫') handleDeletePress();
                  else if (key === '.') handleDecimalPress();
                  else handleNumberPress(key);
                }}
                className="w-[33.33%] aspect-[1.5] items-center justify-center"
                activeOpacity={0.7}
              >
                <View className="w-[60px] h-[60px] rounded-full bg-background-50/30 items-center justify-center">
                  <Text
                    className={`text-2xl font-semibold leading-8 ${
                      key === '⌫' ? 'text-error-400' : 'text-typography-white'
                    }`}
                  >
                    {key}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!amount || !selectedCategory || !selectedAccount || isSubmitting}
            className={`mx-4 mb-4 rounded-2xl py-4 items-center ${
              !amount || !selectedCategory || !selectedAccount
                ? 'bg-background-50/30'
                : ''
            }`}
            style={{
              backgroundColor: !amount || !selectedCategory || !selectedAccount
                ? undefined
                : colors.primary,
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            <Text className="text-lg font-bold text-typography-white">
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
