import { Component, ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

const CHUNK_ERROR_RE = /loading chunk|loading css chunk|dynamically imported module|module script failed|failed to fetch dynamically imported/i;

/** True when the error looks like a failed dynamic import / stale-chunk fetch. */
export function isChunkLoadError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error ?? '');
  return CHUNK_ERROR_RE.test(msg);
}

/**
 * Reload the page once to pick up fresh assets. Guards against an infinite
 * reload loop (if the chunk is genuinely gone) by rate-limiting via
 * sessionStorage. Returns true if a reload was triggered.
 */
export function reloadOnceForStaleChunks(): boolean {
  try {
    const KEY = 'chunk-reload-at';
    const last = Number(sessionStorage.getItem(KEY) || '0');
    if (Date.now() - last < 20000) return false; // already tried very recently
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable — fall through and reload anyway
  }
  window.location.reload();
  return true;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Auto-recover from stale-deploy chunk load failures: when a new build
    // changes hashed chunk names, a previously cached index.html (or service
    // worker) can request a chunk that no longer exists, rejecting the dynamic
    // import. Reload once to fetch fresh assets instead of stranding the user.
    if (isChunkLoadError(error) && reloadOnceForStaleChunks()) {
      return;
    }

    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service (e.g., Sentry)
    // if (window.Sentry) {
    //   window.Sentry.captureException(error, { extra: errorInfo });
    // }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-500" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 text-center mb-4">
              Oops! Something went wrong
            </h1>

            <p className="text-gray-600 text-center mb-8">
              We're sorry for the inconvenience. An unexpected error occurred while loading this page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-8 p-4 bg-gray-900 rounded-xl overflow-auto">
                <p className="text-red-400 font-mono text-sm mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-gray-400 font-mono text-xs overflow-auto">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
               >
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors"
               >
                <Home className="w-5 h-5" />
                Go to Homepage
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                If this problem persists, please{' '}
                <a
                  href="mailto:support@islakayd.com"
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  contact support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional error boundary hook for function components
export function useErrorHandler() {
  const handleError = (error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    // You can throw the error to be caught by ErrorBoundary
    throw error;
  };

  return handleError;
}

export default ErrorBoundary;
