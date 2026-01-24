import { useState, useEffect } from 'react';
import {
  Mail,
  Bell,
  MessageSquare,
  Star,
  DollarSign,
  Megaphone,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { EmailPreferences as EmailPreferencesType } from '../../types';

interface EmailPreferencesProps {
  className?: string;
}

interface PreferenceOption {
  key: keyof Omit<EmailPreferencesType, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
  label: string;
  description: string;
  icon: React.ReactNode;
  category: 'transactions' | 'communications' | 'marketing';
}

const preferenceOptions: PreferenceOption[] = [
  {
    key: 'booking_confirmations',
    label: 'Booking Confirmations',
    description: 'Receive confirmation emails when bookings are made, confirmed, or cancelled',
    icon: <CheckCircle2 className="w-5 h-5" />,
    category: 'transactions',
  },
  {
    key: 'booking_reminders',
    label: 'Booking Reminders',
    description: 'Get reminded about upcoming pickups and returns',
    icon: <Calendar className="w-5 h-5" />,
    category: 'transactions',
  },
  {
    key: 'new_messages',
    label: 'New Messages',
    description: 'Receive email notifications when you get new messages',
    icon: <MessageSquare className="w-5 h-5" />,
    category: 'communications',
  },
  {
    key: 'new_reviews',
    label: 'New Reviews',
    description: 'Get notified when someone leaves a review on your equipment or profile',
    icon: <Star className="w-5 h-5" />,
    category: 'communications',
  },
  {
    key: 'price_alerts',
    label: 'Price Alerts',
    description: 'Receive alerts when saved equipment has price changes',
    icon: <DollarSign className="w-5 h-5" />,
    category: 'communications',
  },
  {
    key: 'marketing_emails',
    label: 'Marketing & Promotions',
    description: 'Receive special offers, promotions, and announcements',
    icon: <Megaphone className="w-5 h-5" />,
    category: 'marketing',
  },
  {
    key: 'weekly_digest',
    label: 'Weekly Digest',
    description: 'Get a weekly summary of your activity and recommended equipment',
    icon: <Mail className="w-5 h-5" />,
    category: 'marketing',
  },
];

export default function EmailPreferences({ className = '' }: EmailPreferencesProps) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<EmailPreferencesType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no preferences exist, create defaults
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from('email_preferences')
            .insert({ user_id: user.id })
            .select()
            .single();

          if (insertError) throw insertError;
          setPreferences(newData);
        } else {
          throw error;
        }
      } else {
        setPreferences(data);
      }
    } catch (err) {
      console.error('Error loading email preferences:', err);
      setError('Failed to load email preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async (key: PreferenceOption['key']) => {
    if (!preferences || !user) return;

    const newValue = !preferences[key];
    
    // Optimistically update UI
    setPreferences(prev => prev ? { ...prev, [key]: newValue } : null);
    
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const { error } = await supabase
        .from('email_preferences')
        .update({ [key]: newValue, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Error updating preference:', err);
      // Revert on error
      setPreferences(prev => prev ? { ...prev, [key]: !newValue } : null);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnableAll = async () => {
    if (!user || !preferences) return;

    const updates = preferenceOptions.reduce((acc, opt) => {
      acc[opt.key] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('email_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Error enabling all preferences:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisableAll = async () => {
    if (!user || !preferences) return;

    const updates = preferenceOptions.reduce((acc, opt) => {
      acc[opt.key] = false;
      return acc;
    }, {} as Record<string, boolean>);

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('email_preferences')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;
      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Error disabling all preferences:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderCategory = (category: string, title: string) => {
    const items = preferenceOptions.filter(opt => opt.category === category);
    
    return (
      <div key={category} className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          {title}
        </h3>
        <div className="space-y-4">
          {items.map((option) => (
            <div
              key={option.key}
              className="flex items-start justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-white rounded-lg text-teal-500 shadow-sm">
                  {option.icon}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(option.key)}
                disabled={isSaving || !preferences}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 ${
                  preferences?.[option.key]
                    ? 'bg-teal-500'
                    : 'bg-gray-200'
                } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={preferences?.[option.key]}
                aria-label={`Toggle ${option.label}`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences?.[option.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">{error}</p>
        <button
          onClick={loadPreferences}
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl text-white">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Email Notifications</h2>
            <p className="text-gray-500 text-sm">Manage your email preferences</p>
          </div>
        </div>
        
        {/* Save Status Indicator */}
        {saveStatus !== 'idle' && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              saveStatus === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {saveStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                Error saving
              </>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleEnableAll}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors disabled:opacity-50"
        >
          <CheckCircle2 className="w-4 h-4" />
          Enable All
        </button>
        <button
          onClick={handleDisableAll}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <Bell className="w-4 h-4" />
          Disable All
        </button>
        {isSaving && (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Saving...</span>
          </div>
        )}
      </div>

      {/* Preference Categories */}
      {renderCategory('transactions', 'Transactions')}
      {renderCategory('communications', 'Communications')}
      {renderCategory('marketing', 'Marketing & Updates')}

      {/* Unsubscribe Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-500">
          <strong>Note:</strong> You will always receive important account and security emails 
          regardless of these settings. You can unsubscribe from all marketing emails at any time 
          by clicking the unsubscribe link in any email.
        </p>
      </div>
    </div>
  );
}
