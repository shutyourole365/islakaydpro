import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Regression coverage for the analytics consent gate (prod-readiness #1).
// Asserts that analytics.initialize() fires (and ONLY fires) when the
// user has granted consent — declining, first-mount-no-consent, and the
// VITE_ENABLE_ANALYTICS=off case are all no-ops.
//
// Important: the hook dynamic-imports `../services/analytics`. vi.mock
// intercepts dynamic imports too, so the mocked module below is what
// runs. We then waitFor() to let the import promise resolve.

const { initializeMock } = vi.hoisted(() => ({
  initializeMock: vi.fn(),
}));

vi.mock('../services/analytics', () => ({
  analytics: {
    initialize: initializeMock,
    pageView: vi.fn(),
    event: vi.fn(),
    setUserId: vi.fn(),
  },
}));

import { useCookieConsent } from '../hooks/useCookieConsent';
import { CONSENT_STORAGE_KEY } from '../utils/consent';

describe('useCookieConsent → analytics gate (env enabled)', () => {
  beforeEach(() => {
    initializeMock.mockClear();
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');
  });

  it('does not call analytics.initialize on first mount (no stored consent)', () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.showBanner).toBe(true);
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('declineAll persists settings without calling analytics.initialize', async () => {
    const { result } = renderHook(() => useCookieConsent());
    await act(async () => result.current.declineAll());
    // Give the (would-be) async import a microtask to settle.
    await Promise.resolve();
    expect(initializeMock).not.toHaveBeenCalled();
    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}');
    expect(stored.analytics).toBe(false);
  });

  it('acceptAll calls analytics.initialize exactly once', async () => {
    const { result } = renderHook(() => useCookieConsent());
    await act(async () => result.current.acceptAll());
    await waitFor(() => expect(initializeMock).toHaveBeenCalledTimes(1));
    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}');
    expect(stored.analytics).toBe(true);
  });

  it('saveSettings with analytics=true triggers analytics.initialize', async () => {
    const { result } = renderHook(() => useCookieConsent());
    await act(async () => {
      result.current.setSettings({
        essential: true,
        analytics: true,
        marketing: false,
        functional: false,
      });
    });
    await act(async () => result.current.saveSettings());
    await waitFor(() => expect(initializeMock).toHaveBeenCalledTimes(1));
  });

  it('saveSettings with analytics=false does NOT trigger analytics.initialize', async () => {
    const { result } = renderHook(() => useCookieConsent());
    await act(async () => {
      result.current.setSettings({
        essential: true,
        analytics: false,
        marketing: true,
        functional: true,
      });
    });
    await act(async () => result.current.saveSettings());
    await Promise.resolve();
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('remount with previously-accepted consent re-fires analytics.initialize', async () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ essential: true, analytics: true, marketing: false, functional: false })
    );
    renderHook(() => useCookieConsent());
    await waitFor(() => expect(initializeMock).toHaveBeenCalled());
  });

  it('remount with previously-declined consent does NOT fire analytics.initialize', async () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ essential: true, analytics: false, marketing: false, functional: false })
    );
    renderHook(() => useCookieConsent());
    await Promise.resolve();
    expect(initializeMock).not.toHaveBeenCalled();
  });
});

describe('useCookieConsent → analytics gate (env disabled)', () => {
  beforeEach(() => {
    initializeMock.mockClear();
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
    vi.stubEnv('VITE_ENABLE_ANALYTICS', 'false');
  });

  it('acceptAll is a no-op when VITE_ENABLE_ANALYTICS is off', async () => {
    const { result } = renderHook(() => useCookieConsent());
    await act(async () => result.current.acceptAll());
    await Promise.resolve();
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('remount with accepted consent is a no-op when VITE_ENABLE_ANALYTICS is off', async () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ essential: true, analytics: true, marketing: false, functional: false })
    );
    renderHook(() => useCookieConsent());
    await Promise.resolve();
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('saveSettings with analytics=true is a no-op when VITE_ENABLE_ANALYTICS is off', async () => {
    const { result } = renderHook(() => useCookieConsent());
    await act(async () => {
      result.current.setSettings({
        essential: true,
        analytics: true,
        marketing: false,
        functional: false,
      });
    });
    await act(async () => result.current.saveSettings());
    await Promise.resolve();
    expect(initializeMock).not.toHaveBeenCalled();
  });
});
