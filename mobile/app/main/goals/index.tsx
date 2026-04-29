import React, { useState, useCallback } from 'react';
import { View, FlatList, Pressable, Modal, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../../src/utils/formatters';
import type { Goal } from '../../../src/types';
import { ConfirmModal } from '../../../src/components/ui/ConfirmModal';
import { ToastContainer } from '../../../src/components/ui/Toast';

const BORDER = 'rgba(255,255,255,0.08)';
const CARD_BG = '#141418';

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goals = useDataStore((s) => s.goals);
  const createGoal = useDataStore((s) => s.createGoal);
  const updateGoalApi = useDataStore((s) => s.updateGoalApi);
  const addGoalProgress = useDataStore((s) => s.addGoalProgress);
  const deleteGoalApi = useDataStore((s) => s.deleteGoalApi);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    goal: Goal | null;
    name: string;
    target: string;
    deadline: string;
  }>({ visible: false, goal: null, name: '', target: '', deadline: '' });

  const [progressModal, setProgressModal] = useState<{
    visible: boolean;
    goalId: string | null;
    amount: string;
  }>({ visible: false, goalId: null, amount: '' });

  const [deleteConfirm, setDeleteConfirm] = useState<{ visible: boolean; goalId: string | null }>({
    visible: false,
    goalId: null,
  });

  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleAdd = useCallback(async () => {
    if (!name || !target) return;
    try {
      await createGoal({
        name,
        targetAmount: Math.round(parseFloat(target) * 100),
        deadline: deadline || undefined,
      });
      setName('');
      setTarget('');
      setDeadline('');
      setShowAdd(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
    }
  }, [name, target, deadline, createGoal]);

  const openEdit = useCallback((goal: Goal) => {
    setEditModal({
      visible: true,
      goal,
      name: goal.name,
      target: String(Math.round(Number(goal.targetAmount) / 100)),
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editModal.goal) return;
    try {
      await updateGoalApi(editModal.goal.id, {
        name: editModal.name,
        targetAmount: Math.round(parseFloat(editModal.target) * 100),
        deadline: editModal.deadline || undefined,
      });
      setEditModal({ visible: false, goal: null, name: '', target: '', deadline: '' });
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  }, [editModal, updateGoalApi]);

  const handleAddProgress = useCallback(async () => {
    if (!progressModal.goalId || !progressModal.amount) return;
    try {
      await addGoalProgress(progressModal.goalId, Math.round(parseFloat(progressModal.amount) * 100));
      setProgressModal({ visible: false, goalId: null, amount: '' });
    } catch (error) {
      console.error('Failed to add progress:', error);
    }
  }, [progressModal, addGoalProgress]);

  const handleDelete = useCallback((id: string) => {
    setDeleteConfirm({ visible: true, goalId: id });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm.goalId) return;
    try {
      await deleteGoalApi(deleteConfirm.goalId);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
    setDeleteConfirm({ visible: false, goalId: null });
  }, [deleteConfirm.goalId, deleteGoalApi]);

  const renderGoal = useCallback(({ item }: { item: Goal }) => {
    const progress = item.progress ?? (item.targetAmount > 0 ? (Number(item.currentAmount) / Number(item.targetAmount)) * 100 : 0);
    const clamped = Math.min(100, Math.max(0, progress));
    return (
      <Pressable onPress={() => openEdit(item)} style={{ backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 18, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#E4E4E7', flex: 1 }} numberOfLines={1}>{item.name}</Text>
          {item.isCompleted ? (
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#34D399' }}>Достигнута</Text>
          ) : (
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#6366F1' }}>{Math.round(clamped)}%</Text>
          )}
        </View>
        <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 10 }}>
          <View style={{ height: 6, borderRadius: 3, width: `${clamped}%`, backgroundColor: item.isCompleted ? '#34D399' : '#6366F1' }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: '#52525B' }}>{formatCurrency(Number(item.currentAmount))}</Text>
          <Text style={{ fontSize: 12, color: '#52525B' }}>из {formatCurrency(Number(item.targetAmount))}</Text>
        </View>
        {!item.isCompleted && (
          <Pressable
            onPress={() => setProgressModal({ visible: true, goalId: item.id, amount: '' })}
            style={{ backgroundColor: 'rgba(99,102,241,0.12)', borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#6366F1' }}>+ Пополнить</Text>
          </Pressable>
        )}
      </Pressable>
    );
  }, [openEdit]);

  const keyExtractor = useCallback((item: Goal) => item.id, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0F', paddingTop: insets.top }}>
      <View style={{ position: 'relative' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={{ padding: 4, marginLeft: -4 }}>
            <Ionicons name="chevron-back" size={28} color="#A1A1AA" />
          </Pressable>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 }}>Цели</Text>
        </View>
        <ToastContainer />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: BORDER, padding: 18, marginBottom: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(99,102,241,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <Ionicons name="flag-outline" size={18} color="#6366F1" />
          </View>
          <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Общий прогресс</Text>
          <Text style={{ fontSize: 32, fontWeight: '700', color: '#FFFFFF', letterSpacing: -1, marginBottom: 2 }}>{formatCurrency(totalSaved)}</Text>
          <Text style={{ fontSize: 13, color: '#52525B', marginBottom: 14 }}>из {formatCurrency(totalTarget)}</Text>
          <View style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 12, color: '#52525B' }}>Прогресс</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6366F1' }}>{Math.round(overallProgress)}%</Text>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <View style={{ height: 6, borderRadius: 3, width: `${Math.min(100, overallProgress)}%`, backgroundColor: '#6366F1' }} />
            </View>
          </View>
        </View>

        {goals.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Ionicons name="flag-outline" size={44} color="#3F3F46" />
            <Text style={{ fontSize: 14, color: '#3F3F46', marginTop: 8 }}>Нет целей</Text>
          </View>
        ) : (
          <FlatList
            data={goals}
            renderItem={renderGoal}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <Pressable onPress={() => setShowAdd(true)} style={{ position: 'absolute', bottom: 90, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 }}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={() => setShowAdd(false)}>
          <Pressable style={{ backgroundColor: '#1C1C20', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>Новая цель</Text>
              <Pressable onPress={() => setShowAdd(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Название</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                value={name}
                onChangeText={setName}
                placeholder="На что копим?"
                placeholderTextColor="#52525B"
              />

              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Сумма</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                value={target}
                onChangeText={setTarget}
                placeholder="0"
                placeholderTextColor="#52525B"
                keyboardType="decimal-pad"
              />

              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Дедлайн (YYYY-MM-DD)</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                value={deadline}
                onChangeText={setDeadline}
                placeholder="2026-12-31"
                placeholderTextColor="#52525B"
              />

              <Pressable
                onPress={handleAdd}
                disabled={!name || !target}
                style={{ backgroundColor: '#6366F1', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4, opacity: !name || !target ? 0.4 : 1 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Создать цель</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={editModal.visible} transparent animationType="slide" onRequestClose={() => setEditModal({ visible: false, goal: null, name: '', target: '', deadline: '' })}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={() => setEditModal({ visible: false, goal: null, name: '', target: '', deadline: '' })}>
          <Pressable style={{ backgroundColor: '#1C1C20', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>Редактировать цель</Text>
              <Pressable onPress={() => setEditModal({ visible: false, goal: null, name: '', target: '', deadline: '' })} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Название</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                value={editModal.name}
                onChangeText={(text) => setEditModal((prev) => ({ ...prev, name: text }))}
                placeholder="На что копим?"
                placeholderTextColor="#52525B"
              />

              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Сумма</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                value={editModal.target}
                onChangeText={(text) => setEditModal((prev) => ({ ...prev, target: text }))}
                placeholder="0"
                placeholderTextColor="#52525B"
                keyboardType="decimal-pad"
              />

              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Дедлайн (YYYY-MM-DD)</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                value={editModal.deadline}
                onChangeText={(text) => setEditModal((prev) => ({ ...prev, deadline: text }))}
                placeholder="2026-12-31"
                placeholderTextColor="#52525B"
              />

              <Pressable
                onPress={handleSaveEdit}
                disabled={!editModal.name || !editModal.target}
                style={{ backgroundColor: '#6366F1', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4, opacity: !editModal.name || !editModal.target ? 0.4 : 1 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Сохранить</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  if (editModal.goal) {
                    handleDelete(editModal.goal.id);
                    setEditModal({ visible: false, goal: null, name: '', target: '', deadline: '' });
                  }
                }}
                style={{ paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#F87171' }}>Удалить цель</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={progressModal.visible} transparent animationType="slide" onRequestClose={() => setProgressModal({ visible: false, goalId: null, amount: '' })}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={() => setProgressModal({ visible: false, goalId: null, amount: '' })}>
          <Pressable style={{ backgroundColor: '#1C1C20', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }} onPress={(e) => e.stopPropagation()}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: '#FFFFFF' }}>Пополнить цель</Text>
              <Pressable onPress={() => setProgressModal({ visible: false, goalId: null, amount: '' })} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <View style={{ gap: 16 }}>
              <Text style={{ fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 }}>Сумма пополнения</Text>
              <TextInput
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#D4D4D8' }}
                value={progressModal.amount}
                onChangeText={(text) => setProgressModal((prev) => ({ ...prev, amount: text }))}
                placeholder="0"
                placeholderTextColor="#52525B"
                keyboardType="decimal-pad"
                autoFocus
              />

              <Pressable
                onPress={handleAddProgress}
                disabled={!progressModal.amount}
                style={{ backgroundColor: '#6366F1', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4, opacity: !progressModal.amount ? 0.4 : 1 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#FFFFFF' }}>Пополнить</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={deleteConfirm.visible}
        title="Удалить цель?"
        message="Это действие нельзя отменить"
        confirmText="Удалить"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ visible: false, goalId: null })}
      />
    </View>
  );
}
