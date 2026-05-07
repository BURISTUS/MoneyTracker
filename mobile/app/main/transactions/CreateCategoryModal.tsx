import { useTranslation } from 'react-i18next';
import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { useTheme } from '../../../src/stores/themeStore';
import { Text } from '../../../components/ui/text';
import type { CategoryType } from '../../../src/types';
import { CategoryType as CategoryTypeEnum } from '../../../src/types';
import { useToast } from '../../../src/components/ui/Toast';
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
  const { t } = useTranslation();
  const router = useRouter();
  const C = useTheme();
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
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <ScrollView contentContainerStyle={{ gap: 24, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text bold className="text-xl" style={{ color: C.textMain }}>{t("categories.newCategory")}</Text>
          <Pressable onPress={onClose}>
            <Text style={{ fontSize: 20, color: C.textSec }}>✕</Text>
          </Pressable>
        </View>

        <View style={{ gap: 16 }}>
          <View>
            <Text className="text-base text-typography-400 mb-2">{t("common.name")}</Text>
            <Text style={{ color: C.textMain, padding: 16, backgroundColor: C.inputBg, borderRadius: 12, marginTop: 8 }}>
              {name}
            </Text>
          </View>

          <View>
            <Text className="text-base text-typography-400 mb-2">{t("common.type")}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setType(CategoryTypeEnum.EXPENSE)}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: type === CategoryTypeEnum.EXPENSE ? C.red : 'transparent',
                  backgroundColor: type === CategoryTypeEnum.EXPENSE ? C.redBg : C.inputBg,
                }}
              >
                <Text bold={type === CategoryTypeEnum.EXPENSE} className={`text-base ${type === CategoryTypeEnum.EXPENSE ? 'text-error-400' : 'text-typography-400'}`}>{t("transactions.expenseTypeLabel")}</Text>
              </Pressable>
              <Pressable
                onPress={() => setType(CategoryTypeEnum.INCOME)}
                style={{
                  flex: 1,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: 'center',
                  borderWidth: 2,
                  borderColor: type === CategoryTypeEnum.INCOME ? C.green : 'transparent',
                  backgroundColor: type === CategoryTypeEnum.INCOME ? C.greenBg : C.inputBg,
                }}
              >
                <Text bold={type === CategoryTypeEnum.INCOME} className={`text-base ${type === CategoryTypeEnum.INCOME ? 'text-success-400' : 'text-typography-400'}`}>{t("transactions.incomeTypeLabel")}</Text>
              </Pressable>
            </View>
          </View>

          <View>
            <Text className="text-base text-typography-400 mb-2">{t("categories.colorLabel")}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {colors.map((color) => (
                <Pressable
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
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
            <Text className="text-base text-typography-400 mb-2">{t("categories.iconLabel")}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {icons.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    backgroundColor: selectedIcon === icon ? C.card : C.inputBg,
                    borderColor: selectedIcon === icon ? C.primary : C.border,
                  }}
                >
                  <Text className="text-3xl">{icon}</Text>
                  {selectedIcon === icon && (
                    <Text style={{ fontSize: 20, color: C.primary, position: 'absolute', right: 8, top: 4 }}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-base text-typography-400 mb-2">{t("common.createdAt")}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
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
                    style={{
                      flex: 1,
                      borderRadius: 100,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: dateRange === dr ? C.primaryBg : C.inputBg,
                    }}
                  >
                    <Text bold={dateRange === dr} style={{ fontSize: 16, color: dateRange === dr ? C.textMain : C.textSec }}>
                      {labels[dr]}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setShowDatePicker(true)}
                style={{
                  flex: 1,
                  borderRadius: 100,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: dateRange === 'custom' ? C.primaryBg : C.inputBg,
                }}
              >
                <Text bold={dateRange === 'custom'} style={{ fontSize: 16, color: dateRange === 'custom' ? C.textMain : C.textSec }}>
                  {customDate.toLocaleDateString('ru-RU')}
                </Text>
                <Ionicons name="calendar-outline" size={16} color={C.primary} />
              </Pressable>
            </View>
          </View>

          {showDatePicker && (
            <View style={{ backgroundColor: C.overlay, padding: 24, borderRadius: 16 }}>
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
                textColor={C.textMain}
                accentColor={C.primary}
              />
            </View>
          )}

          <Pressable
            onPress={handleCreate}
            disabled={!name || !selectedColor || !selectedIcon}
            style={{
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              backgroundColor: !name || !selectedColor || !selectedIcon ? C.divider : C.primary,
            }}
          >
            <Text bold className="text-lg" style={{ color: C.textMain }}>{t("categories.create")}</Text>
          </Pressable>

          <View style={{ marginTop: 16 }}>
            <Pressable
              onPress={handleReset}
              style={{ paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: C.inputBg }}
            >
              <Text className="text-base text-typography-400">{t("common.reset")}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
    </Modal>
  );
}
