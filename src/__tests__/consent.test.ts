import { describe, it, expect, beforeEach } from 'vitest';
import {
  CONSENT_STORAGE_KEY,
  hasAnalyticsConsent,
  readCookieSettings,
  writeCookieSettings,
} from '../utils/consent';

describe('consent helpers', () => {
  beforeEach(() => {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  });

  describe('hasAnalyticsConsent', () => {
    it('returns false on first visit (no stored consent)', () => {
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('returns false when user declined analytics', () => {
      writeCookieSettings({
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      });
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('returns true when user accepted analytics', () => {
      writeCookieSettings({
        essential: true,
        analytics: true,
        marketing: false,
        functional: false,
      });
      expect(hasAnalyticsConsent()).toBe(true);
    });

    it('returns false when stored value is malformed JSON', () => {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, '{not json');
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('defaults missing fields to false / essential=true', () => {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, '{}');
      const settings = readCookieSettings();
      expect(settings).toEqual({
        essential: true,
        analytics: false,
        marketing: false,
        functional: false,
      });
      expect(hasAnalyticsConsent()).toBe(false);
    });
  });

  describe('writeCookieSettings', () => {
    it('round-trips through readCookieSettings', () => {
      const settings = {
        essential: true,
        analytics: true,
        marketing: false,
        functional: true,
      };
      writeCookieSettings(settings);
      expect(readCookieSettings()).toEqual(settings);
    });
  });
});
