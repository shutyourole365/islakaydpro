import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    open: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    cssCodeSplit: true,
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'leaflet': ['leaflet', 'react-leaflet'],

          'premium-features': [
            './src/components/subscription/SubscriptionPlans',
            './src/components/booking/GroupBooking',
            './src/components/inspection/AIDamageDetection',
            './src/components/contracts/BlockchainContract',
            './src/components/fleet/FleetManager',
          ],

          'admin': [
            './src/components/admin/AdminPanel',
            './src/components/dashboard/AnalyticsDashboard',
            './src/components/security/SecurityCenter',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  esbuild: {
    target: 'esnext',
    drop: ['console', 'debugger'],
  },
});
