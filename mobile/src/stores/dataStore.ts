import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../utils/safeAsyncStorage';
import type { Account, Transaction, Goal, Category, UserGamification, Challenge, WishlistItem, User, Article, Budget, RecurringRule, Deposit, Loan, ForecastScenario } from '../types';
import { AccountType, CategoryType, TransactionType, WishlistStatus, RecurrencePeriod } from '../types';
import { useAuthStore } from './authStore';
import transactionsService from '../services/transactions';
import accountsService from '../services/accounts';
import categoriesService, { CategoryTypeOption, IconOption } from '../services/categories';
import authService from '../services/auth';
import lifeCostService from '../services/lifeCost';
import currencyService from '../services/currency';
import wishlistService from '../services/wishlist';
import goalsService from '../services/goals';
import articlesService from '../services/articles';
import budgetsService from '../services/budgets';
import recurringService, { CreateRecurringRuleData, UpdateRecurringRuleData } from '../services/recurring';
import depositsService, { CreateDepositData } from '../services/deposits';
import loansService, { CreateLoanData } from '../services/loans';
import forecastService, { CreateForecastData } from '../services/forecast';
import { useSubscriptionStore } from './subscriptionStore';
import type { ExchangeRate } from '../services/currency';
import { setCurrencyConfig } from '../utils/formatters';
import { getTransactionCurrency } from '../utils/transactionUtils';
import i18n from '../i18n';

