import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import type { CategoryType } from '../../../src/types';
import { CategoryType as CategoryTypeEnum } from '../../../src/types';
import { useToast } from '../../../src/components/ui/Toast';
import { ToastContainer } from '../../../src/components/ui/Toast';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

const EXPENSE_COLORS = [
  '#F87171', '#FBBF24', '#F59E0B', '#EAB308', '#F472B6', '#34D399',
];

const INCOME_COLORS = [
  '#6366F1', '#3B82F6', '#34D399', '#F472B6', '#A855F7', '#EC4899',
];

const CATEGORY_ICONS = {
  EXPENSE: ['🛒', '🍕', '🚕', '🎬', '🛍', '💰'],
  INCOME: ['💰', '💼', '🎁', '📈', '💸'],
};

type DateRangeType = 'today' | 'yesterday' | 'day_before_yesterday' | 'custom';

interface CreateCategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: () => void;
}

export function CreateCategoryModal({ visible, onClose, onCreate }: CreateCategoryModalProps) {
  const router = useRouter();
  const addCategory = useDataStore((s) => s.addCategory);
  const { showError } = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(CategoryTypeEnum.EXPENSE);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeType>('today');
  const [customDate, setCustomDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const colors = type === CategoryTypeEnum.EXPENSE ? EXPENSE_COLORS : INCOME_COLORS;
  const icons = type === CategoryTypeEnum.EXPENSE ? CATEGORY_ICONS.EXPENSE : CATEGORY_ICONS.INCOME;

  const handleDateSelect = useCallback((date: Date) => {
    setCustomDate(date);
    setShowDatePicker(false);
    setDateRange('custom');
  }, []);

  const handleReset = useCallback(() => {
    setName('');
    setType(CategoryTypeEnum.EXPENSE);
    setSelectedColor('');
    setSelectedIcon('');
    setDateRange('today');
    setCustomDate(new Date());
  }, []);

  const handleCreate = useCallback(async () => {
    if (!name || !selectedColor || !selectedIcon) {
      showError('Заполните все поля');
      return;
    }

    try {
      await addCategory({
        name,
        type,
        icon: selectedIcon,
        color: selectedColor,
      });
      handleReset();
      onCreate();
    } catch (error) {
      showError('Не удалось создать категорию');
      console.error('Failed to create category:', error);
    }
  }, [name, type, selectedColor, selectedIcon, addCategory, onCreate, handleReset]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-[#0A0A0F]">
        <View style={{ position: 'relative' }}>
          <ToastContainer />
        </View>
        <ScrollView contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        <View className="flex-row justify-between items-center">
          <Text bold className="text-xl text-white">Новая категория</Text>
          <Pressable onPress={onClose}>
            <Text className="text-xl text-typography-400">✕</Text>
          </Pressable>
        </View>

        <View className="gap-4">
          <View>
            <Text className="text-base text-typography-400 mb-2">Название</Text>
            <Text className="text-white p-4 bg-[rgba(255,255,255,0.05)] rounded-xl mt-2">
              {name}
            </Text>
          </View>

          <View>
            <Text className="text-base text-typography-400 mb-2">Тип</Text>
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setType(CategoryTypeEnum.EXPENSE)}
                className={`flex-1 rounded-xl py-4 items-center border-2 ${
                  type === CategoryTypeEnum.EXPENSE ? 'border-error-400' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: type === CategoryTypeEnum.EXPENSE
                    ? 'rgba(248, 113, 113, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Text bold={type === CategoryTypeEnum.EXPENSE} className={`text-base ${type === CategoryTypeEnum.EXPENSE ? 'text-error-400' : 'text-typography-400'}`}>
                  ⛔ Расход
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setType(CategoryTypeEnum.INCOME)}
                className={`flex-1 rounded-xl py-4 items-center border-2 ${
                  type === CategoryTypeEnum.INCOME ? 'border-success-400' : 'border-transparent'
                }`}
                style={{
                  backgroundColor: type === CategoryTypeEnum.INCOME
                    ? 'rgba(52, 211, 153, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                }}
              >
                <Text bold={type === CategoryTypeEnum.INCOME} className={`text-base ${type === CategoryTypeEnum.INCOME ? 'text-success-400' : 'text-typography-400'}`}>
                  ✅ Доход
                </Text>
              </Pressable>
            </View>
          </View>

          <View>
            <Text className="text-base text-typography-400 mb-2">Цвет</Text>
            <View className="flex-row flex-wrap gap-3">
              {colors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 3 : 1,
                    borderColor: selectedColor === color ? '#FFFFFF' : 'transparent',
                  }}
                >
                  {selectedColor === color && (
                    <Text className="text-xl text-white">✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-base text-typography-400 mb-2">Иконка</Text>
            <View className="flex-row flex-wrap gap-3">
              {icons.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  className="w-16 h-16 rounded-2xl items-center justify-center border-2"
                  style={{
                    backgroundColor: selectedIcon === icon
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(255, 255, 255, 0.03)',
                    borderColor: selectedIcon === icon ? '#6366F1' : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Text className="text-3xl">{icon}</Text>
                  {selectedIcon === icon && (
                    <Text className="text-xl text-primary-400 absolute right-2 top-1">✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-base text-typography-400 mb-2">Дата создания</Text>
            <View className="flex-row gap-2">
              {(['today', 'yesterday', 'day_before_yesterday'] as DateRangeType[]).map((dr) => {
                const labels: Record<string, string> = { today: 'Сегодня', yesterday: 'Вчера', day_before_yesterday: 'Позавчера' };
                const handlers: Record<string, () => void> = {
                  today: () => { setDateRange('today'); setCustomDate(new Date()); },
                  yesterday: () => { setDateRange('yesterday'); setCustomDate(new Date(Date.now() - 86400000)); },
                  day_before_yesterday: () => { setDateRange('day_before_yesterday'); setCustomDate(new Date(Date.now() - 2 * 86400000)); },
                };
                return (
                  <Pressable
                    key={dr}
                    onPress={handlers[dr]}
                    className={`flex-1 rounded-full px-4 py-3 items-center ${
                      dateRange === dr ? 'bg-[rgba(99,102,241,0.2)]' : 'bg-[rgba(255,255,255,0.05)]'
                    }`}
                  >
                    <Text bold={dateRange === dr} className={`text-base ${dateRange === dr ? 'text-white' : 'text-typography-400'}`}>
                      {labels[dr]}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setShowDatePicker(true)}
                className={`flex-1 rounded-full px-4 py-3 flex-row items-center gap-2 ${
                  dateRange === 'custom' ? 'bg-[rgba(99,102,241,0.2)]' : 'bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                <Text bold={dateRange === 'custom'} className={`text-base ${dateRange === 'custom' ? 'text-white' : 'text-typography-400'}`}>
                  {customDate.toLocaleDateString('ru-RU')}
                </Text>
                <Ionicons name="calendar-outline" size={16} color="#6366F1" />
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <View className="bg-[rgba(0,0,0,0.8)] p-6 rounded-2xl">
              <DateTimePicker
                value={customDate}
                mode="date"
                display="default"
                onChange={(event: DateTimePickerEvent) => {
                  if (event.type === 'set' && event.nativeEvent.timestamp) {
                    setCustomDate(new Date(event.nativeEvent.timestamp));
                    setShowDatePicker(false);
                  }
                }}
                maximumDate={new Date()}
                minimumDate={new Date(2020, 0, 1)}
                textColor="#FFFFFF"
                accentColor="#6366F1"
              />
            </View>
          )}

          <Pressable
            onPress={handleCreate}
            disabled={!name || !selectedColor || !selectedIcon}
            className={`py-4 rounded-xl items-center ${
              !name || !selectedColor || !selectedIcon
                ? 'bg-[rgba(255,255,255,0.1)]'
                : 'bg-primary-500'
            }`}
          >
            <Text bold className="text-lg text-white">Создать категорию</Text>
          </Pressable>

          <View className="mt-4">
            <Pressable
              onPress={handleReset}
              className="py-3 rounded-xl items-center bg-[rgba(255,255,255,0.04)]"
            >
              <Text className="text-base text-typography-400">Сбросить</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
    </Modal>
  );
}
