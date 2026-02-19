import { useState, useEffect } from 'react';
import { Smartphone, Wifi, WifiOff, Download, Bell, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface PWATest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  error?: string;
}

interface PWATestSuiteProps {
  onClose: () => void;
}

export default function PWATestSuite({ onClose }: PWATestSuiteProps) {
  const [tests, setTests] = useState<PWATest[]>([
    {
      id: 'manifest',
      name: 'Manifest File',
      description: 'Check if manifest.json exists and is valid',
      status: 'pending',
    },
    {
      id: 'service-worker',
      name: 'Service Worker',
      description: 'Verify service worker registration',
      status: 'pending',
    },
    {
      id: 'install-prompt',
      name: 'Install Prompt',
      description: 'Test install prompt availability',
      status: 'pending',
    },
    {
      id: 'offline-mode',
      name: 'Offline Mode',
      description: 'Check offline functionality',
      status: 'pending',
    },
    {
      id: 'push-notifications',
      name: 'Push Notifications',
      description: 'Verify notification permission support',
      status: 'pending',
    },
    {
      id: 'cache-strategy',
      name: 'Cache Strategy',
      description: 'Test caching of static assets',
      status: 'pending',
    },
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);

    for (const test of tests) {
      setTests(prev =>
        prev.map(t => (t.id === test.id ? { ...t, status: 'running' } : t))
      );

      await new Promise(resolve => setTimeout(resolve, 800));

      let passed = false;
      let error: string | undefined;

      try {
        switch (test.id) {
          case 'manifest':
            passed = await testManifest();
            break;
          case 'service-worker':
            passed = await testServiceWorker();
            break;
          case 'install-prompt':
            passed = testInstallPrompt();
            break;
          case 'offline-mode':
            passed = testOfflineMode();
            break;
          case 'push-notifications':
            passed = testPushNotifications();
            break;
          case 'cache-strategy':
            passed = await testCacheStrategy();
            break;
        }
      } catch (e) {
        passed = false;
        error = (e as Error).message;
      }

      setTests(prev =>
        prev.map(t =>
          t.id === test.id
            ? { ...t, status: passed ? 'passed' : 'failed', error }
            : t
        )
      );
    }

    setIsRunning(false);
  };

  const testManifest = async (): Promise<boolean> => {
    try {
      const response = await fetch('/manifest.json');
      if (!response.ok) return false;
      const manifest = await response.json();
      return !!(manifest.name && manifest.short_name && manifest.icons);
    } catch {
      return false;
    }
  };

  const testServiceWorker = async (): Promise<boolean> => {
    return 'serviceWorker' in navigator && !!(await navigator.serviceWorker.getRegistration());
  };

  const testInstallPrompt = (): boolean => {
    return 'BeforeInstallPromptEvent' in window || ('standalone' in window.navigator);
  };

  const testOfflineMode = (): boolean => {
    return 'serviceWorker' in navigator && 'caches' in window;
  };

  const testPushNotifications = (): boolean => {
    return 'Notification' in window && 'PushManager' in window;
  };

  const testCacheStrategy = async (): Promise<boolean> => {
    if (!('caches' in window)) return false;
    try {
      const cacheNames = await caches.keys();
      return cacheNames.length > 0;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Auto-run tests on mount
    runTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const passedTests = tests.filter(t => t.status === 'passed').length;
  const failedTests = tests.filter(t => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500">
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white">PWA Test Suite</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-gray-900">{totalTests}</div>
              <div className="text-sm text-gray-600">Total Tests</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {tests.map(test => (
              <div
                key={test.id}
                className={`p-4 rounded-xl border-2 ${
                  test.status === 'passed'
                    ? 'border-green-200 bg-green-50'
                    : test.status === 'failed'
                    ? 'border-red-200 bg-red-50'
                    : test.status === 'running'
                    ? 'border-blue-200 bg-blue-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {test.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {test.status === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
                      {test.status === 'running' && (
                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                      )}
                      <h3 className="font-semibold text-gray-900">{test.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{test.description}</p>
                    {test.error && (
                      <p className="text-sm text-red-600 mt-1">Error: {test.error}</p>
                    )}
                  </div>
                  <div>
                    {test.id === 'manifest' && <Download className="w-6 h-6 text-gray-400" />}
                    {test.id === 'service-worker' && <Wifi className="w-6 h-6 text-gray-400" />}
                    {test.id === 'install-prompt' && <Smartphone className="w-6 h-6 text-gray-400" />}
                    {test.id === 'offline-mode' && <WifiOff className="w-6 h-6 text-gray-400" />}
                    {test.id === 'push-notifications' && <Bell className="w-6 h-6 text-gray-400" />}
                    {test.id === 'cache-strategy' && <RefreshCw className="w-6 h-6 text-gray-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">PWA Capabilities</h3>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>✓ Install app on home screen</li>
              <li>✓ Work offline with cached content</li>
              <li>✓ Receive push notifications</li>
              <li>✓ Fast loading with service worker</li>
              <li>✓ App-like experience on mobile</li>
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Re-run Tests'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
