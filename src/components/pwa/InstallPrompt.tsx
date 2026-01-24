import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Zap, Bell, Wifi } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return; // Don't show for 7 days after dismissal
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show banner after 30 seconds on page
      setTimeout(() => {
        setShowBanner(true);
      }, 30000);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      } else {
        console.log('PWA installation dismissed');
      }
    } catch (error) {
      console.error('PWA installation error:', error);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  const features = [
    { icon: Zap, title: 'Lightning Fast', description: 'Instant loading, even offline' },
    { icon: Bell, title: 'Push Notifications', description: 'Never miss a booking update' },
    { icon: Wifi, title: 'Works Offline', description: 'Browse equipment anywhere' },
  ];

  if (isInstalled || !deferredPrompt) return null;

  return (
    <>
      {/* Bottom Banner */}
      {showBanner && !showPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg animate-slide-up">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Install Islakayd App</p>
                <p className="text-sm text-white/80">Get the full experience on your device</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrompt(true)}
                className="px-4 py-2 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Install
              </button>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Install Modal */}
      {showPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />
          
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="relative bg-gradient-to-br from-teal-500 to-emerald-500 p-8 text-white text-center">
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-4xl">🔧</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Install Islakayd</h2>
              <p className="text-white/80">Add to your home screen for the best experience</p>
            </div>

            {/* Features */}
            <div className="p-6 space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="p-6 pt-0 space-y-3">
              <button
                onClick={handleInstall}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Install Now
              </button>
              
              <button
                onClick={handleDismiss}
                className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
              >
                Maybe Later
              </button>
            </div>

            {/* Footer note */}
            <div className="px-6 pb-6">
              <p className="text-xs text-center text-gray-400">
                No app store needed • Install directly from your browser
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook to check PWA status
export function usePWAStatus() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    setIsInstalled(window.matchMedia('(display-mode: standalone)').matches);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isInstalled, isOnline };
}

// Offline indicator component
export function OfflineIndicator() {
  const { isOnline } = usePWAStatus();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShow(true);
    } else {
      // Hide after a delay when coming back online
      const timer = setTimeout(() => setShow(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!show) return null;

  return (
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg transition-all duration-300 ${
      isOnline 
        ? 'bg-green-500 text-white' 
        : 'bg-gray-800 text-white'
    }`}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Wifi className={`w-4 h-4 ${!isOnline && 'opacity-50'}`} />
        {isOnline ? 'Back online' : 'You are offline'}
      </div>
    </div>
  );
}
