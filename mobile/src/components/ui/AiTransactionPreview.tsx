import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Modal as RNModal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { useDataStore } from '../../stores/dataStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../../utils/formatters';
import type { AiTransactionResult, AiReceiptResult } from '../../services/ai';

interface AiTransactionPreviewProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  result: AiTransactionResult | AiReceiptResult | null;
}

// Цвета по типу транзакции
const COLORS = {
  EXPENSE: { primary: '#FF3B30', bg: 'rgba(255,59,48,0.1)' },
  INCOME: { primary: '#34C759', bg: 'rgba(52,199,89,0.1)' },
};

// Дефолтные иконки/цвета для новых категорий
const CATEGORY_PRESETS: Record<string, { icon: string; color: string }> = {
  'Продукты': { icon: 'material:cart', color: '#34C759' },
  'Транспорт': { icon: 'material:bus', color: '#007AFF' },
  'Жильё': { icon: 'material:home', color: '#FF9500' },
  'Коммунальные': { icon: 'material:flash', color: '#FFCC00' },
  'Связь': { icon: 'material:phone', color: '#5856D6' },
  'Здоровье': { icon: 'material:medical-bag', color: '#FF2D55' },
  'Развлечения': { icon: 'material:gamepad-variant', color: '#AF52DE' },
  'Одежда': { icon: 'material:tshirt-crew', color: '#5AC8FA' },
  'Рестораны': { icon: 'material:food', color: '#FF3B30' },
  'Подарки': { icon: 'material:gift', color: '#FF2D55' },
  'Зарплата': { icon: 'material:wallet', color: '#34C759' },
  'Фриланс': { icon: 'material:laptop', color: '#007AFF' },
  'Инвестиции': { icon: 'material:chart-line', color: '#5856D6' },
};

function getCategoryPreset(name: string): { icon: string; color: string } {
  return CATEGORY_PRESETS[name] || { icon: 'material:tag', color: '#8E8E93' };
}

