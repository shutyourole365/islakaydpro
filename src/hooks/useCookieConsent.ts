import { useState, useEffect } from 'react';
import {
  type CookieSettings,
  DEFAULT_DECLINED,
  readCookieSettings,
  writeCookieSettings,
} from '../utils/consent';

// Lazily load the GA SDK when the user actively grants consent. Crucially,
// the analytics module is dynamic-imported instead of statically imported,
// so an end user who hasn't consented (or hasn't been shown the banner
// yet) doesn't cause the analytics module's side effects to run at
// hook-load time. The build-time VITE_ENABLE_ANALYTICS flag is read at
// call time so test stubs apply.
async function maybeStartAnalytics(next: CookieSettings): Promise<void> {
  if (import.meta.env.VITE_ENABLE_ANALYTICS !== 'true') return;
  if (!next.analytics) return;
  const { analytics } = await import('../services/analytics');
  analytics.initialize();
}

export function useCookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>(DEFAULT_DECLINED);

  useEffect(() => {
    const stored = readCookieSettings();
    if (!stored) {
      setShowBanner(true);
      return;
    }
    setSettings(stored);
    // If consent was granted on a previous visit and the boot-time gate
    // SKIPPED analytics, make sure it starts now. analytics.initialize()
    // is idempotent.
    void maybeStartAnalytics(stored);
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
    void maybeStartAnalytics(allSettings);
  };

  const declineAll = () => {
    setSettings(DEFAULT_DECLINED);
    writeCookieSettings(DEFAULT_DECLINED);
    setShowBanner(false);
    // No analytics start on decline.
  };

  const saveSettings = () => {
    writeCookieSettings(settings);
    setShowBanner(false);
    setShowSettings(false);
    void maybeStartAnalytics(settings);
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
  };
}
