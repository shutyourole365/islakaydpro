import { useState, useEffect } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

// Extend ServiceWorkerRegistration to include pushManager
interface ServiceWorkerRegistrationWithPush extends ServiceWorkerRegistration {
  pushManager: PushManager;
}

interface PushNotificationsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PushNotifications({ isOpen, onClose }: PushNotificationsProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await (registration as ServiceWorkerRegistrationWithPush).pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (subscribeError) {
        console.error('Error checking subscription status:', subscribeError);
      }
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      error('This browser does not support notifications');
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        success('Notification permission granted!');
        await subscribeToNotifications();
      } else {
        error('Notification permission denied');
      }
    } catch (permissionError) {
      console.error('Error requesting permission:', permissionError);
      error('Failed to request notification permission');
    }
  };

  const subscribeToNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      error('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      // You'll need to replace this with your actual VAPID public key
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY_HERE';

      const subscription = await (registration as ServiceWorkerRegistrationWithPush).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to your server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription,
          userId: 'current-user-id' // Replace with actual user ID
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        success('Successfully subscribed to push notifications!');
      } else {
        throw new Error('Failed to subscribe');
      }
    } catch (subscribeError) {
      console.error('Error subscribing to notifications:', subscribeError);
      error('Failed to subscribe to push notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as ServiceWorkerRegistrationWithPush).pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();

        // Notify server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            userId: 'current-user-id' // Replace with actual user ID
          })
        });

        setIsSubscribed(false);
        success('Unsubscribed from push notifications');
      }
    } catch (unsubscribeError) {
      console.error('Error unsubscribing:', unsubscribeError);
      error('Failed to unsubscribe');
    } finally {
      setIsLoading(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-6 w-6 text-teal-600" />
            <h2 className="text-xl font-semibold text-gray-900">Push Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-sm text-gray-600">
            Stay updated with booking confirmations, new equipment in your area, and important updates.
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Browser Permission</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                permission === 'granted' ? 'bg-green-100 text-green-800' :
                permission === 'denied' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {permission === 'granted' ? 'Granted' :
                 permission === 'denied' ? 'Denied' :
                 'Not Asked'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Push Subscription</span>
              <span className={`px-2 py-1 text-xs rounded-full ${
                isSubscribed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isSubscribed ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {permission === 'default' && (
              <Button
                onClick={requestPermission}
                className="w-full"
                disabled={isLoading}
              >
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            )}

            {permission === 'granted' && !isSubscribed && (
              <Button
                onClick={subscribeToNotifications}
                className="w-full"
                disabled={isLoading}
              >
                <Bell className="h-4 w-4 mr-2" />
                Subscribe to Push Notifications
              </Button>
            )}

            {isSubscribed && (
              <Button
                onClick={unsubscribeFromNotifications}
                variant="outline"
                className="w-full"
                disabled={isLoading}
              >
                <BellOff className="h-4 w-4 mr-2" />
                Unsubscribe
              </Button>
            )}

            {permission === 'denied' && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                Notifications are blocked. Please enable them in your browser settings.
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>• Get notified about booking updates</p>
            <p>• New equipment in your search area</p>
            <p>• Messages from equipment owners</p>
            <p>• Special offers and promotions</p>
          </div>
        </div>
      </div>
    </div>
  );
}