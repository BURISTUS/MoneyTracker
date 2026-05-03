import { useTranslation } from 'react-i18next';
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useDataStore } from '../../stores/dataStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ConfirmModal } from './ConfirmModal';
import type { Transaction } from '../../types';

interface TransactionActionModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionActionModal({
  visible,
  transaction,
  onClose,
}: TransactionActionModalProps) {
  const { t } = useTranslation();
  const categories = useDataStore((s) => s.categories);
  const accounts = useDataStore((s) => s.accounts);
  const deleteTransaction = useDataStore((s) => s.deleteTransaction);
  const updateTransaction = useDataStore((s) => s.updateTransaction);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const category = useMemo(
    () => (transaction ? categories.find((c) => c.id === transaction.categoryId) : null),
    [transaction, categories],
  );

  const account = useMemo(
    () => (transaction ? accounts.find((a) => a.id === transaction.accountId) : null),
    [transaction, accounts],
  );

  const lifeHours = useMemo(() => {
    if (!transaction || transaction.type !== 'EXPENSE') return null;
    const rate = getHourlyRate();
    if (rate <= 0) return null;
    const rubles = transaction.amount / 100;
    const hours = rubles / rate;
    if (hours < 1) return `${Math.round(hours * 60)} мин`;
    if (hours < 100) return `${hours.toFixed(1)} ч`;
    return `${Math.round(hours)} ч`;
  }, [transaction, getHourlyRate]);

  const handleDelete = useCallback(() => {
    if (!transaction) return;
    setShowDeleteConfirm(true);
  }, [transaction]);

  const confirmDelete = useCallback(async () => {
    if (!transaction) return;
    setShowDeleteConfirm(false);
    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [transaction, deleteTransaction, onClose]);

  const handleEdit = useCallback(() => {
    if (!transaction) return;
    setEditDescription(transaction.description || '');
    setIsEditing(true);
  }, [transaction]);

  const handleSaveEdit = useCallback(async () => {
    if (!transaction) return;
    try {
      await updateTransaction(transaction.id, { description: editDescription });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  }, [transaction, editDescription, updateTransaction]);

  const handleClose = useCallback(() => {
    setIsEditing(false);
    setEditDescription('');
    onClose();
  }, [onClose]);

  if (!transaction) return null;

  const isExpense = transaction.type === 'EXPENSE';
  const amountColor = isExpense ? '#FF3B30' : '#34C759';

  return (
    <>
    <RNModal visible={visible} animationType="slide" onRequestClose={handleClose} transparent>
      <View className="flex-1 bg-[rgba(0,0,0,0.5)] justify-end">
        <Pressable className="flex-1" onPress={handleClose} />

        <View
          className="bg-[#1C1C1E] rounded-t-3xl"
          style={{ paddingBottom: Platform.OS === 'ios' ? 34 : 16 }}
        >
          <View className="w-9 h-1 bg-[#3A3A3C] rounded-full self-center mt-2 mb-4" />

          <View className="px-5">
            <View className="flex-row items-center gap-4 mb-4">
              <CategoryIcon
                icon={category?.icon || ''}
                color={category?.color || (isExpense ? '#FF3B30' : '#34C759')}
                size={28}
              />
              <View className="flex-1">
                <Text bold className="text-lg text-white">
                  {category?.name || 'Без категории'}
                </Text>
                <Text bold className="text-xl" style={{ color: amountColor }}>
                  {isExpense ? '− ' : '+ '}{formatCurrency(transaction.amount)}
                </Text>
              </View>
              {lifeHours && (
                <View className="items-end" style={{ backgroundColor: 'rgba(255,149,0,0.12)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#FF9500' }}>
                    {lifeHours}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#FF9500', opacity: 0.7 }}>
                    работы
                  </Text>
                </View>
              )}
            </View>

            <View className="gap-2 mb-5">
              <View className="flex-row justify-between">
                <Text className="text-sm text-[#8E8E93]">Дата</Text>
                <Text className="text-sm text-white">
                  {formatDate(new Date(transaction.date))}
                </Text>
              </View>
              {account && (
                <View className="flex-row justify-between">
                  <Text className="text-sm text-[#8E8E93]">Счёт</Text>
                  <Text className="text-sm text-white">{account.name}</Text>
                </View>
              )}
            </View>

            {isEditing ? (
              <View className="mb-4">
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Добавить заметку..."
                  placeholderTextColor="#8E8E93"
                  autoFocus
                  className="bg-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3 text-white text-base mb-2"
                />
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setIsEditing(false)}
                    className="flex-1 py-3 rounded-xl bg-[rgba(255,255,255,0.05)] items-center"
                  >
                    <Text className="text-base text-[#8E8E93]">Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    className="flex-1 py-3 rounded-xl bg-primary-500 items-center"
                  >
                    <Text bold className="text-base text-white">Сохранить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              transaction.description && (
                <View className="bg-[rgba(255,255,255,0.03)] rounded-xl p-3.5 mb-4">
                  <Text className="text-xs text-[#8E8E93] mb-1">Заметка</Text>
                  <Text className="text-base text-white">{transaction.description}</Text>
                </View>
              )
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleEdit}
                className="flex-1 py-3.5 rounded-[14px] bg-[rgba(99,102,241,0.15)] items-center"
              >
                <Text bold className="text-base text-primary-400">{t("common.editAction")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3.5 rounded-[14px] bg-[rgba(255,59,48,0.15)] items-center"
                style={{ opacity: isDeleting ? 0.5 : 1 }}
              >
                <Text bold className="text-base text-error-400">
                  {isDeleting ? 'Удаление...' : '🗑 Удалить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </RNModal>

      <ConfirmModal
        visible={showDeleteConfirm}
        title="Удалить операцию?"
        message={transaction ? `${category?.name || 'Без категории'} — ${formatCurrency(transaction.amount)}` : ''}
        confirmText="Удалить"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
}