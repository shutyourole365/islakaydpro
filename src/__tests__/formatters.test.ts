import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPhoneNumber, formatDate, formatRelativeTime } from '../utils/formatters';

describe('Formatter Utilities', () => {
  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
      expect(formatCurrency(1000000)).toBe('$1,000,000.00');
    });

    it('should handle different currencies', () => {
      expect(formatCurrency(100, 'EUR')).toContain('100');
      expect(formatCurrency(100, 'GBP')).toContain('100');
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format 10-digit US numbers', () => {
      expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
    });

    it('should format 11-digit numbers with country code', () => {
      expect(formatPhoneNumber('11234567890')).toBe('+1 (123) 456-7890');
    });

    it('should return input if not standard format', () => {
      expect(formatPhoneNumber('123')).toBe('123');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-03-15T12:00:00Z');

    it('should format date in short format', () => {
      const result = formatDate(testDate, 'short');
      expect(result).toContain('3');
      expect(result).toContain('15');
    });

    it('should format date in medium format', () => {
      const result = formatDate(testDate, 'medium');
      expect(result).toContain('Mar');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format date in long format', () => {
      const result = formatDate(testDate, 'long');
      expect(result).toContain('March');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });
  });

  describe('formatRelativeTime', () => {
    const now = new Date();

    it('should return "just now" for recent times', () => {
      const recent = new Date(now.getTime() - 30000); // 30 seconds ago
      expect(formatRelativeTime(recent)).toBe('just now');
    });

    it('should return minutes ago', () => {
      const minutes = new Date(now.getTime() - 5 * 60000); // 5 minutes ago
      expect(formatRelativeTime(minutes)).toBe('5m ago');
    });

    it('should return hours ago', () => {
      const hours = new Date(now.getTime() - 3 * 3600000); // 3 hours ago
      expect(formatRelativeTime(hours)).toBe('3h ago');
    });

    it('should return days ago', () => {
      const days = new Date(now.getTime() - 2 * 86400000); // 2 days ago
      expect(formatRelativeTime(days)).toBe('2d ago');
    });
  });
});
