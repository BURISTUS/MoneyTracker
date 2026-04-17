import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Account } from '../types';

export const accountsService = {
  // Get public accounts info (no auth required)
  async getPublicInfo(): Promise<{ availableTypes: string[] }> {
    return apiGet<{ availableTypes: string[] }>('/accounts/public');
  },

  // Get all accounts (requires auth)
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
