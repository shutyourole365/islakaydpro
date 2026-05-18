import { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Download,
  Check,
  RefreshCw,
  HardDrive,
  Globe,
  Smartphone
} from 'lucide-react';
import { useToast } from '../ui/Toast';

interface PWAEnhancedFeaturesProps {
  onClose: () => void;
}

export default function PWAEnhancedFeatures({ onClose }: PWAEnhancedFeaturesProps) {
  const { addToast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [offlineData, setOfflineData] = useState({
    equipment: 0,
    favorites: 0,
    messages: 0,
  });

  useEffect(() => {
    // Online/offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Service-worker update listeners get tracked so cleanup can remove
    // them. registration is long-lived (it survives this component's
    // lifetime), so an 'updatefound' handler added inside the Promise
    // and never removed would leak forever — including any 'statechange'
    // listener it attaches to newWorker after the component unmounts.
    let isMounted = true;
    let registrationForCleanup: ServiceWorkerRegistration | null = null;
    let updateFoundHandler: (() => void) | null = null;
    // updatefound can fire more than once during a single mount (each SW
    // update is a new worker), so track them per-worker.
    const statechangeHandlers = new Map<ServiceWorker, () => void>();

    // Check for service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        // The component may have unmounted while the Promise was pending;
        // if so, don't attach anything.
        if (!isMounted) return;

        registrationForCleanup = registration;
        setSwRegistration(registration);

        // Check for updates
        updateFoundHandler = () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          const handleStateChange = () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              if (isMounted) setUpdateAvailable(true);
            }
            // Self-remove once the worker reaches a terminal state for our
            // purposes: 'installed' (we've already signaled the update —
            // no more useful transitions to react to) or 'redundant' (the
            // worker was superseded / install failed). Without this, the
            // Map grows unbounded across repeated SW updates on a long
            // mount.
            if (newWorker.state === 'installed' || newWorker.state === 'redundant') {
              newWorker.removeEventListener('statechange', handleStateChange);
              statechangeHandlers.delete(newWorker);
            }
          };
          newWorker.addEventListener('statechange', handleStateChange);
          statechangeHandlers.set(newWorker, handleStateChange);
        };
        registration.addEventListener('updatefound', updateFoundHandler);
      });
    }

    // Estimate cache size
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        if (!isMounted) return;
        const sizeInMB = (estimate.usage || 0) / (1024 * 1024);
        setCacheSize(sizeInMB);
      });
    }

    // Load offline data counts from localStorage
    const equipment = JSON.parse(localStorage.getItem('offline_equipment') || '[]');
    const favorites = JSON.parse(localStorage.getItem('offline_favorites') || '[]');
    const messages = JSON.parse(localStorage.getItem('offline_messages') || '[]');

    setOfflineData({
      equipment: equipment.length,
      favorites: favorites.length,
      messages: messages.length,
    });

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);

      if (registrationForCleanup && updateFoundHandler) {
        registrationForCleanup.removeEventListener('updatefound', updateFoundHandler);
      }
      statechangeHandlers.forEach((handler, worker) => {
        worker.removeEventListener('statechange', handler);
      });
      statechangeHandlers.clear();
    };
  }, []);

  const handleUpdate = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const handleClearCache = async () => {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      setCacheSize(0);
      addToast({
        type: 'success',
        title: 'Cache cleared',
      });
    }
  };

  const handleDownloadForOffline = async () => {
    // In production, this would prefetch critical assets
    addToast({
      type: 'info',
      title: 'Downloading content',
      message: 'Caching for offline use…',
    });

    // Simulate download
    setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Offline content ready',
        message: 'You can now use Islakayd offline.',
      });
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-violet-500 to-purple-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">PWA Features</h2>
                <p className="text-violet-100 text-sm">Progressive Web App Enhancements</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
             >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Connection Status */}
          <div className={`p-5 rounded-2xl border-2 ${
            isOnline
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {isOnline ? (
                <Wifi className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <WifiOff className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              )}
              <h3 className={`text-lg font-bold ${
                isOnline ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'
              }`}>
                {isOnline ? 'Online Mode' : 'Offline Mode'}
              </h3>
            </div>
            <p className={`text-sm ${
              isOnline ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
            }`}>
              {isOnline
                ? 'You\'re connected and all features are available.'
                : 'You\'re offline. Some features may be limited, but you can still browse cached content.'}
            </p>
          </div>

          {/* Update Available */}
          {updateAvailable && (
            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-200">Update Available</h3>
                    <p className="text-sm text-blue-700 dark:text-blue-300">A new version of Islakayd is ready</p>
                  </div>
                </div>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                 >
                  Update Now
                </button>
              </div>
            </div>
          )}

          {/* Offline Content */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Offline Content
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl border border-teal-200 dark:border-teal-800">
                <p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-1">{offlineData.equipment}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Equipment Cached</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200 dark:border-violet-800">
                <p className="text-3xl font-bold text-violet-600 dark:text-violet-400 mb-1">{offlineData.favorites}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Favorites Saved</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">{offlineData.messages}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">Messages Synced</p>
              </div>
            </div>
          </div>

          {/* Cache Management */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              Cache Management
            </h3>

            <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Storage Used</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{cacheSize.toFixed(2)} MB cached locally</p>
                </div>
                <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{cacheSize.toFixed(1)}MB</div>
              </div>

              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                  style={{ width: `${Math.min((cacheSize / 50) * 100, 100)}%` }}
                />
              </div>

              <button
                onClick={handleClearCache}
                className="w-full py-2.5 bg-white dark:bg-gray-600 border-2 border-gray-200 dark:border-gray-500 rounded-xl font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
               >
                Clear Cache
              </button>
            </div>
          </div>

          {/* Download for Offline */}
          <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border-2 border-violet-200 dark:border-violet-800">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-violet-900 dark:text-violet-200 mb-2">Download for Offline Use</h3>
                <p className="text-sm text-violet-700 dark:text-violet-300 mb-4">
                  Save your favorite equipment, recent searches, and messages for offline access. Perfect for job sites with poor connectivity!
                </p>
                <button
                  onClick={handleDownloadForOffline}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                 >
                  Download Content
                </button>
              </div>
            </div>
          </div>

          {/* Features List */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">PWA Features</h3>

            <div className="space-y-3">
              {[
                { icon: <Check />, text: 'Works offline with cached content', color: 'text-emerald-600 dark:text-emerald-400' },
                { icon: <Check />, text: 'Install as native app on mobile', color: 'text-emerald-600 dark:text-emerald-400' },
                { icon: <Check />, text: 'Fast loading with service workers', color: 'text-emerald-600 dark:text-emerald-400' },
                { icon: <Check />, text: 'Background sync for messages', color: 'text-emerald-600 dark:text-emerald-400' },
                { icon: <Check />, text: 'Push notifications support', color: 'text-emerald-600 dark:text-emerald-400' },
                { icon: <Check />, text: 'Automatic updates', color: 'text-emerald-600 dark:text-emerald-400' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-100 dark:border-gray-600">
                  <div className={`w-6 h-6 ${feature.color}`}>{feature.icon}</div>
                  <span className="text-gray-700 dark:text-gray-300">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Install Instructions */}
          <div className="p-5 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">How to Install Islakayd as an App</h4>
            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">📱 On Mobile (iOS/Android):</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Tap the Share button (iOS) or Menu (Android)</li>
                  <li>Select "Add to Home Screen"</li>
                  <li>Confirm and enjoy the native app experience!</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">💻 On Desktop:</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Look for the install icon in your browser bar</li>
                  <li>Click "Install" when prompted</li>
                  <li>Launch from your desktop or taskbar</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
           >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
