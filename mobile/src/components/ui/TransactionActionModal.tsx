import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useDataStore } from '../../stores/dataStore';
import { Text } from './Text';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency, formatDate } from '../../utils/formatters';
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
  const categories = useDataStore((s) => s.categories);
  const accounts = useDataStore((s) => s.accounts);
  const deleteTransaction = useDataStore((s) => s.deleteTransaction);
  const updateTransaction = useDataStore((s) => s.updateTransaction);
  const getHourlyRate = useDataStore((s) => s.getHourlyRate);

  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

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
    if (hours < 24) return `${hours.toFixed(1)} ч`;
    return `${(hours / 24).toFixed(1)} дн`;
  }, [transaction, getHourlyRate]);

  const handleDelete = useCallback(() => {
    if (!transaction) return;
    Alert.alert(
      'Удалить операцию?',
      `${category?.name || 'Без категории'} — ${formatCurrency(transaction.amount)}`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteTransaction(transaction.id);
              onClose();
            } catch (error) {
              console.error('Failed to delete:', error);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [transaction, category, deleteTransaction, onClose]);

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
    <RNModal visible={visible} animationType="slide" onRequestClose={handleClose} transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={handleClose} />

        <View style={{
          backgroundColor: '#1C1C1E',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingBottom: Platform.OS === 'ios' ? 34 : 16,
        }}>
          <View style={{ width: 36, height: 4, backgroundColor: '#3A3A3C', borderRadius: 2, alignSelf: 'center', marginTop: 8, marginBottom: 16 }} />

          <View style={{ paddingHorizontal: 20 }}>
            {/* Category + Amount */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <CategoryIcon
                icon={category?.icon || ''}
                color={category?.color || (isExpense ? '#FF3B30' : '#34C759')}
                size={28}
              />
              <View style={{ flex: 1 }}>
                <Text size="lg" weight="semibold" style={{ color: '#FFFFFF' }}>
                  {category?.name || 'Без категории'}
                </Text>
                <Text size="xl" weight="bold" style={{ color: amountColor }}>
                  {isExpense ? '− ' : '+ '}{formatCurrency(transaction.amount)}
                </Text>
              </View>
            </View>

            {/* Details */}
            <View style={{ gap: 8, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text size="sm" style={{ color: '#8E8E93' }}>Дата</Text>
                <Text size="sm" style={{ color: '#FFFFFF' }}>
                  {formatDate(new Date(transaction.date))}
                </Text>
              </View>
              {account && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text size="sm" style={{ color: '#8E8E93' }}>Счёт</Text>
                  <Text size="sm" style={{ color: '#FFFFFF' }}>{account.name}</Text>
                </View>
              )}
              {lifeHours && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text size="sm" style={{ color: '#8E8E93' }}>Время работы</Text>
                  <Text size="sm" style={{ color: '#FBBF24' }}>⏱ {lifeHours}</Text>
                </View>
              )}
            </View>

            {/* Description / Edit */}
            {isEditing ? (
              <View style={{ marginBottom: 16 }}>
                <TextInput
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder="Добавить заметку..."
                  placeholderTextColor="#8E8E93"
                  autoFocus
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    color: '#FFFFFF',
                    fontSize: 16,
                    marginBottom: 8,
                  }}
                />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setIsEditing(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      alignItems: 'center',
                    }}
                  >
                    <Text size="md" style={{ color: '#8E8E93' }}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: '#6366F1',
                      alignItems: 'center',
                    }}
                  >
                    <Text size="md" weight="semibold" style={{ color: '#FFFFFF' }}>Сохранить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              transaction.description && (
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                }}>
                  <Text size="xs" style={{ color: '#8E8E93', marginBottom: 4 }}>Заметка</Text>
                  <Text size="md" style={{ color: '#FFFFFF' }}>{transaction.description}</Text>
                </View>
              )
            )}

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleEdit}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  alignItems: 'center',
                }}
              >
                <Text size="md" weight="semibold" style={{ color: '#6366F1' }}>
                  📝 Редактировать
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 14,
                  backgroundColor: 'rgba(255, 59, 48, 0.15)',
                  alignItems: 'center',
                  opacity: isDeleting ? 0.5 : 1,
                }}
              >
                <Text size="md" weight="semibold" style={{ color: '#FF3B30' }}>
                  {isDeleting ? 'Удаление...' : '🗑 Удалить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
