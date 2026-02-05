import { useState } from 'react';
import { 
  Sparkles, 
  DollarSign, 
  Wrench, 
  Gift, 
  Calendar, 
  Zap,
  X,
  ChevronRight,
  Brain,
  BarChart3,
  Camera,
  Star,
  Smartphone,
  CreditCard,
  Cloud,
  Users,
  Fingerprint,
  Bell,
  Trophy,
  Package,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface FeatureShowcaseProps {
  onFeatureSelect: (feature: string) => void;
  onClose: () => void;
}

interface Feature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  demo?: boolean;
}

export default function FeatureShowcase({ onFeatureSelect, onClose }: FeatureShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'booking' | 'pricing' | 'management' | 'ai' | 'security'>('all');

  const features: Feature[] = [
    {
      id: 'price-negotiator',
      name: 'AI Price Negotiator',
      description: 'Get the best deal with AI-powered price negotiation strategies',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Save 15%+',
      demo: true,
    },
    {
      id: 'smart-scheduler',
      name: 'Smart Scheduler',
      description: 'Optimize pickup/return times to save money and avoid traffic',
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-violet-500 to-purple-500',
      badge: 'Time Saver',
      demo: true,
    },
    {
      id: 'maintenance-predictor',
      name: 'Maintenance Predictor',
      description: 'AI predicts maintenance needs before breakdowns occur',
      icon: <Wrench className="w-6 h-6" />,
      color: 'from-indigo-600 to-purple-600',
      badge: 'AI Powered',
      demo: true,
    },
    {
      id: 'referral-program',
      name: 'Referral Rewards',
      description: 'Earn $50 for every friend you refer. They get $40 off!',
      icon: <Gift className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500',
      badge: 'Earn $$',
    },
    {
      id: 'smart-pricing',
      name: 'Dynamic Pricing',
      description: 'Auto-adjust prices based on demand and market trends',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      badge: 'Max Revenue',
    },
    {
      id: 'group-booking',
      name: 'Group Bookings',
      description: 'Book multiple equipment items with split payments',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-cyan-500 to-blue-500',
      badge: 'Team Feature',
    },
    // NEW Balanced Approach Features
    {
      id: 'ai-search',
      name: 'AI Smart Search',
      description: 'Natural language search with intent detection and confidence scoring',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-purple-600 to-indigo-600',
      badge: 'NEW',
      demo: true,
    },
    {
      id: 'analytics',
      name: 'Analytics Dashboard',
      description: 'Interactive charts with AI insights and trend predictions',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-blue-600 to-cyan-600',
      badge: 'NEW',
      demo: true,
    },
    {
      id: 'photo-messaging',
      name: 'Photo Messaging',
      description: 'Send up to 5 photos per message with camera capture support',
      icon: <Camera className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      badge: 'NEW',
      demo: true,
    },
    {
      id: 'enhanced-reviews',
      name: 'Enhanced Reviews',
      description: '4-step review wizard with aspect ratings and photo uploads',
      icon: <Star className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      badge: 'NEW',
      demo: true,
    },
    {
      id: 'pwa-features',
      name: 'Offline Mode (PWA)',
      description: 'Work offline with cached content and app-like experience',
      icon: <Smartphone className="w-6 h-6" />,
      color: 'from-indigo-500 to-violet-500',
      badge: 'NEW',
      demo: true,
    },
    {
      id: 'multi-payment',
      name: 'Multi-Payment System',
      description: '6 payment methods including installments and cryptocurrency',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'from-rose-500 to-pink-500',
      badge: 'NEW',
      demo: true,
    },
    // NEWEST Features - Communication & Discovery
    {
      id: 'live-chat',
      name: 'Live Chat',
      description: 'Real-time messaging with read receipts, typing indicators, and attachments',
      icon: <Camera className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      badge: '🔥 HOT',
      demo: true,
    },
    {
      id: 'advanced-filters',
      name: 'Advanced Filters',
      description: '20+ filters including features, condition, instant book, and verified owners',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-purple-500 to-fuchsia-500',
      badge: '🔥 HOT',
      demo: true,
    },
    {
      id: 'saved-searches',
      name: 'Saved Searches',
      description: 'Save searches with email alerts for new matches and price drops',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-teal-500 to-green-500',
      badge: '🔥 HOT',
      demo: true,
    },
    {
      id: 'recommendations',
      name: 'Smart Recommendations',
      description: 'AI-powered suggestions based on your history and preferences',
      icon: <Sparkles className="w-6 h-6" />,
      color: 'from-orange-500 to-red-500',
      badge: '🔥 HOT',
      demo: true,
    },
    {
      id: 'quick-book',
      name: 'Quick Book',
      description: 'One-click booking with saved dates and payment methods',
      icon: <Zap className="w-6 h-6" />,
      color: 'from-yellow-500 to-amber-500',
      badge: '🔥 HOT',
      demo: true,
    },
    {
      id: 'comparison',
      name: 'Equipment Comparison',
      description: 'Compare up to 4 items side-by-side with specs, pricing, and ratings',
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'from-indigo-500 to-blue-500',
      badge: '🔥 HOT',
      demo: true,
    },
    // Trust, Alerts & Warranty Features
    {
      id: 'trust-score',
      name: 'Renter Trust Score',
      description: 'View detailed trust scores with verification history and rental stats',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
      badge: '⭐ NEW',
      demo: true,
    },
    {
      id: 'smart-alerts',
      name: 'Smart Alerts System',
      description: 'Personalized notifications for price drops, availability, and deals',
      icon: <Bell className="w-6 h-6" />,
      color: 'from-blue-500 to-indigo-500',
      badge: '⭐ NEW',
      demo: true,
    },
    {
      id: 'bundle-deals',
      name: 'Equipment Bundles',
      description: 'Save up to 30% with pre-configured equipment bundles',
      icon: <Package className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      badge: 'SAVE 30%',
      demo: true,
    },
    {
      id: 'warranty-tracker',
      name: 'Warranty Tracker',
      description: 'Track equipment warranties, service history, and maintenance schedules',
      icon: <Wrench className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      badge: '⭐ NEW',
      demo: true,
    },
    {
      id: 'bulk-booking',
      name: 'Bulk Booking System',
      description: 'Book multiple items at once with volume discounts and shared billing',
      icon: <Users className="w-6 h-6" />,
      color: 'from-teal-500 to-cyan-500',
      badge: 'PRO',
      demo: true,
    },
    {
      id: 'market-insights',
      name: 'Market Insights',
      description: 'Real-time market analytics with demand trends and pricing recommendations',
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-rose-500 to-red-500',
      badge: 'BUSINESS',
      demo: true,
    },
    // Weather, Social & Security Features  
    {
      id: 'weather-advisor',
      name: 'Weather Advisor',
      description: 'Get weather forecasts and rental recommendations based on conditions',
      icon: <Cloud className="w-6 h-6" />,
      color: 'from-sky-500 to-blue-500',
      badge: '🌤️ NEW',
      demo: true,
    },
    {
      id: 'social-proof',
      name: 'Social Proof',
      description: 'See real-time booking activity, recent reviews, and trending equipment',
      icon: <Users className="w-6 h-6" />,
      color: 'from-violet-500 to-purple-500',
      badge: 'POPULAR',
      demo: true,
    },
    {
      id: 'biometric-auth',
      name: 'Biometric Security',
      description: 'Secure your account with fingerprint or face recognition',
      icon: <Fingerprint className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
      badge: '🔒 SECURE',
      demo: true,
    },
    {
      id: 'price-alerts',
      name: 'Price Alerts',
      description: 'Set price alerts and get notified when equipment hits your target',
      icon: <Bell className="w-6 h-6" />,
      color: 'from-orange-500 to-amber-500',
      badge: 'SMART',
      demo: true,
    },
    {
      id: 'smart-recommendations',
      name: 'AI Recommendations',
      description: 'Get personalized equipment suggestions based on your rental history',
      icon: <Brain className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-500',
      badge: 'AI',
      demo: true,
    },
    {
      id: 'achievements',
      name: 'Achievements & Badges',
      description: 'Earn badges and unlock rewards as you rent and review equipment',
      icon: <Trophy className="w-6 h-6" />,
      color: 'from-yellow-500 to-amber-500',
      badge: '🏆 FUN',
      demo: true,
    },
  ];

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => {
        if (selectedCategory === 'booking') return ['smart-scheduler', 'group-booking', 'quick-book', 'bulk-booking', 'bundle-deals'].includes(f.id);
        if (selectedCategory === 'pricing') return ['price-negotiator', 'smart-pricing', 'multi-payment', 'price-alerts', 'market-insights'].includes(f.id);
        if (selectedCategory === 'management') return ['maintenance-predictor', 'referral-program', 'analytics', 'saved-searches', 'comparison', 'warranty-tracker', 'achievements'].includes(f.id);
        if (selectedCategory === 'ai') return ['ai-search', 'price-negotiator', 'maintenance-predictor', 'analytics', 'recommendations', 'live-chat', 'advanced-filters', 'smart-recommendations', 'smart-alerts'].includes(f.id);
        if (selectedCategory === 'security') return ['trust-score', 'biometric-auth', 'social-proof'].includes(f.id);
        return true;
      });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Premium Features</h2>
                <p className="text-teal-100 text-sm">Discover powerful tools to enhance your experience</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[
              { id: 'all', label: 'All Features' },
              { id: 'ai', label: 'AI Powered' },
              { id: 'booking', label: 'Booking' },
              { id: 'pricing', label: 'Pricing' },
              { id: 'management', label: 'Management' },
              { id: 'security', label: 'Security' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as 'all' | 'booking' | 'pricing' | 'management' | 'ai' | 'security')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-white text-teal-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
          <div className="grid grid-cols-2 gap-4">
            {filteredFeatures.map((feature) => (
              <button
                key={feature.id}
                onClick={() => {
                  onFeatureSelect(feature.id);
                  onClose();
                }}
                className="group relative p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-transparent hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>

                  {/* Badge */}
                  {feature.badge && (
                    <span className="absolute top-4 right-4 px-2 py-1 bg-white text-xs font-semibold rounded-full group-hover:bg-opacity-20 transition-colors">
                      {feature.badge}
                    </span>
                  )}

                  {/* Demo Badge */}
                  {feature.demo && (
                    <span className="absolute top-12 right-4 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full group-hover:bg-white/20 group-hover:text-white transition-colors">
                      Try Demo
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-2 transition-colors">
                    {feature.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 group-hover:text-white/90 mb-3 transition-colors">
                    {feature.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-teal-600 group-hover:text-white transition-colors">
                    <span>Try Now</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors" />
                <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors" />
              </button>
            ))}
          </div>

          {/* Feature Comparison */}
          <div className="mt-8 p-5 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Why Use Premium Features?
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">25%</div>
                <p className="text-purple-700">Average Savings</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">2x</div>
                <p className="text-purple-700">Faster Bookings</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">$500+</div>
                <p className="text-purple-700">Referral Earnings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
