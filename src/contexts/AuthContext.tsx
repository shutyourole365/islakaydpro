import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserAnalytics } from '../types';
import { getProfile, getUserAnalytics, getUnreadNotificationCount, subscribeToNotifications, logAuditEvent } from '../services/database';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  analytics: UserAnalytics | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  unreadNotifications: number;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    analytics: null,
    isLoading: true,
    isAuthenticated: false,
    unreadNotifications: 0,
  });

  const loadUserData = useCallback(async (userId: string) => {
    try {
      const [profile, analytics, unreadCount] = await Promise.all([
        getProfile(userId),
        getUserAnalytics(userId),
        getUnreadNotificationCount(userId),
      ]);

      setState(prev => ({
        ...prev,
        profile,
        analytics,
        unreadNotifications: unreadCount,
      }));
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await getProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
  }, [state.user]);

  const refreshNotifications = useCallback(async () => {
    if (state.user) {
      const count = await getUnreadNotificationCount(state.user.id);
      setState(prev => ({ ...prev, unreadNotifications: count }));
    }
  }, [state.user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      }));

      if (session?.user) {
        loadUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
        profile: session ? prev.profile : null,
        analytics: session ? prev.analytics : null,
        unreadNotifications: session ? prev.unreadNotifications : 0,
      }));

      if (session?.user) {
        (async () => {
          await loadUserData(session.user.id);
        })();
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  useEffect(() => {
    if (!state.user) return;

    const channel = subscribeToNotifications(state.user.id, () => {
      setState(prev => ({
        ...prev,
        unreadNotifications: prev.unreadNotifications + 1,
      }));
    });

    return () => {
      channel.unsubscribe();
    };
  }, [state.user]);

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('id', data.user.id);
      await logAuditEvent({
        userId: data.user.id,
        action: 'sign_in',
        metadata: { method: 'email' },
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    if (error) throw error;

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      await logAuditEvent({
        userId: data.user.id,
        action: 'sign_up',
        metadata: { method: 'email' },
      });
    }
  };

  const signOut = async () => {
    if (state.user) {
      await logAuditEvent({
        userId: state.user.id,
        action: 'sign_out',
      });
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    setState({
      user: null,
      session: null,
      profile: null,
      analytics: null,
      isLoading: false,
      isAuthenticated: false,
      unreadNotifications: 0,
    });
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;

    if (state.user) {
      await logAuditEvent({
        userId: state.user.id,
        action: 'password_changed',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
        refreshNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
