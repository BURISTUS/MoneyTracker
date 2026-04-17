import { useDataStore } from '../stores/dataStore';

export const useBudget = () => {
  const budgets = useDataStore((s) => s.budgets);
  const isLoading = useDataStore((s) => s.isLoadingBudgets);
  const setBudgets = useDataStore((s) => s.setBudgets);
  const addBudget = useDataStore((s) => s.addBudget);
  const updateBudget = useDataStore((s) => s.updateBudget);

  return {
    budgets,
    isLoading,
    setBudgets,
    addBudget,
    updateBudget,
  };
};
