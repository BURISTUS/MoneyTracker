import api from './api';

const budgetsService = {
  getBudgets: (month?: string) => api.get('/budgets', { params: { month } }),
  createBudget: (data: { categoryId: string; amount: number; month?: string }) =>
    api.post('/budgets', data),
  updateBudget: (id: string, amount: number) =>
    api.patch(`/budgets/${id}`, { amount }),
  deleteBudget: (id: string) => api.delete(`/budgets/${id}`),
  carryForward: () => api.post('/budgets/carry-forward'),
};

export default budgetsService;
