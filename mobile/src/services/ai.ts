import { apiPost } from './api';

// === Типы ===

export interface AiTransactionResult {
  type: 'INCOME' | 'EXPENSE';
  amount: number; // в рублях (не копейках!)
  description: string;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  date?: string; // ISO string
}

export interface AiReceiptResult extends AiTransactionResult {
  store?: string;
  totalAmount?: number;
  items?: Array<{
    name: string;
    amount: number;
    categoryName: string;
  }>;
}

// === Сервис ===

export const aiService = {
  /** Парсинг голосового/текстового ввода в транзакцию */
  async parseVoice(text: string, language?: string): Promise<AiTransactionResult> {
    return apiPost<AiTransactionResult>('/ai/voice-transaction', { text, language });
  },

  /** Парсинг фото чека в транзакцию */
  async parseReceipt(imageBase64: string, mimeType: string, language?: string): Promise<AiReceiptResult> {
    return apiPost<AiReceiptResult>('/ai/receipt-transaction', { imageBase64, mimeType, language });
  },
};

export default aiService;