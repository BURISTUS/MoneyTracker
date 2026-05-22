import { create } from 'zustand';
import { api } from '../services/api';
import { familyService, FamilyInfo, FamilyBudget } from '../services/family';
import { SubscriptionStatus, FeatureKey, FeatureAccess } from '../types';
import i18n from '../i18n';

interface SubscriptionState {
  status: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;
  paywallFeature: FeatureKey | null;
  family: FamilyInfo | null;
  familyBudget: FamilyBudget | null;

  fetchStatus: () => Promise<void>;
  togglePlan: () => Promise<void>;
  checkAccess: (feature: FeatureKey) => FeatureAccess | null;
  isPremium: () => boolean;
  isFamily: () => boolean;
  plan: () => 'free' | 'premium' | 'premium_family';
  allowedAccountTypes: () => string[];
  accountLimit: () => number;
  showPaywall: (feature: FeatureKey) => boolean;
  closePaywall: () => void;
  fetchFamily: () => Promise<void>;
  fetchFamilyBudget: () => Promise<void>;
  createFamily: (name: string) => Promise<void>;
  joinFamily: (inviteCode: string) => Promise<void>;
  clearFamily: () => void;
}

const DEFAULT_FEATURES: Record<string, FeatureAccess> = {
  AI_CHAT: { allowed: false },
  AI_VOICE: { allowed: false },
  AI_RECEIPT: { allowed: false },
  ACCOUNTS: { allowed: true, limit: 3, limitUnit: i18n.t('subscription.pieces') },
  ACCOUNT_CREDIT: { allowed: false },
  ACCOUNT_INVESTMENT: { allowed: false },
  ACCOUNT_DEBT: { allowed: false },
  GOALS: { allowed: false },
  WISHLIST_INCUBATOR: { allowed: true, limit: 5, limitUnit: i18n.t('subscription.wishes') },
  PERSONAL_CATEGORIES: { allowed: true, limit: 3, limitUnit: i18n.t('subscription.categories') },
  LIFE_COST: { allowed: true },
  ANALYTICS_BASIC: { allowed: true },
  ANALYTICS_COMPARISON: { allowed: false },
  ANALYTICS_TRENDS: { allowed: false },
  EXPORT: { allowed: false },
  ARTICLES: { allowed: true, limit: 3, limitUnit: i18n.t('subscription.articlesDay') },
  FAMILY: { allowed: false },
};

const DEFAULT_ACCOUNT_TYPES = ['CASH', 'BANK'];
const DEFAULT_ACCOUNT_LIMIT = 3;

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  status: null,
  isLoading: false,
  error: null,
  paywallFeature: null,
  family: null,
  familyBudget: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/subscription/status');
      set({ status: data, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  togglePlan: async () => {
    set({ isLoading: true });
    try {
      await api.post('/subscription/toggle');
      const { data } = await api.get('/subscription/status');
      set({ status: data, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  checkAccess: (feature: FeatureKey) => {
    const { status } = get();
    if (!status) return DEFAULT_FEATURES[feature];
    return status.features[feature] || DEFAULT_FEATURES[feature];
  },

  isPremium: () => {
    return get().status?.isPremium ?? false;
  },

  isFamily: () => {
    return get().status?.plan === 'premium_family';
  },

  plan: () => {
    return get().status?.plan ?? 'free';
  },

  allowedAccountTypes: () => {
    return get().status?.allowedAccountTypes ?? DEFAULT_ACCOUNT_TYPES;
  },

  accountLimit: () => {
    return get().status?.accountLimit ?? DEFAULT_ACCOUNT_LIMIT;
  },

  showPaywall: (feature: FeatureKey) => {
    const access = get().checkAccess(feature);
    if (!access?.allowed) {
      set({ paywallFeature: feature });
      return true;
    }
    return false;
  },

  closePaywall: () => {
    set({ paywallFeature: null });
  },

  fetchFamily: async () => {
    try {
      const family = await familyService.getMyFamily();
      set({ family });
    } catch {
      set({ family: null });
    }
  },

  fetchFamilyBudget: async () => {
    try {
      const budget = await familyService.getBudget();
      set({ familyBudget: budget });
    } catch {
      set({ familyBudget: null });
    }
  },

  createFamily: async (name: string) => {
    const family = await familyService.create(name);
    set({ family });
  },

  joinFamily: async (inviteCode: string) => {
    await familyService.join(inviteCode);
    await get().fetchFamily();
  },

  clearFamily: () => {
    set({ family: null, familyBudget: null });
  },
}));