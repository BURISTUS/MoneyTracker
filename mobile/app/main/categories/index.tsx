import React, { useMemo, useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { useTheme } from '../../../src/stores/themeStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from '../../../src/components/ui/CategoryIcon';
import { CategoryEditModal } from '../../../src/components/ui/CategoryEditModal';
import { formatCurrency } from '../../../src/utils/formatters';
import { useToast } from '../../../src/components/ui/Toast';
import categoriesService from '../../../src/services/categories';
import type { Category } from '../../../src/types';

export default function CategoriesIndexScreen() {
  const C = useTheme();
  const S = StyleSheet.create({
    header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: C.textMain },
    sectionTitle: { fontSize: 12, fontWeight: '600', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    sectionGap: { marginTop: 20 },
    actions: { paddingHorizontal: 16, marginTop: 8, marginBottom: 6 },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 13, paddingHorizontal: 16, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
    actionIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    actionText: { fontSize: 14, fontWeight: '500', color: C.textMain },
    list: { paddingHorizontal: 16 },
    categoryCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
    categoryIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    categoryInfo: { flex: 1 },
    categoryName: { fontSize: 14, fontWeight: '600', color: C.textMain },
    categorySub: { fontSize: 12, color: C.textSec, marginTop: 2 },
    limitBar: { height: 4, borderRadius: 2, backgroundColor: C.divider, overflow: 'hidden', marginTop: 6 },
    limitFill: { height: 4, borderRadius: 2 },
    limitLabel: { fontSize: 11, fontWeight: '500', marginTop: 4 },
    chevron: { marginLeft: 'auto' },
    empty: { alignItems: 'center', paddingVertical: 48 },
  });
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();  const categories = useDataStore((s) => s.categories);
  const transactions = useDataStore((s) => s.transactions);
  const fetchCategories = useDataStore((s) => s.fetchCategories);
  const checkAccess = useSubscriptionStore((s) => s.checkAccess);
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);

  const categoryLimit = checkAccess('PERSONAL_CATEGORIES');
  const maxCategories = categoryLimit?.limit ?? Infinity;
  const personalCount = categories.length;
  const canCreate = personalCount < maxCategories;

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const categoryTotals = useMemo(() => {
    const map = new Map<string, { expense: number }>();
    transactions
      .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth)
      .forEach((t) => {
        const entry = map.get(t.categoryId) || { expense: 0 };
        entry.expense += t.amount;
        map.set(t.categoryId, entry);
      });
    return map;
  }, [transactions]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE'),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'INCOME'),
    [categories],
  );

  const handleSave = async (data: { name: string; icon?: string; color?: string; excludeFromTotal: boolean; monthlyLimit: number | null }) => {
    if (!editingCategory) return;
    try {
      const body: Record<string, unknown> = {};
      if (data.name !== editingCategory.name) body.name = data.name;
      body.icon = data.icon;
      body.color = data.color;
      body.excludeFromTotal = data.excludeFromTotal;
      body.monthlyLimit = data.monthlyLimit;
      await categoriesService.update(editingCategory.id, body);
      await fetchCategories();
      setEditingCategory(null);
    } catch (error: any) {
      toast.showError(error?.message || t('categories.saveError'));
    }
  };

  const handleDelete = async (categoryId: string) => {
    try {
      await categoriesService.delete(categoryId);
      await fetchCategories();
      toast.showSuccess(t('categories.deletedMsg'));
    } catch (error: any) {
      toast.showError(error?.message || t('categories.deleteError'));
    }
  };

  const renderCategory = (category: Category) => {
    const totals = categoryTotals.get(category.id);
    const spent = totals?.expense ?? 0;
    const monthlyLimitKopecks = category.monthlyLimit;
    const hasLimit = monthlyLimitKopecks !== null && monthlyLimitKopecks !== undefined && monthlyLimitKopecks > 0;
    const limitProgress = hasLimit ? Math.min(spent / monthlyLimitKopecks, 1) : 0;
    const limitOver = hasLimit && spent > monthlyLimitKopecks;

    return (
      <Pressable
        key={category.id}
        onPress={() => setEditingCategory(category)}
        style={S.categoryCard}
      >
        <View style={[S.categoryIconWrap, { backgroundColor: `${category.color || C.primary}18` }]}>
          <CategoryIcon icon={category.icon} color={category.color || C.primary} size={20} />
        </View>
        <View style={S.categoryInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={S.categoryName}>{category.name}</Text>
            {category.excludeFromTotal && (
              <Ionicons name="eye-off-outline" size={13} color={C.textMuted} />
            )}
            {hasLimit && limitOver && (
              <Ionicons name="warning" size={13} color={C.red} />
            )}
          </View>
          {spent > 0 ? (
            <Text style={S.categorySub}>{formatCurrency(spent)} {t("categories.monthlyTotal")}</Text>
          ) : (
            <Text style={S.categorySub}>{t("categories.noTransactionsMonth")}</Text>
          )}

          {hasLimit && (
            <>
              <View style={S.limitBar}>
                <View
                  style={[
                    S.limitFill,
                    {
                      width: `${limitProgress * 100}%`,
                      backgroundColor: limitOver ? C.red : limitProgress > 0.8 ? C.orange : C.green,
                    },
                  ]}
                />
              </View>
              <Text style={[S.limitLabel, { color: limitOver ? C.red : C.textSec }]}>
                {formatCurrency(spent)} / {formatCurrency(monthlyLimitKopecks)}
              </Text>
            </>
          )}
        </View>
        <Ionicons name="create-outline" size={18} color={C.textMuted} style={S.chevron} />
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={S.header}>
          <Text style={S.headerTitle}>{t("categories.title")}</Text>
        </View>

        <View style={S.actions}>
          <Pressable
            onPress={() => {
              if (!canCreate) {
                showPaywall('PERSONAL_CATEGORIES');
                return;
              }
              router.push('/main/categories/create');
            }}
            style={S.actionBtn}
          >
            <View style={[S.actionIconWrap, { backgroundColor: canCreate ? C.primaryBg : '#F59E0B15' }]}>
              {canCreate ? (
                <Ionicons name="add" size={18} color={C.primary} />
              ) : (
                <Ionicons name="lock-closed" size={18} color="#F59E0B" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[S.actionText, { color: canCreate ? C.primary : C.textMain }]}>
                {t('categories.create')}
              </Text>
              {!canCreate && (
                <Text style={{ fontSize: 11, color: '#F59E0B', marginTop: 2 }}>
                  {personalCount}/{maxCategories} · Premium
                </Text>
              )}
            </View>
            {!canCreate && (
              <View style={{ backgroundColor: '#F59E0B', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFF' }}>PRO</Text>
              </View>
            )}
          </Pressable>

          <Pressable onPress={() => router.push('/main/categories/chart')} style={S.actionBtn}>
            <View style={[S.actionIconWrap, { backgroundColor: C.greenBg }]}>
              <Ionicons name="bar-chart" size={18} color={C.green} />
            </View>
            <Text style={S.actionText}>{t("categories.expenseChart")}</Text>
          </Pressable>
        </View>

        <View style={S.list}>
          {expenseCategories.length > 0 && (
            <>
              <Text style={S.sectionTitle}>{t("transactions.expenses")} · {expenseCategories.length}</Text>
              {expenseCategories.map(renderCategory)}
            </>
          )}

          {incomeCategories.length > 0 && (
            <>
              <Text style={[S.sectionTitle, S.sectionGap]}>{t("categories.income")} · {incomeCategories.length}</Text>
              {incomeCategories.map(renderCategory)}
            </>
          )}

          {categories.length === 0 && (
            <View style={S.empty}>
              <Ionicons name="folder-open-outline" size={48} color={C.textMuted} />
              <Text style={{ fontSize: 15, color: C.textSec, marginTop: 8 }}>{t("categories.noCategories")}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {editingCategory && (
        <CategoryEditModal
          visible={!!editingCategory}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
}
