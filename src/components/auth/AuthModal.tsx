import { useState, useId } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { signUpWithRetry, getAuthErrorMessage } from '../../services/authHelpers';
import SocialAuth from './SocialAuth';
import BiometricAuth from './BiometricAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Generate unique IDs for form accessibility
  const emailId = useId();
  const passwordId = useId();
  const fullNameId = useId();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      // Provide user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email address. Check your inbox for the confirmation link.');
      } else {
        setError(error.message);
      }
    } else if (data.session) {
      setSuccess('✅ Successfully signed in! Redirecting...');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await signUpWithRetry(
        email,
        password,
        { full_name: fullName },
        { maxAttempts: 3, delayMs: 1000 }
      );

      if (data.user) {
        // If Supabase requires email confirmation, there will be no session
        if (!data.session) {
          setSuccess('✅ Account created! Please check your email to confirm your account.');
          setLoading(false);
          return;
        }

        // Auto-confirmed (session exists)
        setSuccess('✅ Account created successfully! Welcome to Islakayd!');
        setLoading(false);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      }
    } catch (err) {
      const message = getAuthErrorMessage(err as Error);
      setError(message);
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

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password reset email sent! Check your inbox.');
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex">
        <div className="hidden lg:flex flex-col w-2/5 bg-gradient-to-br from-teal-600 to-emerald-600 p-10 text-white">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">Islakayd</span>
          </div>

          <h2 className="text-3xl font-bold mb-4">
            Join the Future of Equipment Rental
          </h2>
          <p className="text-white/80 mb-8">
            Access thousands of tools and equipment from verified owners. Powered by AI
            for the perfect match every time.
          </p>

          <ul className="space-y-4 mb-auto">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
                <span className="text-white/90">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-8 border-t border-white/20">
            <p className="text-sm text-white/60">Trusted by 120,000+ users worldwide</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-white/20 border-2 border-white/30"
                  />
                ))}
              </div>
              <span className="text-sm text-white/80">+120k users</span>
            </div>
          </div>
        </div>

        <div className="flex-1 p-8 lg:p-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>

          <div className="max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'signin' && 'Welcome back'}
              {mode === 'signup' && 'Create your account'}
              {mode === 'forgot' && 'Reset password'}
            </h2>
            <p className="text-gray-600 mb-8">
              {mode === 'signin' && 'Sign in to continue to your account'}
              {mode === 'signup' && 'Start renting equipment in minutes'}
              {mode === 'forgot' && "Enter your email and we'll send you a reset link"}
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm">
                {success}
              </div>
            )}

            <form
              onSubmit={
                mode === 'signin'
                  ? handleSignIn
                  : mode === 'signup'
                  ? handleSignUp
                  : handleForgotPassword
              }
              className="space-y-4"
            >
              {mode === 'signup' && (
                <div>
                  <label htmlFor={fullNameId} className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      id={fullNameId}
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor={emailId} className="block text-sm font-medium text-gray-700 mb-1.5">
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
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700 mb-1.5">
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
                      className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social Auth */}
            <SocialAuth
              onError={(err) => setError(err)}
              onLoading={(loading) => setLoading(loading)}
              mode={mode === 'signin' ? 'signin' : 'signup'}
            />

            {/* Biometric Auth */}
            {mode === 'signin' && (
              <div className="mt-4">
                <BiometricAuth
                  onSuccess={() => {
                    onSuccess();
                    onClose();
                  }}
                  onError={(err) => setError(err)}
                />
              </div>
            )}

            <div className="mt-8 text-center">
              {mode === 'signin' && (
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signup');
                      setError('');
                    }}
                    className="text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    Sign up
                  </button>
                </p>
              )}
              {(mode === 'signup' || mode === 'forgot') && (
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setMode('signin');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <p className="mt-6 text-xs text-center text-gray-500">
              By continuing, you agree to Islakayd's{' '}
              <a href="#" className="text-teal-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-teal-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
