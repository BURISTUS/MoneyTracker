import { useCallback } from 'react';
import { useDataStore } from '../stores/dataStore';
import type { Transaction, TransactionType } from '../types';

interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
}

export const useTransactions = (filters?: TransactionFilters) => {
  const allTransactions = useDataStore((s) => s.transactions);
  const isLoading = useDataStore((s) => s.isLoadingTransactions);
  const fetchTransactions = useDataStore((s) => s.fetchTransactions);
  const addTransaction = useDataStore((s) => s.addTransaction);

  const transactions = filters
    ? allTransactions.filter((t) => {
        if (filters.type && t.type !== filters.type) return false;
        if (filters.categoryId && t.categoryId !== filters.categoryId) return false;
        if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) return false;
        if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) return false;
        return true;
      })
    : allTransactions;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyIncome = allTransactions
    .filter((t) => t.type === 'INCOME' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = allTransactions
    .filter((t) => t.type === 'EXPENSE' && new Date(t.date) >= startOfMonth)
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    transactions,
    isLoading,
    monthlyIncome,
    monthlyExpenses,
    fetchTransactions,
    addTransaction,
  };
};
