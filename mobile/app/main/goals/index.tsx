import React, { useState, useCallback } from 'react';
import { View, FlatList, Pressable, Modal, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../../src/utils/formatters';

const BORDER = 'rgba(255,255,255,0.08)';
const CARD_BG = '#141418';

export default function GoalsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const goals = useDataStore((s) => s.goals);
  const addGoal = useDataStore((s) => s.addGoal);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleAdd = useCallback(() => {
    if (!name || !target) return;
    addGoal({
      id: `temp_${Date.now()}`,
      userId: '',
      name,
      targetAmount: Math.round(parseFloat(target) * 100),
      currentAmount: 0,
      deadline: deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
    });
    setName('');
    setTarget('');
    setDeadline('');
    setShowAdd(false);
  }, [name, target, deadline, addGoal]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#A1A1AA" />
        </Pressable>
        <Text style={s.headerTitle}>Цели</Text>
      </View>

      <View style={s.content}>
        <View style={s.card}>
          <View style={s.iconWrap}>
            <Ionicons name="flag-outline" size={18} color="#6366F1" />
          </View>
          <Text style={s.cardLabel}>Общий прогресс</Text>
          <Text style={s.savedValue}>{formatCurrency(totalSaved)}</Text>
          <Text style={s.savedSubtext}>из {formatCurrency(totalTarget)}</Text>
          <View style={s.progressArea}>
            <View style={s.progressHeader}>
              <Text style={s.progressLabel}>Прогресс</Text>
              <Text style={s.progressPct}>{Math.round(overallProgress)}%</Text>
            </View>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${Math.min(100, overallProgress)}%` }]} />
            </View>
          </View>
        </View>

        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const progress = item.progress ?? (item.targetAmount > 0 ? (item.currentAmount / item.targetAmount) * 100 : 0);
            const clamped = Math.min(100, Math.max(0, progress));
            return (
              <View style={s.card}>
                <View style={s.goalHeader}>
                  <Text style={s.goalName} numberOfLines={1}>{item.name}</Text>
                  {item.isCompleted ? (
                    <Text style={s.goalDone}>Достигнута</Text>
                  ) : (
                    <Text style={s.goalDays}>{Math.round(clamped)}%</Text>
                  )}
                </View>
                <View style={s.progressTrack}>
                  <View style={[s.progressFill, { width: `${clamped}%` }]} />
                </View>
                <View style={s.goalFooter}>
                  <Text style={s.goalFooterText}>{formatCurrency(item.currentAmount)}</Text>
                  <Text style={s.goalFooterText}>из {formatCurrency(item.targetAmount)}</Text>
                </View>
              </View>
            );
          }}
          scrollEnabled={false}
          contentContainerStyle={{ gap: 10 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Ionicons name="flag-outline" size={44} color="#3F3F46" />
              <Text style={s.emptyText}>Нет целей</Text>
            </View>
          }
        />
      </View>

      <Pressable onPress={() => setShowAdd(true)} style={s.fab}>
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowAdd(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>Новая цель</Text>
              <Pressable onPress={() => setShowAdd(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <View style={s.modalFields}>
              <Text style={s.fieldLabel}>Название</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="На что копим?"
                placeholderTextColor="#52525B"
              />

              <Text style={s.fieldLabel}>Сумма</Text>
              <TextInput
                style={s.input}
                value={target}
                onChangeText={setTarget}
                placeholder="0"
                placeholderTextColor="#52525B"
                keyboardType="decimal-pad"
              />

              <Pressable
                onPress={handleAdd}
                disabled={!name || !target}
                style={[s.createBtn, (!name || !target) ? s.createBtnDisabled : undefined]}
              >
                <Text style={s.createBtnText}>Создать цель</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0F' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 },
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 120 },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    marginBottom: 10,
  },
  iconWrap: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.12)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  cardLabel: { fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 },
  savedValue: { fontSize: 32, fontWeight: '700', color: '#FFFFFF', letterSpacing: -1, marginBottom: 2 },
  savedSubtext: { fontSize: 13, color: '#52525B', marginBottom: 14 },

  progressArea: { paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: '#52525B' },
  progressPct: { fontSize: 13, fontWeight: '700', color: '#6366F1' },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#6366F1' },

  goalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  goalName: { fontSize: 15, fontWeight: '600', color: '#E4E4E7', flex: 1 },
  goalDone: { fontSize: 13, fontWeight: '600', color: '#34D399' },
  goalDays: { fontSize: 14, fontWeight: '700', color: '#6366F1' },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  goalFooterText: { fontSize: 12, color: '#52525B' },

  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 14, color: '#3F3F46', marginTop: 8 },

  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#6366F1',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#6366F1', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#1C1C20', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  modalFields: { gap: 16 },
  fieldLabel: { fontSize: 13, color: '#71717A', fontWeight: '500', marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(0,0,0,0.3)', borderWidth: 1, borderColor: BORDER,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: '#D4D4D8',
  },
  createBtn: { backgroundColor: '#6366F1', paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  createBtnDisabled: { opacity: 0.4 },
  createBtnText: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});
