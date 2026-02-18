import React from 'react';
import { Bot, Lock } from 'lucide-react';
import { useLocalStorage } from '../../hooks';

const GLOBAL_AI_ENABLED = import.meta.env.VITE_ENABLE_AI === 'true';

export default function AISettings({ className = '' }: { className?: string }) {
  const [aiEnabledByUser, setAiEnabledByUser] = useLocalStorage<boolean>('ai_assistant_enabled', true);
  const { user, profile, refreshProfile } = (function tryUseAuth() {
    try {
      // dynamic import to avoid circular dependency errors in tests
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ctx = require('../../contexts/AuthContext');
      return ctx.useAuth();
    } catch (e) {
      return { user: null, profile: null, refreshProfile: async () => {} } as any;
    }
  })();

  const persistPreference = async (value: boolean) => {
    // update local preference
    setAiEnabledByUser(value);

    // persist to server when user is signed in
    if (user?.id) {
      try {
        // lazy import to avoid circular imports
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const db = require('../../services/database');
        await db.updateProfile(user.id, { ai_assistant_enabled: value });
        // refresh cached profile in AuthContext
        await refreshProfile();
      } catch (err) {
        console.error('Failed to persist AI preference:', err);
      }
    }
  };

  return (
    <div className={`${className} bg-white rounded-2xl shadow-sm border border-gray-100`}>
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Enable LLM-powered assistant</p>
              <p className="text-sm text-gray-500">When enabled, Kayd uses a cloud LLM to provide richer, contextual responses.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => persistPreference(!aiEnabledByUser)}
              disabled={!GLOBAL_AI_ENABLED}
              className={`w-12 h-6 rounded-full transition-colors ${aiEnabledByUser && GLOBAL_AI_ENABLED ? 'bg-teal-500' : 'bg-gray-300'} ${!GLOBAL_AI_ENABLED ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${aiEnabledByUser ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            {!GLOBAL_AI_ENABLED && (
              <span className="text-xs text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Disabled by server</span>
            )}
          </div>
        </div>

        <div className="text-sm text-gray-500">We respect your privacy — user preference is stored locally and (when signed-in) in your profile. To fully disable AI at the platform level, set <code>VITE_ENABLE_AI=false</code> in the environment.</div>
      </div>
    </div>
  );
}
