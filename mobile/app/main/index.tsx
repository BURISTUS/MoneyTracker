/**
 * Money Tracker — Modern Home Screen (2024-2026 Design)
 * 
 * Features:
 * - Hero Balance Card with Life Cost
 * - Bento Grid for stats
 * - Glassmorphism account cards
 * - Modern animations with spring physics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useDataStore } from '../../src/stores/dataStore';
import { useTheme } from '../../src/utils/ThemeContext';
import { spacing, borderRadius, fontSize, fontWeight, STATUS_LABELS } from '../../src/utils/theme';
import { 
  Card, 
  Button, 
  IconButton, 
  FAB,
  StatusBadge,
  LifeCostBadge,
  XPBadge,
} from '../../src/components/ui';

// ============================================
// HELPERS
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ============================================
// ANIMATED COMPONENTS
// ============================================

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function AnimatedCard({ 
  children, 
  delay = 0,
  style 
}: { 
  children: React.ReactNode; 
  delay?: number;
  style?: any;
}) {
  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(delay)}
      style={style}
    >
      {children}
    </Animated.View>
  );
}

// ============================================
// SECTION HEADER
// ============================================

function SectionHeader({ 
  title, 
  action, 
  onAction 
}: { 
  title: string; 
  action?: string;
  onAction?: () => void;
}) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action && onAction && (
        <TouchableOpacity onPress={onAction}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ============================================
// HERO BALANCE CARD
// ============================================

function HeroBalanceCard({ 
  balance, 
  income, 
  expense,
  hourlyRate = 150000,
}: { 
  balance: number;
  income: number;
  expense: number;
  hourlyRate?: number;
}) {
  const { colors } = useTheme();
  
  // Calculate life cost in months
  const monthlyLifeCost = (expense / hourlyRate) * 176; // hours per month
  const lifeCostMonths = balance / monthlyLifeCost;
  
  return (
    <AnimatedCard>
      <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroLabel}>Общий баланс</Text>
          {lifeCostMonths > 0 && (
            <View style={[styles.heroLifeCostBadge, { backgroundColor: 'rgba(244,114,182,0.3)' }]}>
              <Ionicons name="time" size={14} color="#F472B6" />
              <Text style={styles.heroLifeCostText}>
                ~{lifeCostMonths.toFixed(1)} мес. работы
              </Text>
            </View>
          )}
        </View>
        
        <Text style={styles.heroBalance}>{formatCurrency(balance)}</Text>
        
        <View style={styles.heroStats}>
          <View style={styles.heroStatItem}>
            <View style={[styles.heroStatIcon, { backgroundColor: 'rgba(52,211,153,0.3)' }]}>
              <Ionicons name="arrow-down" size={14} color="#34D399" />
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Доход</Text>
              <Text style={[styles.heroStatValue, { color: '#34D399' }]}>
                +{formatCurrency(income)}
              </Text>
            </View>
          </View>
          
          <View style={styles.heroStatDivider} />
          
          <View style={styles.heroStatItem}>
            <View style={[styles.heroStatIcon, { backgroundColor: 'rgba(248,113,113,0.3)' }]}>
              <Ionicons name="arrow-up" size={14} color="#F87171" />
            </View>
            <View>
              <Text style={styles.heroStatLabel}>Расход</Text>
              <Text style={[styles.heroStatValue, { color: '#F87171' }]}>
                -{formatCurrency(expense)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </AnimatedCard>
  );
}

// ============================================
// BENTO GRID STATS
// ============================================

function BentoStats({ 
  accountsCount, 
  budgetsCount, 
  goalsCompleted, 
  goalsTotal,
  wishlistCount,
}: {
  accountsCount: number;
  budgetsCount: number;
  goalsCompleted: number;
  goalsTotal: number;
  wishlistCount: number;
}) {
  const { colors } = useTheme();
  
  const stats = [
    {
      icon: 'wallet',
      value: accountsCount.toString(),
      label: 'Счетов',
      color: colors.primary,
      bgColor: colors.primary + '15',
    },
    {
      icon: 'pie-chart',
      value: budgetsCount.toString(),
      label: 'Бюджетов',
      color: '#F59E0B',
      bgColor: 'rgba(245,158,11,0.15)',
    },
    {
      icon: 'flag',
      value: `${goalsCompleted}/${goalsTotal}`,
      label: 'Целей',
      color: '#34D399',
      bgColor: 'rgba(52,211,153,0.15)',
    },
    {
      icon: 'bulb',
      value: wishlistCount.toString(),
      label: 'Желаний',
      color: '#F472B6',
      bgColor: 'rgba(244,114,182,0.15)',
    },
  ];
  
  return (
    <AnimatedCard delay={100}>
      <View style={styles.bentoGrid}>
        {stats.map((stat, index) => (
          <TouchableOpacity 
            key={index} 
            style={[
              styles.bentoItem,
              { backgroundColor: colors.surface }
            ]}
          >
            <View style={[styles.bentoIcon, { backgroundColor: stat.bgColor }]}>
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={[styles.bentoValue, { color: colors.text }]}>{stat.value}</Text>
            <Text style={[styles.bentoLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </AnimatedCard>
  );
}

// ============================================
// ACCOUNT LIST ITEM
// ============================================

function AccountItem({ 
  name, 
  type, 
  balance,
  onPress,
}: {
  name: string;
  type: string;
  balance: number;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  
  const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
    CASH: { icon: 'cash', label: 'Наличные', color: '#34D399' },
    BANK: { icon: 'card', label: 'Банк', color: '#3B82F6' },
    CREDIT: { icon: 'card-outline', label: 'Кредит', color: '#F59E0B' },
    INVESTMENT: { icon: 'trending-up', label: 'Инвестиции', color: '#8B5CF6' },
    DEBT: { icon: 'alert-circle', label: 'Долг', color: '#EF4444' },
  };
  
  const config = typeConfig[type] || typeConfig.BANK;
  
  return (
    <TouchableOpacity 
      style={[styles.accountItem, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.accountLeft}>
        <View style={[styles.accountIcon, { backgroundColor: config.color + '15' }]}>
          <Ionicons name={config.icon as any} size={20} color={config.color} />
        </View>
        <View style={styles.accountInfo}>
          <Text style={[styles.accountName, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.accountType, { color: colors.textSecondary }]}>{config.label}</Text>
        </View>
      </View>
      <Text style={[
        styles.accountBalance, 
        { color: balance >= 0 ? colors.success : colors.danger }
      ]}>
        {formatCurrency(balance)}
      </Text>
    </TouchableOpacity>
  );
}

// ============================================
// TRANSACTION ITEM
// ============================================

function TransactionItem({
  description,
  categoryName,
  categoryIcon,
  categoryColor,
  amount,
  type,
  lifeCostHours,
}: {
  description: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: string;
  lifeCostHours?: number;
}) {
  const { colors } = useTheme();
  const isIncome = type === 'INCOME';
  
  return (
    <View style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
      <View style={styles.transactionLeft}>
        <View style={[
          styles.transactionIcon, 
          { backgroundColor: (categoryColor || colors.primary) + '15' }
        ]}>
          <Ionicons 
            name={(categoryIcon || 'help') as any} 
            size={18} 
            color={categoryColor || colors.primary} 
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionName, { color: colors.text }]} numberOfLines={1}>
            {description || categoryName}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionCategory, { color: colors.textSecondary }]}>
              {categoryName}
            </Text>
            {lifeCostHours !== undefined && lifeCostHours > 0 && (
              <View style={styles.transactionLifeCost}>
                <Ionicons name="time-outline" size={10} color={colors.lifeCost} />
                <Text style={[styles.transactionLifeCostText, { color: colors.lifeCost }]}>
                  {lifeCostHours}ч
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      <Text style={[
        styles.transactionAmount, 
        { color: isIncome ? colors.success : colors.danger }
      ]}>
        {isIncome ? '+' : '-'}{formatCurrency(amount)}
      </Text>
    </View>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyAccounts({ onAdd }: { onAdd: () => void }) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[
        styles.emptyState, 
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
      onPress={onAdd}
      activeOpacity={0.7}
    >
      <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="wallet-outline" size={32} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Нет счетов</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Добавьте счёт для начала учёта
      </Text>
    </TouchableOpacity>
  );
}

// ============================================
// MAIN SCREEN
// ============================================

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const {
    transactions,
    accounts,
    budgets,
    gamification,
    goals,
    wishlist,
    initializeData,
    isLoadingTransactions,
    isLoadingAccounts,
    createAccount,
    accountTypes,
    fetchAccountTypes,
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
      Alert.alert('Ошибка', 'Не удалось создать счёт');
    } finally {
      setIsCreating(false);
    }
  };
  
  useEffect(() => {
    initializeData();
    fetchAccountTypes();
  }, []);
  
  // Calculate totals
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const monthlyIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const completedGoals = goals.filter(g => g.isCompleted).length;
  const pendingWishlist = wishlist.filter(w => w.status === 'PENDING' || w.status === 'READY').length;
  
  // Gamification
  const userStatus = gamification?.status || 'CONSUMER_DRONE';
  const statusInfo = STATUS_LABELS[userStatus];
  
  const isLoading = isLoadingTransactions || isLoadingAccounts;
  
  if (isLoading && accounts.length === 0 && transactions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerGreeting, { color: colors.textSecondary }]}>Добро пожаловать</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Money Tracker</Text>
        </View>
        <IconButton 
          icon="person-circle" 
          onPress={() => router.push('/main/profile')}
          size="lg"
        />
      </View>
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: colors.surface }]}>
          {[
            { id: 'overview', label: 'Обзор', icon: 'pie-chart' },
            { id: 'gamification', label: 'Прогресс', icon: 'trophy' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                activeTab === tab.id && { backgroundColor: colors.primary }
              ]}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Ionicons 
                name={tab.icon as any} 
                size={16} 
                color={activeTab === tab.id ? '#FFFFFF' : colors.textSecondary} 
              />
              <Text style={[
                styles.tabText, 
                { color: activeTab === tab.id ? '#FFFFFF' : colors.textSecondary }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {activeTab === 'overview' ? (
          <>
            {/* Hero Balance Card */}
            <HeroBalanceCard 
              balance={totalBalance}
              income={monthlyIncome}
              expense={monthlyExpenses}
            />
            
            {/* Bento Grid */}
            <BentoStats 
              accountsCount={accounts.length}
              budgetsCount={budgets.length}
              goalsCompleted={completedGoals}
              goalsTotal={goals.length}
              wishlistCount={pendingWishlist}
            />
            
            {/* Status Card (if gamification enabled) */}
            {gamification && statusInfo && (
              <AnimatedCard delay={150}>
                <TouchableOpacity 
                  style={[styles.statusCard, { backgroundColor: colors.surface }]}
                  onPress={() => setActiveTab('gamification')}
                  activeOpacity={0.7}
                >
                  <View style={styles.statusLeft}>
                    <Text style={styles.statusEmoji}>{statusInfo.emoji}</Text>
                    <View>
                      <Text style={[styles.statusName, { color: colors.text }]}>
                        {statusInfo.name}
                      </Text>
                      <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
                        {statusInfo.description}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statusRight}>
                    <View style={[styles.levelBadge, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.levelText, { color: colors.primary }]}>
                        Ур. {gamification.level}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </View>
                </TouchableOpacity>
              </AnimatedCard>
            )}
            
            {/* Accounts Section */}
            <AnimatedCard delay={200}>
              <SectionHeader 
                title="Счета" 
                action="+ Добавить"
                onAction={() => setIsCreateModalVisible(true)}
              />
              
              {accounts.length === 0 ? (
                <EmptyAccounts onAdd={() => setIsCreateModalVisible(true)} />
              ) : (
                <View style={styles.listContainer}>
                  {accounts.slice(0, 3).map((account) => (
                    <AccountItem
                      key={account.id}
                      name={account.name}
                      type={account.type}
                      balance={account.balance}
                      onPress={() => router.push('/main/accounts')}
                    />
                  ))}
                  {accounts.length > 3 && (
                    <TouchableOpacity 
                      style={styles.showMoreButton}
                      onPress={() => router.push('/main/accounts')}
                    >
                      <Text style={[styles.showMoreText, { color: colors.primary }]}>
                        Показать все ({accounts.length})
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </AnimatedCard>
            
            {/* Recent Transactions */}
            <AnimatedCard delay={250}>
              <SectionHeader 
                title="Последние операции"
                action="Все"
                onAction={() => router.push('/main/transactions')}
              />
              
              {transactions.length === 0 ? (
                <View style={[styles.emptyTransactions, { backgroundColor: colors.surface }]}>
                  <Ionicons name="receipt-outline" size={40} color={colors.textTertiary} />
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Нет операций
                  </Text>
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {transactions.slice(0, 5).map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      description={transaction.description || ''}
                      categoryName={transaction.category?.name || 'Без категории'}
                      categoryIcon={transaction.category?.icon || undefined}
                      categoryColor={transaction.category?.color || undefined}
                      amount={transaction.amount}
                      type={transaction.type}
                    />
                  ))}
                </View>
              )}
            </AnimatedCard>
            
            <View style={{ height: 100 }} />
          </>
        ) : (
          <>
            {/* Gamification Tab */}
            {gamification && statusInfo && (
              <>
                {/* Level Card */}
                <AnimatedCard>
                  <View style={[styles.levelCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.levelHeader}>
                      <View style={[styles.levelBadgeLarge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        <Text style={styles.levelNumber}>{gamification.level}</Text>
                      </View>
                      <View style={styles.levelInfo}>
                        <Text style={styles.levelTitle}>Уровень</Text>
                        <Text style={styles.levelXP}>{gamification.xp} XP</Text>
                      </View>
                    </View>
                    
                    <View style={styles.xpBarContainer}>
                      <View style={[styles.xpBar, { backgroundColor: 'rgba(255,255,255,0.3)' }]}>
                        <View 
                          style={[
                            styles.xpProgress, 
                            { width: `${((gamification.xp % 1000) / 1000) * 100}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.xpText}>
                        {1000 - (gamification.xp % 1000)} XP до следующего
                      </Text>
                    </View>
                    
                    <View style={styles.statusBadgeContainer}>
                      <StatusBadge status={userStatus} size="lg" />
                    </View>
                  </View>
                </AnimatedCard>
                
                {/* Stats Grid */}
                <AnimatedCard delay={100}>
                  <View style={styles.gamificationStats}>
                    <View style={[styles.gamStatItem, { backgroundColor: colors.surface }]}>
                      <Ionicons name="wallet" size={24} color={colors.primary} />
                      <Text style={[styles.gamStatValue, { color: colors.text }]}>
                        {formatCurrency(gamification.savedAmount)}
                      </Text>
                      <Text style={[styles.gamStatLabel, { color: colors.textSecondary }]}>
                        Сэкономлено
                      </Text>
                    </View>
                    
                    <View style={[styles.gamStatItem, { backgroundColor: colors.surface }]}>
                      <Ionicons name="flame" size={24} color="#FF6B35" />
                      <Text style={[styles.gamStatValue, { color: colors.text }]}>
                        {gamification.level}
                      </Text>
                      <Text style={[styles.gamStatLabel, { color: colors.textSecondary }]}>
                        Текущий уровень
                      </Text>
                    </View>
                  </View>
                </AnimatedCard>
                
                {/* Achievements Preview */}
                <AnimatedCard delay={150}>
                  <SectionHeader 
                    title="Последние достижения"
                    action="Все"
                    onAction={() => router.push('/main/wishlist')}
                  />
                  <View style={[styles.achievementsPreview, { backgroundColor: colors.surface }]}>
                    <View style={styles.achievementItem}>
                      <View style={[styles.achievementIcon, { backgroundColor: '#FFD70020' }]}>
                        <Ionicons name="trophy" size={20} color="#FFD700" />
                      </View>
                      <Text style={[styles.achievementName, { color: colors.text }]}>
                        Первый шаг
                      </Text>
                    </View>
                    <View style={styles.achievementItem}>
                      <View style={[styles.achievementIcon, { backgroundColor: '#34D39920' }]}>
                        <Ionicons name="checkmark-circle" size={20} color="#34D399" />
                      </View>
                      <Text style={[styles.achievementName, { color: colors.text }]}>
                        Накопитель
                      </Text>
                    </View>
                  </View>
                </AnimatedCard>
              </>
            )}
            
            <View style={{ height: 100 }} />
          </>
        )}
      </ScrollView>
      
      {/* FAB */}
      <FAB 
        icon="add" 
        onPress={() => router.push('/main/transactions/create')}
        color={colors.primary}
      />
      
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
              <IconButton 
                icon="close" 
                onPress={() => setIsCreateModalVisible(false)}
                variant="ghost"
              />
            </View>
            
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Название</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.background, 
                  color: colors.text, 
                  borderColor: colors.border 
                }
              ]}
              placeholder="Например: Наличные"
              placeholderTextColor={colors.textTertiary}
              value={newAccountName}
              onChangeText={setNewAccountName}
            />
            
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Тип счёта</Text>
            <View style={styles.typeGrid}>
              {(accountTypes.length > 0 ? accountTypes : [
                { value: 'CASH', label: 'Наличные', icon: 'cash', color: '#34D399' },
                { value: 'BANK', label: 'Банк', icon: 'card', color: '#3B82F6' },
                { value: 'CREDIT', label: 'Кредит', icon: 'card-outline', color: '#F59E0B' },
                { value: 'INVESTMENT', label: 'Инвестиции', icon: 'trending-up', color: '#8B5CF6' },
                { value: 'DEBT', label: 'Долг', icon: 'alert-circle', color: '#EF4444' },
              ]).map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.typeOption,
                    { backgroundColor: colors.background },
                    newAccountType === item.value && { 
                      backgroundColor: colors.primary + '15', 
                      borderColor: colors.primary 
                    }
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
            
            <Button
              title="Создать счёт"
              onPress={handleCreateAccount}
              loading={isCreating}
              fullWidth
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.body,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerGreeting: {
    fontSize: fontSize.small,
  },
  headerTitle: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
  },
  
  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    padding: spacing.xxs,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  tabText: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
  },
  
  // Hero Card
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  heroLabel: {
    fontSize: fontSize.small,
    color: 'rgba(255,255,255,0.7)',
  },
  heroLifeCostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
    gap: spacing.xxs,
  },
  heroLifeCostText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
    color: '#F472B6',
  },
  heroBalance: {
    fontSize: 40,
    fontWeight: fontWeight.extrabold,
    color: '#FFFFFF',
    letterSpacing: -1,
    marginBottom: spacing.md,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroStatIcon: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.6)',
  },
  heroStatValue: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: spacing.lg,
  },
  
  // Bento Grid
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  bentoItem: {
    width: '48%',
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minWidth: 140,
  },
  bentoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bentoValue: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  bentoLabel: {
    fontSize: fontSize.caption,
  },
  
  // Status Card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusEmoji: {
    fontSize: 32,
  },
  statusName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
  },
  statusDescription: {
    fontSize: fontSize.caption,
    maxWidth: 200,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: borderRadius.full,
  },
  levelText: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.semibold,
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.bold,
  },
  sectionAction: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
  },
  
  // List Container
  listContainer: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  
  // Account Item
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  accountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accountIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountInfo: {
    gap: 2,
  },
  accountName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
  },
  accountType: {
    fontSize: fontSize.caption,
  },
  accountBalance: {
    fontSize: fontSize.h3,
    fontWeight: fontWeight.bold,
  },
  
  // Empty State
  emptyState: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: fontSize.small,
    textAlign: 'center',
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  showMoreText: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semibold,
  },
  
  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.medium,
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  transactionCategory: {
    fontSize: fontSize.caption,
  },
  transactionLifeCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  transactionLifeCostText: {
    fontSize: 10,
    fontWeight: fontWeight.medium,
  },
  transactionAmount: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
  },
  
  // Empty Transactions
  emptyTransactions: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    marginTop: spacing.sm,
    fontSize: fontSize.small,
  },
  
  // Gamification Tab
  levelCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  levelBadgeLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  levelNumber: {
    fontSize: 32,
    fontWeight: fontWeight.extrabold,
    color: '#FFFFFF',
  },
  levelInfo: {
    gap: spacing.xxs,
  },
  levelTitle: {
    fontSize: fontSize.small,
    color: 'rgba(255,255,255,0.7)',
  },
  levelXP: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
    color: '#FFFFFF',
  },
  xpBarContainer: {
    marginBottom: spacing.lg,
  },
  xpBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  xpProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  xpText: {
    fontSize: fontSize.caption,
    color: 'rgba(255,255,255,0.7)',
  },
  statusBadgeContainer: {
    alignItems: 'center',
  },
  
  gamificationStats: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  gamStatItem: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  gamStatValue: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
  },
  gamStatLabel: {
    fontSize: fontSize.caption,
  },
  
  achievementsPreview: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementName: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.h2,
    fontWeight: fontWeight.bold,
  },
  inputLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.sm,
  },
  input: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.body,
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeOption: {
    width: '30%',
    flex: 1,
    minWidth: 90,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  typeLabel: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.medium,
    marginTop: spacing.xs,
  },
});
