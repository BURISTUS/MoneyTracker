import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Category } from '../types';

export interface CategoryTypeOption {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface IconOption {
  name: string;
}

export const categoriesService = {
  // Get available icons
  async getIcons(): Promise<IconOption[]> {
    return apiGet<IconOption[]>('/categories/icons');
  },

  // Get account types
  async getAccountTypes(): Promise<CategoryTypeOption[]> {
    return apiGet<CategoryTypeOption[]>('/categories/types');
  },

  // Get all categories (system + personal)
  async getAll(): Promise<Category[]> {
    return apiGet<Category[]>('/categories');
  },

  // Get category by ID
  async getById(id: string): Promise<Category> {
    return apiGet<Category>(`/categories/${id}`);
  },

  // Create category
  async create(data: {
    name: string;
    type: string;
    icon?: string;
    color?: string;
    isBaseNeed?: boolean;
  }): Promise<Category> {
    return apiPost<Category>('/categories', data);
  },

  // Update category
  async update(id: string, data: Partial<{
    name: string;
    type: string;
    icon: string;
    color: string;
    isBaseNeed: boolean;
  }>): Promise<Category> {
    return apiPatch<Category>(`/categories/${id}`, data);
  },

  // Delete category
  async delete(id: string): Promise<void> {
    return apiDelete(`/categories/${id}`);
  },
};

export default categoriesService;
