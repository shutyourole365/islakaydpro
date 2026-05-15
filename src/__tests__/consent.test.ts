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

    it('does not count string "true" as analytics consent', () => {
      // localStorage is untyped; a stray string must NOT pass through
      // as truthy opt-in. Only an explicit boolean true qualifies.
      window.localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ essential: true, analytics: 'true', marketing: false, functional: false })
      );
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('does not count string "false" as analytics consent', () => {
      window.localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ essential: true, analytics: 'false', marketing: false, functional: false })
      );
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('does not count numeric 1 as analytics consent', () => {
      window.localStorage.setItem(
        CONSENT_STORAGE_KEY,
        JSON.stringify({ essential: true, analytics: 1, marketing: false, functional: false })
      );
      expect(hasAnalyticsConsent()).toBe(false);
    });

    it('returns null when stored value is JSON null', () => {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, 'null');
      expect(readCookieSettings()).toBeNull();
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
