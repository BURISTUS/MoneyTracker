import { useTranslation } from 'react-i18next';
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';
import { ICON_BANK, serializeIcon } from '../../../src/utils/iconBank';
import type { IconDef } from '../../../src/utils/iconBank';
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

export default function CreateCategoryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addCategory = useDataStore((s) => s.addCategory);

  const [name, setName] = useState('');
  const [type, setType] = useState<CategoryType>(CategoryTypeEnum.EXPENSE);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedIconDef, setSelectedIconDef] = useState<IconDef | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState<number>(0);

  const colors = type === 'EXPENSE' ? EXPENSE_COLORS : INCOME_COLORS;

  const filteredIconBank = useMemo(() => {
    if (type === 'INCOME') {
      return ICON_BANK.filter((g) => g.label === t("categories.income"));
    }
    return ICON_BANK.filter((g) => g.label !== t("categories.income"));
  }, [type]);

  const selectedIcon = selectedIconDef ? serializeIcon(selectedIconDef) : '';

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
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <View className="items-center py-8 border-b border-outline-200/50">
            <View
              className="w-[120px] h-[120px] rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: selectedColor || 'rgba(255, 255, 255, 0.1)' }}
            >
              {selectedIconDef ? (
                <CategoryIcon
                  icon={selectedIcon}
                  color="transparent"
                  size={48}
                  showBackground={false}
                />
              ) : (
                <MaterialCommunityIcons name="shape" size={48} color="#8E8E93" />
              )}
            </View>

            <Text className="text-xl font-bold text-typography-white mb-2">
              {name || 'Название категории'}
            </Text>

            <Text className="text-sm text-typography-400">
              {type === 'EXPENSE' ? 'Расход' : 'Доход'}
            </Text>
          </View>

          <View className="p-4">
            <Text className="text-sm font-medium text-typography-400 mb-3">{t("categories.nameLabel")}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Введите название..."
              placeholderTextColor="#8E8E93"
              className={`bg-background-50/30 rounded-xl px-4 py-4 text-lg text-typography-white border ${
                name ? 'border-outline-200' : 'border-transparent'
              }`}
            />
          </View>

          <View className="p-4">
            <Text className="text-sm font-medium text-typography-400 mb-3">{t("categories.typeLabel")}</Text>
            <View className="flex-row gap-3">
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
                  className={`flex-1 py-4 items-center rounded-xl border-2 ${
                    type === tab.key ? '' : 'bg-background-50/30 border-transparent'
                  }`}
                  style={type === tab.key ? { backgroundColor: themeColors.background, borderColor: themeColors.primary } : undefined}
                >
                  <Text
                    className={`text-xl mb-1 ${type === tab.key ? '' : 'text-typography-400'}`}
                    style={type === tab.key ? { color: themeColors.primary } : undefined}
                  >
                    {tab.icon}
                  </Text>
                  <Text className={`text-base font-medium ${type === tab.key ? 'text-typography-white' : 'text-typography-400'}`}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="px-4 py-4 mb-2">
            <Text className="text-xs font-medium text-typography-400 mb-3 uppercase">{t("categories.colorLabel")}</Text>
            <View className="flex-row flex-wrap gap-2.5">
              {colors.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  className={`w-11 h-11 rounded-full items-center justify-center border-[3px] ${
                    selectedColor === color ? 'border-typography-white' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && (
                    <MaterialCommunityIcons name="check" size={24} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="px-4 py-4 mb-2">
            <Text className="text-xs font-medium text-typography-400 mb-3 uppercase">
              {t("categories.iconCountValue", { count: filteredIconBank.reduce((sum, g) => sum + g.icons.length, 0) })}
            </Text>

            {filteredIconBank.map((group, groupIndex) => {
              const isExpanded = expandedGroup === groupIndex;
              const visibleIcons = isExpanded ? group.icons : group.icons.slice(0, 6);

              return (
                <View key={group.label} className="mb-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-xs font-medium text-typography-400 uppercase">
                      {group.label}
                    </Text>
                    {group.icons.length > 6 && (
                      <TouchableOpacity onPress={() => setExpandedGroup(isExpanded ? -1 : groupIndex)}>
                        <Text className="text-xs text-primary-400">
                          {isExpanded ? t('common.collapse') : `t("common.moreCount", { count: group.icons.length - 6 })`}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="flex-row flex-wrap gap-2">
                    {visibleIcons.map((iconDef) => {
                      const isSelected = selectedIcon === serializeIcon(iconDef);
                      return (
                        <TouchableOpacity
                          key={serializeIcon(iconDef)}
                          onPress={() => setSelectedIconDef(iconDef)}
                          className={`w-[52px] h-[52px] rounded-[14px] items-center justify-center border-2 ${
                            isSelected ? '' : 'bg-background-50/30 border-transparent'
                          }`}
                          style={isSelected ? { backgroundColor: themeColors.background, borderColor: themeColors.primary } : undefined}
                        >
                          <MaterialCommunityIcons
                            name={iconDef.name as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                            size={26}
                            color={isSelected ? themeColors.primary : '#EBEBF5'}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View
          className="absolute bottom-0 left-0 right-0 bg-background-0 border-t border-outline-200 p-4"
          style={{ paddingBottom: Math.max(16, insets.bottom + 16) }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!name || !selectedColor || !selectedIcon || isSubmitting}
            className={`rounded-2xl py-4 items-center ${
              !name || !selectedColor || !selectedIcon ? '' : ''
            }`}
            style={{
              backgroundColor: !name || !selectedColor || !selectedIcon
                ? 'rgba(255, 255, 255, 0.1)'
                : themeColors.primary,
              opacity: isSubmitting ? 0.6 : 1,
            }}
          >
            <Text className="text-lg font-bold text-typography-white">
              {isSubmitting ? 'Создание...' : 'Создать категорию'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
