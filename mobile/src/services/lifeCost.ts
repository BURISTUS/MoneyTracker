import { apiGet, apiPost, apiPatch } from './api';
import type { HoursCalculation } from '../types';

export const lifeCostService = {
  async getHourlyRate(): Promise<{ hourlyRate: number }> {
    return apiGet<{ hourlyRate: number }>('/life-cost/rate');
  },

  async updateHourlyRate(hourlyRate: number): Promise<{ hourlyRate: number }> {
    return apiPatch<{ hourlyRate: number }>('/users/hourly-rate', { hourlyRate });
  },

  async calculateHours(amount: number): Promise<HoursCalculation> {
    return apiPost<HoursCalculation>('/life-cost/calculate', { amount });
  },

  async simulateInvestment(amount: number, years?: number): Promise<{ initialAmount: number; futureValue: number; profit: number; years: number; annualRate: number }> {
    return apiPost<{ initialAmount: number; futureValue: number; profit: number; years: number; annualRate: number }>('/life-cost/simulate', { amount, years });
  },
};

export default lifeCostService;
