import React, { useState, useCallback } from 'react';
import { View, ScrollView, Alert, Pressable, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { Button } from '../../../src/components/ui/Button';
import { Icon } from '../../../src/components/ui/Icon';
import { useTheme } from '../../../src/theme';
import type { CategoryType } from '../../../src/types';
import { CategoryType as CategoryTypeEnum } from '../../../src/types';
import DateTimePicker, {
  DateTimePickerEvent,
  DateTimePickerAndroid,
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
  const { spacing } = useTheme();
  const router = useRouter();
  const addCategory = useDataStore((s) => s.addCategory);

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
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
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
      Alert.alert('Ошибка', 'Не удалось создать категорию');
      console.error('Failed to create category:', error);
    }
  }, [name, type, selectedColor, selectedIcon, addCategory, onCreate, handleReset]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <ScrollView contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text size="xl" weight="bold" style={{ color: '#FFFFFF' }}>
            Новая категория
          </Text>
          <Pressable onPress={onClose}>
            <Text size="xl" style={{ color: '#71717A' }}>✕</Text>
          </Pressable>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text size="md" style={{ color: '#71717A', marginBottom: 8 }}>
              Название
            </Text>
            <Text
              style={{
                color: '#FFFFFF',
                padding: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 12,
                marginTop: 8,
              }}
            >
              {name}
            </Text>
          </View>

          <View>
            <Text size="md" style={{ color: '#71717A', marginBottom: 8 }}>
              Тип
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setType(CategoryTypeEnum.EXPENSE)}
                style={{
                  flex: 1,
                  backgroundColor:
                    type === CategoryTypeEnum.EXPENSE
                      ? 'rgba(248, 113, 113, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor:
                    type === CategoryTypeEnum.EXPENSE ? '#F87171' : 'transparent',
                }}
              >
                <Text
                  size="md"
                  weight={type === CategoryTypeEnum.EXPENSE ? 'semibold' : 'regular'}
                  style={{
                    color: type === CategoryTypeEnum.EXPENSE ? '#F87171' : '#A1A1AA',
                  }}
                >
                  ⛔ Расход
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setType(CategoryTypeEnum.INCOME)}
                style={{
                  flex:  1,
                  backgroundColor:
                    type === CategoryTypeEnum.INCOME
                      ? 'rgba(52, 211, 153, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor:
                    type === CategoryTypeEnum.INCOME ? '#34D399' : 'transparent',
                }}
              >
                <Text
                  size="md"
                  weight={type === CategoryTypeEnum.INCOME ? 'semibold' : 'regular'}
                  style={{
                    color: type === CategoryTypeEnum.INCOME ? '#34D399' : '#A1A1AA',
                  }}
                >
                  ✅ Доход
                </Text>
              </Pressable>
            </View>
          </View>

          <View>
            <Text size="md" style={{ color: '#71717A', marginBottom: 8 }}>
              Цвет
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {colors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 3 : 1,
                    borderColor: selectedColor === color ? '#FFFFFF' : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {selectedColor === color && (
                    <Text size="xl" style={{ color: '#FFFFFF' }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text size="md" style={{ color: '#71717A', marginBottom: 8 }}>
              Иконка
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {icons.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    backgroundColor:
                      selectedIcon === icon
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(255, 255, 255, 0.03)',
                    borderWidth: 2,
                    borderColor:
                      selectedIcon === icon ? '#6366F1' : 'rgba(255, 255, 255, 0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text size="xxxl">{icon}</Text>
                  {selectedIcon === icon && (
                    <Text size="xl" style={{ color: '#6366F1', position: 'absolute', right: 8, top: 4 }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text size="md" style={{ color: '#71717A', marginBottom: 8 }}>
              Дата создания
            </Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => {
                  setDateRange('today');
                  setCustomDate(new Date());
                }}
                style={{
                  flex: 1,
                  backgroundColor:
                    dateRange === 'today'
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  size="md"
                  weight={dateRange === 'today' ? 'semibold' : 'regular'}
                  style={{
                    color: dateRange === 'today' ? '#FFFFFF' : '#A1A1AA',
                  }}
                >
                  Сегодня
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDateRange('yesterday');
                  setCustomDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
                }}
                style={{
                  flex: 1,
                  backgroundColor:
                    dateRange === 'yesterday'
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  size="md"
                  weight={dateRange === 'yesterday' ? 'semibold' : 'regular'}
                  style={{
                    color: dateRange === 'yesterday' ? '#FFFFFF' : '#A1A1AA',
                  }}
                >
                  Вчера
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDateRange('day_before_yesterday');
                  setCustomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000));
                }}
                style={{
                  flex: 1,
                  backgroundColor:
                    dateRange === 'day_before_yesterday'
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
              >
                <Text
                  size="md"
                  weight={dateRange === 'day_before_yesterday' ? 'semibold' : 'regular'}
                  style={{
                    color: dateRange === 'day_before_yesterday' ? '#FFFFFF' : '#A1A1AA',
                  }}
                >
                  Позавчера
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setShowDatePicker(true);
                }}
                style={{
                  flex: 1,
                  backgroundColor:
                    dateRange === 'custom'
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Text
                  size="md"
                  weight={dateRange === 'custom' ? 'semibold' : 'regular'}
                  style={{
                    color: dateRange === 'custom' ? '#FFFFFF' : '#A1A1AA',
                  }}
                >
                  {customDate.toLocaleDateString('ru-RU')}
                </Text>
                <Icon name="calendar" size={16} color="#6366F1" />
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <View style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 24,
              borderRadius: 16,
            }}>
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

          <Button
            onPress={handleCreate}
            fullWidth
            size="lg"
            disabled={!name || !selectedColor || !selectedIcon}
          >
            Создать категорию
          </Button>

          <View style={{ marginTop: 16 }}>
            <Button
              onPress={handleReset}
              fullWidth
              size="md"
              variant="ghost"
            >
              Сбросить
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
    </Modal>
  );
}
