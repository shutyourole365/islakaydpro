import { supabase } from '../lib/supabase';

// Service worker registration and push subscription management

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  url?: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
  requireInteraction?: boolean;
  data?: Record<string, unknown>;
}

// Check if push notifications are supported
export function isPushSupported(): boolean {
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

// Check current notification permission
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('Notifications not supported');
  }

  const permission = await Notification.requestPermission();
  return permission;
}

// Get VAPID public key from server
async function getVapidPublicKey(): Promise<string> {
  const { data, error } = await supabase.functions.invoke('push-notification', {
    body: { action: 'get-vapid-key' },
  });

  if (error) throw error;
  return data.publicKey;
}

// Convert base64 string to Uint8Array (for VAPID key)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Register service worker for push notifications
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('Service worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}

// Subscribe to push notifications
export async function subscribeToPush(userId: string): Promise<boolean> {
  if (!isPushSupported()) {
    console.warn('Push notifications not supported');
    return false;
  }

  try {
    // Request permission first
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return false;
    }

    // Get or register service worker
    let registration = await navigator.serviceWorker.ready;
    
    if (!registration) {
      registration = (await registerServiceWorker())!;
      if (!registration) return false;
    }

    // Get VAPID public key
    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) {
      console.error('VAPID public key not configured');
      return false;
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    // Get device info
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine,
    };

    // Send subscription to server
    const { error } = await supabase.functions.invoke('push-notification', {
      body: {
        action: 'subscribe',
        userId,
        subscription: subscription.toJSON(),
        deviceInfo,
      },
    });

    if (error) throw error;

    console.log('Push subscription registered successfully');
    return true;
  } catch (error) {
    console.error('Push subscription failed:', error);
    return false;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return true;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    // Unsubscribe locally
    await subscription.unsubscribe();

    // Remove from server
    await supabase.functions.invoke('push-notification', {
      body: {
        action: 'unsubscribe',
        endpoint: subscription.endpoint,
      },
    });

    console.log('Push unsubscription successful');
    return true;
  } catch (error) {
    console.error('Push unsubscription failed:', error);
    return false;
  }
}

// Check if currently subscribed to push
export async function isPushSubscribed(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch {
    return false;
  }
}

// Send push notification to specific user(s)
export async function sendPushNotification(
  userId: string | string[],
  notification: PushNotificationOptions
): Promise<{ success: boolean; sent: number }> {
  try {
    const { data, error } = await supabase.functions.invoke('push-notification', {
      body: {
        action: 'send',
        ...(Array.isArray(userId) ? { userIds: userId } : { userId }),
        notification,
      },
    });

    if (error) throw error;
    return { success: true, sent: data.sent || 0 };
  } catch (error) {
    console.error('Send push notification failed:', error);
    return { success: false, sent: 0 };
  }
}

// Send notification for booking events
export async function sendBookingNotification(
  userId: string,
  type: 'request' | 'confirmed' | 'cancelled' | 'reminder' | 'completed',
  bookingDetails: {
    equipmentName: string;
    dates?: string;
    ownerName?: string;
    renterName?: string;
  }
): Promise<boolean> {
  const notifications: Record<string, PushNotificationOptions> = {
    request: {
      title: '📬 New Booking Request',
      body: `${bookingDetails.renterName} wants to rent your ${bookingDetails.equipmentName}`,
      tag: 'booking-request',
      url: '/dashboard?tab=bookings',
      actions: [
        { action: 'accept', title: 'Accept' },
        { action: 'view', title: 'View Details' },
      ],
      requireInteraction: true,
    },
    confirmed: {
      title: '✅ Booking Confirmed!',
      body: `Your booking for ${bookingDetails.equipmentName} is confirmed for ${bookingDetails.dates}`,
      tag: 'booking-confirmed',
      url: '/dashboard?tab=bookings',
    },
    cancelled: {
      title: '❌ Booking Cancelled',
      body: `The booking for ${bookingDetails.equipmentName} has been cancelled`,
      tag: 'booking-cancelled',
      url: '/dashboard?tab=bookings',
    },
    reminder: {
      title: '⏰ Pickup Reminder',
      body: `Don't forget! Pick up ${bookingDetails.equipmentName} tomorrow`,
      tag: 'booking-reminder',
      url: '/dashboard?tab=bookings',
      requireInteraction: true,
    },
    completed: {
      title: '🎉 Rental Completed',
      body: `Thanks for returning ${bookingDetails.equipmentName}! Leave a review?`,
      tag: 'booking-completed',
      url: '/dashboard?tab=reviews',
      actions: [
        { action: 'review', title: 'Leave Review' },
        { action: 'dismiss', title: 'Later' },
      ],
    },
  };

  const notification = notifications[type];
  if (!notification) return false;

  const result = await sendPushNotification(userId, notification);
  return result.success;
}

// Send notification for messages
export async function sendMessageNotification(
  userId: string,
  senderName: string,
  messagePreview: string,
  conversationId: string
): Promise<boolean> {
  const result = await sendPushNotification(userId, {
    title: `💬 New message from ${senderName}`,
    body: messagePreview.length > 100 ? messagePreview.slice(0, 100) + '...' : messagePreview,
    tag: `message-${conversationId}`,
    url: `/dashboard?tab=messages&conversation=${conversationId}`,
    actions: [
      { action: 'reply', title: 'Reply' },
      { action: 'view', title: 'View' },
    ],
  });

  return result.success;
}

// Send price alert notification
export async function sendPriceAlertNotification(
  userId: string,
  equipmentName: string,
  oldPrice: number,
  newPrice: number,
  equipmentId: string
): Promise<boolean> {
  const percentOff = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  
  const result = await sendPushNotification(userId, {
    title: '💰 Price Drop Alert!',
    body: `${equipmentName} is now $${newPrice}/day (${percentOff}% off!)`,
    tag: `price-alert-${equipmentId}`,
    url: `/equipment/${equipmentId}`,
    actions: [
      { action: 'book', title: 'Book Now' },
      { action: 'view', title: 'View' },
    ],
    requireInteraction: true,
  });

  return result.success;
}

// Show local notification (for testing or immediate feedback)
export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options,
    });
  }
}
