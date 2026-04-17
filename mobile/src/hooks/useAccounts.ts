import { useCallback } from 'react';
import { useDataStore } from '../stores/dataStore';
import type { Account } from '../types';

export const useAccounts = () => {
  const accounts = useDataStore((s) => s.accounts);
  const isLoading = useDataStore((s) => s.isLoadingAccounts);
  const fetchAccounts = useDataStore((s) => s.fetchAccounts);
  const createAccount = useDataStore((s) => s.createAccount);
  const deleteAccount = useDataStore((s) => s.deleteAccount);
  const updateAccount = useDataStore((s) => s.updateAccount);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return {
    accounts,
    isLoading,
    totalBalance,
    fetchAccounts,
    createAccount,
    deleteAccount,
    updateAccount,
  };
};
