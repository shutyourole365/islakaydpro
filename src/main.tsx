import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { registerServiceWorker } from './lib/serviceWorker';
import { analytics } from './services/analytics';
import { errorMonitoring } from './services/errorMonitoring';
import { PerformanceMonitor } from './utils/performance';
import { validateEnvironment, logValidationResults } from './utils/envValidation';
import './index.css';

// Dev-only: hide Vite error overlay from accessibility scans
if (import.meta.env.DEV) {
  import('./utils/dev-overlay-a11y');
}

// Initialize error monitoring first
errorMonitoring.initialize();

// Validate environment variables on startup
const envValidation = validateEnvironment();
logValidationResults(envValidation);

// Stop app initialization if critical env vars are missing (only in production)
// In development/E2E mode the app runs with placeholder credentials and sample data
if (!envValidation.isValid && import.meta.env.PROD) {
  // Show error to user (accessible colors + main landmark)
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    ">
      <main id="main-content" role="main" style="width:100%; display:flex; align-items:center; justify-content:center;">
        <div style="
          max-width: 600px;
          background: white;
          color: #1a202c;
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        ">
          <h1 style="font-size: 2rem; margin-bottom: 1rem; color: #b91c1c;">⚠️ Configuration Error</h1>
          <p style="margin-bottom: 1.5rem; color: #2d3748;">
            The application cannot start because required environment variables are missing or invalid.
          </p>
          <div style="background: #fff5f5; padding: 1rem; border-radius: 0.5rem; border-left: 4px solid #b91c1c; margin-bottom: 1.5rem;">
            <strong style="display: block; margin-bottom: 0.5rem; color: #7f1d1d;">Errors:</strong>
            <ul style="margin: 0; padding-left: 1.5rem; color: #542424;">
              ${envValidation.errors.map(err => `<li style="margin-bottom: 0.5rem;">${err}</li>`).join('')}
            </ul>
          </div>
          <p style="color: #2d3748; margin-bottom: 1rem;">
            <strong>To fix this:</strong>
          </p>
          <ol style="color: #2d3748; padding-left: 1.5rem;">
            <li style="margin-bottom: 0.5rem;">Copy <code style="background: #edf2f7; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">.env.example</code> to <code style="background: #edf2f7; padding: 0.25rem 0.5rem; border-radius: 0.25rem;">.env.local</code></li>
            <li style="margin-bottom: 0.5rem;">Fill in your Supabase credentials</li>
            <li style="margin-bottom: 0.5rem;">Restart the development server</li>
          </ol>
          <p style="margin-top: 1.5rem; color: #4a5568; font-size: 0.875rem;">
            📖 See <strong>SETUP_GUIDE.md</strong> for detailed instructions.
          </p>
        </div>
      </main>
    </div>
  `;
  throw new Error('Environment validation failed. Check console for details.');
}

// Initialize analytics if enabled
if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  analytics.initialize();
}

// Initialize performance monitoring in production
if (import.meta.env.PROD) {
  PerformanceMonitor.getInstance();
  PerformanceMonitor.getWebVitals();
}

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    registerServiceWorker().then((registration) => {
      if (registration) {
        if (import.meta.env.DEV) {
          console.log('PWA service worker registered');
        }
      }
    }).catch((error) => {
      console.error('Service worker registration failed:', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>
);
