import { useState, useId } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signUpWithRetry, getAuthErrorMessage } from '../../services/authHelpers';
import { peekPendingReferralCode, clearPendingReferralCode } from '../../services/referrals';
import { sendWelcomeEmail } from '../../services/email';
import SocialAuth from './SocialAuth';
import BiometricAuth from './BiometricAuth';
import Logo from '../ui/Logo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: 'signin' | 'signup' | 'forgot' | 'reset-password';
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset-password'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAge18Plus, setIsAge18Plus] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const fullNameId = useId();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email address. Check your inbox for the confirmation link.');
      } else {
        setError(error.message);
      }
    } else if (data.session) {
      setSuccess('✅ Successfully signed in! Redirecting...');
      setTimeout(() => { onSuccess(); onClose(); }, 800);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAge18Plus) {
      setError('You must be 18 years or older to use IslaKayd.');
      return;
    }
    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    // Peek the pending referral code so a failed signup retry still
    // attributes correctly; only clear after the user is created.
    const referralCode = peekPendingReferralCode();
    const metadata: Record<string, unknown> = { full_name: fullName };
    if (referralCode) metadata.referral_code = referralCode;
    try {
      const data = await signUpWithRetry(email, password, metadata, { maxAttempts: 3, delayMs: 1000 });
      if (data.user) {
        if (referralCode) clearPendingReferralCode();
        if (!data.session) {
          sendWelcomeEmail(email, fullName).catch(() => {});
          setSuccess('✅ Account created! Please check your email to confirm your account.');
          setLoading(false);
          return;
        }
        sendWelcomeEmail(email, fullName).catch(() => {});
        setSuccess('✅ Account created successfully! Welcome to IslaKayd!');
        setLoading(false);
        setTimeout(() => { onSuccess(); onClose(); }, 800);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err as Error));
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess('Password reset email sent! Check your inbox.');
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setSuccess('Password updated! You can now sign in.');
      setTimeout(() => { window.history.replaceState({}, '', '/'); onSuccess(); }, 1500);
    }
  };

  if (!isOpen) return null;

  const benefits = [
    'Access to 50,000+ equipment listings',
    'AI-powered equipment recommendations',
    'Secure payments and insurance',
    'Direct messaging with owners',
    'Earn money listing your equipment',
  ];

  const inputBase =
    'w-full py-3.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all border-gray-200 dark:border-gray-600';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sign in"
        className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex"
      >
        {/* Left panel — brand */}
        <div className="hidden lg:flex flex-col w-2/5 bg-brand-gradient p-10 text-white">
          <div className="mb-8">
            <Logo size="md" inverse />
          </div>

          <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
            Join the Future of Equipment Rental
          </h2>
          <p className="text-white/80 mb-8 leading-relaxed">
            Access thousands of tools and equipment from verified owners. Powered by AI
            for the perfect match every time.
          </p>

          <ul className="space-y-4 mb-auto">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span className="text-white/90 text-sm">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-sm text-white/60">Trusted by 120,000+ users worldwide</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30" />
                ))}
              </div>
              <span className="text-sm text-white/80">+120k users</span>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 p-8 lg:p-10 bg-white dark:bg-gray-900">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close authentication dialog"
          >
            <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </button>

          <div className="max-w-sm mx-auto">
            {/* Mobile logo */}
            <div className="lg:hidden mb-6">
              <Logo size="md" />
            </div>

            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {mode === 'signin' && 'Welcome back'}
              {mode === 'reset-password' && 'Set new password'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'forgot' && 'Reset password'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              {mode === 'signin' && 'Sign in to continue to your account'}
              {mode === 'signup' && 'Start renting equipment in minutes'}
              {mode === 'forgot' && "Enter your email and we'll send you a reset link"}
              {mode === 'reset-password' && 'Choose a new password for your account'}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
                {success}
              </div>
            )}

            <form
              onSubmit={
                mode === 'signin' ? handleSignIn
                  : mode === 'signup' ? handleSignUp
                  : mode === 'reset-password' ? handleSetNewPassword
                  : handleForgotPassword
              }
              className="space-y-4"
            >
              {mode === 'signup' && (
                <div>
                  <label htmlFor={fullNameId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id={fullNameId}
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      required
                      className={`${inputBase} pl-12 pr-4`}
                    />
                  </div>
                </div>
              )}

              {mode !== 'reset-password' && (
                <div>
                  <label htmlFor={emailId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id={emailId}
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className={`${inputBase} pl-12 pr-4`}
                    />
                  </div>
                </div>
              )}

              {(mode === 'signin' || mode === 'signup' || mode === 'reset-password') && (
                <div>
                  <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id={passwordId}
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                      className={`${inputBase} pl-12 pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAge18Plus}
                      onChange={(e) => setIsAge18Plus(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500 mt-1 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      I confirm that I am 18 years of age or older
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500 mt-1 flex-shrink-0"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">Privacy Policy</a>
                    </span>
                  </label>
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-pop"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                    {mode === 'reset-password' && 'Update Password'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  or continue with
                </span>
              </div>
            </div>

            <SocialAuth
              onError={(err) => setError(err)}
              onLoading={(l) => setLoading(l)}
              mode={mode === 'signin' ? 'signin' : 'signup'}
              isAge18Plus={isAge18Plus}
              agreeToTerms={agreeToTerms}
            />

            {mode === 'signin' && (
              <div className="mt-4">
                <BiometricAuth
                  onSuccess={() => { onSuccess(); onClose(); }}
                  onError={(err) => setError(err)}
                />
              </div>
            )}

            <div className="mt-8 text-center">
              {mode === 'signin' && (
                <p className="text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setMode('signup'); setError(''); setIsAge18Plus(false); setAgreeToTerms(false); }}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold"
                  >
                    Sign up
                  </button>
                </p>
              )}
              {(mode === 'signup' || mode === 'forgot') && (
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('signin'); setError(''); setSuccess(''); setIsAge18Plus(false); setAgreeToTerms(false); }}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <p className="mt-6 text-xs text-center text-gray-400 dark:text-gray-500">
              By continuing, you agree to IslaKayd's{' '}
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
