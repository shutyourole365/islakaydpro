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

export const DEFAULT_DECLINED: CookieSettings = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

// Strictly coerce so only an explicit boolean `true` counts as opt-in.
// localStorage is untyped: a stray string like "false" or 0 must NOT
// pass through as truthy consent.
function strictBool(v: unknown, fallback: boolean): boolean {
  if (v === true) return true;
  if (v === false) return false;
  return fallback;
}

export function readCookieSettings(): CookieSettings | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      essential: strictBool(parsed.essential, true),
      analytics: strictBool(parsed.analytics, false),
      marketing: strictBool(parsed.marketing, false),
      functional: strictBool(parsed.functional, false),
    };
  } catch {
    return null;
  }
}

// True when the user has explicitly opted in to analytics. Returns false
// for: missing localStorage entry (first visit, banner not yet shown),
// malformed JSON, malformed field types, or analytics=false. Use this
// to gate any third-party analytics SDK load.
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
