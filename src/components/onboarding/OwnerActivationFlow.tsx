import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ArrowRight,
  Hammer,
  Shield,
  DollarSign,
  User,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { getProfile } from '../../services/database';
import type { Profile } from '../../types';

interface OwnerActivationFlowProps {
  userId: string;
  onListEquipment: () => void;
  onGoToVerification: () => void;
  onGoToPayments?: () => void;
  onDismiss: () => void;
}

type StepStatus = 'complete' | 'active' | 'pending';

interface Step {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  status: StepStatus;
  action: string;
  actionFn: () => void;
  completedText: string;
}

const DISMISSED_KEY = 'owner_activation_dismissed';

export default function OwnerActivationFlow({
  userId,
  onListEquipment,
  onGoToVerification,
  onGoToPayments: _onGoToPayments,
  onDismiss,
}: OwnerActivationFlowProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [equipmentCount, setEquipmentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, eq] = await Promise.all([
          getProfile(userId),
          supabase
            .from('equipment')
            .select('id', { count: 'exact', head: true })
            .eq('owner_id', userId),
        ]);
        setProfile(p);
        setEquipmentCount(eq.count ?? 0);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return null;

  const hasProfile = !!(profile?.full_name && profile?.location && profile?.bio);
  const hasVerification = profile?.is_verified || profile?.identity_verified || profile?.email_verified;
  const hasListing = (equipmentCount ?? 0) > 0;

  // If all 3 done, auto-dismiss
  const allDone = hasProfile && hasVerification && hasListing;

  const steps: Step[] = [
    {
      id: 'profile',
      title: 'Complete your profile',
      subtitle: 'Add your name, location and a short bio so renters trust you.',
      icon: User,
      color: 'from-blue-500 to-indigo-500',
      status: hasProfile ? 'complete' : 'active',
      action: 'Go to profile',
      actionFn: () => {
        onDismiss();
        // Navigate to dashboard settings tab — handled by parent
        window.dispatchEvent(new CustomEvent('islakayd:nav', { detail: 'dashboard' }));
      },
      completedText: 'Profile complete ✓',
    },
    {
      id: 'verify',
      title: 'Verify your identity',
      subtitle: 'Verified owners get 3× more bookings. Takes less than 2 minutes.',
      icon: Shield,
      color: 'from-teal-500 to-emerald-500',
      status: hasVerification
        ? 'complete'
        : hasProfile
        ? 'active'
        : 'pending',
      action: 'Start verification',
      actionFn: onGoToVerification,
      completedText: 'Identity verified ✓',
    },
    {
      id: 'list',
      title: 'List your first item',
      subtitle: 'Publish one listing and start earning. AI writes the description for you.',
      icon: Hammer,
      color: 'from-orange-500 to-amber-500',
      status: hasListing
        ? 'complete'
        : hasProfile
        ? 'active'
        : 'pending',
      action: 'List equipment',
      actionFn: onListEquipment,
      completedText: `${equipmentCount} listing${equipmentCount === 1 ? '' : 's'} live ✓`,
    },
  ];

  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    onDismiss();
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">Setup progress</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{completedCount}/{steps.length} steps done</p>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-white/80" />
                <span className="text-xs font-medium text-white/80 uppercase tracking-wide">Owner Setup</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {allDone ? "You're ready to earn! 🎉" : 'Start earning in 3 steps'}
              </h3>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setExpanded(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Minimise"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/70 mb-1">
              <span>{completedCount} of {steps.length} complete</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {steps.map((step) => {
            const Icon = step.icon;
            const isComplete = step.status === 'complete';
            const isPending = step.status === 'pending';

            return (
              <div
                key={step.id}
                className={`px-5 py-4 transition-colors ${
                  isPending ? 'opacity-50' : 'hover:bg-gray-50/60 dark:hover:bg-gray-700/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {isComplete ? (
                      <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    ) : (
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${isComplete ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {step.title}
                    </p>
                    {isComplete ? (
                      <p className="text-xs text-green-600 mt-0.5">{step.completedText}</p>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{step.subtitle}</p>
                        {!isPending && (
                          <button
                            onClick={step.actionFn}
                            className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r ${step.color} bg-clip-text text-transparent hover:opacity-80 transition-opacity`}
                          >
                            {step.action}
                            <ArrowRight className="w-3 h-3 text-teal-500" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between">
          {allDone ? (
            <button
              onClick={handleDismiss}
              className="w-full py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-semibold hover:shadow-md transition-all"
            >
              Go to my listings →
            </button>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <DollarSign className="w-3.5 h-3.5" />
                <span>Avg owner earns $340/mo</span>
              </div>
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                Dismiss
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to check if we should show this flow
export function shouldShowOwnerActivation(_userId: string): boolean {
  return localStorage.getItem(DISMISSED_KEY) !== 'true';
}
