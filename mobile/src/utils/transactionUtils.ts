import { Transaction } from '../types';

export function getTransactionCurrency(transaction: Transaction): string {
  return transaction.account?.currency || 'RUB';
}

export function formatLifeHours(amount: number, hourlyRate: number): string {
  if (!hourlyRate || hourlyRate <= 0) return '';
  const hours = amount / hourlyRate;
  if (hours < 1) return `${Math.round(hours * 60)} мин`;
  if (hours < 24) return `${hours.toFixed(1)} ч`;
  return `${(hours / 24).toFixed(1)} дн`;
}
