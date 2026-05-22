import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../stores/dataStore';
import { useTheme } from '../../stores/themeStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
import { DatePickerModal } from './DatePickerModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import type { Transaction } from '../../types';

interface Props {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionActionModal({ visible, transaction, onClose }: Props) {
  const { t } = useTranslation();
  const C = useTheme();
  const transactions = useDataStore((s) => s.transactions);
  const categories = useDataStore((s) => s.categories);
  const accounts = useDataStore((s) => s.accounts);
  const deleteTransaction = useDataStore((s) => s.deleteTransaction);
  const updateTransaction = useDataStore((s) => s.updateTransaction);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  // Local copy that stays in sync with store
  const [localTx, setLocalTx] = useState<Transaction | null>(null);

  // Sync localTx when opening or when store transactions change
  React.useEffect(() => {
    if (visible && transaction) {
      // Always use the latest from store
      const fresh = transactions.find(t => t.id === transaction.id);
      setLocalTx(fresh || transaction);
    }
  }, [visible, transaction?.id, transactions]);

  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editAccountId, setEditAccountId] = useState('');
  const [editDate, setEditDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const category = useMemo(
    () => localTx ? categories.find((c) => c.id === localTx.categoryId) : null,
    [localTx, categories],
  );
  const account = useMemo(
    () => localTx ? accounts.find((a) => a.id === localTx.accountId) : null,
    [localTx, accounts],
  );

  const lifeHours = useMemo(() => {
    if (!localTx || localTx.type !== 'EXPENSE') return null;
    const rate = getHourlyRate();
    if (rate <= 0) return null;
    const rubles = localTx.amount / 100;
    const hours = rubles / rate;
    if (hours < 1) return `${Math.round(hours * 60)} ${t('common.min')}`;
    if (hours < 100) return `${hours.toFixed(1)} ${t('common.hours')}`;
    return `${Math.round(hours)} ${t('common.hours')}`;
  }, [localTx, getHourlyRate]);

  const handleEdit = useCallback(() => {
    if (!localTx) return;
    setEditDescription(localTx.description || '');
    setEditAmount(String(localTx.amount / 100));
    setEditAccountId(localTx.accountId);
    setEditDate(new Date(localTx.date));
    setIsEditing(true);
  }, [localTx]);

  const handleSaveEdit = useCallback(async () => {
    if (!localTx) return;
    try {
      const amountNum = parseFloat(editAmount);
      await updateTransaction(localTx.id, {
        description: editDescription || undefined,
        amount: !isNaN(amountNum) && amountNum > 0 ? Math.round(amountNum * 100) : undefined,
        accountId: editAccountId !== localTx.accountId ? editAccountId : undefined,
        date: editDate.toISOString(),
      });
      // Refresh local copy from store
      const fresh = useDataStore.getState().transactions.find(t => t.id === localTx.id);
      if (fresh) setLocalTx(fresh);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  }, [localTx, editDescription, editAmount, editAccountId, editDate, updateTransaction]);

  const confirmDelete = useCallback(async () => {
    if (!localTx) return;
    setShowDeleteConfirm(false);
    try {
      await deleteTransaction(localTx.id);
      onClose();
    } catch (e) { console.error('Delete failed:', e); }
  }, [localTx, deleteTransaction, onClose]);

  const handleClose = useCallback(() => {
    setIsEditing(false);
    onClose();
  }, [onClose]);

  const MONTHS_GEN_KEYS = ['monthsGen.jan','monthsGen.feb','monthsGen.mar','monthsGen.apr','monthsGen.may','monthsGen.jun','monthsGen.jul','monthsGen.aug','monthsGen.sep','monthsGen.oct','monthsGen.nov','monthsGen.dec'] as const;
  const fmtDate = (d: Date) => `${d.getDate()} ${t(MONTHS_GEN_KEYS[d.getMonth()])} ${d.getFullYear()}`;

  const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: C.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: 34,
      maxHeight: '90%',
    },
    handle: {
      width: 36, height: 5, borderRadius: 3,
      backgroundColor: C.handle,
      alignSelf: 'center', marginBottom: 16,
    },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 20, marginBottom: 16,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
    closeBtn: {
      width: 32, height: 32, borderRadius: 10,
      backgroundColor: C.card, alignItems: 'center', justifyContent: 'center',
      borderWidth: 1, borderColor: C.border,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 16 },
    amountText: { fontSize: 22, fontWeight: '800' },
    metaSection: { paddingHorizontal: 20, marginBottom: 12 },
    metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
    metaLabel: { fontSize: 13, color: C.textSec },
    metaValue: { fontSize: 13, color: C.textMain, fontWeight: '500' },
    descBox: {
      backgroundColor: C.inputBg, borderRadius: 12, padding: 14,
      marginHorizontal: 20, marginBottom: 16,
      borderWidth: 1, borderColor: C.border,
    },
    descLabel: { fontSize: 11, color: C.textSec, marginBottom: 4, textTransform: 'uppercase' },
    descText: { fontSize: 14, color: C.textMain, lineHeight: 20 },
    section: { paddingHorizontal: 20, marginBottom: 14 },
    sectionTitle: { fontSize: 11, fontWeight: '600', color: C.textSec, marginBottom: 6, textTransform: 'uppercase' },
    input: {
      backgroundColor: C.inputBg, borderRadius: 12,
      paddingHorizontal: 14, paddingVertical: 12,
      fontSize: 14, color: C.textMain,
      borderWidth: 1, borderColor: C.border, marginBottom: 8,
    },
    btnRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 20 },
    editBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 14,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: C.primaryBg,
      borderWidth: 1, borderColor: C.primaryBorder,
      flexDirection: 'row', gap: 6,
    },
    editBtnText: { fontSize: 14, fontWeight: '700', color: C.primary },
    deleteBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 14,
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: C.redBg,
      borderWidth: 1, borderColor: C.redBorder,
      flexDirection: 'row', gap: 6,
    },
    deleteBtnText: { fontSize: 14, fontWeight: '600', color: C.red },
    saveBtn: {
      paddingVertical: 14, borderRadius: 14, alignItems: 'center',
      backgroundColor: C.primary, marginTop: 4,
    },
    saveBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
    cancelBtn: {
      paddingVertical: 12, borderRadius: 14, alignItems: 'center',
      backgroundColor: C.inputBg, marginTop: 8,
      borderWidth: 1, borderColor: C.border,
    },
    cancelBtnText: { fontSize: 14, color: C.textSec },
    lifeCost: {
      alignItems: 'center', backgroundColor: C.orangeBg,
      borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
      borderWidth: 1, borderColor: C.orangeBorder,
    },
    lifeCostValue: { fontSize: 20, fontWeight: '800', color: C.amber },
    lifeCostLabel: { fontSize: 11, color: C.amber, opacity: 0.7 },
  });

  if (!localTx) return null;

  const isExpense = localTx.type === 'EXPENSE';
  const amountColor = isExpense ? C.red : C.green;

  return (
    <>
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={S.overlay}>
        <Pressable style={S.overlay} onPress={handleClose}>
          <View style={{ flex: 1 }} />
        </Pressable>

        <View style={S.sheet}>
          <View style={S.handle} />

          <View style={S.header}>
            <Text style={S.headerTitle}>
              {isEditing ? t('transactions.editing') : t('components.operation')}
            </Text>
            <Pressable style={S.closeBtn} onPress={handleClose}>
              <Ionicons name="close" size={18} color={C.textSec} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header with icon + amount */}
            <View style={S.row}>
              <CategoryIcon
                icon={category?.icon || ''}
                color={category?.color || amountColor}
                size={30}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, color: C.textMain, fontWeight: '600' }}>
                  {category?.name || t('transactions.noCategoryFallback')}
                </Text>
                <Text style={[S.amountText, { color: amountColor }]}>
                  {isExpense ? '− ' : '+ '}{formatCurrency(localTx.amount, account?.currency)}
                </Text>
              </View>
              {lifeHours && (
                <View style={S.lifeCost}>
                  <Text style={S.lifeCostValue}>{lifeHours}</Text>
                  <Text style={S.lifeCostLabel}>{t('common.workUnit')}</Text>
                </View>
              )}
            </View>

            {isEditing ? (
              <>
                {/* Edit: Amount */}
                <View style={S.section}>
                  <Text style={S.sectionTitle}>{t('transactions.amount')}</Text>
                  <TextInput
                    style={S.input}
                    value={editAmount}
                    onChangeText={setEditAmount}
                    keyboardType="decimal-pad"
                    placeholderTextColor={C.textMuted}
                  />
                </View>

                {/* Edit: Account */}
                <View style={S.section}>
                  <Text style={S.sectionTitle}>{t('transactions.account')}</Text>                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {accounts.map((acc) => (
                      <TouchableOpacity
                        key={acc.id}
                        onPress={() => setEditAccountId(acc.id)}
                        style={{
                          paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10,
                          backgroundColor: editAccountId === acc.id ? amountColor + '18' : C.inputBg,
                          borderWidth: 1,
                          borderColor: editAccountId === acc.id ? amountColor : C.border,
                        }}
                      >
                        <Text style={{ fontSize: 13, color: editAccountId === acc.id ? amountColor : C.textMain }}>
                          {acc.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Edit: Date */}
                <View style={S.section}>
                  <Text style={S.sectionTitle}>{t('transactions.date')}</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 8,
                      backgroundColor: C.inputBg, borderRadius: 12,
                      paddingHorizontal: 14, paddingVertical: 12,
                      borderWidth: 1, borderColor: C.border,
                    }}
                  >
                    <Ionicons name="calendar-outline" size={16} color={C.textSec} />
                    <Text style={{ fontSize: 14, color: C.textMain }}>{fmtDate(editDate)}</Text>
                  </TouchableOpacity>
                </View>

                {/* Edit: Description */}
                <View style={S.section}>
                  <Text style={S.sectionTitle}>{t('transactions.note')}</Text>
                  <TextInput
                    style={[S.input, { minHeight: 80 }]}
                    value={editDescription}
                    onChangeText={setEditDescription}
                    placeholder={t('transactions.notePlaceholder')}
                    placeholderTextColor={C.textMuted}
                    multiline
                  />
                </View>

                <View style={{ paddingHorizontal: 20 }}>
                  <TouchableOpacity style={S.saveBtn} onPress={handleSaveEdit}>
                    <Text style={S.saveBtnText}>{t('common.save')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={S.cancelBtn} onPress={() => setIsEditing(false)}>
                    <Text style={S.cancelBtnText}>{t('common.cancel')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* View: Meta */}
                <View style={S.metaSection}>
                  <View style={S.metaRow}>
                    <Text style={S.metaLabel}>{t('transactions.date')}</Text>
                    <Text style={S.metaValue}>{formatDate(new Date(localTx.date))}</Text>
                  </View>
                  {account && (
                    <View style={S.metaRow}>
                      <Text style={S.metaLabel}>{t('transactions.account')}</Text>
                      <Text style={S.metaValue}>{account.name}</Text>
                    </View>
                  )}
                </View>

                {/* View: Description */}
                {localTx.description && !isEditing && (
                  <View style={S.descBox}>
                    <Text style={S.descLabel}>{t('transactions.note')}</Text>
                    <Text style={S.descText}>{localTx.description}</Text>
                  </View>
                )}

                {/* View: Buttons */}
                <View style={S.btnRow}>
                  <TouchableOpacity style={S.editBtn} onPress={handleEdit}>
                    <Ionicons name="create-outline" size={16} color={C.primary} />
                    <Text style={S.editBtnText}>{t('common.edit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={S.deleteBtn} onPress={() => setShowDeleteConfirm(true)}>
                    <Ionicons name="trash-outline" size={16} color={C.red} />
                    <Text style={S.deleteBtnText}>{t('common.delete')}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </RNModal>

    <DatePickerModal
      visible={showDatePicker}
      currentDate={editDate}
      onSelect={(d) => { setEditDate(d); setShowDatePicker(false); }}
      onClose={() => setShowDatePicker(false)}
    />

    <ConfirmModal
      visible={showDeleteConfirm}
      title={t('components.confirmDelete')}
      message={localTx ? `${category?.name || t('transactions.noCategoryFallback')} — ${formatCurrency(localTx.amount, account?.currency)}` : ''}
      confirmText={t('common.delete')}
      onConfirm={confirmDelete}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    </>
  );
}
