import * as Sentry from '@sentry/react';

class ErrorMonitoring {
  private initialized = false;

  initialize() {
    const dsn = import.meta.env.VITE_SENTRY_DSN;
    
    if (!dsn || this.initialized) {
      if (import.meta.env.DEV) {
        console.log('Sentry not configured or already initialized');
      }
      return;
    }

    try {
      Sentry.init({
        dsn,
        environment: import.meta.env.MODE,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of transactions
        // Session Replay
        replaysSessionSampleRate: 0.1, // 10% of sessions
        replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
        // Release tracking
        release: import.meta.env.VITE_APP_VERSION || 'development',
        // Enable debug in development
        debug: import.meta.env.DEV,
        // Filter out common noise
        ignoreErrors: [
          // Browser extensions
          'top.GLOBALS',
          'chrome-extension://',
          'moz-extension://',
          // Network errors
          'NetworkError',
          'Failed to fetch',
          // Random plugins/extensions
          'Can\'t find variable: ZiteReader',
          'jigsaw is not defined',
        ],
        beforeSend(event, hint) {
          // Don't send errors in development
          if (import.meta.env.DEV) {
            console.error('Sentry would send:', event, hint);
            return null;
          }
          return event;
        },
      });

      this.initialized = true;
      
      if (import.meta.env.DEV) {
        console.log('✅ Sentry error monitoring initialized');
      }
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  // Set user context
  setUser(user: { id: string; email?: string; username?: string }) {
    if (!this.initialized) return;
    
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  // Clear user context (on logout)
  clearUser() {
    if (!this.initialized) return;
    Sentry.setUser(null);
  }

  // Add breadcrumb (for debugging context)
  addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, unknown>) {
    if (!this.initialized) return;
    
    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }

  // Manually capture exception
  captureException(error: Error, context?: Record<string, unknown>) {
    if (!this.initialized) {
      console.error('Error (not sent to Sentry):', error, context);
      return;
    }
    
    if (context) {
      Sentry.withScope((scope) => {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value as Record<string, unknown>);
        });
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  }

  // Capture custom message
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    if (!this.initialized) {
      console.log(`Message (not sent to Sentry) [${level}]:`, message);
      return;
    }
    
    Sentry.captureMessage(message, level);
  }

  // Set tags for filtering
  setTag(key: string, value: string) {
    if (!this.initialized) return;
    Sentry.setTag(key, value);
  }

  // Set context
  setContext(name: string, context: Record<string, unknown>) {
    if (!this.initialized) return;
    Sentry.setContext(name, context);
  }
}

export const errorMonitoring = new ErrorMonitoring();

// Export Sentry for advanced usage
export { Sentry };
