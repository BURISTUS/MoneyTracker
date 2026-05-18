import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Modal as RNModal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDataStore } from '../../stores/dataStore';
import { useTheme } from '../../stores/themeStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
import { formatCurrency } from '../../utils/formatters';
import type { AiTransactionResult, AiReceiptResult } from '../../services/ai';
import { useToast } from './Toast';

interface AiTransactionPreviewProps {
  visible: boolean;
  onClose: () => void;
  onComplete: () => void;
  result: AiTransactionResult | AiReceiptResult | null;
}

// Дефолтные иконки/цвета для новых категорий
const CATEGORY_PRESETS: Record<string, { icon: string; color: string }> = {
  'Продукты': { icon: 'material:cart', color: '#34C759' },
  'Транспорт': { icon: 'material:bus', color: '#007AFF' },
  'Жильё': { icon: 'material:home', color: '#FF9500' },
  'Коммунальные': { icon: 'material:flash', color: '#FFCC00' },
  'Связь': { icon: 'material:phone', color: '#5856D6' },
  'Здоровье': { icon: 'material:medical-bag', color: '#FF2D55' },
  'Развлечения': { icon: 'material:gamepad-variant', color: '#AF52DE' },
  'Одежда': { icon: 'material:tshirt-crew', color: '#5AC8FA' },
  'Рестораны': { icon: 'material:food', color: '#FF3B30' },
  'Подарки': { icon: 'material:gift', color: '#FF2D55' },
  'Зарплата': { icon: 'material:wallet', color: '#34C759' },
  'Фриланс': { icon: 'material:laptop', color: '#007AFF' },
  'Инвестиции': { icon: 'material:chart-line', color: '#5856D6' },
};

function getCategoryPreset(name: string): { icon: string; color: string } {
  return CATEGORY_PRESETS[name] || { icon: 'material:tag', color: '#8E8E93' };
}

