import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, useColorScheme, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDataStore } from '../../../src/stores/dataStore';
import { lightTheme, darkTheme } from '../../../src/utils/theme';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getDaysRemaining(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function GoalsScreen() {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  const { goals, addGoal } = useDataStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', targetAmount: '', deadline: '' });

  const completedGoals = goals.filter(g => g.isCompleted);
  const activeGoals = goals.filter(g => !g.isCompleted);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    const goal = {
      id: Date.now().toString(),
      userId: '1',
      name: newGoal.name,
      targetAmount: parseFloat(newGoal.targetAmount) * 100,
      currentAmount: 0,
      deadline: newGoal.deadline,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
    };
    addGoal(goal as any);
    setShowAddModal(false);
    setNewGoal({ name: '', targetAmount: '', deadline: '' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryLabel}>Всего накоплено</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalSaved)}</Text>
          <Text style={styles.summarySubtext}>из {formatCurrency(totalTarget)} по всем целям</Text>
        </Animated.View>

        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.surface }]} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Новая цель</Text>
        </TouchableOpacity>

        {activeGoals.map((goal, index) => {
          const progress = goal.progress || (goal.currentAmount / goal.targetAmount) * 100;
          const daysRemaining = getDaysRemaining(goal.deadline);
          return (
            <Animated.View key={goal.id} entering={FadeInDown.duration(300).delay(index * 50)} style={[styles.goalCard, { backgroundColor: colors.surface }]}>
              <View style={styles.goalHeader}>
                <View style={styles.goalIcon}><Ionicons name="flag" size={20} color={colors.primary} /></View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
                  <Text style={[styles.goalDeadline, { color: colors.textSecondary }]}>{daysRemaining} дней осталось</Text>
                </View>
              </View>
              <View style={styles.goalProgressRow}>
                <Text style={[styles.goalCurrent, { color: colors.text }]}>{formatCurrency(goal.currentAmount)}</Text>
                <Text style={[styles.goalTarget, { color: colors.textSecondary }]}>из {formatCurrency(goal.targetAmount)}</Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
                <LinearGradient colors={[colors.primary, colors.primary + '80']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
              <View style={styles.goalFooter}>
                <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>Прогресс</Text>
                <Text style={[styles.footerValue, { color: colors.primary }]}>{Math.round(progress)}%</Text>
              </View>
            </Animated.View>
          );
        })}

        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="flag-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Нет целей</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Новая цель</Text>
            <TextInput style={[styles.modalInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]} placeholder="Название" placeholderTextColor={colors.textTertiary} value={newGoal.name} onChangeText={(text) => setNewGoal({ ...newGoal, name: text })} />
            <TextInput style={[styles.modalInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]} placeholder="Сумма" placeholderTextColor={colors.textTertiary} value={newGoal.targetAmount} onChangeText={(text) => setNewGoal({ ...newGoal, targetAmount: text })} keyboardType="numeric" />
            <TextInput style={[styles.modalInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]} placeholder="2024-12-31" placeholderTextColor={colors.textTertiary} value={newGoal.deadline} onChangeText={(text) => setNewGoal({ ...newGoal, deadline: text })} />
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => setShowAddModal(false)}><Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleAddGoal}><Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Создать</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },
  summaryCard: { borderRadius: 20, padding: 24, marginBottom: 20, alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  summaryValue: { fontSize: 36, fontWeight: '800', color: '#FFFFFF' },
  summarySubtext: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  addButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8, marginBottom: 24 },
  addButtonText: { fontSize: 16, fontWeight: '600' },
  goalCard: { borderRadius: 20, padding: 16, marginBottom: 12 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  goalIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#667eea15', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 16, fontWeight: '600' },
  goalDeadline: { fontSize: 12 },
  goalProgressRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  goalCurrent: { fontSize: 20, fontWeight: '700', marginRight: 6 },
  goalTarget: { fontSize: 14 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', borderRadius: 4 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  footerLabel: { fontSize: 11 },
  footerValue: { fontSize: 14, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '600', marginTop: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  modalInput: { padding: 16, borderRadius: 12, fontSize: 16, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  modalButtonText: { fontSize: 16, fontWeight: '600' },
});
