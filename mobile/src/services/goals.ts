import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Goal, GoalContribution } from '../types';

export const goalsService = {
  async getAll(): Promise<Goal[]> {
    return apiGet<Goal[]>('/goals');
  },

  async getById(id: string): Promise<Goal> {
    return apiGet<Goal>(`/goals/${id}`);
  },

  async create(data: { name: string; targetAmount: number; currency?: string; deadline?: string }): Promise<Goal> {
    return apiPost<Goal>('/goals', data);
  },

  async update(id: string, data: { name?: string; targetAmount?: number; deadline?: string }): Promise<Goal> {
    return apiPatch<Goal>(`/goals/${id}`, data);
  },

  async addContribution(id: string, data: { amount: number; note?: string; date?: string }): Promise<Goal> {
    return apiPost<Goal>(`/goals/${id}/contribution`, data);
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`/goals/${id}`);
  },
};

export default goalsService;