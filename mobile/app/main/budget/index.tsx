import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, Pressable, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../../src/utils/formatters';
import type { Budget, Category } from '../../../src/types';

const BORDER = 'rgba(255,255,255,0.08)';
const CARD_BG = '#141418';

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const budgets = useDataStore((s) => s.budgets);
  const categories = useDataStore((s) => s.categories);
  const createBudget = useDataStore((s) => s.createBudget);
  const updateBudget = useDataStore((s) => s.updateBudget);
  const deleteBudgetApi = useDataStore((s) => s.deleteBudgetApi);

  const [showAdd, setShowAdd] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState(80);

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    budget: Budget | null;
    amount: string;
    alertThreshold: number;
  }>({ visible: false, budget: null, amount: '', alertThreshold: 80 });

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'EXPENSE'),
    [categories]
  );

  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + (b.spent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;

  const getBudgetColor = (percent: number, threshold: number) => {
    if (percent > 100) return '#F87171';
    if (percent >= threshold) return '#FBBF24';
    return '#34D399';
  };

  const handleCreate = useCallback(async () => {
    if (!selectedCategoryId || !amount) return;
    try {
      await createBudget({
        categoryId: selectedCategoryId,
        amount: Math.round(Number(amount) * 100),
        alertThreshold,
      });
      setShowAdd(false);
      setSelectedCategoryId(null);
      setAmount('');
      setAlertThreshold(80);
    } catch (error) {
      console.error('Failed to create budget:', error);
    }
  }, [selectedCategoryId, amount, alertThreshold, createBudget]);

  const openEdit = useCallback((budget: Budget) => {
    setEditModal({
      visible: true,
      budget,
      amount: String(Math.round(Number(budget.amount) / 100)),
      alertThreshold: budget.alertThreshold || 80,
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editModal.budget) return;
    try {
      await updateBudget(editModal.budget.id, {
        amount: Math.round(Number(editModal.amount) * 100),
        alertThreshold: editModal.alertThreshold,
      });
      setEditModal({ visible: false, budget: null, amount: '', alertThreshold: 80 });
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  }, [editModal, updateBudget]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Удалить бюджет?', 'Это действие нельзя отменить', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBudgetApi(id);
          } catch (error) {
            console.error('Failed to delete budget:', error);
          }
        },
      },
    ]);
  }, [deleteBudgetApi]);

  const renderBudget = useCallback(({ item }: { item: Budget }) => {
    const percent = item.percentUsed || item.progress || 0;
    const threshold = item.alertThreshold || 80;
    const color = getBudgetColor(percent, threshold);
    const category = item.category || categories.find((c) => c.id === item.categoryId);

    return (
      <Pressable onPress={() => openEdit(item)} style={{ backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 18, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#E4E4E7', flex: 1 }} numberOfLines={1}>
            {category?.name || 'Категория'}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: '700', color }}>{Math.round(percent)}%</Text>
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 10 }}>
          <View style={{ height: 6, borderRadius: 3, width: `${Math.min(percent, 100)}%`, backgroundColor: color }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 12, color: '#52525B' }}>{formatCurrency(item.spent || 0)}</Text>
          <Text style={{ fontSize: 12, color: '#52525B' }}>из {formatCurrency(item.amount)}</Text>
        </View>
      </Pressable>
    );
  }, [categories, openEdit]);

  const keyExtractor = useCallback((item: Budget) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F', paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 }}>
        <Ionicons name="wallet-outline" size={22} color="#6366F1" />
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 }}>Бюджеты</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 18, marginBottom: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(99,102,241,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Ionicons name="pie-chart-outline" size={18} color="#6366F1" />
          </View>
          <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Свободно в этом месяце</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', letterSpacing: -1, marginBottom: 14, color: totalRemaining >= 0 ? '#34D399' : '#F87171' }}>
            {totalRemaining >= 0 ? '+' : ''}{formatCurrency(totalRemaining)}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#52525B', marginBottom: 3 }}>Лимит</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#D4D4D8' }}>{formatCurrency(totalBudget)}</Text>
            </View>
            <View style={{ width: 1, backgroundColor: BORDER, marginHorizontal: 16, alignSelf: 'stretch' }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#52525B', marginBottom: 3 }}>Потрачено</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#F87171' }}>{formatCurrency(totalSpent)}</Text>
            </View>
          </View>
        </View>

        <Text style={{ fontSize: 16, fontWeight: '600', color: '#A1A1AA', marginBottom: 10, marginTop: 4 }}>По категориям</Text>

        {budgets.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="pie-chart-outline" size={44} color="#3F3F46" />
            <Text style={{ fontSize: 14, color: '#3F3F46', marginTop: 8 }}>Нет бюджетов</Text>
          </View>
        ) : (
          <FlatList
            data={budgets}
            renderItem={renderBudget}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <Pressable onPress={() => setShowAdd(true)} style={{ position: 'absolute', bottom: 90, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 }}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      {/* Add Budget Modal */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={() => setShowAdd(false)}>
          <Pressable style={{ backgroundColor: '#1C1C20', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>Новый бюджет</Text>
              <Pressable onPress={() => setShowAdd(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              <View style={{ gap: 16 }}>
                <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Категория</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {expenseCategories.map((cat) => {
                    const active = selectedCategoryId === cat.id;
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() => setSelectedCategoryId(cat.id)}
                        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: active ? 'rgba(99,102,241,0.3)' : BORDER, backgroundColor: active ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.2)' }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#6366F1' : '#71717A' }}>{cat.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Лимит на месяц</Text>
                <TextInput
                  style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="0"
                  placeholderTextColor="#52525B"
                  keyboardType="numeric"
                />

                <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Предупреждение при ({alertThreshold}%)</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[50, 70, 80, 90].map((t) => (
                    <Pressable
                      key={t}
                      onPress={() => setAlertThreshold(t)}
                      style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: alertThreshold === t ? 'rgba(99,102,241,0.3)' : BORDER, backgroundColor: alertThreshold === t ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.2)', alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: alertThreshold === t ? '#6366F1' : '#71717A' }}>{t}%</Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  onPress={handleCreate}
                  disabled={!selectedCategoryId || !amount}
                  style={{ backgroundColor: '#6366F1', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4, opacity: !selectedCategoryId || !amount ? 0.4 : 1 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Создать</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal visible={editModal.visible} transparent animationType="slide" onRequestClose={() => setEditModal({ visible: false, budget: null, amount: '', alertThreshold: 80 })}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={() => setEditModal({ visible: false, budget: null, amount: '', alertThreshold: 80 })}>
          <Pressable style={{ backgroundColor: '#1C1C20', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>Редактировать бюджет</Text>
              <Pressable onPress={() => setEditModal({ visible: false, budget: null, amount: '', alertThreshold: 80 })} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Лимит на месяц</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                value={editModal.amount}
                onChangeText={(text) => setEditModal((prev) => ({ ...prev, amount: text }))}
                placeholder="0"
                placeholderTextColor="#52525B"
                keyboardType="numeric"
              />

              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Предупреждение при ({editModal.alertThreshold}%)</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[50, 70, 80, 90].map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setEditModal((prev) => ({ ...prev, alertThreshold: t }))}
                    style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: editModal.alertThreshold === t ? 'rgba(99,102,241,0.3)' : BORDER, backgroundColor: editModal.alertThreshold === t ? 'rgba(99,102,241,0.12)' : 'rgba(0,0,0,0.2)', alignItems: 'center' }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: editModal.alertThreshold === t ? '#6366F1' : '#71717A' }}>{t}%</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable
                onPress={handleSaveEdit}
                disabled={!editModal.amount}
                style={{ backgroundColor: '#6366F1', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4, opacity: !editModal.amount ? 0.4 : 1 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Сохранить</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (editModal.budget) {
                    handleDelete(editModal.budget.id);
                    setEditModal({ visible: false, budget: null, amount: '', alertThreshold: 80 });
                  }
                }}
                style={{ paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#F87171' }}>Удалить бюджет</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
