import { describe, it, expect } from 'vitest';
import { formatNumber, formatPercentage, formatCompactNumber } from '../utils/formatters';

describe('Formatter Utilities', () => {
  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should handle zero', () => {
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(0.5)).toBe('50%');
      expect(formatPercentage(0.755, 1)).toBe('75.5%');
    });
  });

  describe('formatCompactNumber', () => {
    it('should format large numbers compactly', () => {
      expect(formatCompactNumber(1000)).toBe('1K');
      expect(formatCompactNumber(1500000)).toBe('1.5M');
    });
  });
});
