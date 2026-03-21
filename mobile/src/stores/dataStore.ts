import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Account, Transaction, Budget, Goal, Category, UserGamification, Achievement, Challenge, WishlistItem, User } from '../types';
import { AccountType, CategoryType, TransactionType, BudgetPeriod, GamificationStatus, AchievementCondition, AchievementTier, ChallengeType, WishlistStatus } from '../types';
import transactionsService from '../services/transactions';
import accountsService from '../services/accounts';
import categoriesService, { CategoryTypeOption, IconOption } from '../services/categories';
import authService from '../services/auth';

// Initial empty state - data will be loaded from API
const INITIAL_ACCOUNTS: Account[] = [];
const INITIAL_CATEGORIES: Category[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_BUDGETS: Budget[] = [];
const INITIAL_GOALS: Goal[] = [];
const INITIAL_GAMIFICATION: UserGamification & { hourlyRate?: number } = {
  id: '',
  userId: '',
  xp: 0,
  level: 1,
  savedAmount: 0,
  status: GamificationStatus.CONSUMER_DRONE,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  hourlyRate: undefined,
};
const INITIAL_ACHIEVEMENTS: Achievement[] = [];
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
  
  // Categories
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  fetchCategories: () => Promise<void>;
  
  // Budgets
  budgets: Budget[];
  isLoadingBudgets: boolean;
  setBudgets: (budgets: Budget[]) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (id: string, data: Partial<Budget>) => void;
  
  // Goals
  goals: Goal[];
  isLoadingGoals: boolean;
  setGoals: (goals: Goal[]) => void;
  addGoal: (goal: Goal) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  
  // Gamification
  gamification: UserGamification | null;
  setGamification: (gamification: UserGamification | null) => void;
  addXp: (amount: number) => void;
  fetchGamification: () => Promise<void>;
  
  // Achievements
  achievements: Achievement[];
  earnedAchievements: string[];
  earnAchievement: (id: string) => void;
  
  // Challenges
  challenges: Challenge[];
  activeChallenges: Challenge[];
  joinChallenge: (id: string) => void;
  
  // Wishlist
  wishlist: WishlistItem[];
  addWishlistItem: (item: WishlistItem) => void;
  updateWishlistItem: (id: string, data: Partial<WishlistItem>) => void;
  
  // Helpers
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getHourlyRate: () => number;
  calculateLifeCost: (amount: number) => { hours: number; days: number; message: string };
  
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
      createAccount: async (data: { name: string; type: string; balance?: number; currency?: string; isDefault?: boolean }) => {
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
        // First add to local state optimistically
        set((state) => ({ transactions: [transaction, ...state.transactions] }));
        // Then sync with API
        try {
          await transactionsService.create({
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            amount: Number(transaction.amount),
            type: transaction.type,
            description: transaction.description || undefined,
            date: transaction.date,
          });
        } catch (error) {
          // Revert on error - in production you'd want better error handling
          console.error('Failed to sync transaction:', error);
        }
      },
      fetchTransactions: async (filters?: { startDate?: string; endDate?: string; categoryId?: string; type?: string }) => {
        set({ isLoadingTransactions: true });
        try {
          const transactions = await transactionsService.getAll(filters);
          set({ transactions, isLoadingTransactions: false });
        } catch (error) {
          set({ isLoadingTransactions: false });
          throw error;
        }
      },
      
      // Categories
      categories: INITIAL_CATEGORIES,
      setCategories: (categories) => set({ categories }),
      fetchCategories: async () => {
        try {
          const categories = await categoriesService.getAll();
          set({ categories });
        } catch (error) {
          console.error('Failed to fetch categories:', error);
        }
      },
      
      // Budgets
      budgets: INITIAL_BUDGETS,
      isLoadingBudgets: false,
      setBudgets: (budgets) => set({ budgets }),
      addBudget: (budget) => set((state) => ({ budgets: [...state.budgets, budget] })),
      updateBudget: (id, data) => set((state) => ({
        budgets: state.budgets.map((b) => b.id === id ? { ...b, ...data } : b)
      })),
      
      // Goals
      goals: INITIAL_GOALS,
      isLoadingGoals: false,
      setGoals: (goals) => set({ goals }),
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoal: (id, data) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...data } : g)
      })),
      
      // Gamification
      gamification: INITIAL_GAMIFICATION,
      setGamification: (gamification) => set({ gamification }),
      addXp: (amount) => set((state) => {
        if (!state.gamification) return state;
        const newXp = state.gamification.xp + amount;
        const newLevel = Math.floor(newXp / 1000) + 1;
        return {
          gamification: {
            ...state.gamification,
            xp: newXp,
            level: newLevel,
          }
        };
      }),
      fetchGamification: async () => {
        try {
          const user = await authService.getCurrentUser();
          // Gamification data would come from a separate endpoint in a real app
          // For now, we use the hourly rate from the user
          set({
            gamification: {
              ...INITIAL_GAMIFICATION,
              userId: user.id,
              hourlyRate: user.hourlyRate ?? undefined,
            }
          });
        } catch (error) {
          console.error('Failed to fetch gamification:', error);
        }
      },
      
      // Achievements
      achievements: INITIAL_ACHIEVEMENTS,
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
      addWishlistItem: (item) => set((state) => ({ wishlist: [...state.wishlist, item] })),
      updateWishlistItem: (id, data) => set((state) => ({
        wishlist: state.wishlist.map((w) => w.id === id ? { ...w, ...data } : w)
      })),
      
      // Helpers
      getTotalBalance: () => {
        const { accounts } = get();
        return accounts.reduce((sum, acc) => sum + acc.balance, 0);
      },
      
      getMonthlyIncome: () => {
        const { transactions } = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactions
          .filter(t => t.type === 'INCOME' && new Date(t.date) >= startOfMonth)
          .reduce((sum, t) => sum + t.amount, 0);
      },
      
      getMonthlyExpenses: () => {
        const { transactions } = get();
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        return transactions
          .filter(t => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth)
          .reduce((sum, t) => sum + t.amount, 0);
      },
      
      getHourlyRate: () => {
        const { gamification } = get();
        // Default to 1500 if not set (in rubles per hour)
        return gamification?.hourlyRate ? gamification.hourlyRate / 100 : 1500;
      },
      
      calculateLifeCost: (amount) => {
        const hourlyRate = get().getHourlyRate();
        const hours = Math.round(amount / hourlyRate * 10) / 10;
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
      },
      
      // Initialize data from API
      initializeData: async () => {
        const { fetchAccounts, fetchCategories, fetchTransactions, fetchGamification } = get();
        await Promise.all([
          fetchAccounts(),
          fetchCategories(),
          fetchTransactions(),
          fetchGamification(),
        ]);
      },
    }),
    {
      name: 'data-storage',
      partialize: (state) => ({
        accounts: state.accounts,
        transactions: state.transactions,
        categories: state.categories,
        budgets: state.budgets,
        goals: state.goals,
        gamification: state.gamification,
        earnedAchievements: state.earnedAchievements,
        wishlist: state.wishlist,
      }),
    }
  )
);

export default useDataStore;
