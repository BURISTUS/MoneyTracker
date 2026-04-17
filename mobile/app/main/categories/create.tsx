import React, { useState, useCallback } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { useTheme } from '../../../src/theme';
import type { CategoryType } from '../../../src/types';
import { CategoryType as CategoryTypeEnum } from '../../../src/types';

const EXPENSE_COLORS = [
  '#FF3B30', '#FF9500', '#FFCC00', '#FF2D55', '#FF6B6B', '#FF8787',
  '#34C759', '#30D158', '#5AC8FA', '#64D2FF', '#007AFF', '#5E5CE6',
  '#5856D6', '#AF52DE', '#BF5AF2', '#FF453A', '#FF9F0A',
];

const INCOME_COLORS = [
  '#34C759', '#30D158', '#32D74B', '#00C7BE', '#5AC8FA', '#64D2FF',
  '#007AFF', '#0A84FF', '#5856D6', '#5E5CE6', '#AF52DE', '#BF5AF2',
  '#FF2D55', '#FF453A', '#FF9F0A', '#FFCC00',
];

const ICONS = {
  FOOD: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥤', '☕'],
  TRANSPORT: ['🚗', '🚕', '🚌', '🚇', '🚲', '✈️', '🛫', '🚂'],
  HOME: ['🏠', '🏢', '🏡', '🛖', '🏨', '🏥', '🏫', '🛒'],
  SHOPPING: ['👕', '👗', '👟', '💄', '💍', '👜', '🎁', '📱'],
  ENTERTAINMENT: ['🎬', '🎮', '🎵', '📺', '🎨', '🎭', '🎪', '🎯'],
  HEALTH: ['💊', '🏥', '🩺', '🚑', '🦠', '🧬', '🧪', '🩹'],
  FINANCE: ['💰', '💳', '💸', '📊', '💹', '💲', '🏦', '💎'],
  OTHER: ['⭐', '🎁', '❤️', '🔥', '✨', '🌟', '💫', '🎉'],
};

type IconCategory = keyof typeof ICONS;

