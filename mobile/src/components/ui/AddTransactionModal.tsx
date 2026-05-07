import { useTranslation } from 'react-i18next';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../stores/dataStore';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../stores/themeStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
import { DatePickerModal } from './DatePickerModal';
import { formatCurrency } from '../../utils/formatters';
import type { TransactionType } from '../../types';
import { TransactionType as TransactionTypeEnum } from '../../types';
// import { VoiceInputModal } from './VoiceInputButton';
import { ReceiptScannerButton } from './ReceiptScanner';
import { AiTransactionPreview } from './AiTransactionPreview';
import type { AiTransactionResult, AiReceiptResult } from '../../services/ai';

type MathOp = '+' | '−' | '×' | '÷' | null;

// ============================================================
// Helpers
// ============================================================

const evaluateExpression = (left: string, op: MathOp, right: string): number | null => {
  const a = parseFloat(left);
  const b = parseFloat(right);
  if (isNaN(a) || isNaN(b)) return null;
  switch (op) {
    case '+': return a + b;
    case '−': return a - b;
    case '×': return a * b;
    case '÷': return b !== 0 ? a / b : null;
    default: return null;
  }
};

const MONTHS_GEN = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];
const formatDateFull = (d: Date) => `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;

const NUMPAD_KEYS = ['7','8','9','÷','4','5','6','×','1','2','3','−','.','0','⌫','+'];

// ============================================================
// Component
// ============================================================

export function AddTransactionModal({
  visible,
  onClose,
  onComplete,
  initialType = TransactionTypeEnum.EXPENSE,
}: {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  initialType?: TransactionType;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const C = useTheme();

  const addTransaction = useDataStore((s) => s.addTransaction);
  const accounts = useDataStore((s) => s.accounts);
  const categories = useDataStore((s) => s.categories);
  const transactions = useDataStore((s) => s.transactions);
  const user = useAuthStore((s) => s.user);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [pendingOp, setPendingOp] = useState<MathOp>(null);
  const [previousValue, setPreviousValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date());

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showAiPreview, setShowAiPreview] = useState(false);
  const [aiResult, setAiResult] = useState<AiTransactionResult | AiReceiptResult | null>(null);
  const deleteTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset on open & cleanup timer
  React.useEffect(() => {
    if (visible) {
      setType(initialType);
      setAmount('');
      setPendingOp(null);
      setPreviousValue('');
      setSelectedCategory(null);
      if (accounts.length > 0) setSelectedAccount(accounts[0].id);
    }
    return () => {
      if (deleteTimer.current) { clearInterval(deleteTimer.current); deleteTimer.current = null; }
    };
  }, [visible, initialType]);

  const EXPENSE_COLORS = { primary: C.red, background: C.redBg };
  const INCOME_COLORS = { primary: C.green, background: C.greenBg };
  const colors = type === 'EXPENSE' ? EXPENSE_COLORS : INCOME_COLORS;
  const displayCategories = categories.filter((c) => c.type === (type as string));

  const hourlyRate = useMemo(() => {
    const rate = getHourlyRate();
    return rate > 0 ? rate : (user?.hourlyRate ?? 0);
  }, [getHourlyRate, user?.hourlyRate]);

  const displayAmount = useMemo(() => {
    if (previousValue && pendingOp) return `${previousValue} ${pendingOp} ${amount}`;
    return amount || '0';
  }, [amount, previousValue, pendingOp]);

  const numericAmount = useMemo(() => {
    if (previousValue && pendingOp && amount) {
      return evaluateExpression(previousValue, pendingOp, amount);
    }
    const parsed = parseFloat(amount);
    return isNaN(parsed) ? 0 : parsed;
  }, [amount, previousValue, pendingOp]);

  const lifeHours = useMemo(() => {
    if (!numericAmount || !hourlyRate || numericAmount <= 0) return null;
    const h = numericAmount / hourlyRate;
    if (h < 1) return `${Math.round(h * 60)} мин`;
    if (h < 24) return `${h.toFixed(1)} ч`;
    return `${(h / 24).toFixed(1)} дн`;
  }, [numericAmount, hourlyRate]);

  // ---- Handlers ----

  const handleNumberPress = useCallback((num: string) => {
    setAmount((prev) => {
      if (prev === '0' && num !== '.') return num;
      if (prev.length >= 12) return prev;
      // Limit to 2 decimal places
      const dotIdx = prev.indexOf('.');
      if (dotIdx !== -1 && prev.length - dotIdx > 2) return prev;
      return prev + num;
    });
  }, []);

  const handleDelete = useCallback(() => {
    if (pendingOp) {
      setAmount(previousValue);
      setPendingOp(null);
      setPreviousValue('');
      return;
    }
    setAmount((prev) => (prev.length > 1 ? prev.slice(0, -1) : ''));
  }, [pendingOp, previousValue]);

  const handleMathOp = useCallback(
    (op: MathOp) => {
      if (previousValue && pendingOp && amount) {
        const r = evaluateExpression(previousValue, pendingOp, amount);
        if (r !== null) {
          setPreviousValue(String(Math.round(r * 100) / 100));
          setAmount('');
          setPendingOp(op);
          return;
        }
      }
      if (amount) {
        setPreviousValue(amount);
        setAmount('');
        setPendingOp(op);
      }
    },
    [amount, previousValue, pendingOp],
  );

  const handleEquals = useCallback(() => {
    if (previousValue && pendingOp && amount) {
      const r = evaluateExpression(previousValue, pendingOp, amount);
      if (r !== null) {
        setAmount(String(Math.round(r * 100) / 100));
        setPreviousValue('');
        setPendingOp(null);
      }
    }
  }, [previousValue, pendingOp, amount]);

  const handleSubmit = useCallback(async () => {
    if (!numericAmount || !selectedCategory || !selectedAccount) return;
    setIsSubmitting(true);
    try {
      await addTransaction({
        id: `temp_${Date.now()}`,
        userId: '',
        accountId: selectedAccount,
        categoryId: selectedCategory,
        amount: Math.round(numericAmount * 100),
        type,
        description: note || null,
        date: date.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
      onComplete();
    } catch (error) {
      console.error('Failed to add transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [numericAmount, type, selectedCategory, selectedAccount, note, date, addTransaction, onClose, onComplete]);

  const selectedCateData = displayCategories.find((c) => c.id === selectedCategory);
  const selectedAccData = accounts.find((a) => a.id === selectedAccount);

  // Category limit bar
  const limitInfo = useMemo(() => {
    if (type !== 'EXPENSE' || !selectedCategory) return null;
    const cat = categories.find((c) => c.id === selectedCategory);
    if (!cat || !cat.monthlyLimit || cat.monthlyLimit <= 0) return null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const spent = transactions
      .filter((t) => t.type === 'EXPENSE' && t.categoryId === selectedCategory && new Date(t.date) >= startOfMonth)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const limit = Number(cat.monthlyLimit);
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = limit - spent;
    const threshold = 80;
    const barColor = percent > 100 ? C.expenseBar.over : percent >= threshold ? C.expenseBar.warn : C.expenseBar.ok;

    return { percent, remaining, barColor, limit, spent };
  }, [type, selectedCategory, categories, transactions]);

  const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: C.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: 34,
      maxHeight: '95%',
    },
    handle: {
      width: 36,
      height: 5,
      borderRadius: 3,
      backgroundColor: C.handle,
      alignSelf: 'center',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    section: { paddingHorizontal: 20, marginBottom: 16 },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: C.textSec,
      marginBottom: 8,
      textTransform: 'uppercase',
    },

    // Type toggle
    typeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    typeBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.card,
    },
    typeBtnActive: { borderColor: 'transparent' },
    typeLabel: { fontSize: 15, fontWeight: '600', color: C.textSec },
    typeLabelActive: {},

    // Amount display
    amountWrap: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    amountText: { fontSize: 32, fontWeight: '800', letterSpacing: -1, lineHeight: 40 },
    lifeCostBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
      backgroundColor: C.inputBg,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: C.border,
    },
    lifeCostText: { fontSize: 16, color: C.yellow, fontWeight: '700' },

    // Date row
    dateBtn: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 6,
      backgroundColor: C.inputBg,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.border,
    },
    dateText: { fontSize: 13, fontWeight: '600', color: C.textMain },
    dateChevron: { fontSize: 12, color: C.textSec },

    // Quick actions row
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 20,
    },
    actionBtn: { alignItems: 'center', gap: 4 },
    actionIconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
    },
    actionIconWrapActive: {},
    actionLabel: { fontSize: 11, color: C.textSec },

    // Budget bar
    budgetBar: {
      backgroundColor: C.inputBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: C.border,
    },
    budgetRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    budgetLabel: { fontSize: 12, color: C.textSec },
    budgetValue: { fontSize: 12, fontWeight: '600' },
    budgetTrack: {
      height: 4,
      borderRadius: 2,
      backgroundColor: C.expenseBar.track,
      overflow: 'hidden',
    },
    budgetFill: { height: 4, borderRadius: 2 },

    // Note input
    noteInput: {
      backgroundColor: C.inputBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: C.textMain,
      borderWidth: 1,
      borderColor: C.border,
    },

    // Account picker
    accountRow: {
      flexDirection: 'row',
      gap: 8,
    },
    accountBtn: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: C.inputBg,
      borderWidth: 1,
      borderColor: C.border,
    },
    accountBtnActive: { borderColor: 'transparent' },
    accountLabel: { fontSize: 14, color: C.textMain },
    accountLabelActive: {},

    // Numpad
    numpadGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 12,
    },
    numpadKey: {
      width: '25%',
      aspectRatio: 1.3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numpadInner: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
    },
    numpadOp: { backgroundColor: C.primaryBg },
    numpadOpActive: { backgroundColor: C.primaryBorder },
    numpadDel: { backgroundColor: C.redBg },
    numpadKeyText: { fontSize: 20, fontWeight: '600', color: C.textMain },
    numpadOpText: { color: C.primary },
    numpadDelText: { color: C.red },

    // Bottom row (equals + save)
    bottomRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      paddingTop: 4,
      gap: 10,
    },
    equalsBtn: {
      width: 60,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: C.primaryBg,
    },
    equalsText: { fontSize: 32, fontWeight: '700', color: C.primary },
    saveBtn: {
      flex: 1,
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.primary,
    },
    saveText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  });

  // Styles for the embedded category picker modal
  const SC = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: C.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: 34,
      maxHeight: '80%',
    },
    handle: {
      width: 36,
      height: 5,
      borderRadius: 3,
      backgroundColor: C.handle,
      alignSelf: 'center',
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: C.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: C.border,
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20 },
    catItem: {
      width: '30%',
      paddingVertical: 14,
      alignItems: 'center',
      borderRadius: 14,
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
    },
    catItemActive: { borderColor: 'transparent' },
    catName: { fontSize: 12, fontWeight: '600', color: C.textMain, textAlign: 'center', marginTop: 6 },
    emptyWrap: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 15, color: C.textSec, marginBottom: 16 },
    emptyBtn: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    emptyBtnText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
    newCatBtn: {
      marginHorizontal: 20,
      marginTop: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed' as const,
      borderColor: C.border,
      alignItems: 'center',
    },
    newCatText: { fontSize: 15, color: C.textSec },
  });

  // ---- Render ----

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={S.overlay}>
        <Pressable style={S.overlay} onPress={onClose}>
          <View style={{ flex: 1 }} />
        </Pressable>

        <View style={S.sheet}>
          {/* Handle */}
          <View style={S.handle} />

          {/* Header */}
          <View style={S.header}>
            <Text style={S.headerTitle}>
              {type === 'EXPENSE' ? 'Добавить расход' : 'Добавить доход'}
            </Text>
            <Pressable style={S.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color={C.textSec} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* ──── Тип ──── */}
            <View style={S.section}>
              <Text style={S.sectionTitle}>Тип</Text>
              <View style={S.typeRow}>
                {[
                  { k: TransactionTypeEnum.EXPENSE, label: '− Расход' },
                  { k: TransactionTypeEnum.INCOME, label: '+ Доход' },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.k}
                    onPress={() => {
                      setType(tab.k as TransactionType);
                      setSelectedCategory(null);
                    }}
                    style={[
                      S.typeBtn,
                      type === tab.k && { backgroundColor: colors.background, borderColor: colors.primary },
                    ]}
                  >
                    <Text style={[S.typeLabel, type === tab.k && { color: colors.primary }]}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ──── Сумма ──── */}
            <View style={[S.section, { marginBottom: 6 }]}>
              <Text style={S.sectionTitle}>Сумма</Text>
              <View style={[S.amountWrap, { height: type === 'EXPENSE' ? 100 : 70 }]}>
                <Text style={[S.amountText, { color: colors.primary }]} numberOfLines={1}>
                  {displayAmount}
                </Text>
                {lifeHours && type === 'EXPENSE' && (
                  <View style={S.lifeCostBadge}>
                    <Ionicons name="time-outline" size={16} color={C.yellow} />
                    <Text style={S.lifeCostText}>{lifeHours} работы</Text>
                  </View>
                )}
              </View>
            </View>

            {/* ──── Дата ──── */}
            <View style={[S.section, { marginBottom: 14, alignItems: 'center' }]}>
              <TouchableOpacity style={S.dateBtn} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={16} color={C.textSec} />
                <Text style={S.dateText}>{formatDateFull(date)}</Text>
                <Ionicons name="chevron-down" size={12} color={C.textSec} />
              </TouchableOpacity>
            </View>

            {/* ──── Действия ──── */}
            <View style={S.section}>
              <Text style={S.sectionTitle}>Детали</Text>
              <View style={S.actionsRow}>
                {/* Заметка */}
                <TouchableOpacity
                  onPress={() => setShowNoteInput(!showNoteInput)}
                  style={S.actionBtn}
                >
                  <View style={[S.actionIconWrap, showNoteInput && { backgroundColor: colors.background, borderColor: colors.primary }]}>
                    <Ionicons name="document-text-outline" size={20} color={showNoteInput ? colors.primary : C.textSec} />
                  </View>
                  <Text style={S.actionLabel}>{note ? 'Есть' : 'Заметка'}</Text>
                </TouchableOpacity>

                {/* Счёт */}
                <TouchableOpacity
                  onPress={() => setShowAccountPicker(!showAccountPicker)}
                  style={S.actionBtn}
                >
                  <View style={S.actionIconWrap}>
                    <Ionicons name="card-outline" size={20} color={C.textSec} />
                  </View>
                  <Text style={S.actionLabel}>{selectedAccData?.name || 'Счёт'}</Text>
                </TouchableOpacity>

                {/* Категория */}
                <TouchableOpacity
                  onPress={() => setShowCategoryPicker(true)}
                  style={S.actionBtn}
                >
                  {selectedCateData ? (
                    <CategoryIcon
                      icon={selectedCateData.icon || ''}
                      color={selectedCateData.color || colors.primary}
                      size={28}
                    />
                  ) : (
                    <View style={S.actionIconWrap}>
                      <Ionicons name="grid-outline" size={20} color={C.textSec} />
                    </View>
                  )}
                  <Text style={S.actionLabel} numberOfLines={1}>
                    {selectedCateData?.name || 'Категория'}
                  </Text>
                </TouchableOpacity>

                {/* Голос */}
                <TouchableOpacity onPress={() => setShowVoiceModal(true)} style={S.actionBtn}>
                  <View style={[S.actionIconWrap, { backgroundColor: C.primaryBg, borderColor: C.primaryBorder }]}>
                    <Ionicons name="mic-outline" size={20} color={C.primary} />
                  </View>
                  <Text style={S.actionLabel}>Голос</Text>
                </TouchableOpacity>

                {/* Чек */}
                <ReceiptScannerButton
                  onResult={(r) => { setAiResult(r); setShowAiPreview(true); }}
                />
              </View>
            </View>

            {/* ──── Нота ──── */}
            {showNoteInput && (
              <View style={S.section}>
                <TextInput
                  style={S.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholder="Добавить заметку..."
                  placeholderTextColor={C.textMuted}
                  autoFocus
                />
              </View>
            )}

            {/* ──── Счёт ──── */}
            {showAccountPicker && (
              <View style={S.section}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={S.accountRow}>
                    {accounts.map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => { setSelectedAccount(acc.id); setShowAccountPicker(false); }}
                        style={[
                          S.accountBtn,
                          selectedAccount === acc.id && {
                            backgroundColor: colors.background,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <Text style={S.accountLabel}>{acc.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            )}

            {/* ──── Лимит категории ──── */}
            {limitInfo && (
              <View style={S.section}>
                <View style={S.budgetBar}>
                  <View style={S.budgetRow}>
                    <Text style={S.budgetLabel}>Лимит категории</Text>
                    <Text style={[S.budgetValue, { color: limitInfo.barColor }]}>
                      {limitInfo.percent > 100
                        ? `Превышен на ${formatCurrency(Math.abs(limitInfo.remaining))}`
                        : `Осталось ${formatCurrency(limitInfo.remaining)}`}
                    </Text>
                  </View>
                  <View style={S.budgetTrack}>
                    <View
                      style={[
                        S.budgetFill,
                        {
                          width: `${Math.min(limitInfo.percent, 100)}%`,
                          backgroundColor: limitInfo.barColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* ──── Numpad ──── */}
            <View style={S.numpadGrid}>
              {NUMPAD_KEYS.map((key) => {
                const isOp = ['+', '−', '×', '÷'].includes(key);
                const isDelete = key === '⌫';
                const isActiveOp = isOp && pendingOp === key;

                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => {
                      if (isDelete) handleDelete();
                      else if (isOp) handleMathOp(key as MathOp);
                      else if (key === '.' && amount.includes('.')) return;
                      else handleNumberPress(key);
                    }}
                    onLongPress={isDelete ? () => {
                      deleteTimer.current = setInterval(() => handleDelete(), 80);
                    } : undefined}
                    onPressOut={isDelete ? () => {
                      if (deleteTimer.current) { clearInterval(deleteTimer.current); deleteTimer.current = null; }
                    } : undefined}
                    style={S.numpadKey}
                    activeOpacity={0.6}
                  >
                    <View
                      style={[
                        S.numpadInner,
                        isOp && S.numpadOp,
                        isActiveOp && S.numpadOpActive,
                        isDelete && S.numpadDel,
                      ]}
                    >
                      <Text
                        style={[
                          S.numpadKeyText,
                          isOp && S.numpadOpText,
                          isDelete && S.numpadDelText,
                        ]}
                      >
                        {key}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ──── Bottom row ──── */}
            <View style={{ height: 6 }} />
            <View style={S.bottomRow}>
              {pendingOp ? (
                <TouchableOpacity style={S.saveBtn} onPress={handleEquals}>
                  <Text style={S.saveText}>=</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!numericAmount || !selectedCategory || !selectedAccount || isSubmitting}
                  style={[
                    S.saveBtn,
                    {
                      backgroundColor:
                        !numericAmount || !selectedCategory || !selectedAccount
                          ? C.divider
                          : colors.primary,
                      opacity: isSubmitting ? 0.6 : 1,
                    },
                  ]}
                >
                  <Text style={S.saveText}>
                    {isSubmitting ? 'Сохранение...' : '✓ Сохранить'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* ──── Date Picker ──── */}
      <DatePickerModal
        visible={showDatePicker}
        currentDate={date}
        onSelect={(d) => { setDate(d); setShowDatePicker(false); }}
        onClose={() => setShowDatePicker(false)}
      />

      {/* ──── Category Picker ──── */}
      <RNModal visible={showCategoryPicker} transparent animationType="slide">
        <View style={SC.overlay}>
          <Pressable style={SC.overlay} onPress={() => setShowCategoryPicker(false)}>
            <View style={{ flex: 1 }} />
          </Pressable>

          <View style={SC.sheet}>
            <View style={SC.handle} />

            <View style={SC.header}>
              <Text style={SC.headerTitle}>Категория</Text>
              <Pressable style={SC.closeBtn} onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={18} color={C.textSec} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
              {displayCategories.length === 0 ? (
                <View style={SC.emptyWrap}>
                  <Text style={SC.emptyText}>Нет категорий</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setShowCategoryPicker(false);
                      onClose();
                      router.push('/main/categories/create');
                    }}
                    style={[SC.emptyBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={SC.emptyBtnText}>{t('categories.create')}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={SC.grid}>
                    {displayCategories.map((cat) => (
                      <TouchableOpacity
                        key={cat.id}
                        onPress={() => {
                          setSelectedCategory(cat.id);
                          setShowCategoryPicker(false);
                        }}
                        style={[
                          SC.catItem,
                          selectedCategory === cat.id && {
                            backgroundColor: colors.background,
                            borderColor: colors.primary,
                          },
                        ]}
                      >
                        <CategoryIcon
                          icon={cat.icon}
                          color={cat.color || colors.primary}
                          size={26}
                        />
                        <Text style={SC.catName} numberOfLines={1}>
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setShowCategoryPicker(false);
                      onClose();
                      router.push('/main/categories/create');
                    }}
                    style={SC.newCatBtn}
                  >
                    <Text style={SC.newCatText}>+ Создать новую категорию</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </RNModal>

      {/* ──── Voice Modal ──── */}
      {/* <VoiceInputModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onResult={(r) => {
          setAiResult(r);
          setShowVoiceModal(false);
          setShowAiPreview(true);
        }}
      /> */}

      {/* ──── AI Preview ──── */}
      <AiTransactionPreview
        visible={showAiPreview}
        onClose={() => setShowAiPreview(false)}
        onComplete={() => setShowAiPreview(false)}
        result={aiResult}
      />
    </RNModal>
  );
}
