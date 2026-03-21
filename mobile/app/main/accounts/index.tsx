import { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, useColorScheme, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useDataStore } from '../../../src/stores/dataStore';
import { AccountType } from '../../../src/types';
import { lightTheme, darkTheme } from '../../../src/utils/theme';

const ACCOUNT_TYPE_CONFIG = {
  [AccountType.CASH]: { icon: 'cash', color: '#34C759', label: 'Наличные' },
  [AccountType.BANK]: { icon: 'card', color: '#007AFF', label: 'Банк' },
  [AccountType.CREDIT]: { icon: 'credit-card', color: '#FF9500', label: 'Кредитка' },
  [AccountType.INVESTMENT]: { icon: 'trending-up', color: '#9D7BBD', label: 'Инвестиции' },
  [AccountType.DEBT]: { icon: 'alert-circle', color: '#FF3B30', label: 'Долг' },
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function AccountsScreen() {
  const systemColorScheme = useColorScheme() ?? 'light';
  const colors = systemColorScheme === 'dark' ? darkTheme : lightTheme;
  const { accounts, addAccount } = useDataStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: AccountType.BANK, balance: '' });

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const assets = accounts.filter(acc => acc.balance >= 0).reduce((sum, acc) => sum + acc.balance, 0);
  const liabilities = accounts.filter(acc => acc.balance < 0).reduce((sum, acc) => sum + acc.balance, 0);

  const handleAddAccount = () => {
    if (!newAccount.name || !newAccount.balance) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const account = {
      id: Date.now().toString(),
      userId: '1',
      name: newAccount.name,
      type: newAccount.type,
      balance: parseFloat(newAccount.balance) * 100,
      currency: 'RUB',
      isDefault: accounts.length === 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addAccount(account as any);
    setShowAddModal(false);
    setNewAccount({ name: '', type: AccountType.BANK, balance: '' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Summary Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.summaryLabel}>Общий баланс</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalBalance)}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-up-circle" size={16} color={colors.success} />
              <Text style={styles.summaryItemText}>Активы: {formatCurrency(assets)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons name="arrow-down-circle" size={16} color={colors.danger} />
              <Text style={styles.summaryItemText}>Пассивы: {formatCurrency(liabilities)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Add Account Button */}
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.surface }]} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>Добавить счет</Text>
        </TouchableOpacity>

        {/* Accounts List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои счета</Text>
        {accounts.map((account, index) => {
          const typeConfig = ACCOUNT_TYPE_CONFIG[account.type] || ACCOUNT_TYPE_CONFIG[AccountType.BANK];
          return (
            <Animated.View
              key={account.id}
              entering={FadeInDown.duration(300).delay(index * 50)}
              style={[styles.accountCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.accountIconContainer}>
                <Ionicons name={typeConfig.icon as any} size={24} color={typeConfig.color} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                <Text style={[styles.accountType, { color: colors.textSecondary }]}>{typeConfig.label}</Text>
              </View>
              <Text style={[styles.accountBalance, { color: account.balance >= 0 ? colors.success : colors.danger }]}>
                {formatCurrency(account.balance)}
              </Text>
            </Animated.View>
          );
        })}

        {/* Empty State */}
        {accounts.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Нет счетов</Text>
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>Добавьте свой первый счет</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Account Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Новый счет</Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]}
              placeholder="Название счета"
              placeholderTextColor={colors.textTertiary}
              value={newAccount.name}
              onChangeText={(text) => setNewAccount({ ...newAccount, name: text })}
            />
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.backgroundTertiary, color: colors.text }]}
              placeholder="Начальный баланс"
              placeholderTextColor={colors.textTertiary}
              value={newAccount.balance}
              onChangeText={(text) => setNewAccount({ ...newAccount, balance: text })}
              keyboardType="numeric"
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>Тип счета</Text>
            <View style={styles.typeSelector}>
              {Object.entries(ACCOUNT_TYPE_CONFIG).map(([type, config]) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    { backgroundColor: colors.backgroundTertiary },
                    newAccount.type === type && { backgroundColor: config.color + '20' },
                  ]}
                  onPress={() => setNewAccount({ ...newAccount, type: type as AccountType })}
                >
                  <Ionicons name={config.icon as any} size={16} color={newAccount.type === type ? config.color : colors.textSecondary} />
                  <Text style={[
                    styles.typeOptionText,
                    { color: newAccount.type === type ? config.color : colors.textSecondary },
                  ]}>
                    {config.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.backgroundTertiary }]} onPress={() => setShowAddModal(false)}>
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleAddAccount}>
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Добавить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 24,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryItemText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  accountIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountType: {
    fontSize: 13,
    marginTop: 2,
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  typeOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
