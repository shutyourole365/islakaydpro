import { UserCircle, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import type { Profile } from '../../types';

interface ProfileCompletionCardProps {
  profile: Profile | null;
  onComplete: () => void;
}

/**
 * Shows how complete the user's profile is and nudges them to finish the
 * remaining items. Hidden once everything is done. A complete, verified
 * profile earns more trust (and bookings) on the marketplace.
 */
export default function ProfileCompletionCard({ profile, onComplete }: ProfileCompletionCardProps) {
  if (!profile) return null;

  const items = [
    { label: 'Add a profile photo', done: !!profile.avatar_url },
    { label: 'Write a short bio', done: !!profile.bio },
    { label: 'Add your location', done: !!profile.location },
    { label: 'Add a phone number', done: !!profile.phone },
    { label: 'Verify your email', done: !!profile.email_verified },
    { label: 'Verify your identity', done: !!(profile.identity_verified || profile.is_verified) },
  ];

  const completed = items.filter((i) => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  if (pct === 100) return null;

  const nextItems = items.filter((i) => !i.done).slice(0, 3);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
            <UserCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Complete your profile</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">A complete profile earns more trust and bookings.</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-teal-600 dark:text-teal-400 tabular-nums">{pct}%</span>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Remaining items */}
      <ul className="mt-4 space-y-2">
        {nextItems.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Circle className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />
            {item.label}
          </li>
        ))}
        {completed > 0 && (
          <li className="flex items-center gap-2 text-sm text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {completed} of {items.length} done
          </li>
        )}
      </ul>

      <button
        onClick={onComplete}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:gap-2.5 transition-all"
      >
        Finish setup <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
