import { describe, it, expect } from 'vitest';
import { 
  validateEmail, 
  validatePassword, 
  validatePhoneNumber,
  validatePrice,
  validateTextInput,
  validateDateRange,
  sanitizeInput
} from '../utils/validation';

describe('Validation Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('javascript:void(0)')).toBe('void(0)');
      expect(sanitizeInput('onclick=alert(1)')).toBe('alert(1)');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });
  });

  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toEqual({ valid: true });
      expect(validateEmail('user+tag@domain.co.uk')).toEqual({ valid: true });
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toHaveProperty('error');
      expect(validateEmail('test@')).toHaveProperty('error');
      expect(validateEmail('@example.com')).toHaveProperty('error');
      expect(validateEmail('')).toHaveProperty('error');
    });

    it('should reject overly long emails', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toHaveProperty('error');
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const result = validatePassword('MyP@ssw0rd123');
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('strong');
    });

    it('should identify medium strength passwords', () => {
      const result = validatePassword('Password123');
      expect(result.valid).toBe(true);
      expect(result.strength).toBe('medium');
    });

    it('should reject short passwords', () => {
      const result = validatePassword('Short1');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty passwords', () => {
      const result = validatePassword('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Password is required');
    });
  });

  describe('validatePhoneNumber', () => {
    it('should validate US phone numbers', () => {
      expect(validatePhoneNumber('+1234567890')).toEqual({ valid: true });
      expect(validatePhoneNumber('234-567-8901')).toEqual({ valid: true });
    });

    it('should allow empty phone numbers (optional field)', () => {
      expect(validatePhoneNumber('')).toEqual({ valid: true });
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toHaveProperty('error');
      expect(validatePhoneNumber('abc')).toHaveProperty('error');
    });
  });

  describe('validatePrice', () => {
    it('should validate valid prices', () => {
      expect(validatePrice(100)).toEqual({ valid: true, value: 100 });
      expect(validatePrice('50.50')).toEqual({ valid: true, value: 50.50 });
      expect(validatePrice(0)).toEqual({ valid: true, value: 0 });
    });

    it('should reject negative prices', () => {
      expect(validatePrice(-10)).toHaveProperty('error');
    });

    it('should reject non-numeric prices', () => {
      expect(validatePrice('abc')).toHaveProperty('error');
    });

    it('should reject excessively high prices', () => {
      expect(validatePrice(2000000)).toHaveProperty('error');
    });
  });

  describe('validateTextInput', () => {
    it('should validate required fields', () => {
      const result = validateTextInput('', { required: true, fieldName: 'Name' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should validate minimum length', () => {
      const result = validateTextInput('ab', { minLength: 3, fieldName: 'Name' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 3 characters');
    });

    it('should validate maximum length', () => {
      const longText = 'a'.repeat(1001);
      const result = validateTextInput(longText, { maxLength: 1000, fieldName: 'Name' });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('less than 1000 characters');
    });

    it('should allow valid text', () => {
      const result = validateTextInput('Valid input', { required: true });
      expect(result.valid).toBe(true);
      expect(result.value).toBe('Valid input');
    });
  });

  describe('validateDateRange', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    it('should validate valid date ranges', () => {
      const result = validateDateRange(tomorrow, nextWeek);
      expect(result.valid).toBe(true);
      expect(result.days).toBe(7);
    });

    it('should reject past dates', () => {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const result = validateDateRange(yesterday, tomorrow);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('past');
    });

    it('should reject end date before start date', () => {
      const result = validateDateRange(nextWeek, tomorrow);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('after start date');
    });

    it('should enforce minimum days', () => {
      const result = validateDateRange(tomorrow, tomorrow, { minDays: 2 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Minimum rental period');
    });

    it('should enforce maximum days', () => {
      const farFuture = new Date(today);
      farFuture.setDate(farFuture.getDate() + 400);
      const result = validateDateRange(tomorrow, farFuture, { maxDays: 365 });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum rental period');
    });
  });
});
