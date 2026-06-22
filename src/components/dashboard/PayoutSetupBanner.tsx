import { useState, useEffect } from 'react';
import { Banknote, ArrowRight, X, Loader2, CheckCircle2 } from 'lucide-react';
import { checkPayoutStatus, redirectToConnectOnboarding } from '../../services/payments';

interface PayoutSetupBannerProps {
  /** Whether the current user has any listings — owners benefit most from this nudge. */
  hasListings: boolean;
}

const DISMISS_KEY = 'payout_banner_dismissed_v1';

/**
 * Nudges owners to complete Stripe Connect onboarding so they can receive
 * payouts. Hidden once onboarding is complete, when the user has no listings,
 * or after the user dismisses it for the session.
 */
export default function PayoutSetupBanner({ hasListings }: PayoutSetupBannerProps) {
  const [status, setStatus] = useState<'loading' | 'needed' | 'hidden'>('loading');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    let active = true;

    if (!hasListings) { setStatus('hidden'); return; }
    try {
      if (sessionStorage.getItem(DISMISS_KEY) === 'true') { setStatus('hidden'); return; }
    } catch { /* ignore storage errors */ }

    checkPayoutStatus()
      .then((res) => {
        if (!active) return;
        setStatus(res.isOnboarded ? 'hidden' : 'needed');
      })
      .catch(() => { if (active) setStatus('hidden'); });

    return () => { active = false; };
  }, [hasListings]);

  const handleDismiss = () => {
    try { sessionStorage.setItem(DISMISS_KEY, 'true'); } catch { /* ignore */ }
    setStatus('hidden');
  };

  const handleSetup = async () => {
    setRedirecting(true);
    try {
      await redirectToConnectOnboarding();
    } catch {
      setRedirecting(false);
    }
  };

  if (status !== 'needed') return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-teal-200/70 dark:border-teal-800/50 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/30 p-5 sm:p-6 animate-fade-in">
      {/* ambient glow */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-6 w-40 h-40 bg-teal-400/20 dark:bg-teal-500/15 blur-3xl rounded-full" />

      <button
        onClick={handleDismiss}
        aria-label="Dismiss payout reminder"
        className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 text-white shadow-lg flex-shrink-0">
          <Banknote className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">Set up payouts to get paid</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
            Connect your bank account through Stripe so your rental earnings land directly in your account. Takes about 2 minutes.
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
            Secure, bank-grade onboarding powered by Stripe
          </div>
        </div>
        <button
          onClick={handleSetup}
          disabled={redirecting}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:translate-y-0 flex-shrink-0"
        >
          {redirecting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting…</>
          ) : (
            <>Set up payouts <ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>
    </div>
  );
}
