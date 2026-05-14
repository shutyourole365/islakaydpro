import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Regression coverage for the analytics init gate.
//
// Bug: a module-level auto-init at the bottom of src/services/analytics.ts
// fired whenever VITE_GA_MEASUREMENT_ID was set, bypassing the explicit
// VITE_ENABLE_ANALYTICS feature flag. Anyone who set the measurement id
// (e.g. preparing env for a future enable) silently loaded the GA script
// on every page view.
//
// Fix: rely solely on the main.tsx-gated call, which requires
// VITE_ENABLE_ANALYTICS === 'true'.
//
// These tests assert the singleton is in a fresh state on import (no GA
// script tag was injected, initialize() has not been called).

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

describe('analytics module import', () => {
  beforeEach(async () => {
    vi.resetModules();
    clearGaScripts();
  });

  afterEach(() => {
    clearGaScripts();
    vi.unstubAllEnvs();
  });

  it('does NOT inject the GA script just because VITE_GA_MEASUREMENT_ID is set', async () => {
    // Set only the measurement id; do NOT enable analytics.
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TESTONLY');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');

    await import('../services/analytics');

    expect(getInjectedGaScript()).toBeNull();
  });

  it('does NOT inject the GA script when both vars are absent', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', '');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', '');

    await import('../services/analytics');

    expect(getInjectedGaScript()).toBeNull();
  });

  it('initialize() is the only path that loads GA — explicit call still works', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-EXPLICIT');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');

    const mod = await import('../services/analytics');
    // No auto-init at module load:
    expect(getInjectedGaScript()).toBeNull();

    // Explicit init (mirrors main.tsx behavior) does inject the script:
    mod.analytics.initialize();
    const script = getInjectedGaScript();
    expect(script).not.toBeNull();
    expect(script?.src).toContain('id=G-EXPLICIT');
  });

  it('initialize() is idempotent — calling twice does not inject duplicate scripts', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-DEDUPE');
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');

    const mod = await import('../services/analytics');
    mod.analytics.initialize();
    mod.analytics.initialize();

    const scripts = document.head.querySelectorAll(
      'script[src*="googletagmanager.com/gtag/js"]'
    );
    expect(scripts.length).toBe(1);
  });
});
