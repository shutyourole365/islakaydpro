import { useState, useEffect } from 'react';
import { Bell, BellOff, Settings, X } from 'lucide-react';
import { Button } from '../ui/AccessibleComponents';

interface PushNotificationManagerProps {
  className?: string;
}

export default function PushNotificationManager({ className = '' }: PushNotificationManagerProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // Check if already subscribed
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    setIsLoading(true);
    try {
      // Request permission first
      const granted = await requestPermission();
      if (!granted) {
        alert('Notification permission denied. Please enable notifications in your browser settings.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // You'll need to replace this with your actual VAPID public key
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to your server
      await sendSubscriptionToServer(subscription);

      setIsSubscribed(true);
      alert('Successfully subscribed to notifications!');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      alert('Failed to subscribe to notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await removeSubscriptionFromServer(subscription);
        setIsSubscribed(false);
        alert('Successfully unsubscribed from notifications.');
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', error);
      alert('Failed to unsubscribe from notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    // Send subscription to your backend
    const response = await fetch('/api/push-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userId: 'current-user-id' // Replace with actual user ID
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription');
    }
  };

  const removeSubscriptionFromServer = async (subscription: PushSubscription) => {
    // Remove subscription from your backend
    const response = await fetch('/api/push-subscription', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        userId: 'current-user-id' // Replace with actual user ID
      })
    });

    if (!response.ok) {
      throw new Error('Failed to remove subscription');
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const testNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Islakayd!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
      });
    }
  };

  if (!isSupported) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <BellOff className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Notifications Not Supported</h3>
            <p className="text-sm text-yellow-700">
              Push notifications are not supported in your browser.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isSubscribed ? (
              <Bell className="w-6 h-6 text-green-500" />
            ) : (
              <BellOff className="w-6 h-6 text-gray-400" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-600">
                {isSubscribed
                  ? 'You\'re subscribed to notifications'
                  : 'Get notified about bookings, messages, and updates'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isSubscribed && (
              <Button
                variant="outline"
                size="sm"
                onClick={testNotification}
                disabled={permission !== 'granted'}
              >
                Test
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Status: <span className={`font-medium ${
              isSubscribed ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isSubscribed ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <Button
            variant={isSubscribed ? 'outline' : 'primary'}
            size="sm"
            onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
            disabled={isLoading}
            isLoading={isLoading}
          >
            {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
          </Button>
        </div>
      </div>

      {/* Notification Types Settings */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Booking Updates</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">New Messages</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Equipment Available</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                </label>

                <label className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Promotions</span>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                  />
                </label>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  You can change these settings anytime. Notifications will respect your browser's do-not-disturb settings.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Button onClick={() => setShowSettings(false)}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}