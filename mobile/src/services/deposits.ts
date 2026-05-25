import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Deposit } from '../types';

export interface CreateDepositData {
  name: string;
  type: string;
  principal: number;
  annualRate: number;
  compounding: string;
  termMonths: number;
  startDate: string;
}

const depositsService = {
  getAll: () => apiGet<Deposit[]>('/deposits'),
  getById: (id: string) => apiGet<Deposit>(`/deposits/${id}`),
  getProjection: (id: string) => apiGet<{
    principal: number; maturityAmount: number; totalInterest: number;
    projection: { month: number; amount: number; interest: number }[];
  }>(`/deposits/${id}/projection`),
  create: (data: CreateDepositData) => apiPost<Deposit>('/deposits', data),
  update: (id: string, data: { name?: string; currentAmount?: number; annualRate?: number }) =>
    apiPatch<Deposit>(`/deposits/${id}`, data),
  delete: (id: string) => apiDelete(`/deposits/${id}`),
};

export default depositsService;
