import React, { useState, useCallback, useMemo } from 'react';
import { View, Pressable, Alert, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Icon } from '../../../src/components/ui/Icon';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';
import { useTheme } from '../../../src/theme';
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
  const { spacing } = useTheme();
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
    <Screen style={{ padding: 0 }}>
      <View style={{ flex: 1 }}>
        {/* Header with type toggle */}
        <View style={{
          flexDirection: 'row',
          padding: 16,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          <TouchableOpacity
            onPress={() => setType(TransactionTypeEnum.EXPENSE)}
            style={{
              flex: 1,
              backgroundColor: type === 'EXPENSE' ? EXPENSE_COLORS.background : 'transparent',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: type === 'EXPENSE' ? EXPENSE_COLORS.primary : 'transparent',
            }}
          >
            <Text size="lg" weight="semibold" style={{ color: EXPENSE_COLORS.primary }}>
              − Расход
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setType(TransactionTypeEnum.INCOME)}
            style={{
              flex: 1,
              backgroundColor: type === 'INCOME' ? INCOME_COLORS.background : 'transparent',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
              borderWidth: 2,
              borderColor: type === 'INCOME' ? INCOME_COLORS.primary : 'transparent',
            }}
          >
            <Text size="lg" weight="semibold" style={{ color: INCOME_COLORS.primary }}>
              + Доход
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 320 }}>
          {/* Amount display */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 32,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(255, 255, 255, 0.1)',
          }}>
            <Text
              size="display"
              weight="bold"
              style={{
                color: colors.primary,
                fontSize: 56,
                lineHeight: 64,
                letterSpacing: -1,
              }}
            >
              {formattedAmount}
            </Text>
            <Text size="md" style={{ color: '#8E8E93', marginTop: 8 }}>
              рублей
            </Text>
          </View>

          {/* Account selector */}
          <View style={{ padding: 16 }}>
            <Text size="sm" weight="medium" style={{ color: '#8E8E93', marginBottom: 12 }}>
              СЧЁТ
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => setSelectedAccount(account.id)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: selectedAccount === account.id
                        ? colors.background
                        : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: selectedAccount === account.id
                        ? colors.primary
                        : 'rgba(255, 255, 255, 0.1)',
                      minWidth: 120,
                      alignItems: 'center',
                    }}
                  >
                    <Text size="sm" style={{ color: '#8E8E93', marginBottom: 4 }}>
                      {account.name}
                    </Text>
                    <Text size="md" weight="semibold" style={{ color: '#FFFFFF' }}>
                      {(account.balance / 100).toLocaleString('ru-RU')} ₽
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Categories */}
          <View style={{ padding: 16 }}>
            <Text size="sm" weight="medium" style={{ color: '#8E8E93', marginBottom: 12 }}>
              КАТЕГОРИЯ
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {displayCategories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={{
                    width: '31%',
                    backgroundColor: selectedCategory === category.id
                      ? colors.background
                      : 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 12,
                    paddingVertical: 16,
                    paddingHorizontal: 8,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: selectedCategory === category.id
                      ? colors.primary
                      : 'transparent',
                  }}
                >
                  <CategoryIcon
                    icon={category.icon}
                    color={category.color || '#6366F1'}
                    size={24}
                  />
                  <Text
                    size="xs"
                    weight="medium"
                    style={{
                      color: selectedCategory === category.id ? colors.primary : '#FFFFFF',
                      textAlign: 'center',
                      marginTop: 4,
                    }}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Note */}
          <View style={{ padding: 16 }}>
            <Text size="sm" weight="medium" style={{ color: '#8E8E93', marginBottom: 12 }}>
              ЗАМЕТКА
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Добавить заметку..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                color: '#FFFFFF',
                fontSize: 16,
                minHeight: 80,
                textAlignVertical: 'top',
              }}
            />
          </View>
        </ScrollView>

        {/* Fixed bottom section with Numpad and Save button */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0A0A0F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
        }}>
          {/* Quick amount presets */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {AMOUNT_PRESETS.map((value) => (
                <TouchableOpacity
                  key={value}
                  onPress={() => setAmount(String(value))}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Text size="sm" weight="semibold" style={{ color: '#FFFFFF' }}>
                    {value} ₽
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Numpad */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingHorizontal: 8,
            paddingBottom: 16,
          }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '⌫'].map((key) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  if (key === '⌫') handleDeletePress();
                  else if (key === '.') handleDecimalPress();
                  else handleNumberPress(key);
                }}
                style={{
                  width: '33.33%',
                  aspectRatio: 1.5,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text
                    size="xxl"
                    weight="semibold"
                    style={{
                      color: key === '⌫' ? '#FF3B30' : '#FFFFFF',
                      lineHeight: 32,
                    }}
                  >
                    {key}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!amount || !selectedCategory || !selectedAccount || isSubmitting}
            style={{
              marginHorizontal: 16,
              marginBottom: 16,
              backgroundColor: !amount || !selectedCategory || !selectedAccount
                ? 'rgba(255, 255, 255, 0.1)'
                : colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            <Text size="lg" weight="bold" style={{ color: '#FFFFFF' }}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}
