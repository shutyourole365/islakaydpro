import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SocialAuthProps {
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
  mode: 'signin' | 'signup';
}

interface SocialProvider {
  id: 'google' | 'apple' | 'github' | 'twitter';
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

export default function SocialAuth({ onError, onLoading, mode }: SocialAuthProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const { signInWithGoogle } = useAuth();

  // TEMPORARILY DISABLED: Google OAuth needs to be configured in Supabase
  // To enable: Follow instructions in API_INTEGRATION_GUIDE.md
  const providers: SocialProvider[] = [
    // {
    //   id: 'google',
    //   name: 'Google',
    //   icon: (
    //     <svg viewBox="0 0 24 24" className="w-5 h-5">
    //       <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    //       <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    //       <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    //       <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    //     </svg>
    //   ),
    //   color: 'bg-white border-gray-200',
    //   hoverColor: 'hover:bg-gray-50',
    // },
  ];

  const handleSocialLogin = async (providerId: SocialProvider['id']) => {
    setLoadingProvider(providerId);
    onLoading(true);
    onError('');

    try {
      if (providerId === 'google') {
        await signInWithGoogle();
      }
    } catch (error) {
      console.error('Social auth error:', error);
      onError(error instanceof Error ? error.message : 'Failed to connect. Please try again.');
    } finally {
      setLoadingProvider(null);
      onLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Social auth temporarily disabled - configure OAuth in Supabase to enable */}
      {providers.length > 0 && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                {mode === 'signin' ? 'Or sign in with' : 'Or sign up with'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {providers.map((provider) => (
              <button
                key={provider.id}
                onClick={() => handleSocialLogin(provider.id)}
                disabled={loadingProvider !== null}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${provider.color} ${provider.hoverColor} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loadingProvider === provider.id ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {provider.icon}
                    <span className="text-sm">{provider.name}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Magic Link Option */}
      <button
        onClick={async () => {
          const email = prompt('Enter your email for passwordless login:');
          if (!email) return;
          
          onLoading(true);
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          onLoading(false);
          
          if (error) {
            onError(error.message);
          } else {
            alert('Check your email for the magic link!');
          }
        }}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-all"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
          <path d="M15 7h2a5 5 0 010 10h-2m-6 0H7A5 5 0 017 7h2"/>
          <path d="M8 12h8"/>
        </svg>
        <span className="text-sm">Continue with Magic Link</span>
      </button>
    </div>
  );
}
