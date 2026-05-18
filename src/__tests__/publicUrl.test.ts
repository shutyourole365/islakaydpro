import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPublicAppUrl } from '../utils/publicUrl';

// Regression coverage for cubic finding on PR #79:
// `window.location.origin` in Capacitor builds is `capacitor://localhost`,
// so shareable invite/referral links need a VITE_APP_URL escape hatch.

describe('getPublicAppUrl', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns VITE_APP_URL when set', () => {
    vi.stubEnv('VITE_APP_URL', 'https://islakayd.com');
    expect(getPublicAppUrl()).toBe('https://islakayd.com');
  });

  it('strips a trailing slash so callers can append paths cleanly', () => {
    vi.stubEnv('VITE_APP_URL', 'https://islakayd.com/');
    expect(getPublicAppUrl()).toBe('https://islakayd.com');
  });

  it('falls back to window.location.origin when VITE_APP_URL is unset', () => {
    vi.stubEnv('VITE_APP_URL', '');
    // jsdom default
    expect(getPublicAppUrl()).toBe('http://localhost:3000');
  });

  it('falls back to window.location.origin when VITE_APP_URL is whitespace-empty', () => {
    vi.stubEnv('VITE_APP_URL', '');
    expect(getPublicAppUrl()).toBe('http://localhost:3000');
  });
});
