export interface AiTransactionResult {
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  categoryName: string;
  categoryType: 'INCOME' | 'EXPENSE';
  date?: string;
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