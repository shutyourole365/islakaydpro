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
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate heavy dependencies
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'leaflet': ['leaflet', 'react-leaflet'],
          
          // Premium feature chunks - lazy loaded
          'premium-features': [
            './src/components/subscription/SubscriptionPlans',
            './src/components/sustainability/CarbonFootprintTracker',
            './src/components/tutorials/AREquipmentTutorial',
            './src/components/booking/GroupBooking',
            './src/components/delivery/DroneDeliveryTracking',
            './src/components/inspection/AIDamageDetection',
            './src/components/contracts/BlockchainContract',
            './src/components/gamification/LoyaltyProgram',
            './src/components/fleet/FleetManager',
          ],
          
          // Admin & analytics chunks
          'admin': [
            './src/components/admin/AdminPanel',
            './src/components/dashboard/AnalyticsDashboard',
            './src/components/security/SecurityCenter',
          ],
        },
      },
    },
    // Increase chunk size warning limit (we'll optimize further if needed)
    chunkSizeWarningLimit: 600,
    // Enable source maps for production debugging (optional)
    sourcemap: false,
  },
});
