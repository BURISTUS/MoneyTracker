import React, { useMemo } from 'react';
import {
  View,
  Pressable,
  Modal as RNModal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../stores/themeStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { Text } from '../../../components/ui/text';
import { CategoryIcon } from './CategoryIcon';
import { DatePickerModal } from './DatePickerModal';
import { ReceiptScannerButton } from './ReceiptScanner';
import { AiTransactionPreview } from './AiTransactionPreview';
import { PremiumBadge } from './PremiumBadge';
import { formatCurrency } from '../../utils/formatters';

import {
  useTransactionForm,
  TransactionTypeToggle,
  AmountInput,
  CategorySelector,
  AccountSelector,
  TransactionNoteInput,
} from './TransactionForm';

import type { TransactionType } from '../../types';
import { TransactionType as TransactionTypeEnum } from '../../types';

const MONTHS_GEN_KEYS = [
  'monthsGen.jan', 'monthsGen.feb', 'monthsGen.mar', 'monthsGen.apr',
  'monthsGen.may', 'monthsGen.jun', 'monthsGen.jul', 'monthsGen.aug',
  'monthsGen.sep', 'monthsGen.oct', 'monthsGen.nov', 'monthsGen.dec',
] as const;

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

  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  const checkAccess = useSubscriptionStore((s) => s.checkAccess);

  const form = useTransactionForm({ visible, initialType, onClose, onComplete });

  React.useEffect(() => {
    if (visible) form.reset();
    return form.cleanupTimer;
  }, [visible]);

  const formatDateFull = (d: Date) =>
    `${d.getDate()} ${t(MONTHS_GEN_KEYS[d.getMonth()])} ${d.getFullYear()}`;

  const navigateToCreateCategory = () => {
    form.setShowCategoryPicker(false);
    onClose();
    router.push('/main/categories/create');
  };

  const S = useMemo(
    () =>
      StyleSheet.create({
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
        actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
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
        actionLabel: { fontSize: 11, color: C.textSec },
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
      }),
    [C],
  );

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={S.overlay}>
        <Pressable style={S.overlay} onPress={onClose}>
          <View style={{ flex: 1 }} />
        </Pressable>

        <View style={S.sheet}>
          <View style={S.handle} />

          <View style={S.header}>
            <Text style={S.headerTitle}>
              {form.type === 'EXPENSE' ? t('transactions.addExpense') : t('transactions.addIncome')}
            </Text>
            <Pressable style={S.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color={C.textSec} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <TransactionTypeToggle
              type={form.type}
              onTypeChange={form.setType}
              colors={form.colors}
            />

            <AmountInput
              displayAmount={form.displayAmount}
              lifeHours={form.lifeHours}
              showLifeCost={form.type === 'EXPENSE'}
              colors={form.colors}
              pendingOp={form.pendingOp}
              onNumberPress={form.handleNumberPress}
              onDelete={form.handleDelete}
              onMathOp={form.handleMathOp}
              onEquals={form.handleEquals}
              onSubmit={form.handleSubmit}
              canSubmit={!!(form.numericAmount && form.selectedCategory && form.selectedAccount)}
              isSubmitting={form.isSubmitting}
            />

            <View style={[S.section, { marginBottom: 14, alignItems: 'center' }]}>
              <TouchableOpacity style={S.dateBtn} onPress={() => form.setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={16} color={C.textSec} />
                <Text style={S.dateText}>{formatDateFull(form.date)}</Text>
                <Ionicons name="chevron-down" size={12} color={C.textSec} />
              </TouchableOpacity>
            </View>

            <View style={S.section}>
              <Text style={S.sectionTitle}>{t('transactions.details')}</Text>
              <View style={S.actionsRow}>
                <TouchableOpacity
                  onPress={() => form.setShowNoteInput(!form.showNoteInput)}
                  style={S.actionBtn}
                >
                  <View
                    style={[
                      S.actionIconWrap,
                      form.showNoteInput && {
                        backgroundColor: form.colors.background,
                        borderColor: form.colors.primary,
                      },
                    ]}
                  >
                    <Ionicons
                      name="document-text-outline"
                      size={20}
                      color={form.showNoteInput ? form.colors.primary : C.textSec}
                    />
                  </View>
                  <Text style={S.actionLabel}>
                    {form.note ? t('transactions.hasNote') : t('transactions.note')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => form.setShowAccountPicker(!form.showAccountPicker)}
                  style={S.actionBtn}
                >
                  <View style={S.actionIconWrap}>
                    <Ionicons name="card-outline" size={20} color={C.textSec} />
                  </View>
                  <Text style={S.actionLabel}>
                    {form.selectedAccData?.name || t('transactions.account')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => form.setShowCategoryPicker(true)}
                  style={S.actionBtn}
                >
                  {form.selectedCateData ? (
                    <CategoryIcon
                      icon={form.selectedCateData.icon || ''}
                      color={form.selectedCateData.color || form.colors.primary}
                      size={28}
                    />
                  ) : (
                    <View style={S.actionIconWrap}>
                      <Ionicons name="grid-outline" size={20} color={C.textSec} />
                    </View>
                  )}
                  <Text style={S.actionLabel} numberOfLines={1}>
                    {form.selectedCateData?.name || t('transactions.category')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    if (showPaywall('AI_VOICE')) return;
                    form.setShowVoiceModal(true);
                  }}
                  style={S.actionBtn}
                >
                  <View style={{ position: 'relative' }}>
                    <View
                      style={[
                        S.actionIconWrap,
                        { backgroundColor: C.primaryBg, borderColor: C.primaryBorder },
                      ]}
                    >
                      <Ionicons name="mic-outline" size={20} color={C.primary} />
                    </View>
                    {!checkAccess('AI_VOICE')?.allowed && (
                      <PremiumBadge size="sm" style={{ position: 'absolute', top: -6, right: -6 }} />
                    )}
                  </View>
                  <Text style={S.actionLabel}>{t('transactions.voice')}</Text>
                </TouchableOpacity>

                <ReceiptScannerButton
                  onResult={(r) => {
                    form.setAiResult(r);
                    form.setShowAiPreview(true);
                  }}
                />
              </View>
            </View>

            <TransactionNoteInput
              visible={form.showNoteInput}
              note={form.note}
              onChangeText={form.setNote}
            />

            <AccountSelector
              visible={form.showAccountPicker}
              selectedAccount={form.selectedAccount}
              accounts={form.accounts}
              colors={form.colors}
              onSelect={(id) => {
                form.setSelectedAccount(id);
                form.setShowAccountPicker(false);
              }}
            />

            {form.limitInfo && (
              <View style={S.section}>
                <View style={S.budgetBar}>
                  <View style={S.budgetRow}>
                    <Text style={S.budgetLabel}>{t('transactions.categoryLimit')}</Text>
                    <Text style={[S.budgetValue, { color: form.limitInfo.barColor }]}>
                      {form.limitInfo.percent > 100
                        ? `${t('transactions.limitExceeded')} ${formatCurrency(Math.abs(form.limitInfo.remaining))}`
                        : `${t('transactions.limitRemaining')} ${formatCurrency(form.limitInfo.remaining)}`}
                    </Text>
                  </View>
                  <View style={S.budgetTrack}>
                    <View
                      style={[
                        S.budgetFill,
                        {
                          width: `${Math.min(form.limitInfo.percent, 100)}%`,
                          backgroundColor: form.limitInfo.barColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      <DatePickerModal
        visible={form.showDatePicker}
        currentDate={form.date}
        onSelect={(d) => {
          form.setDate(d);
          form.setShowDatePicker(false);
        }}
        onClose={() => form.setShowDatePicker(false)}
      />

      <CategorySelector
        visible={form.showCategoryPicker}
        selectedCategory={form.selectedCategory}
        categories={form.displayCategories}
        colors={form.colors}
        onSelect={(id) => {
          form.setSelectedCategory(id);
          form.setShowCategoryPicker(false);
        }}
        onClose={() => form.setShowCategoryPicker(false)}
        onNavigateToCreate={navigateToCreateCategory}
      />

      <AiTransactionPreview
        visible={form.showAiPreview}
        onClose={() => form.setShowAiPreview(false)}
        onComplete={() => form.setShowAiPreview(false)}
        result={form.aiResult}
      />
    </RNModal>
  );
}
