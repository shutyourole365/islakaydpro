import { useState } from 'react';
import { supabase } from '../../lib/supabase';

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

  const providers: SocialProvider[] = [
    {
      id: 'google',
      name: 'Google',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      ),
      color: 'bg-white border-gray-200',
      hoverColor: 'hover:bg-gray-50',
    },
    {
      id: 'apple',
      name: 'Apple',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
        </svg>
      ),
      color: 'bg-black text-white',
      hoverColor: 'hover:bg-gray-900',
    },
    {
      id: 'github',
      name: 'GitHub',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      ),
      color: 'bg-gray-900 text-white',
      hoverColor: 'hover:bg-gray-800',
    },
    {
      id: 'twitter',
      name: 'X',
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      color: 'bg-black text-white',
      hoverColor: 'hover:bg-gray-900',
    },
  ];

  const handleSocialLogin = async (providerId: SocialProvider['id']) => {
    setLoadingProvider(providerId);
    onLoading(true);
    onError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: providerId,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: providerId === 'google' ? {
            access_type: 'offline',
            prompt: 'consent',
          } : undefined,
        },
      });

      if (error) {
        onError(error.message);
      }
    } catch {
      onError('Failed to connect. Please try again.');
    } finally {
      setLoadingProvider(null);
      onLoading(false);
    }
  };

  return (
    <div className="space-y-3">
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
