import { Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Category, Equipment } from '../types';
import type { PageType } from './types';
import { PageLoader } from './types';
import Footer from '../components/layout/Footer';
import {
  SecurityCenter,
  AnalyticsDashboard,
  AdminPanel,
  NotificationCenter,
  PaymentSettings,
  SubscriptionPlans,
  CarbonFootprintTracker,
  LoyaltyProgram,
  FleetManager,
  AIMatching,
  SmartContracts,
  ARPreview,
  CarbonTracker,
  EquipmentFinancing,
  IoTTelematics,
  AREquipmentVisualization,
  GPSTracking,
  CryptoPayments,
  AIInsurance,
  SustainabilityDashboard,
  SocialCommunities,
  VoiceAIAssistant,
  BlockchainContracts,
  VRTraining,
  DroneDelivery,
  IndustryIntegrations,
  MaintenanceScheduler,
  SchedulingOptimizer,
  ReferralSystem,
  ReferralProgram,
  PWAEnhancedFeatures,
  RenterTrustScore,
  SmartAlertsSystem,
  EquipmentBundleDeals,
  EquipmentWarrantyTracker,
  BulkBookingSystem,
  MarketplaceInsights,
  EquipmentHealthScore,
  RentalCostEstimator,
  SeasonalDeals,
  RentalHistoryTimeline,
  MultiLanguageSupport,
  EquipmentAvailabilityCalendar,
  OwnerRevenueDashboard,
  EquipmentCertificationTracker,
  RentalAgreementGenerator,
  CustomerSupportTickets,
  TermsOfService,
  PrivacyPolicy,
  CookiePolicy,
  RefundPolicy,
  Accessibility,
  CancellationPolicy,
  AboutUs,
  Careers,
  Press,
  Blog,
  Partnerships,
  Investors,
  HelpCenter,
  Safety,
  TrustAndVerification,
  ContactUs,
  PricingCalculator,
  InsuranceOptions,
  HostResources,
  HostCommunity,
} from './lazyComponents';
import BrowsePage from '../components/browse/BrowsePage';
import Dashboard from '../components/dashboard/Dashboard';
import ListEquipmentForm from '../components/listing/ListEquipmentForm';

interface PageRendererProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  categories: Category[];
  equipment: Equipment[];
  searchQuery: string;
  searchCategory: string;
  setSearchQuery: (q: string) => void;
  setSearchCategory: (c: string) => void;
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteToggle: (id: string) => void;
  favorites: Set<string>;
  onListEquipment: () => void;
  onListingSubmit: () => void;
  onNavigate: (page: string) => void;
}

