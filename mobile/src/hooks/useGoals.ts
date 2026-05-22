import { useDataStore } from '../stores/dataStore';

export const useGoals = () => {
  const goals = useDataStore((s) => s.goals);
  const isLoading = useDataStore((s) => s.isLoadingGoals);
  const setGoals = useDataStore((s) => s.setGoals);
  const createGoal = useDataStore((s) => s.createGoal);

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  return {
    goals,
    isLoading,
    totalSaved,
    totalTarget,
    setGoals,
    createGoal,
  };
};
