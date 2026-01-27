import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface SupabaseStatus {
  isConfigured: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  latency: number | null;
}

/**
 * Hook to check Supabase connection status
 * Useful for showing connection indicators in the UI
 */
export function useSupabaseStatus(): SupabaseStatus {
  const [status, setStatus] = useState<SupabaseStatus>({
    isConfigured: isSupabaseConfigured,
    isConnected: false,
    isLoading: true,
    error: null,
    latency: null,
  });

  const checkConnection = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setStatus({
        isConfigured: false,
        isConnected: false,
        isLoading: false,
        error: 'Supabase not configured',
        latency: null,
      });
      return;
    }

    const startTime = Date.now();

    try {
      // Simple query to check connection
      const { error } = await supabase.from('categories').select('id').limit(1);
      
      const latency = Date.now() - startTime;

      if (error) {
        setStatus({
          isConfigured: true,
          isConnected: false,
          isLoading: false,
          error: error.message,
          latency: null,
        });
      } else {
        setStatus({
          isConfigured: true,
          isConnected: true,
          isLoading: false,
          error: null,
          latency,
        });
      }
    } catch (err) {
      setStatus({
        isConfigured: true,
        isConnected: false,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Connection failed',
        latency: null,
      });
    }
  }, []);

  useEffect(() => {
    checkConnection();

    // Re-check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, [checkConnection]);

  return status;
}

/**
 * Hook to monitor real-time connection status
 */
export function useRealtimeStatus() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channel = supabase.channel('connection-status');
    
    channel
      .on('system', { event: 'connected' }, () => {
        setIsConnected(true);
      })
      .on('system', { event: 'disconnected' }, () => {
        setIsConnected(false);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return isConnected;
}
