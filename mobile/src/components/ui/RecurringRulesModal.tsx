import React, { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Switch,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../../components/ui/text';
import { formatCurrency } from '../../utils/formatters';
import { useTheme } from '../../stores/themeStore';
import { useDataStore } from '../../stores/dataStore';
import { useToast } from './Toast';
import { CategoryIcon } from './CategoryIcon';
import { RecurrencePeriod, TransactionType } from '../../types';
import type { RecurringRule } from '../../types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const WEEKDAYS = [
  { value: 1, labelKey: 'recurring.mon' },
  { value: 2, labelKey: 'recurring.tue' },
  { value: 3, labelKey: 'recurring.wed' },
  { value: 4, labelKey: 'recurring.thu' },
  { value: 5, labelKey: 'recurring.fri' },
  { value: 6, labelKey: 'recurring.sat' },
  { value: 7, labelKey: 'recurring.sun' },
];

export function RecurringRulesModal({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const C = useTheme();
  const toast = useToast();

  const recurringRules = useDataStore((s) => s.recurringRules);
  const isLoadingRecurringRules = useDataStore((s) => s.isLoadingRecurringRules);
  const fetchRecurringRules = useDataStore((s) => s.fetchRecurringRules);
  const addRecurringRule = useDataStore((s) => s.addRecurringRule);
  const deleteRecurringRule = useDataStore((s) => s.deleteRecurringRule);
  const pauseRecurringRule = useDataStore((s) => s.pauseRecurringRule);
  const activateRecurringRule = useDataStore((s) => s.activateRecurringRule);
  const categories = useDataStore((s) => s.categories);
  const accounts = useDataStore((s) => s.accounts);

  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [formPeriod, setFormPeriod] = useState<RecurrencePeriod>(RecurrencePeriod.MONTHLY);
  const [formCategoryId, setFormCategoryId] = useState<string | null>(null);
  const [formAccountId, setFormAccountId] = useState<string | null>(null);
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDayOfWeek, setFormDayOfWeek] = useState(1);
  const [formDayOfMonth, setFormDayOfMonth] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
    container: { flex: 1, backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: 40 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border },
    headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
    body: { flex: 1 },
    ruleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, marginBottom: 8, marginHorizontal: 16 },
    ruleInfo: { flex: 1 },
    ruleName: { fontSize: 14, fontWeight: '600', color: C.textMain },
    ruleSub: { fontSize: 12, color: C.textSec, marginTop: 2 },
    ruleAmount: { fontSize: 16, fontWeight: '700' },
    fab: { position: 'absolute', bottom: 20, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
    formSection: { paddingHorizontal: 16, marginTop: 16 },
    formLabel: { fontSize: 12, fontWeight: '600', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
    input: { backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 12, fontSize: 15, color: C.textMain },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    chipSelected: { borderWidth: 1 },
    row: { flexDirection: 'row', gap: 8 },
    emptyState: { alignItems: 'center', paddingVertical: 48 },
    btnRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
    actionBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: C.border },
  });

  const activeRules = useMemo(() => recurringRules.filter((r) => r.isActive), [recurringRules]);
  const pausedRules = useMemo(() => recurringRules.filter((r) => !r.isActive), [recurringRules]);

  const handleCreate = useCallback(async () => {
    if (!formCategoryId || !formAccountId || !formAmount) {
      toast.showError(t('recurring.fillRequired'));
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await addRecurringRule({
        accountId: formAccountId,
        categoryId: formCategoryId,
        amount: Math.round(parseFloat(formAmount) * 100),
        type: formType,
        period: formPeriod,
        dayOfWeek: formPeriod === RecurrencePeriod.WEEKLY ? formDayOfWeek : undefined,
        dayOfMonth: formPeriod === RecurrencePeriod.MONTHLY ? formDayOfMonth : undefined,
        description: formDescription || undefined,
      });
      if (result) {
        toast.showSuccess(t('recurring.created'));
        setShowForm(false);
        resetForm();
      }
    } catch {
      toast.showError(t('common.error'));
    }
    setIsSubmitting(false);
  }, [formCategoryId, formAccountId, formAmount, formType, formPeriod, formDayOfWeek, formDayOfMonth, formDescription, addRecurringRule, toast, t]);

  const resetForm = () => {
    setFormType(TransactionType.EXPENSE);
    setFormPeriod(RecurrencePeriod.MONTHLY);
    setFormCategoryId(null);
    setFormAccountId(accounts.length > 0 ? accounts[0].id : null);
    setFormAmount('');
    setFormDescription('');
    setFormDayOfWeek(1);
    setFormDayOfMonth(1);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };

  const renderRule = (rule: RecurringRule) => {
    const cat = rule.category || categories.find((c) => c.id === rule.categoryId);
    const acc = rule.account || accounts.find((a) => a.id === rule.accountId);
    const isExpense = rule.type === TransactionType.EXPENSE;
    const periodLabel = rule.period === RecurrencePeriod.WEEKLY
      ? t('recurring.weekly')
      : t('recurring.monthly');

    return (
      <View key={rule.id} style={[S.ruleCard, { opacity: rule.isActive ? 1 : 0.5 }]}>
        {cat && (
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `${cat.color || C.primary}18`, alignItems: 'center', justifyContent: 'center' }}>
            <CategoryIcon icon={cat.icon} color={cat.color || C.primary} size={18} />
          </View>
        )}
        <View style={S.ruleInfo}>
          <Text style={S.ruleName}>{cat?.name || '—'}</Text>
          <Text style={S.ruleSub}>
            {periodLabel} · {t('recurring.next')}: {formatDate(rule.nextRunDate)}
            {acc ? ` · ${acc.name}` : ''}
          </Text>
        </View>
        <Text style={[S.ruleAmount, { color: isExpense ? '#FF3B30' : '#34C759' }]}>
          {isExpense ? '−' : '+'}{formatCurrency(rule.amount)}
        </Text>
        <View style={S.btnRow}>
          <Pressable
            style={S.actionBtn}
            onPress={() => rule.isActive ? pauseRecurringRule(rule.id) : activateRecurringRule(rule.id)}
          >
            <Ionicons name={rule.isActive ? 'pause' : 'play'} size={16} color={C.textSec} />
          </Pressable>
          <Pressable
            style={S.actionBtn}
            onPress={() => deleteRecurringRule(rule.id)}
          >
            <Ionicons name="trash-outline" size={16} color={C.red} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={S.container}>
        <View style={S.header}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={C.textSec} />
          </Pressable>
          <Text style={S.headerTitle}>{t('recurring.title')}</Text>
          <Pressable onPress={() => { resetForm(); setShowForm(!showForm); }}>
            <Ionicons name={showForm ? 'close' : 'add'} size={24} color={C.primary} />
          </Pressable>
        </View>

        <ScrollView style={S.body} contentContainerStyle={{ paddingBottom: 100 }}>
          {showForm && (
            <View style={{ paddingTop: 16 }}>
              <View style={S.formSection}>
                <Text style={S.formLabel}>{t('recurring.type')}</Text>
                <View style={S.chipRow}>
                  <Pressable
                    style={[S.chip, { backgroundColor: formType === TransactionType.EXPENSE ? 'rgba(255,59,48,0.12)' : C.card, borderColor: formType === TransactionType.EXPENSE ? '#FF3B30' : C.border }]}
                    onPress={() => setFormType(TransactionType.EXPENSE)}
                  >
                    <Text style={{ fontSize: 13, color: formType === TransactionType.EXPENSE ? '#FF3B30' : C.textSec }}>{t('transactions.expenses')}</Text>
                  </Pressable>
                  <Pressable
                    style={[S.chip, { backgroundColor: formType === TransactionType.INCOME ? 'rgba(52,199,89,0.12)' : C.card, borderColor: formType === TransactionType.INCOME ? '#34C759' : C.border }]}
                    onPress={() => setFormType(TransactionType.INCOME)}
                  >
                    <Text style={{ fontSize: 13, color: formType === TransactionType.INCOME ? '#34C759' : C.textSec }}>{t('transactions.income')}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={S.formSection}>
                <Text style={S.formLabel}>{t('recurring.period')}</Text>
                <View style={S.chipRow}>
                  <Pressable
                    style={[S.chip, { backgroundColor: formPeriod === RecurrencePeriod.WEEKLY ? `${C.primary}18` : C.card, borderColor: formPeriod === RecurrencePeriod.WEEKLY ? C.primary : C.border }]}
                    onPress={() => setFormPeriod(RecurrencePeriod.WEEKLY)}
                  >
                    <Text style={{ fontSize: 13, color: formPeriod === RecurrencePeriod.WEEKLY ? C.primary : C.textSec }}>{t('recurring.weekly')}</Text>
                  </Pressable>
                  <Pressable
                    style={[S.chip, { backgroundColor: formPeriod === RecurrencePeriod.MONTHLY ? `${C.primary}18` : C.card, borderColor: formPeriod === RecurrencePeriod.MONTHLY ? C.primary : C.border }]}
                    onPress={() => setFormPeriod(RecurrencePeriod.MONTHLY)}
                  >
                    <Text style={{ fontSize: 13, color: formPeriod === RecurrencePeriod.MONTHLY ? C.primary : C.textSec }}>{t('recurring.monthly')}</Text>
                  </Pressable>
                </View>
              </View>

              {formPeriod === RecurrencePeriod.WEEKLY && (
                <View style={S.formSection}>
                  <Text style={S.formLabel}>{t('recurring.dayOfWeek')}</Text>
                  <View style={[S.chipRow, { flexWrap: 'wrap' }]}>
                    {WEEKDAYS.map((d) => (
                      <Pressable
                        key={d.value}
                        style={[S.chip, { backgroundColor: formDayOfWeek === d.value ? `${C.primary}18` : C.card, borderColor: formDayOfWeek === d.value ? C.primary : C.border, paddingHorizontal: 10, paddingVertical: 6 }]}
                        onPress={() => setFormDayOfWeek(d.value)}
                      >
                        <Text style={{ fontSize: 12, color: formDayOfWeek === d.value ? C.primary : C.textSec }}>{t(d.labelKey)}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              {formPeriod === RecurrencePeriod.MONTHLY && (
                <View style={S.formSection}>
                  <Text style={S.formLabel}>{t('recurring.dayOfMonth')}</Text>
                  <TextInput
                    style={[S.input, { width: 80 }]}
                    value={String(formDayOfMonth)}
                    onChangeText={(v) => { const n = parseInt(v, 10); if (n >= 1 && n <= 31) setFormDayOfMonth(n); }}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              )}

              <View style={S.formSection}>
                <Text style={S.formLabel}>{t('common.amount')}</Text>
                <TextInput
                  style={S.input}
                  value={formAmount}
                  onChangeText={setFormAmount}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={C.textMuted}
                />
              </View>

              <View style={S.formSection}>
                <Text style={S.formLabel}>{t('recurring.category')}</Text>
                <View style={[S.chipRow, { flexWrap: 'wrap' }]}>
                  {categories
                    .filter((c) => formType === TransactionType.EXPENSE ? c.type === 'EXPENSE' : c.type === 'INCOME')
                    .map((cat) => (
                      <Pressable
                        key={cat.id}
                        style={[S.chip, { backgroundColor: formCategoryId === cat.id ? `${cat.color || C.primary}18` : C.card, borderColor: formCategoryId === cat.id ? (cat.color || C.primary) : C.border, flexDirection: 'row', alignItems: 'center', gap: 6 }]}
                        onPress={() => setFormCategoryId(cat.id)}
                      >
                        <CategoryIcon icon={cat.icon} color={cat.color || C.primary} size={14} />
                        <Text style={{ fontSize: 12, color: formCategoryId === cat.id ? C.textMain : C.textSec }}>{cat.name}</Text>
                      </Pressable>
                    ))}
                </View>
              </View>

              <View style={S.formSection}>
                <Text style={S.formLabel}>{t('recurring.account')}</Text>
                <View style={[S.chipRow, { flexWrap: 'wrap' }]}>
                  {accounts.map((acc) => (
                    <Pressable
                      key={acc.id}
                      style={[S.chip, { backgroundColor: formAccountId === acc.id ? `${C.primary}18` : C.card, borderColor: formAccountId === acc.id ? C.primary : C.border }]}
                      onPress={() => setFormAccountId(acc.id)}
                    >
                      <Text style={{ fontSize: 12, color: formAccountId === acc.id ? C.textMain : C.textSec }}>{acc.name}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={S.formSection}>
                <Text style={S.formLabel}>{t('common.description')}</Text>
                <TextInput
                  style={[S.input, { height: 60 }]}
                  value={formDescription}
                  onChangeText={setFormDescription}
                  multiline
                  placeholder={t('recurring.descriptionPlaceholder')}
                  placeholderTextColor={C.textMuted}
                />
              </View>

              <View style={[S.formSection, { marginBottom: 30 }]}>
                <Pressable
                  style={{ backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}
                  onPress={handleCreate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFF' }}>{t('recurring.create')}</Text>
                  )}
                </Pressable>
              </View>
            </View>
          )}

          {activeRules.length > 0 && (
            <View style={{ marginTop: showForm ? 0 : 16 }}>
              <Text style={[S.formLabel, { paddingHorizontal: 16 }]}>{t('recurring.activeRules')}</Text>
              {activeRules.map(renderRule)}
            </View>
          )}

          {pausedRules.length > 0 && (
            <View style={{ marginTop: 20 }}>
              <Text style={[S.formLabel, { paddingHorizontal: 16 }]}>{t('recurring.pausedRules')}</Text>
              {pausedRules.map(renderRule)}
            </View>
          )}

          {!showForm && recurringRules.length === 0 && (
            <View style={S.emptyState}>
              <Ionicons name="repeat" size={48} color={C.textMuted} />
              <Text style={{ fontSize: 15, color: C.textSec, marginTop: 8 }}>{t('recurring.emptyState')}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}
