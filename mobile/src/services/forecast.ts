import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { ForecastScenario, ForecastProjection } from '../types';

export interface CreateForecastData {
  name: string;
  description?: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySave?: number;
  inflationRate?: number;
  investmentReturnRate?: number;
  forecastYears?: number;
}

const forecastService = {
  getAll: () => apiGet<ForecastScenario[]>('/forecast'),
  getById: (id: string) => apiGet<ForecastScenario>(`/forecast/${id}`),
  calculate: (id: string) => apiGet<ForecastProjection>(`/forecast/${id}/calculate`),
  create: (data: CreateForecastData) => apiPost<ForecastScenario>('/forecast', data),
  update: (id: string, data: { name?: string; description?: string }) =>
    apiPatch<ForecastScenario>(`/forecast/${id}`, data),
  delete: (id: string) => apiDelete(`/forecast/${id}`),
};

export default forecastService;
