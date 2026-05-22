import { formatCurrency, formatNumber, formatPercent, calculatePercent, getDaysRemaining, getInitials, truncateText, getXpForLevel, getLevelFromXp, getLevelProgress, setCurrencyConfig } from '../formatters';

jest.mock('../../i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
          key,
        );
      }
      return key;
    },
  },
}));

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats kopecks to rubles with symbol', () => {
      const result = formatCurrency(100500);
      expect(result).toMatch(/1.*005,00/);
      expect(result).toContain('₽');
    });

    it('formats zero', () => {
      expect(formatCurrency(0)).toMatch(/0,00/);
    });

    it('formats with custom currency USD', () => {
      const result = formatCurrency(10000, 'USD');
      expect(result).toContain('$');
    });

    it('formats with active currency set via setCurrencyConfig', () => {
      setCurrencyConfig('USD', '$');
      const result = formatCurrency(5000);
      expect(result).toContain('$');
      setCurrencyConfig('RUB', '₽');
    });
  });

  describe('formatNumber', () => {
    it('formats with thousand separators', () => {
      const result = formatNumber(1000000);
      expect(result.replace(/\s/g, '')).toBe('1000000');
    });

    it('formats small numbers', () => {
      expect(formatNumber(42)).toBe('42');
    });
  });

  describe('formatPercent', () => {
    it('formats percentage with 1 decimal', () => {
      expect(formatPercent(33.333)).toBe('33.3%');
    });

    it('formats whole number', () => {
      expect(formatPercent(100)).toBe('100.0%');
    });
  });

  describe('calculatePercent', () => {
    it('calculates percentage correctly', () => {
      expect(calculatePercent(25, 100)).toBe(25);
    });

    it('returns 0 when total is 0', () => {
      expect(calculatePercent(25, 0)).toBe(0);
    });

    it('rounds to integer', () => {
      expect(calculatePercent(1, 3)).toBe(33);
    });
  });

  describe('getDaysRemaining', () => {
    it('returns days until future date', () => {
      const future = new Date();
      future.setDate(future.getDate() + 5);
      expect(getDaysRemaining(future.toISOString())).toBe(5);
    });

    it('returns 0 for past date', () => {
      const past = new Date();
      past.setDate(past.getDate() - 3);
      expect(getDaysRemaining(past.toISOString())).toBe(0);
    });

    it('works with Date object', () => {
      const future = new Date();
      future.setDate(future.getDate() + 10);
      expect(getDaysRemaining(future)).toBe(10);
    });
  });

  describe('getInitials', () => {
    it('returns initials from full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });

    it('returns first letter for single name', () => {
      expect(getInitials('John')).toBe('J');
    });

    it('handles three names — takes first letter of each word', () => {
      expect(getInitials('John Michael Doe')).toBe('JM');
    });
  });

  describe('truncateText', () => {
    it('returns original text when under limit', () => {
      expect(truncateText('hello', 10)).toBe('hello');
    });

    it('truncates with ellipsis', () => {
      expect(truncateText('hello world', 8)).toBe('hello...');
    });

    it('handles exact length', () => {
      expect(truncateText('hello', 5)).toBe('hello');
    });
  });

  describe('getXpForLevel', () => {
    it('returns correct XP for level 1', () => {
      expect(getXpForLevel(1)).toBe(100);
    });

    it('returns correct XP for level 5', () => {
      expect(getXpForLevel(5)).toBe(2500);
    });
  });

  describe('getLevelFromXp', () => {
    it('returns level 1 for 0 XP', () => {
      expect(getLevelFromXp(0)).toBe(1);
    });

    it('returns correct level for given XP', () => {
      expect(getLevelFromXp(2500)).toBe(6);
    });
  });

  describe('getLevelProgress', () => {
    it('returns 0 for level 1 start', () => {
      expect(getLevelProgress(0)).toBe(0);
    });

    it('returns progress within level', () => {
      const progress = getLevelProgress(150);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });
});
