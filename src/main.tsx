import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './components/ui/Toast';
import { registerServiceWorker } from './lib/serviceWorker';
import './index.css';

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    registerServiceWorker().then((registration) => {
      if (registration) {
        console.log('PWA ready');
      }
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </StrictMode>
);
