const CURRENCY_SYMBOLS: Record<string, string> = {
  RUB: '₽', USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
  BRL: 'R$', MXN: 'MX$', INR: '₹', KRW: '₩', TRY: '₺',
  CHF: 'CHF', CAD: 'C$', AUD: 'A$',
};

let activeCurrency = 'RUB';
let activeSymbol = '₽';

export function setCurrencyConfig(currency: string, symbol?: string) {
  activeCurrency = currency;
  activeSymbol = symbol || CURRENCY_SYMBOLS[currency] || currency;
}

export function getCurrencySymbol(): string {
  return activeSymbol;
}

export function formatCurrency(amount: number, currency?: string): string {
  const sym = currency ? (CURRENCY_SYMBOLS[currency] || currency) : activeSymbol;
  const formatted = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
  return `${formatted} ${sym}`;
}

/**
 * Format a number as simple currency without decimals
 */
export function formatCurrencySimple(amount: number): string {
  const formatted = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100);
  return formatted.replace('₽', '₽').trim();
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ru-RU').format(num);
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Calculate percentage
 */
export function calculatePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Get date string in Russian format
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Get short date string
 */
export function formatShortDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(d);
}

/**
 * Get relative time string
 */
export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дней назад`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяцев назад`;
  return `${Math.floor(diffDays / 365)} лет назад`;
}

/**
 * Get days remaining until date
 */
export function getDaysRemaining(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate XP needed for next level
 */
export function getXpForLevel(level: number): number {
  // Formula: level * level * 100
  return level * level * 100;
}

/**
 * Calculate current level from XP
 */
export function getLevelFromXp(xp: number): number {
  // Inverse of level * level * 100
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get progress to next level (0-100)
 */
export function getLevelProgress(xp: number): number {
  const currentLevel = getLevelFromXp(xp);
  const currentLevelXp = getXpForLevel(currentLevel - 1);
  const nextLevelXp = getXpForLevel(currentLevel);
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));
}

/**
 * Generate avatar initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
