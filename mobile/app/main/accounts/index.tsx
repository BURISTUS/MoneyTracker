import React, { useState, useCallback } from 'react';
import { View, FlatList, Pressable, ScrollView, Modal, TextInput, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDataStore } from '../../../src/stores/dataStore';
import { useTheme } from '../../../src/stores/themeStore';
import { Text } from '../../../components/ui/text';
import { CurrencyPicker } from '../../../src/components/ui/CurrencyPicker';
import { TransferModal } from '../../../src/components/ui/TransferModal';
import { formatCurrency } from '../../../src/utils/formatters';
import { currencyService } from '../../../src/services/currency';
import type { AccountType, TransactionType } from '../../../src/types';
import { AccountType as AccountTypeEnum, TransactionType as TransactionTypeEnum } from '../../../src/types';
import { useSubscriptionStore } from '../../../src/stores/subscriptionStore';
import { PremiumBadge } from '../../../src/components/ui/PremiumBadge';
import type { FeatureKey } from '../../../src/types';
import type { ExchangeRate } from '../../../src/services/currency';

const accountIcons: Record<AccountType, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  CASH: { icon: 'wallet-outline', color: '#34D399' },
  BANK: { icon: 'card-outline', color: '#6366F1' },
  CREDIT: { icon: 'card-outline', color: '#F87171' },
  INVESTMENT: { icon: 'trending-up-outline', color: '#FBBF24' },
  DEBT: { icon: 'alert-circle-outline', color: '#FB923C' },
};

