import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useDataStore } from '../../src/stores/dataStore';
import { useTheme } from '../../src/utils/ThemeContext';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(amount);
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const { 
    transactions, accounts, budgets, gamification, goals, 
    initializeData, isLoadingTransactions, isLoadingAccounts, createAccount,
    accountTypes, fetchAccountTypes
  } = useDataStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'gamification'>('overview');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) {
      Alert.alert('Ошибка', 'Введите название счета');
      return;
    }
    if (!newAccountType) {
      Alert.alert('Ошибка', 'Выберите тип счета');
      return;
    }
    try {
      setIsCreating(true);
      await createAccount({ name: newAccountName.trim(), type: newAccountType });
      setNewAccountName('');
      setNewAccountType('');
      setIsCreateModalVisible(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать счет');
    } finally {
      setIsCreating(false);
    }
  };
  
  useEffect(() => {
    initializeData();
    fetchAccountTypes();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlyIncome = transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);

  const completedGoals = goals.filter(g => g.isCompleted).length;

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: 'pie-chart' },
    { id: 'lifecost', label: 'Стоимость жизни', icon: 'time' },
  ];

  const isLoading = isLoadingTransactions || isLoadingAccounts;
  
  if (isLoading && accounts.length === 0 && transactions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Загрузка данных...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.id ? '#FFFFFF' : colors.textSecondary} />
              <Text style={[styles.tabText, { color: activeTab === tab.id ? '#FFFFFF' : colors.textSecondary }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'overview' ? (
          <>
            {/* Balance Card */}
            <Animated.View entering={FadeInDown.duration(400)} style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
              <LinearGradient colors={['#1E3A5F', '#2DD4BF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceGradient}>
                <Text style={styles.balanceLabel}>Общий баланс</Text>
                <Text style={styles.balanceValue}>{formatCurrency(totalBalance)}</Text>
                <View style={styles.balanceRow}>
                  <View style={styles.balanceItem}>
                    <Ionicons name="arrow-down-circle" size={16} color="#34C759" />
                    <Text style={styles.balanceItemText}>+{formatCurrency(monthlyIncome)}</Text>
                  </View>
                  <View style={styles.balanceItem}>
                    <Ionicons name="arrow-up-circle" size={16} color="#FF3B30" />
                    <Text style={styles.balanceItemText}>-{formatCurrency(monthlyExpenses)}</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Quick Stats */}
            <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.statIcon, { backgroundColor: '#007AFF15' }]}>
                  <Ionicons name="wallet" size={22} color="#007AFF" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{accounts.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Счета</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.statIcon, { backgroundColor: '#FF950015' }]}>
                  <Ionicons name="pie-chart" size={22} color="#FF9500" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{budgets.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Бюджеты</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
                <View style={[styles.statIcon, { backgroundColor: '#34C75915' }]}>
                  <Ionicons name="flag" size={22} color="#34C759" />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{completedGoals}/{goals.length}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Цели</Text>
              </View>
            </Animated.View>

            {/* Accounts List */}
            <Animated.View entering={FadeInDown.duration(400).delay(150)}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Мои счета</Text>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: colors.primary }]}
                  onPress={() => setIsCreateModalVisible(true)}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              
              {accounts.length === 0 ? (
                <TouchableOpacity 
                  style={[styles.emptyAccountCard, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}
                  onPress={() => setIsCreateModalVisible(true)}
                >
                  <Ionicons name="wallet-outline" size={32} color={colors.primary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Добавьте первый счёт</Text>
                  <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>Нажмите + чтобы создать счёт</Text>
                </TouchableOpacity>
              ) : (
                accounts.map((account) => (
                  <View key={account.id} style={[styles.accountCard, { backgroundColor: colors.surface }]}>
                    <View style={styles.accountLeft}>
                      <View style={[styles.accountIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name={account.type === 'CASH' ? 'cash' : account.type === 'BANK' ? 'business' : 'wallet'} size={20} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={[styles.accountName, { color: colors.text }]}>{account.name}</Text>
                        <Text style={[styles.accountType, { color: colors.textSecondary }]}>
                          {account.type === 'CASH' ? 'Наличные' : account.type === 'BANK' ? 'Банк' : account.type === 'CREDIT' ? 'Кредит' : account.type === 'INVESTMENT' ? 'Инвестиции' : 'Долг'}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.accountBalance, { color: account.balance >= 0 ? '#34C759' : '#FF3B30' }]}>
                      {formatCurrency(account.balance)}
                    </Text>
                  </View>
                ))
              )}
            </Animated.View>

            {/* Recent Transactions */}
            <Animated.View entering={FadeInDown.duration(400).delay(200)}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Последние операции</Text>
              {transactions.slice(0, 5).map((transaction) => (
                <View key={transaction.id} style={[styles.transactionCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: transaction.category?.color + '20' }]}>
                      <Ionicons name={transaction.category?.icon as any || 'help'} size={20} color={transaction.category?.color || colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.transactionName, { color: colors.text }]}>{transaction.description}</Text>
                      <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>{transaction.category?.name || 'Без категории'}</Text>
                    </View>
                  </View>
                  <Text style={[styles.transactionAmount, { color: transaction.type === 'INCOME' ? '#34C759' : '#FF3B30' }]}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                </View>
              ))}
            </Animated.View>
          </>
        ) : (
          <>
            {/* Gamification on Home */}
            <Animated.View entering={FadeInDown.duration(400)} style={[styles.gamificationCard, { backgroundColor: colors.primary }]}>
              <LinearGradient colors={['#1E3A5F', '#2DD4BF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gamificationGradient}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelNumber}>{gamification?.level || 1}</Text>
                </View>
                <Text style={styles.levelTitle}>Уровень</Text>
                <Text style={styles.levelXP}>{gamification?.xp || 0} XP</Text>
                <View style={styles.xpBar}>
                  <View style={[styles.xpProgress, { width: `${((gamification?.xp || 0) % 1000) / 10}%` }]} />
                </View>
              </LinearGradient>
            </Animated.View>

            <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.gamificationStats}>
              <View style={[styles.gamificationStat, { backgroundColor: colors.surface }]}>
                <Ionicons name="trophy" size={28} color="#FFD700" />
                <Text style={[styles.gamificationStatValue, { color: colors.text }]}>{gamification?.level || 1}</Text>
                <Text style={[styles.gamificationStatLabel, { color: colors.textSecondary }]}>Уровень</Text>
              </View>
              <View style={[styles.gamificationStat, { backgroundColor: colors.surface }]}>
                <Ionicons name="star" size={28} color="#FFD700" />
                <Text style={[styles.gamificationStatValue, { color: colors.text }]}>{formatCurrency(gamification?.savedAmount || 0)}</Text>
                <Text style={[styles.gamificationStatLabel, { color: colors.textSecondary }]}>Сэкономлено</Text>
              </View>
              <View style={[styles.gamificationStat, { backgroundColor: colors.surface }]}>
                <Ionicons name="flame" size={28} color="#FF6B35" />
                <Text style={[styles.gamificationStatValue, { color: colors.text }]}>{gamification?.status || 'NONE'}</Text>
                <Text style={[styles.gamificationStatLabel, { color: colors.textSecondary }]}>Статус</Text>
              </View>
            </Animated.View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Create Account Modal */}
      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Новый счёт</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Название</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              placeholder="Например: Наличные"
              placeholderTextColor={colors.textSecondary}
              value={newAccountName}
              onChangeText={setNewAccountName}
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Тип счёта</Text>
            <View style={styles.typeGrid}>
              {(accountTypes.length > 0 ? accountTypes : [
                { value: 'CASH', label: 'Наличные', icon: 'cash', color: '#34C759' },
                { value: 'BANK', label: 'Банк', icon: 'business', color: '#007AFF' },
                { value: 'CREDIT', label: 'Кредит', icon: 'card', color: '#FF9500' },
                { value: 'INVESTMENT', label: 'Инвестиции', icon: 'trending-up', color: '#5856D6' },
                { value: 'DEBT', label: 'Долг', icon: 'alert-circle', color: '#FF3B30' },
              ]).map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.typeOption,
                    { backgroundColor: colors.background },
                    newAccountType === item.value && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                  ]}
                  onPress={() => setNewAccountType(item.value)}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={newAccountType === item.value ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.typeLabel, 
                    { color: newAccountType === item.value ? colors.primary : colors.textSecondary }
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={handleCreateAccount}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>Создать счёт</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 24 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 16 },
  tabsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 16, gap: 8 },
  tabText: { fontSize: 14, fontWeight: '600' },
  balanceCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  balanceGradient: { padding: 24 },
  balanceLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  balanceValue: { fontSize: 36, fontWeight: '800', color: '#FFFFFF', marginBottom: 16 },
  balanceRow: { flexDirection: 'row', gap: 24 },
  balanceItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceItemText: { fontSize: 14, color: '#FFFFFF' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center' },
  statIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  addButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  emptyAccountCard: { borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 2, borderStyle: 'dashed' },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  emptySubtext: { fontSize: 14, marginTop: 4 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, padding: 16, marginBottom: 12 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  transactionIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  transactionName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  transactionCategory: { fontSize: 13 },
  transactionAmount: { fontSize: 16, fontWeight: '700' },
  // Account cards
  accountCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 16, padding: 16, marginBottom: 12 },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  accountIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  accountName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  accountType: { fontSize: 13 },
  accountBalance: { fontSize: 16, fontWeight: '700' },
  gamificationCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  gamificationGradient: { padding: 24, alignItems: 'center' },
  levelBadge: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  levelNumber: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  levelTitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 4 },
  levelXP: { fontSize: 20, fontWeight: '700', color: '#FFFFFF', marginBottom: 12 },
  xpBar: { width: '80%', height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4 },
  xpProgress: { height: '100%', backgroundColor: '#FFFFFF', borderRadius: 4 },
  gamificationStats: { flexDirection: 'row', gap: 12 },
  gamificationStat: { flex: 1, borderRadius: 20, padding: 16, alignItems: 'center' },
  gamificationStatValue: { fontSize: 18, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  gamificationStatLabel: { fontSize: 12 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20, borderWidth: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  typeOption: { flex: 1, minWidth: '45%', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 2 },
  typeLabel: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  createButton: { borderRadius: 16, padding: 18, alignItems: 'center' },
  createButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
