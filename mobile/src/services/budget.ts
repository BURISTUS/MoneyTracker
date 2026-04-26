import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Budget } from '../types';

export interface BudgetWithProgress extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  currentStartDate: string;
  currentEndDate: string;
}

export const budgetService = {
  async getAll(): Promise<BudgetWithProgress[]> {
    return apiGet<BudgetWithProgress[]>('/budgets');
  },

  async create(data: {
    categoryId: string;
    amount: number;
    alertThreshold?: number;
  }): Promise<Budget> {
    return apiPost<Budget>('/budgets', data);
  },

  async update(id: string, data: {
    amount?: number;
    alertThreshold?: number;
  }): Promise<Budget> {
    return apiPatch<Budget>(`/budgets/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`/budgets/${id}`);
  },
};

export default budgetService;