export function AiTransactionPreview({
  visible,
  onClose,
  onComplete,
  result,
}: AiTransactionPreviewProps) {
  const { t } = useTranslation();
  const C = useTheme();
  const toast = useToast();
  const addTransaction = useDataStore((s) => s.addTransaction);
  const addCategory = useDataStore((s) => s.addCategory);
  const categories = useDataStore((s) => s.categories);
  const accounts = useDataStore((s) => s.accounts);
  const fetchCategories = useDataStore((s) => s.fetchCategories);

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showItems, setShowItems] = useState(false);

  // Инициализация при новом результате
  React.useEffect(() => {
    if (visible && result) {
      setAmount(String(result.amount));
      setDescription(result.description || '');
      if (accounts.length > 0 && !selectedAccount) {
        setSelectedAccount(accounts[0].id);
      }
    }
  }, [visible, result]);

  // Найти существующую категорию
  const matchedCategory = useMemo(() => {
    if (!result) return null;
    return categories.find(
      (c) =>
        c.name.toLowerCase() === result.categoryName.toLowerCase() &&
        c.type === result.categoryType,
    );
  }, [result, categories]);

  const isNewCategory = !matchedCategory;

  const COLORS = {
    EXPENSE: { primary: C.red, bg: C.redBg },
    INCOME: { primary: C.green, bg: C.greenBg },
  };
  const colors = result ? COLORS[result.type] || COLORS.EXPENSE : COLORS.EXPENSE;

  const handleSave = useCallback(async () => {
    if (!result || !selectedAccount) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    setIsSaving(true);
    try {
      let categoryId = matchedCategory?.id;

      // Создать категорию, если не существует
      if (!categoryId) {
        const preset = getCategoryPreset(result.categoryName);
        await addCategory({
          name: result.categoryName,
          type: result.categoryType as any,
          icon: preset.icon,
          color: preset.color,
        });
        // Перечитаем категории, чтобы найти ID новой
        await fetchCategories();
        const freshCategories = useDataStore.getState().categories;
        const created = freshCategories.find(
          (c) =>
            c.name.toLowerCase() === result.categoryName.toLowerCase() &&
            c.type === result.categoryType,
        );
        categoryId = created?.id;
      }

      if (!categoryId) {
        toast.showError(t('aiPreview.categoryNotFound'));
        setIsSaving(false);
        return;
      }

      await addTransaction({
        id: `temp_${Date.now()}`,
        userId: '',
        accountId: selectedAccount,
        categoryId,
        amount: Math.round(amountNum * 100),
        type: result.type as any,
        description: description || null,
        date: result.date || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setIsSaving(false);
      onClose();
      onComplete();
    } catch (error) {
      setIsSaving(false);
      console.error('Failed to save AI transaction:', error);
      toast.showError(t('aiPreview.saveFailed'));
    }
  }, [result, amount, description, selectedAccount, matchedCategory, addTransaction, addCategory, fetchCategories, onClose, onComplete]);

  const S = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: C.sheet,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
      maxHeight: '90%',
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: C.handle,
      alignSelf: 'center',
      marginTop: 8,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
    closeText: { fontSize: 14, color: C.textSec },
    content: { paddingHorizontal: 16, paddingBottom: 20 },
    // Type card
    typeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16,
      backgroundColor: C.inputBg,
      borderRadius: 16,
      padding: 16,
    },
    typeIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    typeLabel: { fontSize: 16, fontWeight: '700', color: C.textMain },
    catRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    catLabel: { fontSize: 14, color: C.textMain },
    newBadge: {
      backgroundColor: C.primaryBg,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 100,
      marginLeft: 4,
    },
    newBadgeText: { fontSize: 10, color: C.primary },
    // Fields
    fieldLabel: { fontSize: 12, color: C.textSec, marginBottom: 6 },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: C.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
    },
    fieldInput: { flex: 1, color: C.textMain, fontSize: 20, fontWeight: '700' },
    fieldSuffix: { fontSize: 14, color: C.textSec, marginLeft: 8 },
    descInput: {
      backgroundColor: C.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: C.textMain,
      fontSize: 14,
      marginBottom: 12,
    },
    infoBox: {
      backgroundColor: C.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
    },
    infoLabel: { fontSize: 12, color: C.textSec },
    infoValue: { fontSize: 14, fontWeight: '700', color: C.textMain, marginTop: 2 },
    // Receipt items
    itemsToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: C.inputBg,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
    },
    itemsToggleText: { fontSize: 12, color: C.textSec },
    itemsToggleArrow: { fontSize: 12, color: C.primary },
    itemsList: {
      marginTop: -8,
      marginBottom: 12,
      backgroundColor: C.divider,
      borderRadius: 12,
      overflow: 'hidden',
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    itemName: { fontSize: 14, color: C.textMain },
    itemCatName: { fontSize: 12, color: C.textSec },
    itemAmount: { fontSize: 14, fontWeight: '700', color: C.textMain, marginLeft: 12 },
    // Account chips
    accountScroll: { marginBottom: 16 },
    accountChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
    },
    accountChipText: { fontSize: 14, color: C.textMain },
    // Bottom buttons
    bottomRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingTop: 8,
      gap: 8,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    },
    cancelBtn: {
      paddingHorizontal: 24,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: C.divider,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelBtnText: { fontSize: 14, fontWeight: '700', color: C.textSec },
    saveBtn: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    saveBtnText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  });

  if (!result) return null;

  const receiptItems = 'items' in result ? (result as AiReceiptResult).items : undefined;
  const storeName = 'store' in result ? (result as AiReceiptResult).store : undefined;

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose} transparent>
      <View style={S.overlay}>
        <Pressable style={{ flex: 1 }} onPress={onClose} />

        <View style={S.sheet}>
          <View style={S.handle} />

          {/* Заголовок */}
          <View style={S.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>🤖</Text>
              <Text style={S.headerTitle}>{t('aiPreview.recognized')}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={S.closeText}>{t('aiPreview.close')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={S.content}>
            {/* Тип и категория */}
            <View style={S.typeCard}>
              <View style={[S.typeIconWrap, { backgroundColor: colors.bg }]}>
                <Text style={{ fontSize: 24 }}>{result.type === 'INCOME' ? '💰' : '💸'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.typeLabel}>
                  {result.type === 'INCOME' ? t('aiPreview.incomeType') : t('aiPreview.expenseType')}
                </Text>
                <View style={S.catRow}>
                  <CategoryIcon
                    icon={matchedCategory?.icon || getCategoryPreset(result.categoryName).icon}
                    color={matchedCategory?.color || getCategoryPreset(result.categoryName).color}
                    size={16}
                  />
                  <Text style={S.catLabel}>{result.categoryName}</Text>
                  {isNewCategory && (
                    <View style={S.newBadge}>
                      <Text style={S.newBadgeText}>{t('aiPreview.newBadge')}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Сумма */}
            <Text style={S.fieldLabel}>{t('aiPreview.amountLabel')}</Text>            <View style={S.fieldRow}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                style={S.fieldInput}
                placeholderTextColor={C.textSec}
              />
              <Text style={S.fieldSuffix}>₽</Text>
            </View>

            {/* Описание */}
            <Text style={S.fieldLabel}>{t('aiPreview.descriptionLabel')}</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={S.descInput}
              placeholderTextColor={C.textSec}
              placeholder={t('aiPreview.descriptionPlaceholder')}
            />

            {/* Магазин (для чеков) */}
            {storeName && (
              <View style={S.infoBox}>
                <Text style={S.infoLabel}>{t('aiPreview.storeLabel')}</Text>
                <Text style={S.infoValue}>{storeName}</Text>
              </View>
            )}

            {/* Дата */}
            {result.date && (
              <View style={S.infoBox}>
                <Text style={S.infoLabel}>{t('aiPreview.dateLabel')}</Text>
                <Text style={S.infoValue}>
                  {new Date(result.date).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
            )}

            {/* Позиции чека */}
            {receiptItems && receiptItems.length > 0 && (
              <View>
                <TouchableOpacity onPress={() => setShowItems(!showItems)} style={S.itemsToggle}>
                  <Text style={S.itemsToggleText}>{t('aiPreview.receiptItems')} ({receiptItems.length})</Text>
                  <Text style={S.itemsToggleArrow}>{showItems ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showItems && (
                  <View style={S.itemsList}>
                    {receiptItems.map((item, idx) => (
                      <View
                        key={idx}
                        style={[
                          S.itemRow,
                          {
                            borderBottomWidth: idx < receiptItems.length - 1 ? 1 : 0,
                            borderBottomColor: C.border,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={S.itemName}>{item.name}</Text>
                          <Text style={S.itemCatName}>{item.categoryName}</Text>
                        </View>
                        <Text style={S.itemAmount}>{item.amount} ₽</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Счёт */}
            <Text style={S.fieldLabel}>{t('aiPreview.accountLabel')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.accountScroll}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {accounts.map((account) => (
                  <TouchableOpacity
                    key={account.id}
                    onPress={() => setSelectedAccount(account.id)}
                    style={[
                      S.accountChip,
                      {
                        backgroundColor: selectedAccount === account.id ? colors.bg : C.inputBg,
                        borderColor: selectedAccount === account.id ? colors.primary : 'transparent',
                      },
                    ]}
                  >
                    <Text style={S.accountChipText}>{account.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </ScrollView>

          {/* Кнопки */}
          <View style={S.bottomRow}>
            <TouchableOpacity onPress={onClose} style={S.cancelBtn}>
              <Text style={S.cancelBtnText}>{t('aiPreview.cancelBtn')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving || !amount || !selectedAccount}
              style={[
                S.saveBtn,
                {
                  backgroundColor: !amount || !selectedAccount || isSaving ? C.divider : colors.primary,
                  opacity: isSaving ? 0.6 : 1,
                },
              ]}
            >
              <Text style={S.saveBtnText}>
                {isSaving ? t('aiPreview.savingBtn') : `✓ ${t('aiPreview.saveBtn')}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </RNModal>
  );
}
