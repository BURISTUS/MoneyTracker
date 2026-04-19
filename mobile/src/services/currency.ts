import { apiGet } from './api';

export interface ExchangeRate {
  id: string;
  code: string;
  name: string;
  symbol: string;
  type: 'FIAT' | 'CRYPTO' | 'METAL';
  popular: boolean;
  rate: number;
  source: string;
  date: string;
  fetchedAt: string;
}

export interface CurrencyListResponse {
  items: ExchangeRate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ConvertResult {
  amount: number;
  from: string;
  to: string;
}

class CurrencyService {
  private rates: ExchangeRate[] = [];
  private loaded = false;

  async fetchRates(): Promise<ExchangeRate[]> {
    try {
      this.rates = await apiGet<ExchangeRate[]>('/currency/rates');
      this.loaded = true;
      return this.rates;
    } catch (error) {
      console.error('Failed to fetch currency rates:', error);
      return this.rates;
    }
  }

  async fetchCurrencyList(params: {
    search?: string;
    type?: 'FIAT' | 'CRYPTO' | 'METAL';
    popular?: boolean;
    page?: number;
    limit?: number;
  }): Promise<CurrencyListResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.type) query.set('type', params.type);
    if (params.popular !== undefined) query.set('popular', String(params.popular));
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    return apiGet<CurrencyListResponse>(`/currency/list?${query.toString()}`);
  }

  getRates(): ExchangeRate[] {
    return this.rates;
  }

  getSymbol(code: string): string {
    const rate = this.rates.find((r) => r.code === code);
    return rate?.symbol || code;
  }

  convertLocal(amount: number, from: string, to: string): number {
    if (from === to) return amount;
    const fromRate = this.rates.find((r) => r.code === from);
    const toRate = this.rates.find((r) => r.code === to);
    if (!fromRate || !toRate) return amount;
    const amountInBase = amount / fromRate.rate;
    return amountInBase * toRate.rate;
  }

  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    try {
      const result = await apiGet<ConvertResult>(
        `/currency/convert?amount=${amount}&from=${from}&to=${to}`,
      );
      return result.amount;
    } catch {
      return this.convertLocal(amount, from, to);
    }
  }
}

export const currencyService = new CurrencyService();
export default currencyService;
