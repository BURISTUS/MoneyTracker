import { useCallback } from 'react';

export const useCurrency = () => {
  const format = useCallback((amount: number): string => {
    const rubles = amount / 100;
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(rubles);
  }, []);

  const formatCompact = useCallback((amount: number): string => {
    const rubles = amount / 100;
    if (rubles >= 1000000) return `${(rubles / 1000000).toFixed(1)}M ₽`;
    if (rubles >= 1000) return `${(rubles / 1000).toFixed(1)}K ₽`;
    return `${Math.round(rubles)} ₽`;
  }, []);

  return { format, formatCompact };
};
