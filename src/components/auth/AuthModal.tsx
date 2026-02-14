import { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import LogoPro from '../branding/LogoPro';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError('');
    setSuccess('');
    setShowPassword(false);
  };

  const switchMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    resetForm();
    setMode(newMode);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signIn(email, password);
      setSuccess('Signed in successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      if (message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await signUp(email, password, fullName);
      setSuccess('Account created! Welcome to Islakayd.');
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
    } finally {
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
    'AI-powered recommendations',
    'Secure payments and insurance',
    'Direct messaging with owners',
    'Earn money listing your equipment',
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex max-h-[90vh]">
        <div className="hidden lg:flex flex-col w-2/5 bg-gradient-to-br from-teal-600 to-emerald-700 p-10 text-white">
          <div className="mb-10">
            <LogoPro variant="light" size="md" showText />
          </div>

          <h2 className="text-2xl font-bold mb-3 leading-tight">
            {mode === 'signin' ? 'Welcome back' : 'Join the marketplace'}
          </h2>
          <p className="text-white/70 text-sm mb-8">
            Rent equipment from verified owners, or earn money by listing yours.
          </p>

          <ul className="space-y-3 mb-auto">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 mt-0.5 shrink-0" />
                <span className="text-sm text-white/80">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 pt-6 border-t border-white/20">
            <div className="flex -space-x-2 mb-2">
              {[
                'bg-teal-400', 'bg-emerald-400', 'bg-cyan-400', 'bg-teal-300'
              ].map((color, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${color} border-2 border-white/30`} />
              ))}
            </div>
            <p className="text-xs text-white/50">Trusted by thousands of renters and owners</p>
          </div>
        </div>

        <div className="flex-1 p-8 lg:p-10 overflow-y-auto">
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="max-w-sm mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === 'signin' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'forgot' && 'Reset password'}
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              {mode === 'signin' && 'Enter your credentials to continue'}
              {mode === 'signup' && 'Start renting equipment in minutes'}
              {mode === 'forgot' && "Enter your email for a reset link"}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-lg text-green-600 text-sm">
                {success}
              </div>
            )}

            <form
              onSubmit={
                mode === 'signin' ? handleSignIn
                : mode === 'signup' ? handleSignUp
                : handleForgotPassword
              }
              className="space-y-4"
            >
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                      required
                      minLength={6}
                      className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' && 'Sign In'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              {mode === 'signin' && (
                <p className="text-sm text-gray-500">
                  No account?{' '}
                  <button onClick={() => switchMode('signup')} className="text-teal-600 hover:text-teal-700 font-semibold">
                    Sign up
                  </button>
                </p>
              )}
              {(mode === 'signup' || mode === 'forgot') && (
                <p className="text-sm text-gray-500">
                  Already have an account?{' '}
                  <button onClick={() => switchMode('signin')} className="text-teal-600 hover:text-teal-700 font-semibold">
                    Sign in
                  </button>
                </p>
              )}
            </div>

            <p className="mt-5 text-[11px] text-center text-gray-400 leading-relaxed">
              By continuing, you agree to Islakayd's Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
