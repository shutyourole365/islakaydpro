import { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const VAPID_PUBLIC_KEY = 'BBjkO4vNGNtrQk0vucOPsrYVNGR9-lf1EY4NoYQDjwKooETldDqoeUEPFRLLm9sunv_Nm7G5f2xQ4b95TaMyCkA';

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

interface PushNotificationManagerProps {
  className?: string;
  compact?: boolean;
}

export default function PushNotificationManager({ className = '', compact = false }: PushNotificationManagerProps) {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = useCallback(async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch {
      // ignore
    }
  }, []);

  const subscribe = async () => {
    if (!user) return;
    setIsLoading(true);
    setStatus('idle');

    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setStatus('error');
        return;
      }

      // Register service worker if needed
      let reg = await navigator.serviceWorker.ready;
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await reg.update();
      }

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = sub.toJSON();

      // Save subscription to Supabase via edge function
      const { error } = await supabase.functions.invoke('push-notification', {
        body: {
          action: 'subscribe',
          userId: user.id,
          subscription: {
            endpoint: subJson.endpoint,
            keys: subJson.keys,
          },
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        },
      });

      if (error) throw error;

      setIsSubscribed(true);
      setStatus('success');
    } catch (err) {
      console.error('Push subscribe error:', err);
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.functions.invoke('push-notification', {
          body: { action: 'unsubscribe', endpoint: sub.endpoint },
        });
        await sub.unsubscribe();
      }
      setIsSubscribed(false);
      setStatus('idle');
    } catch (err) {
      console.error('Push unsubscribe error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null; // Don't show if browser doesn't support it
  }

  if (compact) {
    return (
      <button
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading || permission === 'denied'}
        title={
          permission === 'denied'
            ? 'Notifications blocked in browser settings'
            : isSubscribed
            ? 'Disable push notifications'
            : 'Enable push notifications'
        }
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
          isSubscribed
            ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400'
            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
        } disabled:opacity-50 ${className}`}
      >
        {isLoading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        {isSubscribed ? 'Notifications on' : 'Enable notifications'}
      </button>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 ${className}`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          isSubscribed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          {isSubscribed ? (
            <Bell className="w-6 h-6 text-green-600" />
          ) : (
            <BellOff className="w-6 h-6 text-gray-400" />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">Push Notifications</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isSubscribed
              ? "You'll get notified for bookings, messages, and more."
              : 'Stay on top of booking requests, messages, and updates.'}
          </p>

          {permission === 'denied' && (
            <p className="text-xs text-red-600 mt-2">
              Notifications are blocked. Enable them in your browser settings to continue.
            </p>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-1 text-green-600 text-xs mt-2">
              <CheckCircle className="w-3.5 h-3.5" />
              Successfully enabled!
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-1 text-red-600 text-xs mt-2">
              <XCircle className="w-3.5 h-3.5" />
              {permission === 'denied' ? 'Permission denied.' : 'Something went wrong. Please try again.'}
            </div>
          )}
        </div>

        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading || permission === 'denied'}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
            isSubscribed
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : isSubscribed ? (
            'Turn off'
          ) : (
            'Enable'
          )}
        </button>
      </div>
    </div>
  );
}

