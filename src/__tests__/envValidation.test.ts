import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateEnvironment,
  isFeatureEnabled,
  getEnvironmentName,
  getEnvironmentInfo,
  logValidationResults,
} from '../utils/envValidation';

const VALID_ANON_KEY = 'a'.repeat(120);

// Keys this suite stubs — only these are reset in afterEach, so global
// baseline stubs from src/__tests__/setup.ts survive (matters under
// vitest singleFork pool where modules persist across files).
const STUBBED_KEYS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_STRIPE_PUBLIC_KEY',
  'VITE_ENABLE_ANALYTICS',
  'VITE_GA_MEASUREMENT_ID',
  'VITE_SENTRY_DSN',
] as const;

function snapshotEnv(): Record<string, string | undefined> {
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  const snap: Record<string, string | undefined> = {};
  for (const key of STUBBED_KEYS) snap[key] = env[key];
  return snap;
}

function restoreEnv(snap: Record<string, string | undefined>) {
  for (const key of STUBBED_KEYS) {
    const v = snap[key];
    vi.stubEnv(key, v ?? '');
  }
}

describe('envValidation', () => {
  let baseline: Record<string, string | undefined>;

  beforeEach(() => {
    baseline = snapshotEnv();
  });

  afterEach(() => {
    restoreEnv(baseline);
  });

  describe('validateEnvironment', () => {
    it('returns errors when required vars are missing', () => {
      vi.stubEnv('VITE_SUPABASE_URL', '');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('VITE_SUPABASE_URL'),
          expect.stringContaining('VITE_SUPABASE_ANON_KEY'),
        ])
      );
    });

    it('flags placeholder values as errors', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://your-project.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'paste-your-key-here'.padEnd(120, 'a'));

      const result = validateEnvironment();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('placeholder'))).toBe(true);
    });

    it('rejects an invalid VITE_SUPABASE_URL', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'not-a-url');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_ANON_KEY);

      const result = validateEnvironment();

      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('not a valid URL')])
      );
    });

    it('rejects a too-short VITE_SUPABASE_ANON_KEY', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'short');

      const result = validateEnvironment();

      expect(result.errors).toEqual(
        expect.arrayContaining([expect.stringContaining('VITE_SUPABASE_ANON_KEY appears invalid')])
      );
    });

    it('warns when VITE_STRIPE_PUBLIC_KEY is missing', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_ANON_KEY);
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', '');

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('VITE_STRIPE_PUBLIC_KEY')])
      );
    });

    it('warns when analytics is enabled without a measurement id', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_ANON_KEY);
      vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');

      const result = validateEnvironment();

      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('VITE_GA_MEASUREMENT_ID')])
      );
    });

    it('warns when Stripe key has the wrong prefix', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_ANON_KEY);
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'sk_test_wrongprefix');

      const result = validateEnvironment();

      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('should start with pk_')])
      );
    });

    it('warns when GA measurement id is malformed', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_ANON_KEY);
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'UA-12345');

      const result = validateEnvironment();

      expect(result.warnings).toEqual(
        expect.arrayContaining([expect.stringContaining('format may be incorrect')])
      );
    });

    it('passes cleanly with a fully valid environment', () => {
      vi.stubEnv('VITE_SUPABASE_URL', 'https://abc.supabase.co');
      vi.stubEnv('VITE_SUPABASE_ANON_KEY', VALID_ANON_KEY);
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_validkey');
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-ABCD1234XY');
      vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');

      const result = validateEnvironment();

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('isFeatureEnabled', () => {
    it('returns true for analytics only when both flag and id are set', () => {
      vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-ABCD1234XY');
      expect(isFeatureEnabled('analytics')).toBe(true);

      vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
      expect(isFeatureEnabled('analytics')).toBe(false);

      vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-ABCD1234XY');
      vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');
      expect(isFeatureEnabled('analytics')).toBe(false);
    });

    it('returns true for payments when the Stripe key is set', () => {
      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_xyz');
      expect(isFeatureEnabled('payments')).toBe(true);

      vi.stubEnv('VITE_STRIPE_PUBLIC_KEY', '');
      expect(isFeatureEnabled('payments')).toBe(false);
    });

    it('returns true for sentry only when DSN is set', () => {
      vi.stubEnv('VITE_SENTRY_DSN', 'https://abc@sentry.io/1');
      expect(isFeatureEnabled('sentry')).toBe(true);

      vi.stubEnv('VITE_SENTRY_DSN', '');
      expect(isFeatureEnabled('sentry')).toBe(false);
    });
  });

  describe('getEnvironmentName', () => {
    it('returns "test" in vitest', () => {
      // Vitest sets MODE=test by default; this asserts the helper agrees.
      expect(getEnvironmentName()).toBe('test');
    });
  });

  describe('getEnvironmentInfo', () => {
    it('returns an object with mode, environment, features, and timestamp', () => {
      const info = getEnvironmentInfo();
      expect(info).toHaveProperty('mode');
      expect(info).toHaveProperty('environment');
      expect(info).toHaveProperty('features');
      expect(info).toHaveProperty('timestamp');
      expect(typeof (info.timestamp as string)).toBe('string');
      expect(info.features).toEqual(expect.objectContaining({
        analytics: expect.any(Boolean),
        payments: expect.any(Boolean),
        errorTracking: expect.any(Boolean),
      }));
    });
  });

  describe('logValidationResults', () => {
    it('does not throw for a valid result', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      expect(() =>
        logValidationResults({ isValid: true, errors: [], warnings: [] })
      ).not.toThrow();
      expect(logSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
      warnSpy.mockRestore();
      logSpy.mockRestore();
    });

    it('logs errors when result is invalid', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      logValidationResults({
        isValid: false,
        errors: ['missing X', 'invalid Y'],
        warnings: ['recommend Z'],
      });

      expect(errorSpy).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalled();

      errorSpy.mockRestore();
      warnSpy.mockRestore();
    });
  });
});
