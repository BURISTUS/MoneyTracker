/**
 * Freemium Feature Configuration
 * Единый источник истины: что доступно на каком плане.
 */

export type FeatureKey = keyof typeof FEATURES;

export interface FeatureTier {
  allowed: boolean;
  limit?: number;
}

export interface FeatureConfig {
  description: string;
  icon: string;
  free: FeatureTier;
  premium: FeatureTier;
  limitUnit?: string;
}

export const FEATURES: Record<string, FeatureConfig> = {
  // === AI ===
  AI_CHAT: {
    description: 'AI-ассистент',
    icon: 'sparkles',
    free: { allowed: true, limit: 5 },
    premium: { allowed: true, limit: 50 },
    limitUnit: 'сообщений/день',
  },
  AI_VOICE: {
    description: 'Голосовой ввод',
    icon: 'mic',
    free: { allowed: true, limit: 3 },
    premium: { allowed: true, limit: 20 },
    limitUnit: 'запросов/день',
  },
  AI_RECEIPT: {
    description: 'Сканирование чеков',
    icon: 'camera',
    free: { allowed: true, limit: 2 },
    premium: { allowed: true, limit: 10 },
    limitUnit: 'сканов/день',
  },

  // === Финансы ===
  ACCOUNTS: {
    description: 'Финансовые счета',
    icon: 'wallet',
    free: { allowed: true, limit: 3 },
    premium: { allowed: true },
    limitUnit: 'шт.',
  },
  GOALS: {
    description: 'Финансовые цели',
    icon: 'flag',
    free: { allowed: false },
    premium: { allowed: true },
  },
  WISHLIST_INCUBATOR: {
    description: 'Инкубатор желаний',
    icon: 'heart',
    free: { allowed: true, limit: 5 },
    premium: { allowed: true },
    limitUnit: 'желаний',
  },
  LIFE_COST: {
    description: 'Стоимость жизни',
    icon: 'hourglass',
    free: { allowed: false },
    premium: { allowed: true },
  },

  // === Аналитика ===
  ANALYTICS_BASIC: {
    description: 'Базовая аналитика',
    icon: 'bar-chart',
    free: { allowed: true },
    premium: { allowed: true },
  },
  ANALYTICS_ADVANCED: {
    description: 'Расширенная аналитика',
    icon: 'trending-up',
    free: { allowed: false },
    premium: { allowed: true },
  },
  EXPORT: {
    description: 'Экспорт данных',
    icon: 'download',
    free: { allowed: false },
    premium: { allowed: true },
  },

  // === Контент ===
  ARTICLES: {
    description: 'Статьи',
    icon: 'book',
    free: { allowed: true, limit: 3 },
    premium: { allowed: true },
    limitUnit: 'статей/день',
  },
};

/** Получить лимит фичи для плана. Infinity = безлимит */
export function getLimit(key: FeatureKey, plan: 'free' | 'premium'): number {
  const config = FEATURES[key][plan];
  if (!config.allowed) return 0;
  return config.limit ?? Infinity;
}

/** Проверить доступность фичи на плане */
export function isAllowed(key: FeatureKey, plan: 'free' | 'premium'): boolean {
  return FEATURES[key][plan].allowed;
}