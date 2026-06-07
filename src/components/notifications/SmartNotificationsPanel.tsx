import { useState, useEffect } from 'react';
import { Bell, Settings, Zap, Clock, Filter, Volume2, Vibrate, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useToast } from '../ui/Toast';

interface SmartNotificationPreferences {
  frequency: 'realtime' | 'daily-digest' | 'weekly-digest';
  priority_filter: 'all' | 'high' | 'urgent';
  sound_enabled: boolean;
  vibration_enabled: boolean;
  bundle_similar: boolean;
  quiet_time_override_urgent: boolean;
}

const defaultPreferences: SmartNotificationPreferences = {
  frequency: 'realtime',
  priority_filter: 'all',
  sound_enabled: true,
  vibration_enabled: true,
  bundle_similar: true,
  quiet_time_override_urgent: true,
};

export default function SmartNotificationsPanel() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [preferences, setPreferences] = useState<SmartNotificationPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    loadPreferences();
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('smart_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          frequency: data.frequency || 'realtime',
          priority_filter: data.priority_filter || 'all',
          sound_enabled: data.sound_enabled ?? true,
          vibration_enabled: data.vibration_enabled ?? true,
          bundle_similar: data.bundle_similar ?? true,
          quiet_time_override_urgent: data.quiet_time_override_urgent ?? true,
        });
      }
    } catch (err) {
      console.error('Failed to load smart notification preferences:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPrefs: SmartNotificationPreferences) => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await supabase.from('smart_notification_preferences').upsert({
        user_id: user.id,
        ...newPrefs,
        updated_at: new Date().toISOString(),
      });
      setPreferences(newPrefs);
      success('Smart notification settings saved');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      showError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof SmartNotificationPreferences, value: string | boolean) => {
    const newPrefs = { ...preferences, [key]: value };
    savePreferences(newPrefs);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Smart Notifications</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Intelligent notification management with bundling, filtering, and frequency control
        </p>
      </div>

      {/* Frequency Control */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-teal-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Notification Frequency</h3>
        </div>

        <div className="space-y-3">
          {[
            {
              value: 'realtime',
              label: 'Real-time',
              description: 'Instant notifications as they happen',
              icon: Zap,
            },
            {
              value: 'daily-digest',
              label: 'Daily Digest',
              description: 'Summarized once daily at 9 AM',
              icon: Clock,
            },
            {
              value: 'weekly-digest',
              label: 'Weekly Digest',
              description: 'Weekly summary every Monday at 9 AM',
              icon: Clock,
            },
          ].map(({ value, label, description }) => (
            <label key={value} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <input
                type="radio"
                name="frequency"
                value={value}
                checked={preferences.frequency === value}
                onChange={() => updatePreference('frequency', value)}
                disabled={saving}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Priority Filtering */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-teal-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Priority Filtering</h3>
        </div>

        <div className="space-y-3">
          {[
            {
              value: 'all',
              label: 'All Notifications',
              description: 'Receive all notification types',
            },
            {
              value: 'high',
              label: 'High Priority Only',
              description: 'Booking requests, cancellations, and urgent messages only',
            },
            {
              value: 'urgent',
              label: 'Urgent Only',
              description: 'Only critical alerts that require immediate attention',
            },
          ].map(({ value, label, description }) => (
            <label key={value} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
              <input
                type="radio"
                name="priority"
                value={value}
                checked={preferences.priority_filter === value}
                onChange={() => updatePreference('priority_filter', value)}
                disabled={saving}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Notification Features */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Notification Features</h3>

        {/* Bundle Similar */}
        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-teal-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Smart Bundling</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Group similar notifications together</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={preferences.bundle_similar}
              onChange={(e) => updatePreference('bundle_similar', e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </div>
        </label>

        {/* Sound */}
        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-teal-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Notification Sound</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Play sound for important notifications</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={preferences.sound_enabled}
              onChange={(e) => updatePreference('sound_enabled', e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </div>
        </label>

        {/* Vibration */}
        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Vibrate className="w-5 h-5 text-teal-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Haptic Feedback</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Vibrate on mobile devices for alerts</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={preferences.vibration_enabled}
              onChange={(e) => updatePreference('vibration_enabled', e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </div>
        </label>

        {/* Quiet Time Override */}
        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-teal-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Urgent Override</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Send urgent notifications during quiet hours</p>
            </div>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={preferences.quiet_time_override_urgent}
              onChange={(e) => updatePreference('quiet_time_override_urgent', e.target.checked)}
              disabled={saving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
          </div>
        </label>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Smart Notification Features</p>
            <ul className="space-y-1 text-xs">
              <li>✓ Intelligent bundling reduces notification fatigue</li>
              <li>✓ Priority filtering focuses on what matters</li>
              <li>✓ Frequency options adapt to your workflow</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
