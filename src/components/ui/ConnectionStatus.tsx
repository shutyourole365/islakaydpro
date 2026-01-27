import { useSupabaseStatus } from '../../hooks/useSupabaseStatus';
import { Wifi, WifiOff, Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConnectionStatusProps {
  showLatency?: boolean;
  variant?: 'badge' | 'inline' | 'full';
  className?: string;
}

/**
 * Shows the current Supabase connection status
 * Useful for debugging and user awareness
 */
export default function ConnectionStatus({ 
  showLatency = false, 
  variant = 'badge',
  className = '' 
}: ConnectionStatusProps) {
  const { isConfigured, isConnected, isLoading, error, latency } = useSupabaseStatus();

  if (variant === 'badge') {
    if (isLoading) {
      return (
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-500 ${className}`}>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
          Connecting...
        </div>
      );
    }

    if (!isConfigured) {
      return (
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-amber-100 rounded-full text-xs text-amber-700 ${className}`}>
          <AlertTriangle className="w-3 h-3" />
          Demo Mode
        </div>
      );
    }

    if (!isConnected) {
      return (
        <div className={`flex items-center gap-1.5 px-2 py-1 bg-red-100 rounded-full text-xs text-red-700 ${className}`}>
          <WifiOff className="w-3 h-3" />
          Offline
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-1.5 px-2 py-1 bg-green-100 rounded-full text-xs text-green-700 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full" />
        Connected
        {showLatency && latency && (
          <span className="text-green-600 ml-1">{latency}ms</span>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    if (isLoading) {
      return <span className={`text-gray-500 ${className}`}>Connecting to database...</span>;
    }
    if (!isConfigured) {
      return <span className={`text-amber-600 ${className}`}>Running in demo mode</span>;
    }
    if (!isConnected) {
      return <span className={`text-red-600 ${className}`}>Database connection failed</span>;
    }
    return <span className={`text-green-600 ${className}`}>Database connected</span>;
  }

  // Full variant with details
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isConnected ? 'bg-green-100' : isConfigured ? 'bg-red-100' : 'bg-amber-100'
        }`}>
          {isConnected ? (
            <Database className="w-5 h-5 text-green-600" />
          ) : isConfigured ? (
            <WifiOff className="w-5 h-5 text-red-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">
            {isConnected ? 'Connected' : isConfigured ? 'Disconnected' : 'Demo Mode'}
          </h3>
          <p className="text-sm text-gray-500">
            {isConnected 
              ? `Supabase database connected${latency ? ` (${latency}ms)` : ''}`
              : isConfigured 
                ? error || 'Unable to connect to database'
                : 'No database configured'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {isConfigured ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            )}
          </div>
          <p className="text-xs text-gray-500">Configured</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            {isConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>
          <p className="text-xs text-gray-500">Connected</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-sm font-medium text-gray-900 mb-1">
            {latency ? `${latency}ms` : '--'}
          </p>
          <p className="text-xs text-gray-500">Latency</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Simple dot indicator for connection status
 */
export function ConnectionDot({ className = '' }: { className?: string }) {
  const { isConnected, isConfigured, isLoading } = useSupabaseStatus();

  if (isLoading) {
    return <div className={`w-2 h-2 bg-gray-400 rounded-full animate-pulse ${className}`} />;
  }

  if (!isConfigured) {
    return <div className={`w-2 h-2 bg-amber-500 rounded-full ${className}`} />;
  }

  return (
    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} ${className}`} />
  );
}
