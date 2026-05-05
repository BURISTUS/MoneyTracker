import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../../src/utils/formatters';
import type { Goal } from '../../../src/types';

const C = {
  bg: '#0A0A0F',
  card: '#141418',
  border: 'rgba(255,255,255,0.08)',
  textMain: '#F5F5F5',
  textSec: '#8C8C8C',
  indigo: '#6366F1',
  red: '#FF3B30',
  green: '#34C759',
  orange: '#FB9554',
  inputBg: 'rgba(255,255,255,0.05)',
};

const S = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: C.textMain },
  addBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: C.indigo, alignItems: 'center', justifyContent: 'center',
  },
  list: { paddingHorizontal: 16, paddingBottom: 120 },
  card: {
    backgroundColor: C.card, borderRadius: 20, padding: 18,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  cardCompleted: { opacity: 0.5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardName: { fontSize: 17, fontWeight: '700', color: C.textMain, flex: 1 },
  cardBadge: {
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
    marginLeft: 8,
  },
  cardBadgeText: { fontSize: 11, fontWeight: '700' },
  progressTrack: {
    height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10, overflow: 'hidden',
  },
  progressFill: { height: 8, borderRadius: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '700', color: C.textMain },
  statLabel: { fontSize: 11, color: C.textSec, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: C.border },
  monthNeed: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.border,
  },
  monthNeedText: { fontSize: 12, color: C.textSec },
  monthNeedValue: { fontSize: 12, fontWeight: '600', color: C.indigo },

  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(99,102,241,0.08)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textMain, marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  emptyCta: {
    backgroundColor: C.indigo, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 28,
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  emptyCtaText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
});

// ---- Create Goal Modal ----

const MS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#13131A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingBottom: 34, maxHeight: '90%',
  },
  handle: {
    width: 36, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  field: { marginBottom: 16, paddingHorizontal: 20 },
  label: { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: C.inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 15, color: C.textMain, borderWidth: 1, borderColor: C.border,
  },
  saveBtn: {
    marginHorizontal: 20, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', backgroundColor: C.indigo, marginTop: 4,
  },
  saveText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  monthInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 20, marginBottom: 16,
  },
  monthInfoText: { fontSize: 13, color: C.textSec },
  monthInfoValue: { fontSize: 13, fontWeight: '600', color: C.indigo },
});

function CreateGoalModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const createGoal = useDataStore((s) => s.createGoal);
  const userCurrency = useDataStore((s) => s.userCurrency);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) { setName(''); setTarget(''); setDeadline(''); setSaving(false); }
  }, [visible]);

  const canSave = name && target && parseInt(target) > 0;

  const monthNeed = useMemo(() => {
    if (!target || !deadline) return null;
    const months = Math.max(1, Math.ceil(
      (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)
    ));
    return Math.round(parseInt(target) / months);
  }, [target, deadline]);

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await createGoal({ name, targetAmount: Math.round(parseFloat(target) * 100), currency: userCurrency, deadline: deadline || undefined });
      onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={MS.overlay}>
        <Pressable style={MS.overlay} onPress={onClose}><View style={{ flex: 1 }} /></Pressable>
        <View style={MS.sheet}>
          <View style={MS.handle} />
          <View style={MS.header}>
            <Text style={MS.headerTitle}>Новая цель</Text>
            <Pressable style={MS.closeBtn} onPress={onClose}><Ionicons name="close" size={18} color={C.textSec} /></Pressable>
          </View>
          <ScrollView>
            <View style={MS.field}>
              <Text style={MS.label}>Название</Text>
              <TextInput style={MS.input} value={name} onChangeText={setName} placeholder="Например: Отпуск" placeholderTextColor="#52525B" />
            </View>
            <View style={MS.field}>
              <Text style={MS.label}>Сумма</Text>
              <TextInput style={MS.input} value={target} onChangeText={setTarget} placeholder="100000" placeholderTextColor="#52525B" keyboardType="decimal-pad" />
            </View>
            <View style={MS.field}>
              <Text style={MS.label}>Дедлайн (опционально)</Text>
              <TextInput style={MS.input} value={deadline} onChangeText={setDeadline} placeholder="2026-12-31" placeholderTextColor="#52525B" />
            </View>
            {monthNeed !== null && (
              <View style={MS.monthInfo}>
                <Ionicons name="calendar-outline" size={14} color={C.textSec} />
                <Text style={MS.monthInfoText}>Нужно откладывать</Text>
                <Text style={MS.monthInfoValue}>{formatCurrency(monthNeed * 100, userCurrency)} / мес</Text>
              </View>
            )}
            <TouchableOpacity style={[MS.saveBtn, { opacity: canSave && !saving ? 1 : 0.5 }]} onPress={handleSave} disabled={!canSave || saving}>
              <Text style={MS.saveText}>{saving ? 'Создание...' : 'Создать цель'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ---- Contribution Modal ----

const CS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#13131A', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, paddingBottom: 34,
  },
  handle: {
    width: 36, height: 5, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: C.card,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border,
  },
  goalInfo: { paddingHorizontal: 20, marginBottom: 16 },
  goalName: { fontSize: 15, fontWeight: '600', color: C.textMain, marginBottom: 4 },
  goalMeta: { fontSize: 13, color: C.textSec },
  field: { marginBottom: 12, paddingHorizontal: 20 },
  label: { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 6, textTransform: 'uppercase' },
  input: {
    backgroundColor: C.inputBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 18, color: C.textMain, borderWidth: 1, borderColor: C.border,
  },
  saveBtn: {
    marginHorizontal: 20, marginTop: 8, paddingVertical: 14, borderRadius: 14,
    alignItems: 'center', backgroundColor: C.indigo,
  },
  saveText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  historyTitle: { fontSize: 12, fontWeight: '600', color: C.textSec, paddingHorizontal: 20, marginTop: 12, marginBottom: 6, textTransform: 'uppercase' },
  contribItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  contribAmount: { fontSize: 14, fontWeight: '600', color: C.green },
  contribDate: { fontSize: 12, color: C.textSec },
  contribNote: { fontSize: 12, color: C.textSec, marginTop: 2 },
});

