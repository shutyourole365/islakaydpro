import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  Smartphone,
  Moon,
  Clock,
  MessageSquare,
  Calendar,
  Star,
  Tag,
  Megaphone,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isPushSubscribed,
  showLocalNotification,
} from '../../services/pushNotifications';

interface NotificationPreferences {
  push_enabled: boolean;
  push_booking_requests: boolean;
  push_booking_updates: boolean;
  push_messages: boolean;
  push_reviews: boolean;
  push_price_alerts: boolean;
  push_promotions: boolean;
  push_reminders: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  timezone: string;
}

const defaultPreferences: NotificationPreferences = {
  push_enabled: true,
  push_booking_requests: true,
  push_booking_updates: true,
  push_messages: true,
  push_reviews: true,
  push_price_alerts: true,
  push_promotions: false,
  push_reminders: true,
  quiet_hours_enabled: false,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

export default function NotificationSettings() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'loading' | 'subscribed' | 'unsubscribed' | 'unsupported' | 'denied'>('loading');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check push support and subscription status on mount
  useEffect(() => {
    checkSubscriptionStatus();
    loadPreferences();
  }, []);

  const checkSubscriptionStatus = async () => {
    if (!isPushSupported()) {
      setSubscriptionStatus('unsupported');
      return;
    }

    const permission = getNotificationPermission();
    if (permission === 'denied') {
      setSubscriptionStatus('denied');
      return;
    }

    const subscribed = await isPushSubscribed();
    setSubscriptionStatus(subscribed ? 'subscribed' : 'unsubscribed');
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          push_enabled: data.push_enabled ?? true,
          push_booking_requests: data.push_booking_requests ?? true,
          push_booking_updates: data.push_booking_updates ?? true,
          push_messages: data.push_messages ?? true,
          push_reviews: data.push_reviews ?? true,
          push_price_alerts: data.push_price_alerts ?? true,
          push_promotions: data.push_promotions ?? false,
          push_reminders: data.push_reminders ?? true,
          quiet_hours_enabled: data.quiet_hours_enabled ?? false,
          quiet_hours_start: data.quiet_hours_start ?? '22:00',
          quiet_hours_end: data.quiet_hours_end ?? '08:00',
          timezone: data.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPrefs: NotificationPreferences) => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPrefs,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Preferences saved!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save preferences' });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean | string) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    savePreferences(newPrefs);
  };

  const handleEnablePush = async () => {
    if (!user) return;

    setSubscriptionStatus('loading');
    try {
      const success = await subscribeToPush(user.id);
      if (success) {
        setSubscriptionStatus('subscribed');
        updatePreference('push_enabled', true);
        showLocalNotification('Notifications Enabled! 🔔', {
          body: 'You will now receive push notifications from Islakayd',
        });
      } else {
        setSubscriptionStatus('unsubscribed');
        setMessage({ type: 'error', text: 'Failed to enable notifications' });
      }
    } catch (error) {
      console.error('Enable push failed:', error);
      setSubscriptionStatus('unsubscribed');
      setMessage({ type: 'error', text: 'Failed to enable notifications' });
    }
  };

  const handleDisablePush = async () => {
    setSubscriptionStatus('loading');
    try {
      await unsubscribeFromPush();
      setSubscriptionStatus('unsubscribed');
      updatePreference('push_enabled', false);
    } catch (error) {
      console.error('Disable push failed:', error);
    }
  };

  const testNotification = () => {
    showLocalNotification('Test Notification 🎉', {
      body: 'If you see this, notifications are working!',
      icon: '/icons/icon-192x192.png',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Main Push Toggle */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {subscriptionStatus === 'subscribed' ? (
                <BellRing className="w-6 h-6" />
              ) : (
                <BellOff className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold">Push Notifications</h3>
              <p className="text-sm text-white/80 mt-1">
                {subscriptionStatus === 'unsupported'
                  ? 'Your browser does not support push notifications'
                  : subscriptionStatus === 'denied'
                  ? 'Notifications are blocked. Enable in browser settings.'
                  : subscriptionStatus === 'subscribed'
                  ? 'You will receive notifications on this device'
                  : 'Enable to receive instant updates'}
              </p>
            </div>
          </div>

          {subscriptionStatus === 'loading' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : subscriptionStatus === 'subscribed' ? (
            <button
              onClick={handleDisablePush}
              className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              Disable
            </button>
          ) : subscriptionStatus !== 'unsupported' && subscriptionStatus !== 'denied' ? (
            <button
              onClick={handleEnablePush}
              className="px-4 py-2 bg-white rounded-lg text-teal-600 text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Enable
            </button>
          ) : null}
        </div>

        {subscriptionStatus === 'subscribed' && (
          <button
            onClick={testNotification}
            className="mt-4 w-full py-2.5 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition-colors flex items-center justify-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Send Test Notification
          </button>
        )}
      </div>

      {/* Notification Types */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal-500" />
            Notification Types
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose which notifications you want to receive
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {[
            {
              key: 'push_booking_requests',
              icon: Calendar,
              label: 'Booking Requests',
              description: 'When someone wants to rent your equipment',
            },
            {
              key: 'push_booking_updates',
              icon: CheckCircle2,
              label: 'Booking Updates',
              description: 'Confirmations, cancellations, and status changes',
            },
            {
              key: 'push_messages',
              icon: MessageSquare,
              label: 'Messages',
              description: 'New messages from renters or owners',
            },
            {
              key: 'push_reviews',
              icon: Star,
              label: 'Reviews',
              description: 'When someone leaves you a review',
            },
            {
              key: 'push_price_alerts',
              icon: Tag,
              label: 'Price Alerts',
              description: 'When saved equipment drops in price',
            },
            {
              key: 'push_reminders',
              icon: Clock,
              label: 'Reminders',
              description: 'Pickup, return, and payment reminders',
            },
            {
              key: 'push_promotions',
              icon: Megaphone,
              label: 'Promotions & News',
              description: 'Special offers and platform updates',
            },
          ].map(({ key, icon: Icon, label, description }) => (
            <label
              key={key}
              className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{label}</p>
                  <p className="text-sm text-gray-500">{description}</p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={preferences[key as keyof NotificationPreferences] as boolean}
                  onChange={(e) => updatePreference(key as keyof NotificationPreferences, e.target.checked)}
                  disabled={subscriptionStatus !== 'subscribed' || isSaving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 peer-disabled:opacity-50"></div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-teal-500" />
              <div>
                <h3 className="font-semibold text-gray-900">Quiet Hours</h3>
                <p className="text-sm text-gray-500">
                  Pause notifications during specific hours
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.quiet_hours_enabled}
                onChange={(e) => updatePreference('quiet_hours_enabled', e.target.checked)}
                disabled={isSaving}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
        </div>

        {preferences.quiet_hours_enabled && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Start Time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start}
                  onChange={(e) => updatePreference('quiet_hours_start', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  End Time
                </label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end}
                  onChange={(e) => updatePreference('quiet_hours_end', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => updatePreference('timezone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              >
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Australia/Sydney">Sydney (AEST)</option>
              </select>
            </div>

            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              📱 During quiet hours, notifications will be silently delivered and won't wake your device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
