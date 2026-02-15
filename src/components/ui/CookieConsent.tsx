import { X, Cookie } from 'lucide-react';
import { Button } from './AccessibleComponents';

interface CookieConsentProps {
  onAccept: () => void;
  onDecline: () => void;
  onCustomize: () => void;
}

export function CookieConsentBanner({ onAccept, onDecline, onCustomize }: CookieConsentProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          <Cookie className="w-6 h-6 text-teal-500" />
          <span className="font-semibold text-gray-900">Cookie Preferences</span>
        </div>

        <div className="flex-1 text-sm text-gray-600">
          <p>
            We use cookies to enhance your experience, analyze site traffic, and personalize content.
            By continuing to use our site, you agree to our use of cookies.
            <a
              href="/policies/COOKIE_POLICY.md"
              className="text-teal-500 hover:text-teal-600 underline ml-1"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more
            </a>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onCustomize}
            className="whitespace-nowrap"
          >
            Customize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDecline}
            className="whitespace-nowrap"
          >
            Decline
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onAccept}
            className="whitespace-nowrap"
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}

interface CookieSettings {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export function CookieSettingsModal({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: CookieSettings;
  onSettingsChange: (settings: CookieSettings) => void;
  onSave: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Cookie Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Essential Cookies</h3>
            <p className="text-sm text-gray-600 mb-3">
              Required for the website to function properly. Cannot be disabled.
            </p>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.essential}
                disabled
                className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">Always enabled</span>
            </label>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Analytics Cookies</h3>
            <p className="text-sm text-gray-600 mb-3">
              Help us understand how visitors interact with our website.
            </p>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.analytics}
                onChange={(e) => onSettingsChange({ ...settings, analytics: e.target.checked })}
                className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">Google Analytics</span>
            </label>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Functional Cookies</h3>
            <p className="text-sm text-gray-600 mb-3">
              Enable enhanced functionality and personalization.
            </p>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.functional}
                onChange={(e) => onSettingsChange({ ...settings, functional: e.target.checked })}
                className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">Language and location preferences</span>
            </label>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Marketing Cookies</h3>
            <p className="text-sm text-gray-600 mb-3">
              Used to deliver personalized advertisements.
            </p>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.marketing}
                onChange={(e) => onSettingsChange({ ...settings, marketing: e.target.checked })}
                className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm text-gray-700">Targeted advertising</span>
            </label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}