export function AiTransactionPreview({
  visible,
  onClose,
  onComplete,
  result,
}: AiTransactionPreviewProps) {
  const addTransaction = useDataStore((s) => s.addTransaction);
  const addCategory = useDataStore((s) => s.addCategory);
  const categories = useDataStore((s) => s.categories);
  const accounts = useDataStore((s) => s.accounts);
  const fetchCategories = useDataStore((s) => s.fetchCategories);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showItems, setShowItems] = useState(false);

  // Инициализация при новом результате
  React.useEffect(() => {
    if (visible && result) {
      setAmount(String(result.amount));
      setDescription(result.description || '');
      if (accounts.length > 0 && !selectedAccount) {
        setSelectedAccount(accounts[0].id);
      }
    }
  }, [visible, result]);

  // Найти существующую категорию
  const matchedCategory = useMemo(() => {
    if (!result) return null;
    return categories.find(
      (c) =>
        c.name.toLowerCase() === result.categoryName.toLowerCase() &&
        c.type === result.categoryType,
    );
  }, [result, categories]);

  const isNewCategory = !matchedCategory;

  const colors = result ? COLORS[result.type] || COLORS.EXPENSE : COLORS.EXPENSE;

  const handleSave = useCallback(async () => {
    if (!result || !selectedAccount) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsSaving(true);
    try {
      let categoryId = matchedCategory?.id;

      // Создать категорию, если не существует
      if (!categoryId) {
        const preset = getCategoryPreset(result.categoryName);
        await addCategory({
          name: result.categoryName,
          type: result.categoryType as any,
          icon: preset.icon,
          color: preset.color,
        });
        // Перечитаем категории, чтобы найти ID новой
        await fetchCategories();
        const freshCategories = useDataStore.getState().categories;
        const created = freshCategories.find(
          (c) =>
            c.name.toLowerCase() === result.categoryName.toLowerCase() &&
            c.type === result.categoryType,
        );
        categoryId = created?.id;
      }

      if (!categoryId) {
        Alert.alert('Ошибка', 'Не удалось определить категорию');
        setIsSaving(false);
        return;
      }

      await addTransaction({
        id: `temp_${Date.now()}`,
        userId: '',
        accountId: selectedAccount,
        categoryId,
        amount: Math.round(amountNum * 100), // переводим в копейки
        type: result.type as any,
        description: description || null,
        date: result.date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setIsSaving(false);
      onClose();
      onComplete();
    } catch (error) {
      setIsSaving(false);
      console.error('Failed to save AI transaction:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить транзакцию');
    }
  }, [result, amount, description, selectedAccount, matchedCategory, addTransaction, addCategory, fetchCategories, onClose, onComplete]);

  if (!result) return null;

  const receiptItems = 'items' in result ? (result as AiReceiptResult).items : undefined;
  const storeName = 'store' in result ? (result as AiReceiptResult).store : undefined;

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View className="flex-1 bg-[rgba(0,0,0,0.7)] justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        <View
          className="bg-[#13131A] rounded-t-3xl"
          style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16, maxHeight: '90%' }}
        >
          <View className="w-9 h-1 bg-[#3A3A3C] rounded-full self-center mt-2 mb-3" />

          {/* Заголовок */}
          <View className="px-4 mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl">🤖</Text>
              <Text bold className="text-lg text-white">Распознано</Text>
            </View>
            <TouchableOpacity onPress={onClose} className="px-3 py-1">
              <Text className="text-[#8E8E93]">Закрыть</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}>
            {/* Тип и категория */}
            <View className="flex-row items-center gap-3 mb-4 bg-[rgba(255,255,255,0.05)] rounded-2xl p-4">
              <View
                className="w-14 h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: colors.bg }}
              >
                <Text className="text-2xl">{result.type === 'INCOME' ? '💰' : '💸'}</Text>
              </View>
              <View className="flex-1">
                <Text bold className="text-base text-white">
                  {result.type === 'INCOME' ? 'Доход' : 'Расход'}
                </Text>
                <View className="flex-row items-center gap-1.5 mt-1">
                  <CategoryIcon
                    icon={matchedCategory?.icon || getCategoryPreset(result.categoryName).icon}
                    color={matchedCategory?.color || getCategoryPreset(result.categoryName).color}
                    size={16}
                  />
                  <Text className="text-sm text-[#EBEBF5]">{result.categoryName}</Text>
                  {isNewCategory && (
                    <View className="bg-[rgba(99,102,241,0.15)] px-2 py-0.5 rounded-full ml-1">
                      <Text className="text-[10px] text-[#6366F1]">новая</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Сумма */}
            <View className="mb-3">
              <Text className="text-xs text-[#8E8E93] mb-1.5">Сумма</Text>
              <View className="flex-row items-center bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3">
                <TextInput
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  className="flex-1 text-white text-xl font-bold"
                  placeholderTextColor="#8E8E93"
                />
                <Text className="text-sm text-[#8E8E93] ml-2">₽</Text>
              </View>
            </View>

            {/* Описание */}
            <View className="mb-3">
              <Text className="text-xs text-[#8E8E93] mb-1.5">Описание</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                className="bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3 text-white text-sm"
                placeholderTextColor="#8E8E93"
                placeholder="Описание транзакции"
              />
            </View>

            {/* Магазин (для чеков) */}
            {storeName && (
              <View className="mb-3 bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3">
                <Text className="text-xs text-[#8E8E93]">Магазин</Text>
                <Text bold className="text-sm text-white mt-0.5">{storeName}</Text>
              </View>
            )}

            {/* Дата */}
            {result.date && (
              <View className="mb-3 bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3">
                <Text className="text-xs text-[#8E8E93]">Дата</Text>
                <Text bold className="text-sm text-white mt-0.5">
                  {new Date(result.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}

            {/* Позиции чека */}
            {receiptItems && receiptItems.length > 0 && (
              <View className="mb-3">
                <TouchableOpacity
                  onPress={() => setShowItems(!showItems)}
                  className="flex-row items-center justify-between bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3"
                >
                  <Text className="text-xs text-[#8E8E93]">Позиции чека ({receiptItems.length})</Text>
                  <Text className="text-xs text-[#6366F1]">{showItems ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showItems && (
                  <View className="mt-2 bg-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden">
                    {receiptItems.map((item, idx) => (
                      <View
                        key={idx}
                        className="flex-row justify-between items-center px-4 py-2.5"
                        style={{
                          borderBottomWidth: idx < receiptItems.length - 1 ? 1 : 0,
                          borderBottomColor: 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <View className="flex-1">
                          <Text className="text-sm text-white">{item.name}</Text>
                          <Text className="text-xs text-[#8E8E93]">{item.categoryName}</Text>
                        </View>
                        <Text bold className="text-sm text-white ml-3">
                          {item.amount} ₽
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Счёт */}
            <View className="mb-4">
              <Text className="text-xs text-[#8E8E93] mb-1.5">Счёт</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {accounts.map((account) => (
                    <TouchableOpacity
                      key={account.id}
                      onPress={() => setSelectedAccount(account.id)}
                      className="px-4 py-2.5 rounded-xl border"
                      style={{
                        backgroundColor:
                          selectedAccount === account.id
                            ? colors.bg
                            : 'rgba(255,255,255,0.05)',
                        borderColor:
                          selectedAccount === account.id
                            ? colors.primary
                            : 'transparent',
                      }}
                    >
                      <Text className="text-sm text-white">{account.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </ScrollView>

          {/* Кнопки */}
          <View className="flex-row px-4 pt-2 gap-2" style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16 }}>
            <TouchableOpacity
              onPress={onClose}
              className="px-6 py-4 rounded-2xl bg-[rgba(255,255,255,0.08)] items-center justify-center"
            >
              <Text bold className="text-sm text-[#8E8E93]">Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving || !amount || !selectedAccount}
              className="flex-1 py-4 rounded-2xl items-center justify-center"
              style={{
                backgroundColor:
                  !amount || !selectedAccount || isSaving
                    ? 'rgba(255,255,255,0.1)'
                    : colors.primary,
                opacity: isSaving ? 0.6 : 1,
              }}
            >
              <Text bold className="text-sm text-white">
                {isSaving ? 'Сохранение...' : '✓ Сохранить'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}