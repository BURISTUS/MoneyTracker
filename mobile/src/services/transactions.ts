import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Transaction, TransactionSummary } from '../types';

export const transactionsService = {
  // Get all transactions
  async getAll(filters?: {
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    type?: string;
  }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.type) params.append('type', filters.type);
    
    const query = params.toString();
    return apiGet<Transaction[]>(`/transactions${query ? `?${query}` : ''}`);
  },

  // Get transaction by ID
  async getById(id: string): Promise<Transaction> {
    return apiGet<Transaction>(`/transactions/${id}`);
  },

  // Create transaction
  async create(data: {
    accountId: string;
    categoryId: string;
    amount: number;
    type: string;
    description?: string;
    date?: string;
  }): Promise<Transaction> {
    return apiPost<Transaction>('/transactions', data);
  },

  // Update transaction
  async update(id: string, data: {
    description?: string;
    date?: string;
  }): Promise<Transaction> {
    return apiPatch<Transaction>(`/transactions/${id}`, data);
  },

  // Delete transaction
  async delete(id: string): Promise<void> {
    return apiDelete(`/transactions/${id}`);
  },

  // Get transaction summary
  async getSummary(startDate: string, endDate: string): Promise<TransactionSummary> {
    return apiGet<TransactionSummary>(`/transactions/summary?startDate=${startDate}&endDate=${endDate}`);
  },

  // Transfer between accounts
  async transfer(data: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    description?: string;
    date?: string;
  }): Promise<{ fromTransaction: Transaction; toTransaction: Transaction }> {
    return apiPost<{ fromTransaction: Transaction; toTransaction: Transaction }>('/transactions/transfer', data);
  },

  // Get analytics
  async getAnalytics(startDate: string, endDate: string): Promise<any> {
    return apiGet<any>(`/transactions/analytics?startDate=${startDate}&endDate=${endDate}`);
  },
};

export default transactionsService;
