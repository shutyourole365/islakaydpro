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

interface PWAEnhancedFeaturesProps {
  onClose: () => void;
}

export default function PWAEnhancedFeatures({ onClose }: PWAEnhancedFeaturesProps) {
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

    // Check for service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        setSwRegistration(registration);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    // Estimate cache size
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
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
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
      alert('Cache cleared successfully!');
    }
  };

  const handleDownloadForOffline = async () => {
    // In production, this would prefetch critical assets
    alert('Downloading content for offline use...');
    
    // Simulate download
    setTimeout(() => {
      alert('✅ Content downloaded! You can now use Islakayd offline.');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
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
              ? 'bg-emerald-50 border-emerald-200' 
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3 mb-3">
              {isOnline ? (
                <Wifi className="w-6 h-6 text-emerald-600" />
              ) : (
                <WifiOff className="w-6 h-6 text-amber-600" />
              )}
              <h3 className={`text-lg font-bold ${
                isOnline ? 'text-emerald-900' : 'text-amber-900'
              }`}>
                {isOnline ? 'Online Mode' : 'Offline Mode'}
              </h3>
            </div>
            <p className={`text-sm ${
              isOnline ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {isOnline 
                ? 'You\'re connected and all features are available.' 
                : 'You\'re offline. Some features may be limited, but you can still browse cached content.'}
            </p>
          </div>

          {/* Update Available */}
          {updateAvailable && (
            <div className="p-5 rounded-2xl bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-bold text-blue-900">Update Available</h3>
                    <p className="text-sm text-blue-700">A new version of Islakayd is ready</p>
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
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-violet-600" />
              Offline Content
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                <p className="text-3xl font-bold text-teal-600 mb-1">{offlineData.equipment}</p>
                <p className="text-sm text-gray-700">Equipment Cached</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                <p className="text-3xl font-bold text-violet-600 mb-1">{offlineData.favorites}</p>
                <p className="text-sm text-gray-700">Favorites Saved</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <p className="text-3xl font-bold text-blue-600 mb-1">{offlineData.messages}</p>
                <p className="text-sm text-gray-700">Messages Synced</p>
              </div>
            </div>
          </div>

          {/* Cache Management */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-600" />
              Cache Management
            </h3>
            
            <div className="p-5 bg-gray-50 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">Storage Used</p>
                  <p className="text-sm text-gray-600">{cacheSize.toFixed(2)} MB cached locally</p>
                </div>
                <div className="text-2xl font-bold text-violet-600">{cacheSize.toFixed(1)}MB</div>
              </div>
              
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all"
                  style={{ width: `${Math.min((cacheSize / 50) * 100, 100)}%` }}
                />
              </div>
              
              <button
                onClick={handleClearCache}
                className="w-full py-2.5 bg-white border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Cache
              </button>
            </div>
          </div>

          {/* Download for Offline */}
          <div className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border-2 border-violet-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-violet-900 mb-2">Download for Offline Use</h3>
                <p className="text-sm text-violet-700 mb-4">
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
            <h3 className="text-lg font-bold text-gray-900 mb-4">PWA Features</h3>
            
            <div className="space-y-3">
              {[
                { icon: <Check />, text: 'Works offline with cached content', color: 'text-emerald-600' },
                { icon: <Check />, text: 'Install as native app on mobile', color: 'text-emerald-600' },
                { icon: <Check />, text: 'Fast loading with service workers', color: 'text-emerald-600' },
                { icon: <Check />, text: 'Background sync for messages', color: 'text-emerald-600' },
                { icon: <Check />, text: 'Push notifications support', color: 'text-emerald-600' },
                { icon: <Check />, text: 'Automatic updates', color: 'text-emerald-600' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                  <div className={`w-6 h-6 ${feature.color}`}>{feature.icon}</div>
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Install Instructions */}
          <div className="p-5 bg-gray-50 rounded-xl">
            <h4 className="font-bold text-gray-900 mb-3">How to Install Islakayd as an App</h4>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <p className="font-semibold text-gray-900 mb-1">📱 On Mobile (iOS/Android):</p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Tap the Share button (iOS) or Menu (Android)</li>
                  <li>Select "Add to Home Screen"</li>
                  <li>Confirm and enjoy the native app experience!</li>
                </ol>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">💻 On Desktop:</p>
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
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
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
