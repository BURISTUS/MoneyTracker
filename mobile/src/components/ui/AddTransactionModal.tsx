import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
import { DatePickerModal } from './DatePickerModal';
import { formatCurrency } from '../../utils/formatters';
import type { TransactionType } from '../../types';
import { TransactionType as TransactionTypeEnum } from '../../types';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialType?: TransactionType;
}

const EXPENSE_COLORS = {
  primary: '#FF3B30',
  background: 'rgba(255, 59, 48, 0.1)',
};

const INCOME_COLORS = {
  primary: '#34C759',
  background: 'rgba(52, 199, 89, 0.1)',
};

type MathOp = '+' | '−' | '×' | '÷' | null;

function evaluateExpression(left: string, op: MathOp, right: string): number | null {
  const a = parseFloat(left);
  const b = parseFloat(right);
  if (isNaN(a) || isNaN(b)) return null;
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : null;
    default: return null;
  }
}

export function AddTransactionModal({
  visible,
  onClose,
  onComplete,
  initialType = TransactionTypeEnum.EXPENSE,
}: AddTransactionModalProps) {
  const router = useRouter();
  const addTransaction = useDataStore((s) => s.addTransaction);
  const accounts = useDataStore((s) => s.accounts);
  const categories = useDataStore((s) => s.categories);
  const budgets = useDataStore((s) => s.budgets);
  const user = useAuthStore((s) => s.user);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [type, setType] = useState<TransactionType>(initialType);

  React.useEffect(() => {
    if (visible) {
      setType(initialType);
      setAmount('');
      setPendingOp(null);
      setPreviousValue('');
      setSelectedCategory(null);
    }
  }, [visible, initialType]);
  const [amount, setAmount] = useState('');
  const [pendingOp, setPendingOp] = useState<MathOp>(null);
  const [previousValue, setPreviousValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>(
    accounts.length > 0 ? accounts[0].id : '',
  );
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = type === 'EXPENSE' ? EXPENSE_COLORS : INCOME_COLORS;

  const displayCategories = categories.filter(
    (c) => c.type === (type as string),
  );

  const hourlyRate = useMemo(() => {
    const rate = getHourlyRate();
    return rate > 0 ? rate : (user?.hourlyRate ?? 0);
  }, [getHourlyRate, user?.hourlyRate]);

  const displayAmount = useMemo(() => {
    if (previousValue && pendingOp) {
      return `${previousValue} ${pendingOp} ${amount}`;
    }
    return amount || '0';
  }, [amount, previousValue, pendingOp]);

  const numericAmount = useMemo(() => {
    if (previousValue && pendingOp && amount) {
      const result = evaluateExpression(previousValue, pendingOp, amount);
      return result;
    }
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }, [amount, previousValue, pendingOp]);

  const lifeHours = useMemo(() => {
    if (!numericAmount || !hourlyRate) return null;
    if (numericAmount <= 0) return null;
    const hours = numericAmount / hourlyRate;
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 24) return `${hours.toFixed(1)} ч`;
    return `${(hours / 24).toFixed(1)} дн`;
  }, [numericAmount, hourlyRate]);

  const handleNumberPress = useCallback((num: string) => {
    setAmount((prev) => {
      if (prev === '0' && num !== '.') return num;
      if (prev.length >= 12) return prev;
      return prev + num;
    });
  }, []);

  const handleDelete = useCallback(() => {
    setAmount((prev) => prev.length > 1 ? prev.slice(0, -1) : '');
  }, []);

  const handleMathOp = useCallback((op: MathOp) => {
    if (previousValue && pendingOp && amount) {
      const result = evaluateExpression(previousValue, pendingOp, amount);
      if (result !== null) {
        const rounded = Math.round(result * 100) / 100;
        setPreviousValue(String(rounded));
        setAmount('');
        setPendingOp(op);
        return;
      }
    }
    if (amount) {
      setPreviousValue(amount);
      setAmount('');
      setPendingOp(op);
    }
  }, [amount, previousValue, pendingOp]);

  const handleEquals = useCallback(() => {
    if (previousValue && pendingOp && amount) {
      const result = evaluateExpression(previousValue, pendingOp, amount);
      if (result !== null) {
        const rounded = Math.round(result * 100) / 100;
        setAmount(String(rounded));
        setPreviousValue('');
        setPendingOp(null);
      }
    }
  }, [previousValue, pendingOp, amount]);

  const handleSubmit = useCallback(async () => {
    if (!numericAmount || !selectedCategory || !selectedAccount) return;

    setIsSubmitting(true);
    try {
      await addTransaction({
        id: `temp_${Date.now()}`,
        userId: '',
        accountId: selectedAccount,
        categoryId: selectedCategory,
        amount: Math.round(numericAmount * 100),
        type,
        description: note || null,
        date: date.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setAmount('');
      setPreviousValue('');
      setPendingOp(null);
      setSelectedCategory(null);
      setNote('');
      setDate(new Date());
      onClose();
      onComplete();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [numericAmount, type, selectedCategory, selectedAccount, note, date, addTransaction, onClose, onComplete]);

  const selectedCategoryData = displayCategories.find((c) => c.id === selectedCategory);
  const selectedAccountData = accounts.find((a) => a.id === selectedAccount);

  const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const formatDateFull = (d: Date) =>
    `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;

  const NUMPAD_KEYS = [
    '7', '8', '9', '÷',
    '4', '5', '6', '×',
    '1', '2', '3', '−',
    '.', '0', '⌫', '+',
  ];

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View className="flex-1 bg-[rgba(0,0,0,0.5)] justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        <View
          className="bg-[#1C1C1E] rounded-t-3xl"
          style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16, maxHeight: '95%' }}
        >
          <View className="w-9 h-1 bg-[#3A3A3C] rounded-full self-center mt-2 mb-3" />

          <View className="flex-row px-4 mb-2">
            {[
              { key: TransactionTypeEnum.EXPENSE, label: '− Расход' },
              { key: TransactionTypeEnum.INCOME, label: '+ Доход' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => { setType(tab.key as TransactionType); setSelectedCategory(null); }}
                className={`flex-1 py-2.5 items-center rounded-xl ${
                  type === tab.key ? '' : ''
                }`}
                style={{ backgroundColor: type === tab.key ? colors.background : 'transparent' }}
              >
                <Text bold className={`text-base ${type === tab.key ? '' : 'text-[#8E8E93]'}`} style={{ color: type === tab.key ? colors.primary : '#8E8E93' }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="items-center py-2">
            <Text bold className="text-[40px]" style={{ color: colors.primary }} numberOfLines={1}>
              {displayAmount}
            </Text>
            {lifeHours && type === 'EXPENSE' && (
              <View className="flex-row items-center gap-1.5 mt-1.5 bg-[rgba(255,255,255,0.05)] px-3.5 py-1 rounded-full">
                <Text className="text-sm">⏱</Text>
                <Text className="text-sm text-warning-400">{lifeHours} работы</Text>
              </View>
            )}
          </View>

          <View className="px-4 mb-2">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center justify-center gap-2 py-2 bg-[rgba(255,255,255,0.04)] rounded-full px-4"
            >
              <Text className="text-sm">📅</Text>
              <Text bold className="text-sm text-[#EBEBF5]">{formatDateFull(date)}</Text>
              <Text className="text-xs text-[#8E8E93]">▾</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center gap-6 px-4 mb-2">
            <TouchableOpacity
              onPress={() => setShowNoteInput(!showNoteInput)}
              className="items-center gap-1"
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center ${showNoteInput ? '' : 'bg-[rgba(255,255,255,0.05)]'}`}
                style={{ backgroundColor: showNoteInput ? colors.background : undefined }}>
                <Text className="text-xl">📝</Text>
              </View>
              <Text className="text-xs text-[#8E8E93]">{note ? 'Есть' : 'Заметка'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowAccountPicker(!showAccountPicker)}
              className="items-center gap-1"
            >
              <View className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] items-center justify-center">
                <Text className="text-xl">💳</Text>
              </View>
              <Text className="text-xs text-[#8E8E93]">{selectedAccountData?.name || 'Счёт'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              className="items-center gap-1"
            >
              <CategoryIcon
                icon={selectedCategoryData?.icon || ''}
                color={selectedCategoryData?.color || colors.primary}
                size={24}
              />
              <Text className="text-xs text-[#8E8E93]" numberOfLines={1}>
                {selectedCategoryData?.name || 'Категория'}
              </Text>
            </TouchableOpacity>
          </View>

          {type === 'EXPENSE' && selectedCategory && (() => {
            const budget = budgets.find((b) => b.categoryId === selectedCategory);
            if (!budget) return null;
            const percent = budget.percentUsed || budget.progress || 0;
            const threshold = budget.alertThreshold || 80;
            const barColor = percent > 100 ? '#F87171' : percent >= threshold ? '#FBBF24' : '#34D399';
            const remaining = (budget.remaining ?? 0) / 100;
            return (
              <View className="px-4 mb-2">
                <View className="bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-2.5">
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-xs text-[#8E8E93]">Лимит категории</Text>
                    <Text className="text-xs font-semibold" style={{ color: barColor }}>
                      {percent > 100 ? `Превышен на ${formatCurrency(Math.abs(remaining) * 100)}` : `Осталось ${formatCurrency(remaining * 100)}`}
                    </Text>
                  </View>
                  <View className="h-1.5 rounded-full bg-[rgba(255,255,255,0.08)] overflow-hidden">
                    <View className="h-1.5 rounded-full" style={{ width: `${Math.min(percent, 100)}%`, backgroundColor: barColor }} />
                  </View>
                </View>
              </View>
            );
          })()}

          {showNoteInput && (
            <View className="px-4 mb-2">
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Добавить заметку..."
                placeholderTextColor="#8E8E93"
                autoFocus
                className="bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-2.5 text-white text-base"
              />
            </View>
          )}

          {showAccountPicker && (
            <View className="px-4 mb-2">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      onPress={() => { setSelectedAccount(account.id); setShowAccountPicker(false); }}
                      className="px-4 py-2.5 rounded-xl border"
                      style={{
                        backgroundColor: selectedAccount === account.id ? colors.background : 'rgba(255,255,255,0.05)',
                        borderColor: selectedAccount === account.id ? colors.primary : 'transparent',
                      }}
                    >
                      <Text className="text-sm text-white">{account.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          <View className="flex-row flex-wrap px-2">
            {NUMPAD_KEYS.map((key) => {
              const isOp = ['+', '−', '×', '÷'].includes(key);
              const isDelete = key === '⌫';
              const isActiveOp = isOp && pendingOp === key;

              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    if (isDelete) handleDelete();
                    else if (isOp) handleMathOp(key as MathOp);
                    else if (key === '.' && amount.includes('.')) return;
                    else handleNumberPress(key);
                  }}
                  className="w-[25%] items-center justify-center"
                  style={{ aspectRatio: 1.3 }}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-[60px] h-[60px] rounded-full items-center justify-center"
                    style={{
                      backgroundColor: isActiveOp
                        ? 'rgba(99, 102, 241, 0.25)'
                        : isOp
                          ? 'rgba(99, 102, 241, 0.1)'
                          : isDelete
                            ? 'rgba(255,59,48,0.1)'
                            : 'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Text
                      bold
                      className="text-xl leading-7"
                      style={{
                        color: isOp
                          ? '#6366F1'
                          : isDelete
                            ? '#FF3B30'
                            : '#FFFFFF',
                      }}
                    >
                      {key}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row px-4 pt-1 gap-2">
            <TouchableOpacity
              onPress={handleEquals}
              className="w-16 h-14 rounded-2xl bg-[rgba(99,102,241,0.15)] items-center justify-center"
            >
              <Text bold className="text-3xl text-primary-400">=</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!numericAmount || !selectedCategory || !selectedAccount || isSubmitting}
              className="flex-1 py-4 rounded-2xl items-center"
              style={{
                backgroundColor: !numericAmount || !selectedCategory || !selectedAccount
                  ? 'rgba(255,255,255,0.1)' : colors.primary,
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              <Text bold className="text-lg text-white">
                {isSubmitting ? 'Сохранение...' : '✓ Сохранить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <DatePickerModal
          visible={showDatePicker}
          currentDate={date}
          onSelect={(d) => { setDate(d); setShowDatePicker(false); }}
          onClose={() => setShowDatePicker(false)}
        />

        <RNModal visible={showCategoryPicker} animationType="slide" onRequestClose={() => setShowCategoryPicker(false)} transparent>
          <View className="flex-1 bg-[rgba(0,0,0,0.5)] justify-end">
            <Pressable className="flex-1" onPress={() => setShowCategoryPicker(false)} />
            <View
              className="bg-[#1C1C1E] rounded-t-3xl"
              style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16, maxHeight: '80%' }}
            >
              <View className="w-9 h-1 bg-[#3A3A3C] rounded-full self-center mt-2 mb-3" />

              <View className="px-4 mb-3">
                <Text bold className="text-lg text-white">Категория</Text>
              </View>

              <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
                {displayCategories.length === 0 ? (
                  <View className="items-center py-10">
                    <Text className="text-base text-[#8E8E93] mb-4">Нет категорий</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowCategoryPicker(false);
                        onClose();
                        router.push('/main/categories/create');
                      }}
                      className="px-6 py-3 rounded-xl"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text bold className="text-base text-white">Создать категорию</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View className="flex-row flex-wrap gap-3">
                      {displayCategories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => { setSelectedCategory(category.id); setShowCategoryPicker(false); }}
                          className="w-[31%] rounded-2xl py-4 px-2 items-center border-2"
                          style={{
                            backgroundColor: selectedCategory === category.id ? colors.background : 'rgba(255,255,255,0.05)',
                            borderColor: selectedCategory === category.id ? colors.primary : 'transparent',
                          }}
                        >
                          <CategoryIcon
                            icon={category.icon}
                            color={category.color || colors.primary}
                            size={24}
                            backgroundColor={selectedCategory === category.id ? colors.primary : undefined}
                          />
                          <Text bold className="text-xs text-white text-center" numberOfLines={1}>
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        setShowCategoryPicker(false);
                        onClose();
                        router.push('/main/categories/create');
                      }}
                      className="mt-5 py-3.5 bg-[rgba(255,255,255,0.05)] rounded-xl items-center border border-[rgba(255,255,255,0.1)] border-dashed"
                    >
                      <Text className="text-base text-[#8E8E93]">+ Создать новую категорию</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
            </View>
          </View>
        </RNModal>
      </View>
    </RNModal>
  );
}
