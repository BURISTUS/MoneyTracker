import React, { useMemo } from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';

export default function CategoriesIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const categories = useDataStore((s) => s.categories);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE'),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'INCOME'),
    [categories],
  );

  const renderCategory = (category: typeof categories[0]) => (
    <View
      key={category.id}
      className="flex-row items-center gap-3.5 bg-background-50/30 rounded-[14px] p-3.5"
    >
      <CategoryIcon
        icon={category.icon}
        color={category.color || '#6366F1'}
        size={24}
      />
      <View className="flex-1">
        <Text className="text-base font-medium text-typography-white">
          {category.name}
        </Text>
        <Text className="text-xs text-typography-400">
          {category.isSystem ? 'Системная' : 'Личная'}
        </Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background-0" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xl font-bold text-typography-white mb-4">
          Категории
        </Text>

        <TouchableOpacity
          onPress={() => router.push('/main/categories/create')}
          className="bg-primary-500/10 rounded-[14px] py-4 px-4 border border-primary-500/30 flex-row items-center justify-center gap-2 mb-5"
        >
          <Text className="text-lg font-semibold text-primary-400">
            + Создать категорию
          </Text>
        </TouchableOpacity>

        <Pressable
          onPress={() => router.push('/main/categories/chart')}
          className="bg-background-50/30 rounded-[14px] py-4 px-4 flex-row items-center justify-between mb-5"
        >
          <Text className="text-base font-semibold text-typography-white">
            📊 Диаграмма расходов
          </Text>
          <Text className="text-base text-typography-400">→</Text>
        </Pressable>
      </View>

      <View className="px-4 gap-2">
        {expenseCategories.length > 0 && (
          <>
            <Text className="text-xs font-semibold text-typography-400 mb-1 uppercase">
              Расходы · {expenseCategories.length}
            </Text>
            {expenseCategories.map(renderCategory)}
          </>
        )}

        {incomeCategories.length > 0 && (
          <>
            <Text className="text-xs font-semibold text-typography-400 mt-4 mb-1 uppercase">
              Доходы · {incomeCategories.length}
            </Text>
            {incomeCategories.map(renderCategory)}
          </>
        )}

        {categories.length === 0 && (
          <View className="items-center py-16">
            <Text className="text-xl mb-3">📂</Text>
            <Text className="text-base text-typography-400">Категории не найдены</Text>
          </View>
        )}
      </View>
    </View>
  );
}