export default function AccountsScreen() {
  const { t } = useTranslation();
  const C = useTheme();
  const router = useRouter();
  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },
    backBtn: { padding: 4, marginLeft: -4 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: C.textMain, letterSpacing: -0.3 },
    content: { paddingHorizontal: 16, paddingBottom: 120, gap: 10 },
    listContent: { gap: 10 },
    totalCard: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 18 },
    card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 18 },
    iconWrap: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.primaryBg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
    cardLabel: { fontSize: 13, color: C.textSec, fontWeight: '500', marginBottom: 6 },
    balanceValue: { fontSize: 26, fontWeight: '700', color: C.textMain, letterSpacing: -0.5 },
    empty: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 14, color: C.textSec, marginTop: 8 },
    acctRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    acctIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    acctInfo: { marginLeft: 12, flex: 1 },
    acctName: { fontSize: 15, fontWeight: '600', color: C.textMain },
    acctMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    acctType: { fontSize: 12, color: C.textSec },
    acctCurrency: { fontSize: 11, color: C.textMuted, marginLeft: 8 },
    acctBalance: { fontSize: 20, fontWeight: '700', color: C.textMain, letterSpacing: -0.5 },
    fab: { position: 'absolute', bottom: 90, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', shadowColor: C.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalSheet: { backgroundColor: C.sheet, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 },
    modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.handle, alignSelf: 'center', marginBottom: 16 },
    modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: C.textMain },
    modalFields: { gap: 16 },
    fieldLabel: { fontSize: 13, color: C.textSec, fontWeight: '500', marginBottom: 6 },
    input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: C.textMain },
    typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: C.border, backgroundColor: C.inputBg },
    typeChipActive: { borderColor: C.primaryBorder, backgroundColor: C.primaryBg },
    typeChipText: { fontSize: 12, fontWeight: '600', color: C.textSec },
    typeChipTextActive: { color: C.primary },
    currencyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    currencyValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    currencyText: { fontSize: 15, fontWeight: '600', color: C.textMain },
    createBtn: { backgroundColor: C.primary, paddingVertical: 13, borderRadius: 12, alignItems: 'center', marginTop: 4 },
    createBtnDisabled: { opacity: 0.4 },
    createBtnText: { fontSize: 14, fontWeight: '700', color: C.textMain },
    checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: C.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primaryBg },
    checkboxLabel: { fontSize: 14, color: C.textMain, fontWeight: '500' },
    transactionInfo: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg, borderRadius: 12, padding: 14, gap: 12 },
    transactionInfoText: { fontSize: 15, color: C.textMain, fontWeight: '500', flex: 1 },
    transactionAmount: { fontWeight: '700', color: C.textMain },
    transactionButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
    skipBtn: { flex: 1, backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
    skipBtnText: { fontSize: 14, fontWeight: '600', color: C.textSec },
    addTransactionBtn: { flex: 1, backgroundColor: C.primary, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
    addTransactionBtnText: { fontSize: 14, fontWeight: '700', color: C.textMain },
  });
  const insets = useSafeAreaInsets();
  const accounts = useDataStore((s) => s.accounts);
  const createAccount = useDataStore((s) => s.createAccount);
  const updateAccount = useDataStore((s) => s.updateAccount);
  const addTransaction = useDataStore((s) => s.addTransaction);
  const userCurrency = useDataStore((s) => s.userCurrency);
  const categories = useDataStore((s) => s.categories);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>(AccountTypeEnum.BANK);
  const [currency, setCurrency] = useState(userCurrency);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const [editModal, setEditModal] = useState<{
    visible: boolean;
    accountId: string | null;
    name: string;
    balance: string;
    type: AccountType;
    currency: string;
    includeInTotal: boolean;
    originalBalance: string;
  }>({ visible: false, accountId: null, name: '', balance: '0', type: AccountTypeEnum.BANK, currency: userCurrency, includeInTotal: true, originalBalance: '0' });

  const [transactionModal, setTransactionModal] = useState<{
    visible: boolean;
    accountId: string | null;
    amount: string;
    type: TransactionType;
    note: string;
  }>({ visible: false, accountId: null, amount: '', type: TransactionTypeEnum.EXPENSE, note: '' });

  const totalBalance = accounts
    .filter((a) => a.includeInTotal !== false)
    .reduce((sum, a) => {
      if (a.currency === userCurrency) {
        return sum + Number(a.balance);
      }
      const converted = currencyService.convertLocal(Number(a.balance) / 100, a.currency, userCurrency);
      return sum + Math.round(converted * 100);
    }, 0);

  const allowedTypes = useSubscriptionStore((s) => s.allowedAccountTypes());
  const showPaywall = useSubscriptionStore((s) => s.showPaywall);
  const allAccountTypes: { value: AccountType; label: string; premiumKey?: string }[] = [
    { value: AccountTypeEnum.CASH, label: t('accounts.cashLabel') },
    { value: AccountTypeEnum.BANK, label: t('accounts.bankLabel') },
    { value: AccountTypeEnum.CREDIT, label: t('accounts.creditCardLabel'), premiumKey: 'ACCOUNT_CREDIT' },
    { value: AccountTypeEnum.INVESTMENT, label: t('accounts.investmentLabel'), premiumKey: 'ACCOUNT_INVESTMENT' },
    { value: AccountTypeEnum.DEBT, label: t('accounts.debtLabel'), premiumKey: 'ACCOUNT_DEBT' },
  ];
  const accountTypes = allAccountTypes;

  const handleAdd = useCallback(async () => {
    if (!name) return;
    try {
      await createAccount({ name, type, currency });
      setName('');
      setType(AccountTypeEnum.BANK);
      setCurrency(userCurrency);
      setShowAdd(false);
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  }, [name, type, currency, userCurrency, createAccount]);

  const openEditModal = useCallback((account: { id: string; name: string; type: AccountType; balance: number; currency: string; includeInTotal: boolean }) => {
    const balanceStr = String(Math.round(Number(account.balance) / 100));
    setEditModal({
      visible: true,
      accountId: account.id,
      name: account.name,
      balance: balanceStr,
      type: account.type,
      currency: account.currency,
      includeInTotal: account.includeInTotal !== false,
      originalBalance: balanceStr,
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editModal.accountId || !editModal.name) return;

    const currentAccount = accounts.find((a) => a.id === editModal.accountId);
    if (!currentAccount) return;

    const newBalanceKopecks = Math.round(Number(editModal.balance) * 100);
    const oldBalanceKopecks = Number(currentAccount.balance);
    const difference = newBalanceKopecks - oldBalanceKopecks;

    await updateAccount(editModal.accountId, {
      name: editModal.name,
      type: editModal.type,
      balance: newBalanceKopecks,
      currency: editModal.currency,
      includeInTotal: editModal.includeInTotal,
    });

    if (difference !== 0) {
      setEditModal((prev) => ({ ...prev, visible: false }));
      const transactionType = difference > 0 ? TransactionTypeEnum.INCOME : TransactionTypeEnum.EXPENSE;
      setTransactionModal({
        visible: true,
        accountId: editModal.accountId,
        amount: String(Math.abs(Math.round(difference / 100))),
        type: transactionType,
        note: '',
      });
    } else {
      setEditModal({ visible: false, accountId: null, name: '', balance: '0', type: AccountTypeEnum.BANK, currency: userCurrency, includeInTotal: true, originalBalance: '0' });
    }
  }, [editModal, accounts, updateAccount, userCurrency]);

  const handleAddTransaction = useCallback(async () => {
    if (!transactionModal.accountId || !transactionModal.amount) return;

    const adjustmentCategory = categories.find((c) => c.name === t('accounts.adjustmentCategory'));
    const categoryId = adjustmentCategory ? adjustmentCategory.id : (categories.length > 0 ? categories[0].id : '');

    const amountKopecks = Math.round(Number(transactionModal.amount) * 100);
    const signedAmount = transactionModal.type === TransactionTypeEnum.EXPENSE ? -amountKopecks : amountKopecks;

    await addTransaction({
      id: `temp_${Date.now()}`,
      userId: '',
      accountId: transactionModal.accountId,
      categoryId,
      amount: Math.abs(signedAmount),
      type: transactionModal.type,
      description: transactionModal.note || t("accounts.balanceAdjustment"),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setTransactionModal({ visible: false, accountId: null, amount: '', type: TransactionTypeEnum.EXPENSE, note: '' });
  }, [transactionModal, categories, addTransaction]);

  const handleSkipTransaction = useCallback(() => {
    setTransactionModal({ visible: false, accountId: null, amount: '', type: TransactionTypeEnum.EXPENSE, note: '' });
  }, []);

  const handleTransferComplete = useCallback(async () => {
    setShowTransfer(false);
    await useDataStore.getState().fetchAccounts();
    await useDataStore.getState().fetchTransactions();
  }, []);

  const renderAccount = useCallback(({ item }: { item: { id: string; name: string; type: AccountType; balance: number; currency: string; includeInTotal: boolean } }) => {
    const cfg = accountIcons[item.type] || accountIcons.CASH;
    return (
      <Pressable onPress={() => openEditModal(item)} style={s.card}>
        <View style={s.acctRow}>
          <View style={[s.acctIcon, { backgroundColor: `${cfg.color}15` }]}>
            <Ionicons name={cfg.icon} size={18} color={cfg.color} />
          </View>
          <View style={s.acctInfo}>
            <Text style={s.acctName}>{item.name}</Text>
            <View style={s.acctMetaRow}>
              <Text style={s.acctType}>{item.type}</Text>
              <Text style={s.acctCurrency}>{item.currency}</Text>
              {!item.includeInTotal && (
                <Ionicons name="eye-off" size={12} color="#52525B" style={{ marginLeft: 6 }} />
              )}
            </View>
          </View>
          <Ionicons name="pencil" size={16} color="#52525B" />
        </View>
        <Text style={s.acctBalance}>{formatCurrency(item.balance, item.currency)}</Text>
      </Pressable>
    );
  }, [openEditModal]);

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={s.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#A1A1AA" />
        </Pressable>
        <Text style={s.headerTitle}>{t("accounts.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <View style={s.totalCard}>
          <View style={s.iconWrap}>
            <Ionicons name="wallet-outline" size={18} color="#6366F1" />
          </View>
          <Text style={s.cardLabel}>{t("accounts.totalBalance")}</Text>
          <Text style={s.balanceValue} numberOfLines={1} adjustsFontSizeToFit>{formatCurrency(totalBalance)}</Text>
        </View>

        {/* Transfer Card */}
        {accounts.length >= 2 && (
          <Pressable
            onPress={() => setShowTransfer(true)}
            style={{
              backgroundColor: C.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.primaryBorder,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View style={{
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: C.primaryBg,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Ionicons name="swap-horizontal" size={20} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.textMain }}>{t("accounts.transferBetweenAccounts")}</Text>
              <Text style={{ fontSize: 12, color: C.textSec, marginTop: 2 }}>{t("accounts.transferDesc")}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#52525B" />
          </Pressable>
        )}

        {accounts.length === 0 ? (
          <View style={s.empty}>
            <Ionicons name="wallet-outline" size={44} color="#3F3F46" />
            <Text style={s.emptyText}>{t("accounts.noAccounts")}</Text>
          </View>
        ) : (
          <FlatList
            data={accounts}
            renderItem={renderAccount}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
            contentContainerStyle={s.listContent}
          />
        )}
      </ScrollView>

      <Pressable
        onPress={() => setShowAdd(true)}
        style={s.fab}
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <Pressable style={s.modalOverlay} onPress={() => setShowAdd(false)}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t("accounts.newAccount")}</Text>
              <Pressable onPress={() => setShowAdd(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <View style={s.modalFields}>
              <Text style={s.fieldLabel}>{t("common.name")}</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder={t('accounts.myAccountPlaceholder')}
                placeholderTextColor="#52525B"
              />

              <Text style={s.fieldLabel}>{t("common.type")}</Text>
              <View style={s.typeRow}>
                {accountTypes.map((at) => {
                  const active = type === at.value;
                  const locked = at.premiumKey && !allowedTypes.includes(at.value);
                  return (
                    <Pressable
                      key={at.value}
                      onPress={() => {
                        if (locked && at.premiumKey) {
                          showPaywall(at.premiumKey as FeatureKey);
                          return;
                        }
                        setType(at.value);
                      }}
                      style={[s.typeChip, active && s.typeChipActive, locked && { opacity: 0.5 }]}
                    >
                      <Text style={[s.typeChipText, active && s.typeChipTextActive]}>
                        {at.label}
                      </Text>
                      {locked && <PremiumBadge />}
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => setShowCurrencyPicker(true)}
                style={s.currencyRow}
              >
                <Text style={s.fieldLabel}>{t("profile.currency")}</Text>
                <View style={s.currencyValue}>
                  <Text style={s.currencyText}>{currency}</Text>
                  <Ionicons name="chevron-forward" size={14} color="#52525B" />
                </View>
              </Pressable>

              <Pressable
                onPress={handleAdd}
                disabled={!name}
                style={[s.createBtn, !name && s.createBtnDisabled]}
              >
                <Text style={s.createBtnText}>{t("common.create")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={editModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModal((prev) => ({ ...prev, visible: false }))}
      >
        <Pressable style={s.modalOverlay} onPress={() => setEditModal((prev) => ({ ...prev, visible: false }))}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t("accounts.editAccount")}</Text>
              <Pressable
                onPress={() => setEditModal((prev) => ({ ...prev, visible: false }))}
                hitSlop={12}
              >
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 500 }}>
              <View style={s.modalFields}>
                <Text style={s.fieldLabel}>{t("common.name")}</Text>
                <TextInput
                  style={s.input}
                  value={editModal.name}
                  onChangeText={(text) => setEditModal((prev) => ({ ...prev, name: text }))}
                  placeholder={t("accounts.accountNamePlaceholder")}
                  placeholderTextColor="#52525B"
                />

                <Text style={s.fieldLabel}>{t("common.type")}</Text>
                <View style={s.typeRow}>
                  {accountTypes.map((at) => {
                    const active = editModal.type === at.value;
                    return (
                      <Pressable
                        key={at.value}
                        onPress={() => setEditModal((prev) => ({ ...prev, type: at.value }))}
                        style={[s.typeChip, active && s.typeChipActive]}
                      >
                        <Text style={[s.typeChipText, active && s.typeChipTextActive]}>
                          {at.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={s.fieldLabel}>{t("common.balance")}</Text>
                <TextInput
                  style={s.input}
                  value={editModal.balance}
                  onChangeText={(text) => setEditModal((prev) => ({ ...prev, balance: text }))}
                  placeholder="0"
                  placeholderTextColor="#52525B"
                  keyboardType="numeric"
                />

                <Text style={s.fieldLabel}>{t("profile.currency")}</Text>
                <View style={s.currencyValue}>
                  <Text style={s.currencyText}>{editModal.currency}</Text>
                </View>

                <Pressable
                  onPress={() => setEditModal((prev) => ({ ...prev, includeInTotal: !prev.includeInTotal }))}
                  style={s.checkboxRow}
                >
                  <View style={s.checkbox}>
                    {editModal.includeInTotal && (
                      <Ionicons name="checkmark" size={16} color="#6366F1" />
                    )}
                  </View>
                  <Text style={s.checkboxLabel}>{t("accounts.includeInTotal")}</Text>
                </Pressable>

                <Pressable
                  onPress={handleSaveEdit}
                  disabled={!editModal.name}
                  style={[s.createBtn, !editModal.name && s.createBtnDisabled]}
                >
                  <Text style={s.createBtnText}>{t("common.save")}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={transactionModal.visible}
        transparent
        animationType="slide"
        onRequestClose={handleSkipTransaction}
      >
        <Pressable style={s.modalOverlay} onPress={handleSkipTransaction}>
          <Pressable style={s.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={s.modalHandle} />
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{t("accounts.addTransactionConfirm")}</Text>
              <Pressable onPress={handleSkipTransaction} hitSlop={12}>
                <Ionicons name="close" size={22} color="#A1A1AA" />
              </Pressable>
            </View>

            <View style={s.modalFields}>
              <View style={s.transactionInfo}>
                <Ionicons
                  name={transactionModal.type === TransactionTypeEnum.INCOME ? 'arrow-down-circle' : 'arrow-up-circle'}
                  size={24}
                  color={transactionModal.type === TransactionTypeEnum.INCOME ? C.green : C.red}
                />
                <Text style={s.transactionInfoText}>
                  {transactionModal.type === TransactionTypeEnum.INCOME ? t('accounts.incomeType') : t('accounts.expenseType')}:{' '}
                  <Text style={s.transactionAmount}>{transactionModal.amount} {userCurrency}</Text>
                </Text>
              </View>

              <Text style={s.fieldLabel}>{t("common.note")}</Text>
              <TextInput
                style={s.input}
                value={transactionModal.note}
                onChangeText={(text) => setTransactionModal((prev) => ({ ...prev, note: text }))}
                placeholder={t("transactions.commentPlaceholder")}
                placeholderTextColor="#52525B"
                multiline
              />

              <View style={s.transactionButtons}>
                <Pressable
                  onPress={handleSkipTransaction}
                  style={s.skipBtn}
                >
                  <Text style={s.skipBtnText}>{t("common.skip")}</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddTransaction}
                  style={s.addTransactionBtn}
                >
                  <Text style={s.addTransactionBtnText}>{t("common.add")}</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <CurrencyPicker
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        onSelect={(c: ExchangeRate) => setCurrency(c.code)}
        selectedCode={currency}
        title={t('accounts.accountCurrencyTitle')}
        filterType="FIAT"
      />

      <TransferModal
        visible={showTransfer}
        accounts={accounts}
        hourlyRate={useDataStore.getState().getHourlyRate()}
        onClose={() => setShowTransfer(false)}
        onComplete={handleTransferComplete}
      />
    </View>
  );
}