export default function PageRenderer({
  currentPage,
  setCurrentPage,
  categories,
  equipment,
  searchQuery,
  searchCategory,
  setSearchQuery,
  setSearchCategory,
  onEquipmentClick,
  onFavoriteToggle,
  favorites,
  onListEquipment,
  onListingSubmit,
  onNavigate,
}: PageRendererProps) {
  const { user, profile } = useAuth();

  switch (currentPage) {
    case 'browse':
      return (
        <Suspense fallback={<PageLoader />}>
          <BrowsePage
            equipment={equipment}
            categories={categories}
            initialQuery={searchQuery}
            initialCategory={searchCategory}
            onEquipmentClick={onEquipmentClick}
            onFavoriteClick={onFavoriteToggle}
            favorites={favorites}
            onBack={() => {
              setSearchQuery('');
              setSearchCategory('');
              setCurrentPage('home');
            }}
          />
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'dashboard':
      return (
        <Suspense fallback={<PageLoader />}>
          <Dashboard
            onBack={() => setCurrentPage('home')}
            onEquipmentClick={onEquipmentClick}
            onListEquipment={onListEquipment}
          />
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'security':
      return (
        <Suspense fallback={<PageLoader />}>
          <SecurityCenter onBack={() => setCurrentPage('dashboard')} />
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'analytics':
      return (
        <Suspense fallback={<PageLoader />}>
          <AnalyticsDashboard onBack={() => setCurrentPage('dashboard')} />
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'admin':
      if (!profile?.is_admin) return null;
      return (
        <Suspense fallback={<PageLoader />}>
          <AdminPanel onBack={() => setCurrentPage('dashboard')} />
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'notifications':
      return (
        <Suspense fallback={<PageLoader />}>
          <NotificationCenter onBack={() => setCurrentPage('dashboard')} />
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'payments':
      return (
        <Suspense fallback={<PageLoader />}>
          <PaymentSettings onBack={() => setCurrentPage('dashboard')} />
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'subscription':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-violet-50 to-purple-100">
            <div className="max-w-7xl mx-auto px-4">
              <SubscriptionPlans currentPlan="free" onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'sustainability':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="max-w-3xl mx-auto px-4">
              <CarbonFootprintTracker
                userId={user?.id || ''}
                bookings={[
                  { id: '1', equipmentTitle: 'CAT Excavator', category: 'Heavy Equipment', rentalDays: 5, date: new Date('2026-01-15'), carbonSaved: 45, treesEquivalent: 2 },
                  { id: '2', equipmentTitle: 'Sony Camera Kit', category: 'Photography', rentalDays: 3, date: new Date('2026-01-10'), carbonSaved: 12, treesEquivalent: 1 },
                  { id: '3', equipmentTitle: 'DeWalt Tool Kit', category: 'Power Tools', rentalDays: 7, date: new Date('2026-01-05'), carbonSaved: 28, treesEquivalent: 1 },
                ]}
                onClose={() => setCurrentPage('dashboard')}
              />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'loyalty':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <div className="max-w-3xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} aria-label="Back to dashboard" className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </button>
              <LoyaltyProgram userId={user?.id || ''} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'fleet':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100">
            <div className="max-w-6xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} aria-label="Back to dashboard" className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </button>
              <FleetManager ownerId={user?.id || ''} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'ai-matching':
      return (<Suspense fallback={<PageLoader />}><AIMatching onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'smart-contracts':
      return (<Suspense fallback={<PageLoader />}><SmartContracts onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'ar-preview':
      return (<Suspense fallback={<PageLoader />}><ARPreview onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'carbon-tracker':
      return (<Suspense fallback={<PageLoader />}><CarbonTracker onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'equipment-financing':
      return (<Suspense fallback={<PageLoader />}><EquipmentFinancing onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'iot-telematics':
      return (<Suspense fallback={<PageLoader />}><IoTTelematics onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'ar-visualization':
      return (<Suspense fallback={<PageLoader />}><AREquipmentVisualization onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'gps-tracking':
      return (<Suspense fallback={<PageLoader />}><GPSTracking onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'crypto-payments':
      return (<Suspense fallback={<PageLoader />}><CryptoPayments onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'ai-insurance':
      return (<Suspense fallback={<PageLoader />}><AIInsurance onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'sustainability-dashboard':
      return (<Suspense fallback={<PageLoader />}><SustainabilityDashboard onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'social-communities':
      return (<Suspense fallback={<PageLoader />}><SocialCommunities onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'voice-ai-assistant':
      return (<Suspense fallback={<PageLoader />}><VoiceAIAssistant onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'blockchain-contracts':
      return (<Suspense fallback={<PageLoader />}><BlockchainContracts onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'vr-training':
      return (<Suspense fallback={<PageLoader />}><VRTraining onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'drone-delivery':
      return (<Suspense fallback={<PageLoader />}><DroneDelivery onBack={() => setCurrentPage('dashboard')} /></Suspense>);
    case 'industry-integrations':
      return (<Suspense fallback={<PageLoader />}><IndustryIntegrations onBack={() => setCurrentPage('dashboard')} /></Suspense>);

    case 'maintenance':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100">
            <div className="max-w-6xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Dashboard</button>
              <MaintenanceScheduler />
            </div>
          </div>
          <Footer />
        </Suspense>
      );

    case 'scheduler':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="max-w-6xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Dashboard</button>
              <SchedulingOptimizer />
            </div>
          </div>
          <Footer />
        </Suspense>
      );

    case 'referrals':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
            <div className="max-w-4xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Dashboard</button>
              <ReferralSystem />
            </div>
          </div>
          <Footer />
          {/* Referral Program overlay */}
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100" style={{ display: 'none' }}>
            <div className="max-w-4xl mx-auto px-4">
              <ReferralProgram userId={user?.id || ''} userName={user?.email || 'User'} onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
        </Suspense>
      );

    case 'list-equipment':
      return (
        <Suspense fallback={<PageLoader />}>
          <ListEquipmentForm
            categories={categories}
            onClose={() => setCurrentPage('home')}
            onSubmit={onListingSubmit}
          />
        </Suspense>
      );

    case 'pwa':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
            <div className="max-w-4xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Dashboard</button>
              <PWAEnhancedFeatures onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'trust-score':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100">
            <div className="max-w-4xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Dashboard</button>
              <RenterTrustScore userId={user?.id || ''} onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'alerts':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <div className="max-w-4xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Dashboard</button>
              <SmartAlertsSystem userId={user?.id} onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'bundles':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
            <div className="max-w-6xl mx-auto px-4">
              <button onClick={() => setCurrentPage('browse')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Browse</button>
              <EquipmentBundleDeals mode="browse" onClose={() => setCurrentPage('browse')} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'warranties':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="max-w-4xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Dashboard</button>
              <EquipmentWarrantyTracker ownerId={user?.id} onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'bulk-booking':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-6xl mx-auto px-4">
              <button onClick={() => setCurrentPage('browse')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Browse</button>
              <BulkBookingSystem onClose={() => setCurrentPage('browse')} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'insights':
      return (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
            <div className="max-w-6xl mx-auto px-4">
              <button onClick={() => setCurrentPage('dashboard')} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900">← Back to Dashboard</button>
              <MarketplaceInsights onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
          <Footer onNavigate={onNavigate} />
        </Suspense>
      );

    case 'equipment-health':
      return (<Suspense fallback={<PageLoader />}><EquipmentHealthScore onBack={() => setCurrentPage('home')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'cost-estimator':
      return (<Suspense fallback={<PageLoader />}><RentalCostEstimator onBack={() => setCurrentPage('home')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'seasonal-deals':
      return (<Suspense fallback={<PageLoader />}><SeasonalDeals onBack={() => setCurrentPage('home')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'rental-history':
      return (<Suspense fallback={<PageLoader />}><RentalHistoryTimeline onBack={() => setCurrentPage('dashboard')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'multi-language':
      return (<Suspense fallback={<PageLoader />}><MultiLanguageSupport onBack={() => setCurrentPage('home')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'availability-calendar':
      return (<Suspense fallback={<PageLoader />}><EquipmentAvailabilityCalendar onBack={() => setCurrentPage('home')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'revenue-dashboard':
      return (<Suspense fallback={<PageLoader />}><OwnerRevenueDashboard onBack={() => setCurrentPage('dashboard')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'certification-tracker':
      return (<Suspense fallback={<PageLoader />}><EquipmentCertificationTracker onBack={() => setCurrentPage('dashboard')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'agreement-generator':
      return (<Suspense fallback={<PageLoader />}><RentalAgreementGenerator onBack={() => setCurrentPage('dashboard')} /><Footer onNavigate={onNavigate} /></Suspense>);
    case 'support-tickets':
      return (<Suspense fallback={<PageLoader />}><CustomerSupportTickets onBack={() => setCurrentPage('dashboard')} /><Footer onNavigate={onNavigate} /></Suspense>);

    // Legal Pages
    case 'terms':
      return (<Suspense fallback={<PageLoader />}><TermsOfService onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'privacy':
      return (<Suspense fallback={<PageLoader />}><PrivacyPolicy onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'cookies':
      return (<Suspense fallback={<PageLoader />}><CookiePolicy onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'refund':
      return (<Suspense fallback={<PageLoader />}><RefundPolicy onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'accessibility':
      return (<Suspense fallback={<PageLoader />}><Accessibility onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'cancellation':
      return (<Suspense fallback={<PageLoader />}><CancellationPolicy onBack={() => setCurrentPage('home')} /></Suspense>);

    // Company Pages
    case 'about':
      return (<Suspense fallback={<PageLoader />}><AboutUs onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'careers':
      return (<Suspense fallback={<PageLoader />}><Careers onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'press':
      return (<Suspense fallback={<PageLoader />}><Press onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'blog':
      return (<Suspense fallback={<PageLoader />}><Blog onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'partnerships':
      return (<Suspense fallback={<PageLoader />}><Partnerships onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'investors':
      return (<Suspense fallback={<PageLoader />}><Investors onBack={() => setCurrentPage('home')} /></Suspense>);

    // Support Pages
    case 'help':
      return (<Suspense fallback={<PageLoader />}><HelpCenter onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'safety':
      return (<Suspense fallback={<PageLoader />}><Safety onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'trust':
      return (<Suspense fallback={<PageLoader />}><TrustAndVerification onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'contact':
      return (<Suspense fallback={<PageLoader />}><ContactUs onBack={() => setCurrentPage('home')} /></Suspense>);

    // Utility Pages
    case 'pricing-calculator':
      return (<Suspense fallback={<PageLoader />}><PricingCalculator onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'insurance':
      return (<Suspense fallback={<PageLoader />}><InsuranceOptions onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'host-resources':
      return (<Suspense fallback={<PageLoader />}><HostResources onBack={() => setCurrentPage('home')} /></Suspense>);
    case 'host-community':
      return (<Suspense fallback={<PageLoader />}><HostCommunity onBack={() => setCurrentPage('home')} /></Suspense>);

    default:
      return null;
  }
}
