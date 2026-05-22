export type FeatureKey = keyof typeof FEATURES;
export type PlanType = 'free' | 'premium' | 'premium_family';

export interface FeatureTier {
  allowed: boolean;
  limit?: number;
}

export interface FeatureConfig {
  description: string;
  icon: string;
  free: FeatureTier;
  premium: FeatureTier;
  premium_family: FeatureTier;
  limitUnit?: string;
}

export const FEATURES = {
  AI_CHAT: {
    description: 'AI Assistant',
    icon: 'sparkles',
    free: { allowed: false },
    premium: { allowed: true, limit: 50 },
    premium_family: { allowed: true, limit: 100 },
    limitUnit: 'messages/day',
  },
  AI_VOICE: {
    description: 'Voice Input',
    icon: 'mic',
    free: { allowed: false },
    premium: { allowed: true, limit: 20 },
    premium_family: { allowed: true, limit: 40 },
    limitUnit: 'requests/day',
  },
  AI_RECEIPT: {
    description: 'Receipt Scanning',
    icon: 'camera',
    free: { allowed: false },
    premium: { allowed: true, limit: 10 },
    premium_family: { allowed: true, limit: 20 },
    limitUnit: 'scans/day',
  },
  ACCOUNTS: {
    description: 'Financial Accounts',
    icon: 'wallet',
    free: { allowed: true, limit: 3 },
    premium: { allowed: true },
    premium_family: { allowed: true },
    limitUnit: 'items',
  },
  ACCOUNT_CREDIT: {
    description: 'Credit Cards',
    icon: 'card',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ACCOUNT_INVESTMENT: {
    description: 'Investment Accounts',
    icon: 'trending-up',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ACCOUNT_DEBT: {
    description: 'Debts',
    icon: 'people',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  GOALS: {
    description: 'Financial Goals',
    icon: 'flag',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  WISHLIST_INCUBATOR: {
    description: 'Wish Incubator',
    icon: 'heart',
    free: { allowed: true, limit: 5 },
    premium: { allowed: true },
    premium_family: { allowed: true },
    limitUnit: 'wishes',
  },
  LIFE_COST: {
    description: 'Price of Life',
    icon: 'hourglass',
    free: { allowed: true },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ANALYTICS_BASIC: {
    description: 'Basic Analytics',
    icon: 'bar-chart',
    free: { allowed: true },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ANALYTICS_COMPARISON: {
    description: 'Period Comparison',
    icon: 'swap-vertical',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ANALYTICS_TRENDS: {
    description: 'Category Trends',
    icon: 'trending-up',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  EXPORT: {
    description: 'Data Export',
    icon: 'download',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ARTICLES: {
    description: 'Articles',
    icon: 'book',
    free: { allowed: true, limit: 3 },
    premium: { allowed: true },
    premium_family: { allowed: true },
    limitUnit: 'articles/day',
  },
  PERSONAL_CATEGORIES: {
    description: 'Personal Categories',
    icon: 'tag',
    free: { allowed: true, limit: 3 },
    premium: { allowed: true, limit: 50 },
    premium_family: { allowed: true, limit: 100 },
    limitUnit: 'categories',
  },
  FAMILY: {
    description: 'Family Budget',
    icon: 'people',
    free: { allowed: false },
    premium: { allowed: false },
    premium_family: { allowed: true },
  },
};

export const ACCOUNT_TYPE_ACCESS: Record<PlanType, string[]> = {
  free: ['CASH', 'BANK'],
  premium: ['CASH', 'BANK', 'CREDIT', 'INVESTMENT', 'DEBT'],
  premium_family: ['CASH', 'BANK', 'CREDIT', 'INVESTMENT', 'DEBT'],
};

export const ACCOUNT_LIMITS: Record<PlanType, number> = {
  free: 3,
  premium: Infinity,
  premium_family: Infinity,
};

export const ALL_ACCOUNT_TYPES = ['CASH', 'BANK', 'CREDIT', 'INVESTMENT', 'DEBT'];

export const ACCOUNT_TYPE_NAMES: Record<string, string> = {
  CASH: 'Cash',
  BANK: 'Bank',
  CREDIT: 'Credit Card',
  INVESTMENT: 'Investment',
  DEBT: 'Debt',
};

export const ACCOUNT_TYPE_PREMIUM: Record<string, string> = {
  CREDIT: 'Credit Cards',
  INVESTMENT: 'Investment Accounts',
  DEBT: 'Debts',
};

/** Получить лимит фичи для плана. Infinity = безлимит */
export function getLimit(key: FeatureKey, plan: PlanType): number {
  const config = FEATURES[key][plan] as FeatureTier;
  if (!config.allowed) return 0;
  return config.limit ?? Infinity;
}

/** Проверить доступность фичи на плане */
export function isAllowed(key: FeatureKey, plan: PlanType): boolean {
  return (FEATURES[key][plan] as FeatureTier).allowed;
}
