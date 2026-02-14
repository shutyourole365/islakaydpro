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

// Initialize error monitoring first
errorMonitoring.initialize();

// Validate environment variables on startup
const envValidation = validateEnvironment();
logValidationResults(envValidation);

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
