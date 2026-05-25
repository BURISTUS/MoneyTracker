import { apiGet, apiPost, apiPatch, apiDelete } from './api';
import type { Loan, LoanPayment } from '../types';

export interface CreateLoanData {
  name: string;
  type: string;
  principal: number;
  annualRate: number;
  termMonths: number;
  startDate: string;
}

const loansService = {
  getAll: () => apiGet<Loan[]>('/loans'),
  getById: (id: string) => apiGet<Loan & { payments: LoanPayment[] }>(`/loans/${id}`),
  getSchedule: (id: string) => apiGet<{
    loanId: string; monthlyPayment: number;
    schedule: LoanPayment[];
  }>(`/loans/${id}/schedule`),
  create: (data: CreateLoanData) => apiPost<Loan>('/loans', data),
  recordPayment: (id: string) => apiPost<{ success: boolean }>(`/loans/${id}/pay`, {}),
  update: (id: string, data: { name?: string }) => apiPatch<Loan>(`/loans/${id}`, data),
  delete: (id: string) => apiDelete(`/loans/${id}`),
};

export default loansService;
