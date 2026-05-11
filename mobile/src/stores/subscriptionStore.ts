import { create } from 'zustand';
import { api } from '../services/api';
import { SubscriptionStatus, FeatureKey, FeatureAccess } from '../types';

interface SubscriptionState {
  status: SubscriptionStatus | null;
  isLoading: boolean;
  error: string | null;

  fetchStatus: () => Promise<void>;
  checkAccess: (feature: FeatureKey) => FeatureAccess | null;
  isPremium: () => boolean;
}

const DEFAULT_FEATURES: Record<FeatureKey, FeatureAccess> = {
  AI_CHAT: { allowed: true, limit: 5, limitUnit: 'сообщений/день' },
  AI_VOICE: { allowed: true, limit: 3, limitUnit: 'запросов/день' },
  AI_RECEIPT: { allowed: true, limit: 2, limitUnit: 'сканов/день' },
  ACCOUNTS: { allowed: true, limit: 3, limitUnit: 'шт.' },
  GOALS: { allowed: false },
  WISHLIST_INCUBATOR: { allowed: true, limit: 5, limitUnit: 'желаний' },
  LIFE_COST: { allowed: false },
  ANALYTICS_BASIC: { allowed: true },
  ANALYTICS_ADVANCED: { allowed: false },
  EXPORT: { allowed: false },
  ARTICLES: { allowed: true, limit: 3, limitUnit: 'статей/день' },
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  status: null,
  isLoading: false,
  error: null,

  fetchStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/subscription/status');
      set({ status: data, isLoading: false });
    } catch (e: any) {
      // Если ошибка — используем дефолтные лимиты (free)
      set({ isLoading: false, error: e.message });
    }
  },

  checkAccess: (feature: FeatureKey) => {
    const { status } = get();
    if (!status) return DEFAULT_FEATURES[feature];
    return status.features[feature] || DEFAULT_FEATURES[feature];
  },

  isPremium: () => {
    const { status } = get();
    return status?.isPremium ?? false;
  },
}));