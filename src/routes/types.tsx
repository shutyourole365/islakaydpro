export type PageType = 'home' | 'browse' | 'dashboard' | 'list-equipment' | 'security' | 'analytics' | 'admin' | 'notifications' | 'payments' | 'subscription' | 'sustainability' | 'tutorials' | 'loyalty' | 'fleet' | 'referrals' | 'pwa' | 'trust-score' | 'alerts' | 'bundles' | 'warranties' | 'bulk-booking' | 'insights' | 'terms' | 'privacy' | 'cookies' | 'refund' | 'accessibility' | 'cancellation' | 'about' | 'careers' | 'press' | 'blog' | 'partnerships' | 'investors' | 'help' | 'safety' | 'trust' | 'contact' | 'pricing-calculator' | 'insurance' | 'host-resources' | 'host-community' | 'ai-matching' | 'smart-contracts' | 'ar-preview' | 'carbon-tracker' | 'equipment-financing' | 'iot-telematics' | 'ar-visualization' | 'gps-tracking' | 'crypto-payments' | 'ai-insurance' | 'sustainability-dashboard' | 'social-communities' | 'voice-ai-assistant' | 'blockchain-contracts' | 'vr-training' | 'drone-delivery' | 'industry-integrations' | 'maintenance' | 'scheduler' | 'equipment-health' | 'cost-estimator' | 'seasonal-deals' | 'rental-history' | 'multi-language' | 'availability-calendar' | 'revenue-dashboard' | 'certification-tracker' | 'agreement-generator' | 'support-tickets';

export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);
