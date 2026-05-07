import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { safeAsyncStorage } from '../utils/safeAsyncStorage';
import type { Account, Transaction, Goal, Category, UserGamification, Challenge, WishlistItem, User, Article } from '../types';
import { AccountType, CategoryType, TransactionType, WishlistStatus } from '../types';
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
import type { ExchangeRate } from '../services/currency';
import { setCurrencyConfig } from '../utils/formatters';

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
          const transactions = raw.map((t) => ({
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
          console.log(`✅ Loaded ${categories.length} categories`);
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
            const accCurrency = (t as any).account?.currency || 'RUB';
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
            const accCurrency = (t as any).account?.currency || 'RUB';
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
            message = `Это ${Math.round(days)} рабочих дней. Ты готов провести месяц в офисе ради этого?`;
          } else if (days >= 10) {
            message = `Это ${Math.round(days)} рабочих дней. Две недели твоей жизни.`;
          } else if (days >= 5) {
            message = `Это ${Math.round(days)} рабочих дней. Целая неделя.`;
          } else if (days >= 1) {
            message = `Это ${Math.round(hours)} часов твоей жизни.`;
          } else {
            message = `Это ${Math.round(hours * 60)} минут твоей жизни.`;
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

      // Initialize data from API
      initializeData: async () => {
        const isDemoMode = useAuthStore.getState().isDemoMode;
        if (isDemoMode) {
          console.log('🎮 Demo mode — skipping API calls');
          return;
        }
        const { fetchAccounts, fetchCategories, fetchTransactions, fetchGamification, fetchHourlyRate, fetchCurrencyRates, fetchWishlist, fetchGoals, fetchArticles } = get();
        await Promise.all([
          fetchAccounts(),
          fetchCategories(),
          fetchTransactions(),
          fetchGamification(),
          fetchHourlyRate(),
          fetchCurrencyRates(),
          fetchWishlist(),
          fetchGoals(),
          fetchArticles(),
        ]);
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
