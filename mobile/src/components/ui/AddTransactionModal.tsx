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
import { Text } from './Text';
import { DatePickerModal } from './DatePickerModal';
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
  const user = useAuthStore((s) => s.user);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [type, setType] = useState<TransactionType>(initialType);
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
    (c) => c.type === (type as any),
  );

  const hourlyRate = useMemo(() => {
    const rate = getHourlyRate();
    return rate > 0 ? rate : (user?.hourlyRate ? user.hourlyRate / 100 : 0);
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View style={{
          backgroundColor: '#1C1C1E',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
          maxHeight: '95%',
        }}>
          {/* Handle */}
          <View style={{ width: 36, height: 4, backgroundColor: '#3A3A3C', borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 12 }} />

          {/* Type tabs */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 }}>
            {[
              { key: TransactionTypeEnum.EXPENSE, label: '− Расход' },
              { key: TransactionTypeEnum.INCOME, label: '+ Доход' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => { setType(tab.key as TransactionType); setSelectedCategory(null); }}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  alignItems: 'center',
                  backgroundColor: type === tab.key ? colors.background : 'transparent',
                  borderRadius: 12,
                }}
              >
                <Text size="md" weight="semibold" style={{ color: type === tab.key ? colors.primary : '#8E8E93' }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount display + Life Hours */}
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{ color: colors.primary, fontSize: 40, fontWeight: 'bold' }} numberOfLines={1}>
              {displayAmount}
            </Text>
            {lifeHours && type === 'EXPENSE' && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                marginTop: 6,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                paddingHorizontal: 14,
                paddingVertical: 4,
                borderRadius: 20,
              }}>
                <Text size="sm">⏱</Text>
                <Text size="sm" style={{ color: '#FBBF24' }}>
                  {lifeHours} работы
                </Text>
              </View>
            )}
          </View>

          {/* Date button */}
          <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingVertical: 8,
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: 20,
                paddingHorizontal: 16,
              }}
            >
              <Text size="sm">📅</Text>
              <Text size="sm" weight="medium" style={{ color: '#EBEBF5' }}>
                {formatDateFull(date)}
              </Text>
              <Text size="xs" style={{ color: '#8E8E93' }}>▾</Text>
            </TouchableOpacity>
          </View>

          {/* Detail buttons row */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, paddingHorizontal: 16, marginBottom: 8 }}>

            {/* NOTE button */}
            <TouchableOpacity
              onPress={() => setShowNoteInput(!showNoteInput)}
              style={{ alignItems: 'center', gap: 4 }}
            >
              <View style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: showNoteInput ? colors.background : 'rgba(255,255,255,0.05)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text size="xl">📝</Text>
              </View>
              <Text size="xs" style={{ color: '#8E8E93' }}>
                {note ? 'Есть' : 'Заметка'}
              </Text>
            </TouchableOpacity>

            {/* ACCOUNT button */}
            <TouchableOpacity
              onPress={() => setShowAccountPicker(!showAccountPicker)}
              style={{ alignItems: 'center', gap: 4 }}
            >
              <View style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: 'rgba(255,255,255,0.05)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text size="xl">💳</Text>
              </View>
              <Text size="xs" style={{ color: '#8E8E93' }}>
                {selectedAccountData?.name || 'Счёт'}
              </Text>
            </TouchableOpacity>

            {/* Category shortcut */}
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              style={{ alignItems: 'center', gap: 4 }}
            >
              <View style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: selectedCategoryData ? (selectedCategoryData.color || colors.primary) : 'rgba(255,255,255,0.05)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text size="xl">{selectedCategoryData?.icon || '🏷'}</Text>
              </View>
              <Text size="xs" style={{ color: '#8E8E93' }} numberOfLines={1}>
                {selectedCategoryData?.name || 'Категория'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Note input (collapsible) */}
          {showNoteInput && (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Добавить заметку..."
                placeholderTextColor="#8E8E93"
                autoFocus
                style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  color: '#FFFFFF',
                  fontSize: 16,
                }}
              />
            </View>
          )}

          {/* Account picker (collapsible) */}
          {showAccountPicker && (
            <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      onPress={() => { setSelectedAccount(account.id); setShowAccountPicker(false); }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        backgroundColor: selectedAccount === account.id ? colors.background : 'rgba(255,255,255,0.05)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: selectedAccount === account.id ? colors.primary : 'transparent',
                      }}
                    >
                      <Text size="sm" style={{ color: '#FFFFFF' }}>{account.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Numpad with math operations */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
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
                  style={{ width: '25%', aspectRatio: 1.3, alignItems: 'center', justifyContent: 'center' }}
                  activeOpacity={0.7}
                >
                  <View style={{
                    width: 60, height: 60, borderRadius: 30,
                    backgroundColor: isActiveOp
                      ? 'rgba(99, 102, 241, 0.25)'
                      : isOp
                        ? 'rgba(99, 102, 241, 0.1)'
                        : isDelete
                          ? 'rgba(255,59,48,0.1)'
                          : 'rgba(255,255,255,0.06)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text
                      size="xl"
                      weight="semibold"
                      style={{
                        color: isOp
                          ? '#6366F1'
                          : isDelete
                            ? '#FF3B30'
                            : '#FFFFFF',
                        lineHeight: 28,
                      }}
                    >
                      {key}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* = and Submit row */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingTop: 4, gap: 8 }}>
            <TouchableOpacity
              onPress={handleEquals}
              style={{
                width: 64,
                height: 56,
                borderRadius: 16,
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size="xxl" weight="bold" style={{ color: '#6366F1' }}>=</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!numericAmount || !selectedCategory || !selectedAccount || isSubmitting}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 16,
                backgroundColor: !numericAmount || !selectedCategory || !selectedAccount
                  ? 'rgba(255,255,255,0.1)' : colors.primary,
                alignItems: 'center',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              <Text size="lg" weight="bold" style={{ color: '#FFFFFF' }}>
                {isSubmitting ? 'Сохранение...' : '✓ Сохранить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={showDatePicker}
          currentDate={date}
          onSelect={(d) => { setDate(d); setShowDatePicker(false); }}
          onClose={() => setShowDatePicker(false)}
        />

        {/* Category Picker */}
        <RNModal visible={showCategoryPicker} animationType="slide" onRequestClose={() => setShowCategoryPicker(false)} transparent>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
            <Pressable style={{ flex: 1 }} onPress={() => setShowCategoryPicker(false)} />
            <View style={{
              backgroundColor: '#1C1C1E',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingBottom: Platform.OS === 'ios' ? 34 : 16,
              maxHeight: '80%',
            }}>
              <View style={{ width: 36, height: 4, backgroundColor: '#3A3A3C', borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 12 }} />

              <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <Text size="lg" weight="bold" style={{ color: '#FFFFFF' }}>Категория</Text>
              </View>

              <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
                {displayCategories.length === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                    <Text size="md" style={{ color: '#8E8E93', marginBottom: 16 }}>Нет категорий</Text>
                    <TouchableOpacity
                      onPress={() => {
                        setShowCategoryPicker(false);
                        onClose();
                        router.push('/main/categories/create');
                      }}
                      style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 12 }}
                    >
                      <Text size="md" weight="bold" style={{ color: '#FFFFFF' }}>Создать категорию</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                      {displayCategories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => { setSelectedCategory(category.id); setShowCategoryPicker(false); }}
                          style={{
                            width: '31%',
                            backgroundColor: selectedCategory === category.id ? colors.background : 'rgba(255,255,255,0.05)',
                            borderRadius: 16,
                            paddingVertical: 16,
                            paddingHorizontal: 8,
                            alignItems: 'center',
                            borderWidth: 2,
                            borderColor: selectedCategory === category.id ? colors.primary : 'transparent',
                          }}
                        >
                          <View style={{
                            width: 44, height: 44, borderRadius: 22,
                            backgroundColor: category.color || colors.primary,
                            alignItems: 'center', justifyContent: 'center',
                            marginBottom: 8,
                          }}>
                            <Text size="xl" style={{ lineHeight: 24 }}>{category.icon || '💰'}</Text>
                          </View>
                          <Text size="xs" weight="medium" style={{ color: '#FFFFFF', textAlign: 'center' }} numberOfLines={1}>
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
                      style={{
                        marginTop: 20,
                        paddingVertical: 14,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: 12,
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                        borderStyle: 'dashed',
                      }}
                    >
                      <Text size="md" style={{ color: '#8E8E93' }}>+ Создать новую категорию</Text>
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