function ContributionModal({ goal, visible, onClose }: { goal: Goal | null; visible: boolean; onClose: () => void }) {
  const addGoalContribution = useDataStore((s) => s.addGoalContribution);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (visible) { setAmount(''); setNote(''); setSaving(false); }
  }, [visible]);

  if (!goal) return null;

  const canSave = amount && parseFloat(amount) > 0;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await addGoalContribution(goal.id, parseFloat(amount), note || undefined);
      onClose();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const percent = goal.percentComplete ?? 0;
  const barColor = percent >= 100 ? C.green : percent >= 50 ? C.indigo : C.orange;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={CS.overlay}>
        <Pressable style={CS.overlay} onPress={onClose}><View style={{ flex: 1 }} /></Pressable>
        <View style={CS.sheet}>
          <View style={CS.handle} />
          <View style={CS.header}>
            <Text style={CS.headerTitle}>{goal.name}</Text>
            <Pressable style={CS.closeBtn} onPress={onClose}><Ionicons name="close" size={18} color={C.textSec} /></Pressable>
          </View>
          <View style={CS.goalInfo}>
            <Text style={CS.goalMeta}>
              {formatCurrency(goal.currentAmount, goal.currency)} из {formatCurrency(goal.targetAmount, goal.currency)} · {Math.round(percent)}%
            </Text>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.06)', marginTop: 8, overflow: 'hidden' }}>
              <View style={{ height: 6, borderRadius: 3, width: `${Math.min(percent, 100)}%`, backgroundColor: barColor }} />
            </View>
          </View>
          <View style={CS.field}>
            <Text style={CS.label}>Сумма взноса</Text>
            <TextInput style={CS.input} value={amount} onChangeText={setAmount} placeholder="0" placeholderTextColor="#52525B" keyboardType="decimal-pad" />
          </View>
          <View style={CS.field}>
            <TextInput style={[CS.input, { fontSize: 14 }]} value={note} onChangeText={setNote} placeholder="Заметка (опционально)" placeholderTextColor="#52525B" />
          </View>
          <TouchableOpacity style={[CS.saveBtn, { opacity: canSave && !saving ? 1 : 0.5 }]} onPress={handleSave} disabled={!canSave || saving}>
            <Text style={CS.saveText}>{saving ? '...' : '➕ Добавить'}</Text>
          </TouchableOpacity>

          {/* Contribution history */}
          {goal.contributions && goal.contributions.length > 0 && (
            <>
              <Text style={CS.historyTitle}>История ({goal._count?.contributions || goal.contributions.length})</Text>
              {goal.contributions.slice(0, 10).map((c, i) => (
                <View key={c.id} style={CS.contribItem}>
                  <View style={{ flex: 1 }}>
                    {c.note ? <Text style={CS.contribNote}>{c.note}</Text> : null}
                    <Text style={CS.contribDate}>{new Date(c.date).toLocaleDateString('ru-RU')}</Text>
                  </View>
                  <Text style={CS.contribAmount}>+{formatCurrency(c.amount, goal.currency)}</Text>
                </View>
              ))}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ---- Main Screen ----

export default function GoalsScreen() {
  const insets = useSafeAreaInsets();
  const goals = useDataStore((s) => s.goals);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const activeGoals = useMemo(() => goals.filter((g) => !g.isCompleted), [goals]);
  const completedGoals = useMemo(() => goals.filter((g) => g.isCompleted), [goals]);

  const monthsLeft = useCallback((deadline: string) => {
    return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30)));
  }, []);

  const renderGoal = ({ item: g }: { item: Goal }) => {
    const percent = g.percentComplete ?? 0;
    const barColor = percent >= 100 ? C.green : percent >= 50 ? C.indigo : C.orange;
    const remain = g.remaining ?? (g.targetAmount - g.currentAmount);
    const ml = monthsLeft(g.deadline);
    const monthlyNeed = ml > 0 ? Math.round(remain / ml) : remain;

    return (
      <TouchableOpacity
        style={[S.card, g.isCompleted && S.cardCompleted]}
        onPress={() => !g.isCompleted && setSelectedGoal(g)}
        activeOpacity={0.7}
      >
        <View style={S.cardHeader}>
          <Text style={S.cardName} numberOfLines={1}>{g.name}</Text>
          <View style={[S.cardBadge, { backgroundColor: g.isCompleted ? `${C.green}18` : `${barColor}18` }]}>
            <Text style={[S.cardBadgeText, { color: g.isCompleted ? C.green : barColor }]}>
              {g.isCompleted ? '✓ Готово' : `${Math.round(percent)}%`}
            </Text>
          </View>
        </View>

        <View style={S.progressTrack}>
          <View style={[S.progressFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: barColor }]} />
        </View>

        <View style={S.stats}>
          <View style={S.statItem}>
            <Text style={S.statValue}>{formatCurrency(g.currentAmount, g.currency)}</Text>
            <Text style={S.statLabel}>Собрано</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={S.statValue}>{formatCurrency(g.targetAmount, g.currency)}</Text>
            <Text style={S.statLabel}>Цель</Text>
          </View>
          <View style={S.statDivider} />
          <View style={S.statItem}>
            <Text style={S.statValue}>{ml > 0 ? ml : '—'}</Text>
            <Text style={S.statLabel}>Месяцев</Text>
          </View>
        </View>

        {ml > 0 && monthlyNeed > 0 && (
          <View style={S.monthNeed}>
            <Ionicons name="trending-up" size={14} color={C.indigo} />
            <Text style={S.monthNeedText}>Нужно в месяц:</Text>
            <Text style={S.monthNeedValue}>{formatCurrency(monthlyNeed, g.currency)}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[S.screen, { paddingTop: insets.top }]}>
      <View style={S.header}>
        <Text style={S.title}>Цели</Text>
        <TouchableOpacity style={S.addBtn} onPress={() => setShowCreate(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {goals.length === 0 ? (
        <View style={S.empty}>
          <View style={S.emptyIcon}>
            <Ionicons name="flag" size={36} color={C.indigo} />
          </View>
          <Text style={S.emptyTitle}>Нет целей</Text>
          <Text style={S.emptySub}>Ставьте финансовые цели и отслеживайте прогресс</Text>
          <TouchableOpacity style={S.emptyCta} onPress={() => setShowCreate(true)}>
            <Ionicons name="add-circle" size={18} color="#FFF" />
            <Text style={S.emptyCtaText}>Создать цель</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={[...activeGoals, ...completedGoals]}
          keyExtractor={(g) => g.id}
          renderItem={renderGoal}
          contentContainerStyle={S.list}
        />
      )}

      <CreateGoalModal visible={showCreate} onClose={() => setShowCreate(false)} />
      <ContributionModal goal={selectedGoal} visible={!!selectedGoal} onClose={() => setSelectedGoal(null)} />
    </View>
  );
}