export default function CreateCategoryScreen() {
  const router = useRouter();
  const { spacing } = useTheme();
  const addCategory = useDataStore((s) => s.addCategory);

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(CategoryTypeEnum.EXPENSE);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('');
  const [limit, setLimit] = useState('');
  const [isHidden, setIsHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = type === 'EXPENSE' ? EXPENSE_COLORS : INCOME_COLORS;

  const handleSubmit = useCallback(async () => {
    if (!name || !selectedColor || !selectedIcon) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addCategory({
        name,
        type,
        icon: selectedIcon,
        color: selectedColor,
        isBaseNeed: false,
      });

      router.back();
    } catch (error) {
      console.error('Failed to create category:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [name, type, selectedColor, selectedIcon, addCategory, router]);

  const themeColors = type === 'EXPENSE'
    ? {
        primary: '#FF3B30',
        background: 'rgba(255, 59, 48, 0.1)',
      }
    : {
        primary: '#34C759',
        background: 'rgba(52, 199, 89, 0.1)',
      };

  return (
    <Screen style={{ padding: 0 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Preview */}
          <View
            style={{
              alignItems: 'center',
              paddingVertical: 32,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: selectedColor || 'rgba(255, 255, 255, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text size="display" style={{ lineHeight: 64 }}>
              {selectedIcon || '💰'}
            </Text>
          </View>

          <Text
            size="xl"
            weight="bold"
            style={{
              color: '#FFFFFF',
              marginBottom: 8,
            }}
          >
            {name || 'Название категории'}
          </Text>

          <Text size="sm" style={{ color: '#8E8E93' }}>
            {type === 'EXPENSE' ? 'Расход' : 'Доход'}
          </Text>
        </View>

        {/* Name input */}
        <View style={{ padding: 16 }}>
          <Text
            size="sm"
            weight="medium"
            style={{
              color: '#8E8E93',
              marginBottom: 12,
            }}
          >
            НАЗВАНИЕ
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Введите название..."
            placeholderTextColor="#8E8E93"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
              color: '#FFFFFF',
              fontSize: 18,
              borderWidth: 1,
              borderColor: name ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
            }}
          />
        </View>

        {/* Type selector */}
        <View style={{ padding: 16 }}>
          <Text
            size="sm"
            weight="medium"
            style={{
              color: '#8E8E93',
              marginBottom: 12,
            }}
          >
            ТИП ОПЕРАЦИИ
          </Text>
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
            }}
          >
            {[
              { key: CategoryTypeEnum.EXPENSE, label: 'Расход', icon: '−' },
              { key: CategoryTypeEnum.INCOME, label: 'Доход', icon: '+' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  setType(tab.key as CategoryType);
                  setSelectedColor('');
                }}
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  alignItems: 'center',
                  backgroundColor:
                    type === tab.key ? themeColors.background : 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor:
                    type === tab.key ? themeColors.primary : 'transparent',
                }}
              >
                <Text
                  size="xl"
                  style={{
                    color: type === tab.key ? themeColors.primary : '#8E8E93',
                    marginBottom: 4,
                  }}
                >
                  {tab.icon}
                </Text>
                <Text
                  size="md"
                  weight="medium"
                  style={{
                    color: type === tab.key ? '#FFFFFF' : '#8E8E93',
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color palette */}
        <View style={{ padding: 16, marginBottom: 8 }}>
          <Text
            size="xs"
            weight="medium"
            style={{
              color: '#8E8E93',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            Цвет
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 12 }}
          >
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 3,
                  borderColor:
                    selectedColor === color ? '#FFFFFF' : 'transparent',
                }}
              >
                {selectedColor === color && (
                  <Text size="lg" style={{ color: '#FFFFFF' }}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Icon catalog */}
        <View style={{ padding: 16, marginBottom: 8 }}>
          <Text
            size="xs"
            weight="medium"
            style={{
              color: '#8E8E93',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            Иконка
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={{ maxHeight: 350 }}
          >
            {Object.entries(ICONS).map(([category, icons]) => (
              <View key={category} style={{ marginBottom: 20 }}>
                <Text
                  size="xs"
                  weight="medium"
                  style={{
                    color: '#8E8E93',
                    marginBottom: 12,
                    textTransform: 'uppercase',
                  }}
                >
                  {category}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  {icons.map((icon, iconIndex) => (
                    <TouchableOpacity
                      key={`${category}_${iconIndex}`}
                      onPress={() => setSelectedIcon(icon)}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 16,
                        backgroundColor:
                          selectedIcon === icon
                            ? themeColors.background
                            : 'rgba(255, 255, 255, 0.05)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 2,
                        borderColor:
                          selectedIcon === icon
                            ? themeColors.primary
                            : 'transparent',
                      }}
                    >
                      <Text size="xxl" style={{ lineHeight: 32 }}>
                        {icon}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Budget limit */}
        <View style={{ padding: 16, marginBottom: 8 }}>
          <Text
            size="xs"
            weight="medium"
            style={{
              color: '#8E8E93',
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            БЮДЖЕТНЫЙ ЛИМИТ
          </Text>
          <View
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            <Text size="lg" style={{ color: '#FFFFFF' }}>
              {limit || 'Не установлен'}
            </Text>
          </View>
        </View>

        {/* Hide toggle */}
        <View style={{ padding: 16, marginBottom: 8 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            <Text size="md" style={{ color: '#FFFFFF' }}>
              Скрыть из отчетов
            </Text>
            <TouchableOpacity
              onPress={() => setIsHidden(!isHidden)}
              style={{
                width: 52,
                height: 28,
                borderRadius: 14,
                backgroundColor: isHidden
                  ? '#34C759'
                  : 'rgba(255, 255, 255, 0.1)',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingHorizontal: 4,
              }}
            >
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#FFFFFF',
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Create button */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0A0A0F',
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.1)',
          padding: 16,
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!name || !selectedColor || !selectedIcon || isSubmitting}
          style={{
            backgroundColor:
              !name || !selectedColor || !selectedIcon
                ? 'rgba(255, 255, 255, 0.1)'
                : themeColors.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: isSubmitting ? 0.6 : 1,
          }}
        >
          <Text size="lg" weight="bold" style={{ color: '#FFFFFF' }}>
            {isSubmitting ? 'Создание...' : 'Создать категорию'}
          </Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
