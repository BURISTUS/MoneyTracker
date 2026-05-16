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
    description: 'AI-ассистент',
    icon: 'sparkles',
    free: { allowed: false },
    premium: { allowed: true, limit: 50 },
    premium_family: { allowed: true, limit: 100 },
    limitUnit: 'сообщений/день',
  },
  AI_VOICE: {
    description: 'Голосовой ввод',
    icon: 'mic',
    free: { allowed: false },
    premium: { allowed: true, limit: 20 },
    premium_family: { allowed: true, limit: 40 },
    limitUnit: 'запросов/день',
  },
  AI_RECEIPT: {
    description: 'Сканирование чеков',
    icon: 'camera',
    free: { allowed: false },
    premium: { allowed: true, limit: 10 },
    premium_family: { allowed: true, limit: 20 },
    limitUnit: 'сканов/день',
  },
  ACCOUNTS: {
    description: 'Финансовые счета',
    icon: 'wallet',
    free: { allowed: true, limit: 3 },
    premium: { allowed: true },
    premium_family: { allowed: true },
    limitUnit: 'шт.',
  },
  ACCOUNT_CREDIT: {
    description: 'Кредитные карты',
    icon: 'card',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ACCOUNT_INVESTMENT: {
    description: 'Инвестиционные счета',
    icon: 'trending-up',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ACCOUNT_DEBT: {
    description: 'Долги (должник/кредитор)',
    icon: 'people',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  GOALS: {
    description: 'Финансовые цели',
    icon: 'flag',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  WISHLIST_INCUBATOR: {
    description: 'Инкубатор желаний',
    icon: 'heart',
    free: { allowed: true, limit: 5 },
    premium: { allowed: true },
    premium_family: { allowed: true },
    limitUnit: 'желаний',
  },
  LIFE_COST: {
    description: 'Стоимость жизни',
    icon: 'hourglass',
    free: { allowed: true },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ANALYTICS_BASIC: {
    description: 'Базовая аналитика',
    icon: 'bar-chart',
    free: { allowed: true },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ANALYTICS_COMPARISON: {
    description: 'Сравнение периодов',
    icon: 'swap-vertical',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ANALYTICS_TRENDS: {
    description: 'Тренды по категориям',
    icon: 'trending-up',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  EXPORT: {
    description: 'Экспорт данных',
    icon: 'download',
    free: { allowed: false },
    premium: { allowed: true },
    premium_family: { allowed: true },
  },
  ARTICLES: {
    description: 'Статьи',
    icon: 'book',
    free: { allowed: true, limit: 3 },
    premium: { allowed: true },
    premium_family: { allowed: true },
    limitUnit: 'статей/день',
  },
  FAMILY: {
    description: 'Семейный бюджет',
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
  CASH: 'Наличные',
  BANK: 'Банковский',
  CREDIT: 'Кредитная карта',
  INVESTMENT: 'Инвестиции',
  DEBT: 'Долг',
};

export const ACCOUNT_TYPE_PREMIUM: Record<string, string> = {
  CREDIT: 'ACCOUNT_CREDIT',
  INVESTMENT: 'ACCOUNT_INVESTMENT',
  DEBT: 'ACCOUNT_DEBT',
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
