import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Regression coverage for the analytics consent gate (prod-readiness #1).
// Asserts that:
//   - declining consent does NOT call analytics.initialize()
//   - accepting analytics consent DOES call analytics.initialize()
//   - re-mounting with previously-accepted consent re-initializes
//   - saveSettings respects the current toggle state

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

// Force ANALYTICS_ENABLED_BY_BUILD = true so the gate's INNER branch runs.
vi.stubEnv('VITE_ENABLE_ANALYTICS', 'true');

import { useCookieConsent } from '../hooks/useCookieConsent';
import { CONSENT_STORAGE_KEY } from '../utils/consent';

describe('useCookieConsent → analytics gate', () => {
  beforeEach(() => {
    initializeMock.mockClear();
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  });

  it('does not call analytics.initialize on first mount (no stored consent)', () => {
    const { result } = renderHook(() => useCookieConsent());
    expect(result.current.showBanner).toBe(true);
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('declineAll persists settings without calling analytics.initialize', () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => result.current.declineAll());
    expect(initializeMock).not.toHaveBeenCalled();
    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}');
    expect(stored.analytics).toBe(false);
  });

  it('acceptAll calls analytics.initialize exactly once', () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => result.current.acceptAll());
    expect(initializeMock).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? '{}');
    expect(stored.analytics).toBe(true);
  });

  it('saveSettings with analytics=true triggers analytics.initialize', () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.setSettings({
        essential: true,
        analytics: true,
        marketing: false,
        functional: false,
      });
    });
    act(() => result.current.saveSettings());
    expect(initializeMock).toHaveBeenCalledTimes(1);
  });

  it('saveSettings with analytics=false does NOT trigger analytics.initialize', () => {
    const { result } = renderHook(() => useCookieConsent());
    act(() => {
      result.current.setSettings({
        essential: true,
        analytics: false,
        marketing: true,
        functional: true,
      });
    });
    act(() => result.current.saveSettings());
    expect(initializeMock).not.toHaveBeenCalled();
  });

  it('remount with previously-accepted consent re-fires analytics.initialize', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ essential: true, analytics: true, marketing: false, functional: false })
    );
    renderHook(() => useCookieConsent());
    expect(initializeMock).toHaveBeenCalled();
  });

  it('remount with previously-declined consent does NOT fire analytics.initialize', () => {
    window.localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({ essential: true, analytics: false, marketing: false, functional: false })
    );
    renderHook(() => useCookieConsent());
    expect(initializeMock).not.toHaveBeenCalled();
  });
});
