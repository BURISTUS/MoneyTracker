import { getTransactionCurrency, formatLifeHours } from '../transactionUtils';
import type { Transaction } from '../../types';

describe('transactionUtils', () => {
  describe('getTransactionCurrency', () => {
    it('returns account currency when account is present', () => {
      const tx = {
        id: '1',
        account: { currency: 'USD' },
      } as unknown as Transaction;
      expect(getTransactionCurrency(tx)).toBe('USD');
    });

    it('returns RUB when account is missing', () => {
      const tx = { id: '1' } as Transaction;
      expect(getTransactionCurrency(tx)).toBe('RUB');
    });

    it('returns RUB when account has no currency', () => {
      const tx = { id: '1', account: {} } as unknown as Transaction;
      expect(getTransactionCurrency(tx)).toBe('RUB');
    });
  });

  describe('formatLifeHours', () => {
    it('returns empty string for zero hourly rate', () => {
      expect(formatLifeHours(100, 0)).toBe('');
    });

    it('returns empty string for negative hourly rate', () => {
      expect(formatLifeHours(100, -10)).toBe('');
    });

    it('returns minutes for less than 1 hour', () => {
      expect(formatLifeHours(500, 1000)).toBe('30 мин');
    });

    it('returns hours for 1-23 hours', () => {
      expect(formatLifeHours(5000, 1000)).toBe('5.0 ч');
    });

    it('returns days for 24+ hours', () => {
      expect(formatLifeHours(24000, 1000)).toBe('1.0 дн');
    });

    it('handles exact boundary (60 min)', () => {
      expect(formatLifeHours(1000, 1000)).toBe('1.0 ч');
    });

    it('handles exact boundary (24h)', () => {
      expect(formatLifeHours(24000, 1000)).toBe('1.0 дн');
    });
  });
});
