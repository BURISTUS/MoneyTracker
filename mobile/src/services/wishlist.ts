import { apiGet, apiPost } from './api';
import type { WishlistItem } from '../types';

export interface WishlistGroupedResponse {
  ready: WishlistItem[];
  pending: WishlistItem[];
  history: WishlistItem[];
  all: WishlistItem[];
}

export const wishlistService = {
  async getAll(): Promise<WishlistGroupedResponse> {
    return apiGet<WishlistGroupedResponse>('/wishlist');
  },

  async create(data: {
    name: string;
    price: number;
    description: string;
    cooldownDays?: number;
  }): Promise<WishlistItem> {
    return apiPost<WishlistItem>('/wishlist', data);
  },

  async reject(id: string): Promise<{ futureValue: number; message: string }> {
    return apiPost(`/wishlist/${id}/reject`);
  },

  async purchase(id: string): Promise<{ success: boolean; message: string }> {
    return apiPost(`/wishlist/${id}/purchase`);
  },

  async snooze(id: string): Promise<{ success: boolean; message: string }> {
    return apiPost(`/wishlist/${id}/snooze`);
  },
};

export default wishlistService;
