import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CONSENT_STORAGE_KEY } from '../utils/consent';

// Highest-risk GDPR regression: prove that importing the analytics module
// does NOT, on its own, append a googletagmanager.com/gtag/js script to
// the document. We deliberately do NOT vi.mock('../services/analytics')
// here so the real module evaluates and we observe its true side effects.

function getInjectedGaScript(): HTMLScriptElement | null {
  return document.head.querySelector<HTMLScriptElement>(
    'script[src*="googletagmanager.com/gtag/js"]'
  );
}

function clearGaScripts() {
  document.head
    .querySelectorAll('script[src*="googletagmanager.com/gtag/js"]')
    .forEach((node) => node.remove());
}

describe('analytics module: import-time side effect guarantee', () => {
  beforeEach(() => {
    vi.resetModules();
    clearGaScripts();
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  });

  afterEach(() => {
    clearGaScripts();
    vi.unstubAllEnvs();
  });

  it('does NOT inject GA when imported without consent (measurement id absent)', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', '');
    await import('../services/analytics');
    expect(getInjectedGaScript()).toBeNull();
  });

  it('does NOT inject GA when imported without consent (measurement id present but flag off)', async () => {
    // This is the GDPR regression case: a deployment with the GA ID set
    // in env but no consent yet must NOT load the SDK from a bare import.
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-CONSENTGUARD');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');
    await import('../services/analytics');
    expect(getInjectedGaScript()).toBeNull();
  });

  it('only initialize() (called from the consent path) injects the GA script', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-VIACONSENT');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
    const mod = await import('../services/analytics');
    // Pre-init: no script yet.
    expect(getInjectedGaScript()).toBeNull();
    mod.analytics.initialize();
    expect(getInjectedGaScript()).not.toBeNull();
  });
});
