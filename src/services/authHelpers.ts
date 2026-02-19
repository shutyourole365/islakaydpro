import { supabase } from '../lib/supabase';
import type { AuthError } from '@supabase/supabase-js';

/**
 * Enhanced authentication utilities with retry logic and better error handling
 */

interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoff?: boolean;
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoff = true } = options;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (400-499)
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        if (status >= 400 && status < 500) {
          throw error;
        }
      }

      // Last attempt, throw the error
      if (attempt === maxAttempts) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = backoff ? delayMs * Math.pow(2, attempt - 1) : delayMs;
      console.warn(`Auth attempt ${attempt} failed, retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(error: AuthError | Error | null): string {
  if (!error) return 'An unknown error occurred';

  const message = error.message.toLowerCase();

  // Common auth error messages
  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (message.includes('user already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (message.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (message.includes('password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  }
  if (message.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  if (message.includes('server') || message.includes('500')) {
    return 'Server error. Please try again in a moment.';
  }

  return error.message || 'Authentication failed. Please try again.';
}

/**
 * Enhanced sign in with retry logic
 */
export async function signInWithRetry(
  email: string,
  password: string,
  options: RetryOptions = {}
) {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }, options);
}

/**
 * Enhanced sign up with better error handling
 */
export async function signUpWithRetry(
  email: string,
  password: string,
  metadata: Record<string, unknown> = {},
  options: RetryOptions = {}
) {
  return retryWithBackoff(async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    return data;
  }, options);
}

/**
 * Check if email confirmation is required
 */
export async function isEmailConfirmationRequired(): Promise<boolean> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`,
      {
        headers: {
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
      }
    );
    const settings = await response.json();
    return !settings.mailer_autoconfirm;
  } catch (error) {
    console.error('Failed to check email confirmation settings:', error);
    return true; // Assume confirmation required on error
  }
}

/**
 * Resend confirmation email
 */
export async function resendConfirmationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });

  if (error) throw error;
}

/**
 * Check if user session is valid
 */
export async function checkSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Session check failed:', error);
    return null;
  }
}

/**
 * Sign out with retry logic
 */
export async function signOutWithRetry(options: RetryOptions = {}) {
  return retryWithBackoff(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, { ...options, maxAttempts: 2 });
}

/**
 * Reset password with retry
 */
export async function resetPasswordWithRetry(
  email: string,
  options: RetryOptions = {}
) {
  return retryWithBackoff(async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
  }, options);
}

/**
 * Update password
 */
export async function updatePasswordWithRetry(
  newPassword: string,
  options: RetryOptions = {}
) {
  return retryWithBackoff(async () => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }, options);
}
