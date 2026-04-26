import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Goal } from '../types';

export interface GoalWithProgress extends Goal {
  percentComplete: number;
  remaining: number;
}

export const goalsService = {
  async getAll(): Promise<GoalWithProgress[]> {
    return apiGet<GoalWithProgress[]>('/goals');
  },

  async create(data: {
    name: string;
    targetAmount: number;
    deadline?: string;
  }): Promise<GoalWithProgress> {
    return apiPost<GoalWithProgress>('/goals', data);
  },

  async update(id: string, data: {
    name?: string;
    targetAmount?: number;
    deadline?: string;
  }): Promise<GoalWithProgress> {
    return apiPatch<GoalWithProgress>(`/goals/${id}`, data);
  },

  async addProgress(id: string, amount: number): Promise<GoalWithProgress> {
    return apiPatch<GoalWithProgress>(`/goals/${id}/progress`, { amount });
  },

  async delete(id: string): Promise<void> {
    return apiDelete(`/goals/${id}`);
  },
};

export default goalsService;