// Initial empty state - data will be loaded from API
const INITIAL_ACCOUNTS: Account[] = [];
const INITIAL_CATEGORIES: Category[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_GOALS: Goal[] = [];
const INITIAL_GAMIFICATION: UserGamification = {
  id: '',
  userId: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  hourlyRate: undefined,
};
const INITIAL_CHALLENGES: Challenge[] = [];
const INITIAL_WISHLIST: WishlistItem[] = [];

interface DataState {
  // Account Types (from backend)
  accountTypes: Array<{ value: string; label: string; icon: string; color: string }>;
  availableIcons: string[];
  setAccountTypes: (types: Array<{ value: string; label: string; icon: string; color: string }>) => void;
  setAvailableIcons: (icons: string[]) => void;
  fetchAccountTypes: () => Promise<void>;
  fetchAvailableIcons: () => Promise<void>;

  // Accounts
  accounts: Account[];
  isLoadingAccounts: boolean;
  setAccounts: (accounts: Account[]) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  createAccount: (data: { name: string; type: string; balance?: number; currency?: string; isDefault?: boolean }) => Promise<Account>;
  fetchAccounts: () => Promise<void>;

  // Transactions
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  fetchTransactions: (filters?: { startDate?: string; endDate?: string; categoryId?: string; type?: string }) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateTransaction: (id: string, data: { description?: string; date?: string; amount?: number; accountId?: string }) => Promise<void>;

  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  fetchCategories: () => Promise<void>;
  addCategory: (data: { name: string; type: CategoryType; icon: string; color: string; isBaseNeed?: boolean; excludeFromTotal?: boolean; monthlyLimit?: number | null }) => Promise<void>;

  // Goals
  goals: Goal[];
  isLoadingGoals: boolean;
  setGoals: (goals: Goal[]) => void;
  fetchGoals: () => Promise<void>;
  createGoal: (data: { name: string; targetAmount: number; currency?: string; deadline?: string }) => Promise<Goal>;
  addGoalContribution: (id: string, amount: number, note?: string) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Gamification / Life-Cost
  gamification: UserGamification | null;
  user: User | null;
  setGamification: (gamification: UserGamification | null) => void;
  setUser: (user: User | null) => void;
  fetchGamification: () => Promise<void>;

  // Achievements (kept for backward compat, unused)
  achievements: any[];
  earnedAchievements: string[];
  earnAchievement: (id: string) => void;

  // Challenges
  challenges: Challenge[];
  activeChallenges: Challenge[];
  joinChallenge: (id: string) => void;

  // Wishlist
  wishlist: WishlistItem[];
  fetchWishlist: () => Promise<void>;
  addWishlistItem: (item: WishlistItem) => Promise<void>;
  updateWishlistItem: (id: string, data: Partial<WishlistItem>) => void;

  // Articles
  articles: Article[];
  isLoadingArticles: boolean;
  fetchArticles: () => Promise<void>;

  // Currency
  userCurrency: string;
  setUserCurrency: (currency: string) => void;
  currencySymbol: string;
  fetchCurrencyRates: () => Promise<void>;
  convertToUserCurrency: (amountKopecks: number, fromCurrency: string) => number;

  // Helpers
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getHourlyRate: () => number;
  setHourlyRate: (rateRubles: number) => Promise<void>;
  calculateLifeCost: (amount: number) => Promise<{ hours: number; days: number; message: string }>;
  fetchHourlyRate: () => Promise<void>;

  // Budgets
  budgets: Budget[];
  isLoadingBudgets: boolean;
  fetchBudgets: (month?: string) => Promise<void>;
  addBudget: (data: { categoryId: string; amount: number; month?: string }) => Promise<void>;
  updateBudget: (id: string, amount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  carryForwardBudgets: () => Promise<void>;

  // Recurring Rules
  recurringRules: RecurringRule[];
  isLoadingRecurringRules: boolean;
  fetchRecurringRules: () => Promise<void>;
  addRecurringRule: (data: CreateRecurringRuleData) => Promise<RecurringRule | null>;
  updateRecurringRule: (id: string, data: UpdateRecurringRuleData) => Promise<void>;
  deleteRecurringRule: (id: string, keepTransactions?: boolean) => Promise<void>;
  pauseRecurringRule: (id: string) => Promise<void>;
  activateRecurringRule: (id: string) => Promise<void>;

  // Deposits
  deposits: Deposit[];
  isLoadingDeposits: boolean;
  fetchDeposits: () => Promise<void>;
  addDeposit: (data: CreateDepositData) => Promise<void>;
  deleteDeposit: (id: string) => Promise<void>;

  // Loans
  loans: Loan[];
  isLoadingLoans: boolean;
  fetchLoans: () => Promise<void>;
  addLoan: (data: CreateLoanData) => Promise<void>;
  recordLoanPayment: (id: string) => Promise<void>;
  deleteLoan: (id: string) => Promise<void>;

  // Forecast
  forecasts: ForecastScenario[];
  isLoadingForecasts: boolean;
  fetchForecasts: () => Promise<void>;
  addForecast: (data: CreateForecastData) => Promise<void>;
  deleteForecast: (id: string) => Promise<void>;

  // Initialization
  initializeData: () => Promise<void>;
}

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Account Types
      accountTypes: [],
      availableIcons: [],
      setAccountTypes: (types) => set({ accountTypes: types }),
      setAvailableIcons: (icons) => set({ availableIcons: icons }),
      fetchAccountTypes: async () => {
        try {
          const types = await categoriesService.getAccountTypes();
          set({ accountTypes: types });
        } catch (error) {
          console.error('Failed to fetch account types:', error);
        }
      },
      fetchAvailableIcons: async () => {
        try {
          const icons = await categoriesService.getIcons();
          set({ availableIcons: icons.map(i => i.name) });
        } catch (error) {
          console.error('Failed to fetch icons:', error);
        }
      },

      // Accounts
      accounts: INITIAL_ACCOUNTS,
      isLoadingAccounts: false,
      setAccounts: (accounts) => set({ accounts }),
      addAccount: (account) => set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccount: (id, data) => set((state) => ({
        accounts: state.accounts.map((a) => a.id === id ? { ...a, ...data } : a)
      })),
      deleteAccount: (id) => set((state) => ({
        accounts: state.accounts.filter((a) => a.id !== id)
      })),
      createAccount: async (data) => {
        set({ isLoadingAccounts: true });
        try {
          const newAccount = await accountsService.create(data);
          set((state) => ({
            accounts: [...state.accounts, newAccount],
            isLoadingAccounts: false
          }));
          return newAccount;
        } catch (error) {
          set({ isLoadingAccounts: false });
          throw error;
        }
      },
      fetchAccounts: async () => {
        set({ isLoadingAccounts: true });
        try {
          const accounts = await accountsService.getAll();
          set({ accounts, isLoadingAccounts: false });
        } catch (error) {
          set({ isLoadingAccounts: false });
          throw error;
        }
      },

      // Transactions
      transactions: INITIAL_TRANSACTIONS,
      isLoadingTransactions: false,
      setTransactions: (transactions) => set({ transactions }),
      addTransaction: async (transaction) => {
        try {
          const amountNum = Number(transaction.amount);
          const created = await transactionsService.create({
            accountId: transaction.accountId,
            categoryId: String(transaction.categoryId),
            amount: amountNum,
            type: String(transaction.type),
            description: transaction.description || undefined,
            date: transaction.date,
          });

          // Use the real DB transaction, not the temp one
          const realTx = { ...created, amount: Number(created.amount) };
          set((state) => ({ transactions: [realTx, ...state.transactions] }));

          // Update account balance
          const accounts = await accountsService.getAll();
          set({ accounts });
        } catch (error) {
          console.error('Failed to sync transaction:', error);
        }
      },
      fetchTransactions: async (filters?: { startDate?: string; endDate?: string; categoryId?: string; type?: string }) => {
        set({ isLoadingTransactions: true });
        try {
          const raw = await transactionsService.getAll(filters);
          const transactions = ((raw as any).items ?? raw).map((t: any) => ({
            ...t,
            amount: Number(t.amount),
          }));
          set({ transactions, isLoadingTransactions: false });
        } catch (error) {
          set({ isLoadingTransactions: false });
          throw error;
        }
      },
      deleteTransaction: async (id: string) => {
        try {
          await transactionsService.delete(id);
          set((state) => ({
            transactions: state.transactions.filter((t) => t.id !== id),
          }));
          // Refresh account balances
          const accounts = await accountsService.getAll();
          set({ accounts });
        } catch (error) {
          console.error('Failed to delete transaction:', error);
          throw error;
        }
      },
      updateTransaction: async (id: string, data: { description?: string; date?: string; amount?: number; accountId?: string }) => {
        try {
          const updated = await transactionsService.update(id, data);
          set((state) => ({
            transactions: state.transactions.map((t) =>
              t.id === id ? { ...t, ...data, amount: data.amount ?? t.amount } : t
            ),
          }));
          // Refresh accounts
          const accounts = await accountsService.getAll();
          set({ accounts });
        } catch (error) {
          console.error('Failed to update transaction:', error);
          throw error;
        }
      },

      // Categories
      categories: INITIAL_CATEGORIES,
      setCategories: (cats) => set({ categories: cats }),
      fetchCategories: async () => {
        try {
          const categories = await categoriesService.getAll();
          set({ categories });
          if (__DEV__) console.log(`✅ Loaded ${categories.length} categories`);
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        }
      },
      addCategory: async (data: { name: string; type: CategoryType; icon: string; color: string; isBaseNeed?: boolean; excludeFromTotal?: boolean; monthlyLimit?: number | null }) => {
        try {
          await categoriesService.create(data);
          const categories = await categoriesService.getAll();
          set({ categories });
        } catch (error) {
          console.error('Failed to create category:', error);
          throw error;
        }
      },

      // Goals
      goals: INITIAL_GOALS,
      isLoadingGoals: false,
      setGoals: (goals) => set({ goals }),
      fetchGoals: async () => {
        set({ isLoadingGoals: true });
        try {
          const goals = await goalsService.getAll();
          set({ goals, isLoadingGoals: false });
        } catch (error) {
          set({ isLoadingGoals: false });
          console.error('Failed to fetch goals:', error);
        }
      },
      createGoal: async (data) => {
        set({ isLoadingGoals: true });
        try {
          const goal = await goalsService.create(data);
          set((state) => ({
            goals: [goal, ...state.goals],
            isLoadingGoals: false,
          }));
          return goal;
        } catch (error) {
          set({ isLoadingGoals: false });
          throw error;
        }
      },
      addGoalContribution: async (id, amount, note) => {
        try {
          const updated = await goalsService.addContribution(id, { amount: Math.round(amount * 100), note });
          set((state) => ({
            goals: state.goals.map((g) => (g.id === id ? updated : g)),
          }));
        } catch (error) {
          console.error('Failed to add contribution:', error);
          throw error;
        }
      },
      deleteGoal: async (id) => {
        try {
          await goalsService.delete(id);
          set((state) => ({
            goals: state.goals.filter((g) => g.id !== id),
          }));
        } catch (error) {
          console.error('Failed to delete goal:', error);
          throw error;
        }
      },

      // Gamification / Life-Cost
      gamification: INITIAL_GAMIFICATION,
      user: null,
      setGamification: (gamification) => set({ gamification }),
      setUser: (user: User | null) => set({ user }),
      fetchGamification: async () => {
        const allowed = useSubscriptionStore.getState().checkAccess('LIFE_COST')?.allowed;
        if (!allowed) return;
        try {
          const rate = await lifeCostService.getHourlyRate();
          set((state) => ({
            gamification: state.gamification ? {
              ...state.gamification,
              hourlyRate: rate.hourlyRate,
            } : null,
          }));
        } catch (error) {
          console.error('Failed to fetch hourly rate:', error);
        }
      },

      // Achievements (backward compat)
      achievements: [],
      earnedAchievements: [],
      earnAchievement: (id) => set((state) => ({
        earnedAchievements: state.earnedAchievements.includes(id)
          ? state.earnedAchievements
          : [...state.earnedAchievements, id]
      })),

      // Challenges
      challenges: INITIAL_CHALLENGES,
      activeChallenges: [],
      joinChallenge: (id) => set((state) => ({
        activeChallenges: [...state.activeChallenges, state.challenges.find(c => c.id === id)!]
      })),

      // Wishlist
      wishlist: INITIAL_WISHLIST,
      fetchWishlist: async () => {
        try {
          const response = await wishlistService.getAll();
          set({ wishlist: response.all });
        } catch (e) {
          console.error('Failed to fetch wishlist:', e);
        }
      },
      addWishlistItem: async (item) => {
        const isDemoMode = useAuthStore.getState().isDemoMode;
        if (!isDemoMode) {
          try {
            const created = await wishlistService.create({
              name: item.name,
              price: item.price,
              description: item.description,
              cooldownDays: item.cooldownDays,
            });
            set((state) => ({ wishlist: [...state.wishlist, created] }));
            return;
          } catch (e) {
            console.error('Failed to create wishlist item:', e);
          }
        }
        set((state) => ({ wishlist: [...state.wishlist, item] }));
      },
      updateWishlistItem: (id, data) => set((state) => ({
        wishlist: state.wishlist.map((w) => w.id === id ? { ...w, ...data } : w)
      })),

      // Articles
      articles: [],
      isLoadingArticles: false,
      fetchArticles: async () => {
        set({ isLoadingArticles: true });
        try {
          const articles = await articlesService.getAll();
          set({ articles, isLoadingArticles: false });
        } catch (e) {
          set({ isLoadingArticles: false });
          console.error('Failed to fetch articles:', e);
        }
      },

      userCurrency: 'RUB',
      setUserCurrency: (currency: string) => {
        const symbol = currencyService.getSymbol(currency);
        set({ userCurrency: currency, currencySymbol: symbol });
        setCurrencyConfig(currency, symbol);

        const { isDemoMode } = useAuthStore.getState();
        if (!isDemoMode) {
          import('../services/api').then(({ apiPatch }) => {
            apiPatch('/users/profile', { currency }).catch((err: unknown) => {
              console.error('Failed to update currency on server:', err);
            });
          });
        }
      },
      currencySymbol: '₽',
      fetchCurrencyRates: async () => {
        try {
          await currencyService.fetchRates();
          const { userCurrency } = get();
          const symbol = currencyService.getSymbol(userCurrency);
          set({ currencySymbol: symbol });
          setCurrencyConfig(userCurrency, symbol);
        } catch (error) {
          console.error('Failed to fetch currency rates:', error);
        }
      },
      convertToUserCurrency: (amountKopecks, fromCurrency) => {
        const { userCurrency } = get();
        if (fromCurrency === userCurrency) return amountKopecks;
        const rubles = amountKopecks / 100;
        const converted = currencyService.convertLocal(rubles, fromCurrency, userCurrency);
        return Math.round(converted * 100);
      },

      // Helpers
      getTotalBalance: () => {
        const { accounts, convertToUserCurrency } = get();
        return accounts.reduce((sum, acc) => {
          return sum + convertToUserCurrency(Number(acc.balance), acc.currency);
        }, 0);
      },

      getMonthlyIncome: () => {
        const { transactions, categories, convertToUserCurrency } = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const excludedIds = new Set(categories.filter((c) => c.excludeFromTotal).map((c) => c.id));
        return transactions
          .filter((t) => t.type === 'INCOME' && new Date(t.date) >= startOfMonth)
          .filter((t) => !excludedIds.has(t.categoryId))
          .reduce((sum, t) => {
            const accCurrency = getTransactionCurrency(t);
            return sum + convertToUserCurrency(Number(t.amount), accCurrency);
          }, 0);
      },

      getMonthlyExpenses: () => {
        const { transactions, categories, convertToUserCurrency } = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const excludedIds = new Set(categories.filter((c) => c.excludeFromTotal).map((c) => c.id));
        return transactions
          .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth)
          .filter((t) => !excludedIds.has(t.categoryId))
          .reduce((sum, t) => {
            const accCurrency = getTransactionCurrency(t);
            return sum + convertToUserCurrency(Number(t.amount), accCurrency);
          }, 0);
      },

      getHourlyRate: () => {
        const { gamification } = get();
        return gamification?.hourlyRate ? Number(gamification.hourlyRate) : 1500;
      },

      setHourlyRate: async (rateRubles: number) => {
        set((state) => ({
          gamification: state.gamification
            ? { ...state.gamification, hourlyRate: rateRubles }
            : null,
        }));

        const { isDemoMode } = useAuthStore.getState();
        if (!isDemoMode) {
          try {
            await lifeCostService.updateHourlyRate(rateRubles);
          } catch (error) {
            console.error('Failed to save hourly rate to server:', error);
          }
        }
      },

      calculateLifeCost: async (amount) => {
        try {
          const result = await lifeCostService.calculateHours(amount);
          return {
            hours: result.hours,
            days: result.workingDays,
            message: result.message,
          };
        } catch (error) {
          console.error('Failed to calculate life cost:', error);
          const hourlyRate = get().getHourlyRate();
          const rubles = amount / 100;
          const hours = Math.round(rubles / hourlyRate * 10) / 10;
          const days = Math.round(hours / 8 * 10) / 10;

          let message = '';
          if (days >= 20) {
            message = i18n.t('lifeCost.workDaysMonth', { days: Math.round(days) });
          } else if (days >= 10) {
            message = i18n.t('lifeCost.workDaysTwoWeeks', { days: Math.round(days) });
          } else if (days >= 5) {
            message = i18n.t('lifeCost.workDaysWeek', { days: Math.round(days) });
          } else if (days >= 1) {
            message = i18n.t('lifeCost.hoursLife', { hours: Math.round(hours) });
          } else {
            message = i18n.t('lifeCost.minutesLife', { minutes: Math.round(hours * 60) });
          }

          return { hours, days, message };
        }
      },

      fetchHourlyRate: async () => {
        try {
          const rate = await lifeCostService.getHourlyRate();
          set((state) => ({
            gamification: state.gamification ? {
              ...state.gamification,
              hourlyRate: rate.hourlyRate,
            } : null,
          }));
        } catch (error) {
          console.error('Failed to fetch hourly rate:', error);
        }
      },

      // Budgets
      budgets: [],
      isLoadingBudgets: false,

      fetchBudgets: async (month?: string) => {
        try {
          set({ isLoadingBudgets: true });
          const currentMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
          const res = await budgetsService.getBudgets(currentMonth);
          set({ budgets: res.data, isLoadingBudgets: false });
        } catch (error) {
          set({ isLoadingBudgets: false });
        }
      },

      addBudget: async (data: { categoryId: string; amount: number; month?: string }) => {
        try {
          await budgetsService.createBudget(data);
          await get().fetchBudgets(data.month);
        } catch (error) {
          throw error;
        }
      },

      updateBudget: async (id: string, amount: number) => {
        try {
          await budgetsService.updateBudget(id, amount);
          await get().fetchBudgets();
        } catch (error) {
          throw error;
        }
      },

      deleteBudget: async (id: string) => {
        try {
          await budgetsService.deleteBudget(id);
          await get().fetchBudgets();
        } catch (error) {
          throw error;
        }
      },

      carryForwardBudgets: async () => {
        try {
          await budgetsService.carryForward();
          await get().fetchBudgets();
        } catch (error) {
          throw error;
        }
      },

      // Recurring Rules
      recurringRules: [],
      isLoadingRecurringRules: false,
      fetchRecurringRules: async () => {
        set({ isLoadingRecurringRules: true });
        try {
          const response = await recurringService.getAll();
          const rules = (response as any)?.data ?? response;
          set({ recurringRules: Array.isArray(rules) ? rules : [], isLoadingRecurringRules: false });
        } catch (e) {
          if (__DEV__) console.error('Failed to fetch recurring rules:', e);
          set({ isLoadingRecurringRules: false });
        }
      },
      addRecurringRule: async (data: CreateRecurringRuleData) => {
        try {
          const response = await recurringService.create(data);
          const rule = (response as any)?.data ?? response;
          set((state) => ({ recurringRules: [rule, ...state.recurringRules] }));
          return rule as RecurringRule;
        } catch (e) {
          if (__DEV__) console.error('Failed to create recurring rule:', e);
          return null;
        }
      },
      updateRecurringRule: async (id: string, data: UpdateRecurringRuleData) => {
        try {
          const response = await recurringService.update(id, data);
          const updated = (response as any)?.data ?? response;
          set((state) => ({
            recurringRules: state.recurringRules.map((r) => (r.id === id ? { ...r, ...updated } : r)),
          }));
        } catch (e) {
          if (__DEV__) console.error('Failed to update recurring rule:', e);
        }
      },
      deleteRecurringRule: async (id: string, keepTransactions = true) => {
        try {
          await recurringService.delete(id, keepTransactions);
          set((state) => ({
            recurringRules: state.recurringRules.filter((r) => r.id !== id),
          }));
        } catch (e) {
          if (__DEV__) console.error('Failed to delete recurring rule:', e);
        }
      },
      pauseRecurringRule: async (id: string) => {
        try {
          const response = await recurringService.pause(id);
          const updated = (response as any)?.data ?? response;
          set((state) => ({
            recurringRules: state.recurringRules.map((r) => (r.id === id ? { ...r, ...updated } : r)),
          }));
        } catch (e) {
          if (__DEV__) console.error('Failed to pause recurring rule:', e);
        }
      },
      activateRecurringRule: async (id: string) => {
        try {
          const response = await recurringService.activate(id);
          const updated = (response as any)?.data ?? response;
          set((state) => ({
            recurringRules: state.recurringRules.map((r) => (r.id === id ? { ...r, ...updated } : r)),
          }));
        } catch (e) {
          if (__DEV__) console.error('Failed to activate recurring rule:', e);
        }
      },

      // Deposits
      deposits: [],
      isLoadingDeposits: false,
      fetchDeposits: async () => {
        set({ isLoadingDeposits: true });
        try {
          const response = await depositsService.getAll();
          const deposits = (response as any)?.data ?? response;
          set({ deposits: Array.isArray(deposits) ? deposits : [], isLoadingDeposits: false });
        } catch (e) {
          if (__DEV__) console.error('Failed to fetch deposits:', e);
          set({ isLoadingDeposits: false });
        }
      },
      addDeposit: async (data: CreateDepositData) => {
        try {
          const response = await depositsService.create(data);
          const deposit = (response as any)?.data ?? response;
          set((state) => ({ deposits: [deposit, ...state.deposits] }));
        } catch (e) {
          if (__DEV__) console.error('Failed to create deposit:', e);
        }
      },
      deleteDeposit: async (id: string) => {
        try {
          await depositsService.delete(id);
          set((state) => ({ deposits: state.deposits.filter((d) => d.id !== id) }));
        } catch (e) {
          if (__DEV__) console.error('Failed to delete deposit:', e);
        }
      },

      // Loans
      loans: [],
      isLoadingLoans: false,
      fetchLoans: async () => {
        set({ isLoadingLoans: true });
        try {
          const response = await loansService.getAll();
          const loans = (response as any)?.data ?? response;
          set({ loans: Array.isArray(loans) ? loans : [], isLoadingLoans: false });
        } catch (e) {
          if (__DEV__) console.error('Failed to fetch loans:', e);
          set({ isLoadingLoans: false });
        }
      },
      addLoan: async (data: CreateLoanData) => {
        try {
          const response = await loansService.create(data);
          const loan = (response as any)?.data ?? response;
          set((state) => ({ loans: [loan, ...state.loans] }));
        } catch (e) {
          if (__DEV__) console.error('Failed to create loan:', e);
        }
      },
      recordLoanPayment: async (id: string) => {
        try {
          await loansService.recordPayment(id);
          await get().fetchLoans();
        } catch (e) {
          if (__DEV__) console.error('Failed to record loan payment:', e);
        }
      },
      deleteLoan: async (id: string) => {
        try {
          await loansService.delete(id);
          set((state) => ({ loans: state.loans.filter((l) => l.id !== id) }));
        } catch (e) {
          if (__DEV__) console.error('Failed to delete loan:', e);
        }
      },

      // Forecast
      forecasts: [],
      isLoadingForecasts: false,
      fetchForecasts: async () => {
        set({ isLoadingForecasts: true });
        try {
          const response = await forecastService.getAll();
          const forecasts = (response as any)?.data ?? response;
          set({ forecasts: Array.isArray(forecasts) ? forecasts : [], isLoadingForecasts: false });
        } catch (e) {
          if (__DEV__) console.error('Failed to fetch forecasts:', e);
          set({ isLoadingForecasts: false });
        }
      },
      addForecast: async (data: CreateForecastData) => {
        try {
          const response = await forecastService.create(data);
          const forecast = (response as any)?.data ?? response;
          set((state) => ({ forecasts: [forecast, ...state.forecasts] }));
        } catch (e) {
          if (__DEV__) console.error('Failed to create forecast:', e);
        }
      },
      deleteForecast: async (id: string) => {
        try {
          await forecastService.delete(id);
          set((state) => ({ forecasts: state.forecasts.filter((f) => f.id !== id) }));
        } catch (e) {
          if (__DEV__) console.error('Failed to delete forecast:', e);
        }
      },

      // Initialize data from API
      initializeData: async () => {
        const isDemoMode = useAuthStore.getState().isDemoMode;
        if (isDemoMode) {
          if (__DEV__) console.log('🎮 Demo mode — skipping API calls');
          return;
        }

        // Fetch subscription first to know what features are accessible
        const { fetchStatus } = useSubscriptionStore.getState();
        await fetchStatus();

        const isPremium = useSubscriptionStore.getState().isPremium();
        const check = useSubscriptionStore.getState().checkAccess;

        const { fetchAccounts, fetchCategories, fetchTransactions, fetchGamification, fetchCurrencyRates, fetchArticles } = get();

        const promises: Promise<any>[] = [
          fetchAccounts(),
          fetchCategories(),
          fetchTransactions(),
          fetchGamification(),
          fetchCurrencyRates(),
          fetchArticles(),
        ];

        // Only fetch premium features if accessible
        if (check('LIFE_COST')?.allowed) {
          promises.push(get().fetchHourlyRate());
        }
        if (check('WISHLIST_INCUBATOR')?.allowed) {
          promises.push(get().fetchWishlist());
        }
        if (check('GOALS')?.allowed) {
          promises.push(get().fetchGoals());
        }
        if (isPremium) {
          promises.push(get().fetchBudgets());
          promises.push(get().fetchRecurringRules());
          promises.push(get().fetchDeposits());
          promises.push(get().fetchLoans());
          promises.push(get().fetchForecasts());
        }

        await Promise.all(promises);
      },
    }),
    {
      name: 'data-storage',
      storage: createJSONStorage(() => safeAsyncStorage),
      partialize: (state) => ({
        accounts: state.accounts,
        transactions: state.transactions,
        categories: state.categories,
        goals: state.goals,
        gamification: state.gamification,
        earnedAchievements: state.earnedAchievements,
        wishlist: state.wishlist,
        articles: state.articles,
        userCurrency: state.userCurrency,
        currencySymbol: state.currencySymbol,
        budgets: state.budgets,
        recurringRules: state.recurringRules,
        deposits: state.deposits,
        loans: state.loans,
        forecasts: state.forecasts,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setCurrencyConfig(state.userCurrency || 'RUB', state.currencySymbol || '₽');
        }
      },
    }
  )
);

export default useDataStore;
