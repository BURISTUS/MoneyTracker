import { useDataStore } from '../dataStore';
import { useAuthStore } from '../authStore';

jest.mock('../../i18n', () => ({
  __esModule: true,
  default: { t: (key: string, params?: Record<string, unknown>) => {
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
        key,
      );
    }
    return key;
  }},
}));

jest.mock('../authStore', () => ({
  useAuthStore: {
    getState: jest.fn(() => ({ isDemoMode: false })),
    setState: jest.fn(),
  },
}));

jest.mock('../subscriptionStore', () => ({
  useSubscriptionStore: {
    getState: jest.fn(() => ({
      fetchStatus: jest.fn(() => Promise.resolve()),
      isPremium: jest.fn(() => false),
      checkAccess: jest.fn(() => ({ allowed: true })),
    })),
  },
}));

jest.mock('../../services/transactions', () => ({
  __esModule: true,
  default: {
    create: jest.fn(() => Promise.resolve({ id: 'new', amount: 1000 })),
    getAll: jest.fn(() => Promise.resolve([])),
    delete: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../../services/accounts', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(() => Promise.resolve([])),
    create: jest.fn(() => Promise.resolve({ id: 'new' })),
  },
}));

jest.mock('../../services/categories', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(() => Promise.resolve([])),
    create: jest.fn(() => Promise.resolve()),
    getAccountTypes: jest.fn(() => Promise.resolve([])),
    getIcons: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('../../services/lifeCost', () => ({
  __esModule: true,
  default: {
    getHourlyRate: jest.fn(() => Promise.resolve({ hourlyRate: 1500 })),
    calculateHours: jest.fn(() => Promise.resolve({ hours: 5, workingDays: 1, message: 'test' })),
    updateHourlyRate: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../../services/goals', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(() => Promise.resolve([])),
    create: jest.fn(() => Promise.resolve({ id: 'g1' })),
    addContribution: jest.fn(() => Promise.resolve({ id: 'g1' })),
    delete: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../../services/wishlist', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(() => Promise.resolve({ all: [] })),
    create: jest.fn(() => Promise.resolve({ id: 'w1' })),
  },
}));

jest.mock('../../services/articles', () => ({
  __esModule: true,
  default: {
    getAll: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('../../services/currency', () => ({
  __esModule: true,
  default: {
    fetchRates: jest.fn(() => Promise.resolve()),
    getSymbol: jest.fn(() => '₽'),
    convertLocal: jest.fn((amount) => amount),
  },
}));

jest.mock('../../services/auth', () => ({
  __esModule: true,
  default: {
    isLoggedIn: jest.fn(() => Promise.resolve(false)),
    getCurrentUser: jest.fn(),
  },
}));

describe('dataStore', () => {
  beforeEach(() => {
    useDataStore.setState({
      accounts: [],
      transactions: [],
      categories: [],
      goals: [],
      wishlist: [],
      articles: [],
      gamification: { id: '', userId: '', createdAt: '', updatedAt: '', hourlyRate: 1500 },
      user: null,
      userCurrency: 'RUB',
      currencySymbol: '₽',
      isLoadingAccounts: false,
      isLoadingTransactions: false,
      isLoadingGoals: false,
      isLoadingArticles: false,
      accountTypes: [],
      availableIcons: [],
      achievements: [],
      earnedAchievements: [],
      challenges: [],
      activeChallenges: [],
    });
    jest.clearAllMocks();
  });

  describe('accounts', () => {
    it('setAccounts replaces the list', () => {
      const accs = [{ id: '1', name: 'Cash' }];
      useDataStore.getState().setAccounts(accs as any);
      expect(useDataStore.getState().accounts).toEqual(accs);
    });

    it('addAccount appends to the list', () => {
      useDataStore.getState().setAccounts([{ id: '1' } as any]);
      useDataStore.getState().addAccount({ id: '2' } as any);
      expect(useDataStore.getState().accounts).toHaveLength(2);
    });

    it('updateAccount merges data', () => {
      useDataStore.getState().setAccounts([{ id: '1', name: 'Old' }] as any);
      useDataStore.getState().updateAccount('1', { name: 'New' });
      expect(useDataStore.getState().accounts[0].name).toBe('New');
    });

    it('deleteAccount removes by id', () => {
      useDataStore.getState().setAccounts([{ id: '1' }, { id: '2' }] as any);
      useDataStore.getState().deleteAccount('1');
      expect(useDataStore.getState().accounts).toHaveLength(1);
      expect(useDataStore.getState().accounts[0].id).toBe('2');
    });

    it('updateAccount on non-existent id is no-op', () => {
      useDataStore.getState().setAccounts([{ id: '1', name: 'Old' }] as any);
      useDataStore.getState().updateAccount('999', { name: 'New' });
      expect(useDataStore.getState().accounts[0].name).toBe('Old');
    });

    it('deleteAccount on non-existent id is no-op', () => {
      useDataStore.getState().setAccounts([{ id: '1' }] as any);
      useDataStore.getState().deleteAccount('999');
      expect(useDataStore.getState().accounts).toHaveLength(1);
    });
  });

  describe('transactions', () => {
    it('setTransactions replaces the list', () => {
      useDataStore.getState().setTransactions([{ id: 't1' }] as any);
      expect(useDataStore.getState().transactions).toHaveLength(1);
    });

    it('setTransactions to empty', () => {
      useDataStore.getState().setTransactions([{ id: 't1' }] as any);
      useDataStore.getState().setTransactions([]);
      expect(useDataStore.getState().transactions).toHaveLength(0);
    });
  });

  describe('categories', () => {
    it('setCategories replaces the list', () => {
      useDataStore.getState().setCategories([{ id: 'c1' }] as any);
      expect(useDataStore.getState().categories).toHaveLength(1);
    });
  });

  describe('goals', () => {
    it('setGoals replaces the list', () => {
      useDataStore.getState().setGoals([{ id: 'g1' }] as any);
      expect(useDataStore.getState().goals).toHaveLength(1);
    });
  });

  describe('helpers', () => {
    it('getTotalBalance sums account balances', () => {
      useDataStore.setState({
        accounts: [
          { id: '1', balance: 100000, currency: 'RUB' },
          { id: '2', balance: 50000, currency: 'RUB' },
        ] as any,
      });
      expect(useDataStore.getState().getTotalBalance()).toBe(150000);
    });

    it('getTotalBalance returns 0 for empty accounts', () => {
      expect(useDataStore.getState().getTotalBalance()).toBe(0);
    });

    it('getHourlyRate returns gamification hourlyRate', () => {
      useDataStore.setState({
        gamification: { id: '1', userId: '1', hourlyRate: 2000, createdAt: '', updatedAt: '' },
      });
      expect(useDataStore.getState().getHourlyRate()).toBe(2000);
    });

    it('getHourlyRate returns 1500 default when no gamification', () => {
      useDataStore.setState({ gamification: null });
      expect(useDataStore.getState().getHourlyRate()).toBe(1500);
    });

    it('getHourlyRate returns 1500 when gamification has no hourlyRate', () => {
      useDataStore.setState({
        gamification: { id: '1', userId: '1', createdAt: '', updatedAt: '' },
      });
      expect(useDataStore.getState().getHourlyRate()).toBe(1500);
    });

    it('getMonthlyIncome filters INCOME this month', () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();

      useDataStore.setState({
        categories: [],
        transactions: [
          { id: '1', type: 'INCOME', amount: 50000, date: thisMonth, categoryId: 'c1', accountId: 'a1' },
          { id: '2', type: 'EXPENSE', amount: 30000, date: thisMonth, categoryId: 'c2', accountId: 'a1' },
        ] as any,
      });

      expect(useDataStore.getState().getMonthlyIncome()).toBe(50000);
    });

    it('getMonthlyExpenses filters EXPENSE this month', () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();

      useDataStore.setState({
        categories: [],
        transactions: [
          { id: '1', type: 'INCOME', amount: 50000, date: thisMonth, categoryId: 'c1', accountId: 'a1' },
          { id: '2', type: 'EXPENSE', amount: 30000, date: thisMonth, categoryId: 'c2', accountId: 'a1' },
        ] as any,
      });

      expect(useDataStore.getState().getMonthlyExpenses()).toBe(30000);
    });

    it('getMonthlyIncome excludes categories marked excludeFromTotal', () => {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 15).toISOString();

      useDataStore.setState({
        categories: [{ id: 'c1', excludeFromTotal: true }] as any,
        transactions: [
          { id: '1', type: 'INCOME', amount: 50000, date: thisMonth, categoryId: 'c1', accountId: 'a1' },
          { id: '2', type: 'INCOME', amount: 30000, date: thisMonth, categoryId: 'c2', accountId: 'a1' },
        ] as any,
      });

      expect(useDataStore.getState().getMonthlyIncome()).toBe(30000);
    });

    it('getMonthlyExpenses returns 0 for empty transactions', () => {
      useDataStore.setState({ categories: [], transactions: [] });
      expect(useDataStore.getState().getMonthlyExpenses()).toBe(0);
    });

    it('getMonthlyIncome ignores transactions from other months', () => {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      useDataStore.setState({
        categories: [],
        transactions: [
          { id: '1', type: 'INCOME', amount: 50000, date: lastMonth.toISOString(), categoryId: 'c1', accountId: 'a1' },
        ] as any,
      });

      expect(useDataStore.getState().getMonthlyIncome()).toBe(0);
    });
  });

  describe('wishlist', () => {
    it('updateWishlistItem merges data', () => {
      useDataStore.setState({
        wishlist: [{ id: 'w1', name: 'Phone', status: 'PENDING' }] as any,
      });
      useDataStore.getState().updateWishlistItem('w1', { status: 'REJECTED' });
      expect(useDataStore.getState().wishlist[0].status).toBe('REJECTED');
    });
  });

  describe('gamification', () => {
    it('setGamification updates state', () => {
      const gam = { id: '1', userId: '1', hourlyRate: 3000, createdAt: '', updatedAt: '' };
      useDataStore.getState().setGamification(gam);
      expect(useDataStore.getState().gamification).toEqual(gam);
    });

    it('setUser updates state', () => {
      const user = { id: '1', email: 't@t.com', name: 'T' };
      useDataStore.getState().setUser(user as any);
      expect(useDataStore.getState().user).toEqual(user);
    });
  });

  describe('currency', () => {
    it('convertToUserCurrency returns same amount for same currency', () => {
      useDataStore.setState({ userCurrency: 'RUB' });
      expect(useDataStore.getState().convertToUserCurrency(10000, 'RUB')).toBe(10000);
    });

    it('convertToUserCurrency delegates to currencyService for different currencies', () => {
      useDataStore.setState({ userCurrency: 'USD' });
      const result = useDataStore.getState().convertToUserCurrency(10000, 'RUB');
      expect(typeof result).toBe('number');
    });
  });

  describe('achievements', () => {
    it('earnAchievement adds id if not already earned', () => {
      useDataStore.getState().earnAchievement('a1');
      expect(useDataStore.getState().earnedAchievements).toContain('a1');
    });

    it('earnAchievement does not duplicate', () => {
      useDataStore.getState().earnAchievement('a1');
      useDataStore.getState().earnAchievement('a1');
      expect(useDataStore.getState().earnedAchievements).toEqual(['a1']);
    });
  });
});
