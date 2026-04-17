import { useDataStore } from '../stores/dataStore';

export const useCategories = () => {
  const categories = useDataStore((s) => s.categories);
  const fetchCategories = useDataStore((s) => s.fetchCategories);

  const incomeCategories = categories.filter((c) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE');
  const systemCategories = categories.filter((c) => c.isSystem);
  const personalCategories = categories.filter((c) => !c.isSystem);

  return {
    categories,
    incomeCategories,
    expenseCategories,
    systemCategories,
    personalCategories,
    fetchCategories,
  };
};
