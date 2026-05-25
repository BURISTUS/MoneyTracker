import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import { RecurringRule, RecurrencePeriod, TransactionType } from '../types';

export interface CreateRecurringRuleData {
  accountId: string;
  categoryId: string;
  amount: number;
  type: TransactionType;
  period: RecurrencePeriod;
  dayOfWeek?: number;
  dayOfMonth?: number;
  description?: string;
}

export interface UpdateRecurringRuleData {
  amount?: number;
  description?: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
}

const recurringService = {
  getAll: () => apiGet<RecurringRule[]>('/recurring'),

  getById: (id: string) => apiGet<RecurringRule>(`/recurring/${id}`),

  getPreview: (id: string, count = 3) =>
    apiGet<{ ruleId: string; amount: number; upcomingDates: string[] }>(`/recurring/${id}/preview`, { params: { count } }),

  create: (data: CreateRecurringRuleData) => apiPost<RecurringRule>('/recurring', data),

  update: (id: string, data: UpdateRecurringRuleData) => apiPatch<RecurringRule>(`/recurring/${id}`, data),

  pause: (id: string) => apiPatch<RecurringRule>(`/recurring/${id}/pause`, {}),

  activate: (id: string) => apiPatch<RecurringRule>(`/recurring/${id}/activate`, {}),

  delete: (id: string, keepTransactions = true) =>
    apiDelete<{ success: boolean }>(`/recurring/${id}`, { params: { keepTransactions: String(keepTransactions) } }),
};

export default recurringService;
