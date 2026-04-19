import React, { useMemo } from 'react';
import { View, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../../src/stores/dataStore';
import { Screen } from '../../../src/components/ui/Screen';
import { Text } from '../../../src/components/ui/Text';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';

export default function CategoriesIndexScreen() {
  const router = useRouter();
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
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 14,
        padding: 14,
      }}
    >
      <CategoryIcon
        icon={category.icon}
        color={category.color || '#6366F1'}
        size={24}
      />
      <View style={{ flex: 1 }}>
        <Text size="md" weight="medium" style={{ color: '#FFFFFF' }}>
          {category.name}
        </Text>
        <Text size="xs" style={{ color: '#8E8E93' }}>
          {category.isSystem ? 'Системная' : 'Личная'}
        </Text>
      </View>
    </View>
  );

  return (
    <Screen style={{ padding: 0 }}>
      <View style={{ flex: 1, backgroundColor: '#0A0A0F' }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text size="xl" weight="bold" style={{ color: '#FFFFFF', marginBottom: 16 }}>
            Категории
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/main/categories/create')}
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 16,
              borderWidth: 1,
              borderColor: 'rgba(99, 102, 241, 0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
            }}
          >
            <Text size="lg" weight="semibold" style={{ color: '#6366F1' }}>
              + Создать категорию
            </Text>
          </TouchableOpacity>

          <Pressable
            onPress={() => router.push('/main/categories/chart')}
            style={{
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <Text size="md" weight="semibold" style={{ color: '#FFFFFF' }}>
              📊 Диаграмма расходов
            </Text>
            <Text size="md" style={{ color: '#8E8E93' }}>→</Text>
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {expenseCategories.length > 0 && (
            <>
              <Text size="xs" weight="semibold" style={{ color: '#8E8E93', marginBottom: 4, textTransform: 'uppercase' }}>
                Расходы · {expenseCategories.length}
              </Text>
              {expenseCategories.map(renderCategory)}
            </>
          )}

          {incomeCategories.length > 0 && (
            <>
              <Text size="xs" weight="semibold" style={{ color: '#8E8E93', marginTop: 16, marginBottom: 4, textTransform: 'uppercase' }}>
                Доходы · {incomeCategories.length}
              </Text>
              {incomeCategories.map(renderCategory)}
            </>
          )}

          {categories.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text size="xl" style={{ marginBottom: 12 }}>📂</Text>
              <Text size="md" style={{ color: '#8E8E93' }}>Категории не найдены</Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
}
