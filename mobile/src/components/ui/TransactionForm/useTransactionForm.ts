import { useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../../stores/dataStore';
import { useAuthStore } from '../../../stores/authStore';
import { useTheme } from '../../../stores/themeStore';
import type { TransactionType } from '../../../types';
import { TransactionType as TransactionTypeEnum } from '../../../types';
import type { AiTransactionResult, AiReceiptResult } from '../../../services/ai';

export type MathOp = '+' | '−' | '×' | '÷' | null;

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

interface UseTransactionFormParams {
  visible: boolean;
  initialType?: TransactionType;
  onClose: () => void;
  onComplete: () => void;
}

export function useTransactionForm({
  visible,
  initialType = TransactionTypeEnum.EXPENSE,
  onClose,
  onComplete,
}: UseTransactionFormParams) {
  const { t } = useTranslation();
  const C = useTheme();

  const addTransaction = useDataStore((s: any) => s.addTransaction);
  const accounts = useDataStore((s: any) => s.accounts);
  const categories = useDataStore((s: any) => s.categories);
  const transactions = useDataStore((s: any) => s.transactions);
  const user = useAuthStore((s: any) => s.user);
  const getHourlyRate = useDataStore((s: any) => s.getHourlyRate);

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

  const EXPENSE_COLORS = { primary: C.red, background: C.redBg };
  const INCOME_COLORS = { primary: C.green, background: C.greenBg };
  const colors = type === 'EXPENSE' ? EXPENSE_COLORS : INCOME_COLORS;

  const displayCategories = useMemo(
    () => categories.filter((c: any) => c.type === (type as string)),
    [categories, type],
  );

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
    if (h < 1) return `${Math.round(h * 60)} ${t('common.min')}`;
    if (h < 24) return `${h.toFixed(1)} ${t('common.hours')}`;
    return `${(h / 24).toFixed(1)} ${t('components.daysShort')}`;
  }, [numericAmount, hourlyRate]);

  const selectedCateData = displayCategories.find((c: any) => c.id === selectedCategory);
  const selectedAccData = accounts.find((a: any) => a.id === selectedAccount);

  const limitInfo = useMemo(() => {
    if (type !== 'EXPENSE' || !selectedCategory) return null;
    const cat = categories.find((c: any) => c.id === selectedCategory);
    if (!cat || !cat.monthlyLimit || cat.monthlyLimit <= 0) return null;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const spent = transactions
      .filter((tr: any) => tr.type === 'EXPENSE' && tr.categoryId === selectedCategory && new Date(tr.date) >= startOfMonth)
      .reduce((sum: number, tr: any) => sum + Number(tr.amount), 0);

    const limit = Number(cat.monthlyLimit);
    const percent = limit > 0 ? (spent / limit) * 100 : 0;
    const remaining = limit - spent;
    const threshold = 80;
    const barColor = percent > 100 ? C.expenseBar.over : percent >= threshold ? C.expenseBar.warn : C.expenseBar.ok;

    return { percent, remaining, barColor, limit, spent };
  }, [type, selectedCategory, categories, transactions]);

  const reset = useCallback(() => {
    setType(initialType);
    setAmount('');
    setPendingOp(null);
    setPreviousValue('');
    setSelectedCategory(null);
    if (accounts.length > 0) setSelectedAccount(accounts[0].id);
  }, [initialType, accounts]);

  const cleanupTimer = useCallback(() => {
    if (deleteTimer.current) {
      clearInterval(deleteTimer.current);
      deleteTimer.current = null;
    }
  }, []);

  const handleNumberPress = useCallback((num: string) => {
    setAmount((prev) => {
      if (prev === '0' && num !== '.') return num;
      if (prev.length >= 12) return prev;
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

  const handleTypeChange = useCallback((newType: TransactionType) => {
    setType(newType);
    setSelectedCategory(null);
  }, []);

  return {
    t,
    C,
    type,
    colors,
    amount,
    pendingOp,
    previousValue,
    displayAmount,
    numericAmount,
    lifeHours,
    selectedCategory,
    selectedAccount,
    note,
    date,
    showNoteInput,
    showAccountPicker,
    showCategoryPicker,
    showDatePicker,
    isSubmitting,
    showVoiceModal,
    showAiPreview,
    aiResult,
    deleteTimer,
    displayCategories,
    hourlyRate,
    selectedCateData,
    selectedAccData,
    limitInfo,
    accounts,

    setType: handleTypeChange,
    setAmount,
    setPendingOp,
    setPreviousValue,
    setSelectedCategory,
    setSelectedAccount,
    setNote,
    setDate,
    setShowNoteInput,
    setShowAccountPicker,
    setShowCategoryPicker,
    setShowDatePicker,
    setIsSubmitting,
    setShowVoiceModal,
    setShowAiPreview,
    setAiResult,

    handleNumberPress,
    handleDelete,
    handleMathOp,
    handleEquals,
    handleSubmit,
    reset,
    cleanupTimer,
  };
}
