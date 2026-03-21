import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Account } from '../types';

export const accountsService = {
  // Get all accounts
  async getAll(): Promise<Account[]> {
    return apiGet<Account[]>('/accounts');
  },

  // Get account by ID
  async getById(id: string): Promise<Account> {
    return apiGet<Account>(`/accounts/${id}`);
  },

  // Create account
  async create(data: {
    name: string;
    type: string;
    balance?: number;
    currency?: string;
    isDefault?: boolean;
  }): Promise<Account> {
    return apiPost<Account>('/accounts', data);
  },

  // Update account
  async update(id: string, data: Partial<{
    name: string;
    type: string;
    balance: number;
    currency: string;
    isDefault: boolean;
  }>): Promise<Account> {
    return apiPatch<Account>(`/accounts/${id}`, data);
  },

  // Delete account
  async delete(id: string): Promise<void> {
    return apiDelete(`/accounts/${id}`);
  },
};

export default accountsService;
