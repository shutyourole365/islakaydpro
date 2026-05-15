import { useState, useEffect } from 'react';
import { analytics } from '../services/analytics';
import {
  CONSENT_STORAGE_KEY,
  type CookieSettings,
  readCookieSettings,
  writeCookieSettings,
} from '../utils/consent';

// Lazily load the GA SDK when the user actively grants consent — gated on
// the build-time VITE_ENABLE_ANALYTICS flag so previews / E2E runs without
// the flag still skip the network call. Read the env at call time (not at
// module load) so test stubs apply.
function maybeStartAnalytics(next: CookieSettings) {
  if (import.meta.env.VITE_ENABLE_ANALYTICS !== 'true') return;
  if (next.analytics) analytics.initialize();
}

export function useCookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>({
    essential: true,
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    const stored = readCookieSettings();
    if (!stored) {
      setShowBanner(true);
    } else {
      setSettings(stored);
      // If consent was granted on a previous visit and analytics was
      // SKIPPED at boot (e.g. localStorage parse race), make sure it
      // starts now. analytics.initialize() is idempotent.
      maybeStartAnalytics(stored);
    }
  }, []);

  const acceptAll = () => {
    const allSettings: CookieSettings = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setSettings(allSettings);
    writeCookieSettings(allSettings);
    setShowBanner(false);
    maybeStartAnalytics(allSettings);
  };

  const declineAll = () => {
    const minimalSettings: CookieSettings = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setSettings(minimalSettings);
    writeCookieSettings(minimalSettings);
    setShowBanner(false);
    // No analytics start on decline.
  };

  const saveSettings = () => {
    writeCookieSettings(settings);
    setShowBanner(false);
    setShowSettings(false);
    maybeStartAnalytics(settings);
  };

  return {
    showBanner,
    showSettings,
    settings,
    setShowSettings,
    setSettings,
    acceptAll,
    declineAll,
    saveSettings,
    // exported for tests / debugging
    _storageKey: CONSENT_STORAGE_KEY,
  };
}
