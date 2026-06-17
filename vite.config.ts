import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: false,
    open: false,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller bundles
    target: 'esnext',
    // Minify with esbuild for better performance
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'leaflet';
          }
          const premiumPaths = [
            'components/subscription/SubscriptionPlans',
            'components/sustainability/CarbonFootprintTracker',
            'components/tutorials/AREquipmentTutorial',
            'components/booking/GroupBooking',
            'components/delivery/DroneDeliveryTracking',
            'components/inspection/AIDamageDetection',
            'components/contracts/BlockchainContract',
            'components/gamification/LoyaltyProgram',
            'components/fleet/FleetManager',
          ];
          if (premiumPaths.some((p) => id.includes(p))) {
            return 'premium-features';
          }
          const adminPaths = [
            'components/admin/AdminPanel',
            'components/dashboard/AnalyticsDashboard',
            'components/security/SecurityCenter',
          ];
          if (adminPaths.some((p) => id.includes(p))) {
            return 'admin';
          }
        },
      },
    },
    // Increase chunk size warning limit (we'll optimize further if needed)
    chunkSizeWarningLimit: 1000,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
  },
  // Enable modern features
  esbuild: {
    // Target modern browsers
    target: 'esnext',
    // Remove console.log in production
    drop: ['console', 'debugger'],
  },
});
