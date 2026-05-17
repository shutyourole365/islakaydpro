// Returns the canonical public origin to use when constructing
// **shareable, externally-reachable** URLs (invite links, referral
// codes, public deep-links).
//
// Why this exists: `window.location.origin` is the right thing in a
// browser tab but resolves to `capacitor://localhost` (or similar)
// inside Capacitor mobile builds — share links built from it would
// be unopenable outside the app on the recipient's device.
//
// Set `VITE_APP_URL` to the canonical public origin (e.g.
// `https://islakayd.com`) in any build that ships to a mobile shell.
// Web builds can leave it unset and fall back to `window.location.origin`.
export function getPublicAppUrl(): string {
  const fromEnv = import.meta.env.VITE_APP_URL;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    // Strip a trailing slash so callers can append paths without
    // producing `https://x.com//foo`.
    return fromEnv.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
}
