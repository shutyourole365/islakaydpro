import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read env vars lazily to avoid module-load timing issues
function getSupabaseUrl(): string {
  return import.meta.env.VITE_SUPABASE_URL || '';
}

function getSupabaseAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_ANON_KEY || '';
}

// Check if Supabase credentials are configured (evaluated lazily at call time)
export function checkSupabaseConfigured(): boolean {
  return !!(getSupabaseUrl() && getSupabaseAnonKey());
}

// Backwards-compatible constant for existing imports
export const isSupabaseConfigured = !!(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);

// Create the Supabase client with available credentials
function createSupabaseClient(): SupabaseClient {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  if (!url || !key) {
    // Return a placeholder client that won't crash the app in demo mode
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      { auth: { persistSession: false } }
    );
  }
  return createClient(url, key);
}

export const supabase = createSupabaseClient();
