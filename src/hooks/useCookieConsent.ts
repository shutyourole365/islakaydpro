import { useState, useEffect } from 'react';

interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
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
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const parsedSettings = JSON.parse(consent);
      setSettings(parsedSettings);
    }
  }, []);

  const acceptAll = () => {
    const allSettings = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    setSettings(allSettings);
    localStorage.setItem('cookie-consent', JSON.stringify(allSettings));
    setShowBanner(false);
  };

  const declineAll = () => {
    const minimalSettings = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    setSettings(minimalSettings);
    localStorage.setItem('cookie-consent', JSON.stringify(minimalSettings));
    setShowBanner(false);
  };

  const saveSettings = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(settings));
    setShowBanner(false);
    setShowSettings(false);
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