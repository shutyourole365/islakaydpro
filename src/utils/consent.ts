// Cookie-consent helpers. Read-only at boot time (main.tsx) plus a
// shared CONSENT_STORAGE_KEY constant so the useCookieConsent hook,
// startup gating, and tests don't drift on the localStorage key name.

export const CONSENT_STORAGE_KEY = 'cookie-consent';

export interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const DEFAULT_DECLINED: CookieSettings = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export function readCookieSettings(): CookieSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CookieSettings>;
    return {
      essential: parsed.essential ?? true,
      analytics: parsed.analytics ?? false,
      marketing: parsed.marketing ?? false,
      functional: parsed.functional ?? false,
    };
  } catch {
    return null;
  }
}

// True when the user has explicitly opted in to analytics. Returns false
// for: missing localStorage entry (first visit, banner not yet shown),
// malformed JSON, or analytics=false. Use this to gate any third-party
// analytics SDK load.
export function hasAnalyticsConsent(): boolean {
  const settings = readCookieSettings();
  return settings?.analytics === true;
}

export function writeCookieSettings(settings: CookieSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export { DEFAULT_DECLINED };
