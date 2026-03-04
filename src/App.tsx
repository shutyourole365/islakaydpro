import { useState, useEffect, useCallback, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import type { Category, Equipment } from './types';
import type { PageType } from './routes/types';
import type { ModalState, ModalDataState } from './routes/ModalRenderer';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import Categories from './components/home/Categories';
import FeaturedListings from './components/home/FeaturedListings';
import EquipmentShowcase from './components/home/EquipmentShowcase';
import HowItWorks from './components/home/HowItWorks';
import Testimonials from './components/home/Testimonials';
import CTASection from './components/home/CTASection';
import SearchModal from './components/search/SearchModal';
import EquipmentDetail from './components/equipment/EquipmentDetail';
import AuthModal from './components/auth/AuthModal';
import AIAssistantEnhanced from './components/ai/AIAssistantEnhanced';
import BookingSystem from './components/booking/BookingSystem';
import EquipmentComparison from './components/comparison/EquipmentComparison';
import { SkipLink } from './components/ui/AccessibleComponents';
import QuickActionsMenu from './components/ui/QuickActionsMenu';
import InstallPrompt, { OfflineIndicator } from './components/pwa/InstallPrompt';
import { CookieConsentBanner, CookieSettingsModal } from './components/ui/CookieConsent';
import { useCookieConsent } from './hooks/useCookieConsent';
import { addFavorite, removeFavorite, getEquipment } from './services/database';
import { sampleEquipment, sampleCategories } from './data/sampleData';
import PageRenderer from './routes/PageRenderer';
import ModalRenderer from './routes/ModalRenderer';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { PageLoader } from './routes/types';

function AppContent() {
  const { isAuthenticated, user, signOut } = useAuth();
  const {
    showBanner,
    showSettings,
    settings,
    setShowSettings,
    setSettings,
    acceptAll,
    declineAll,
    saveSettings,
  } = useCookieConsent();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [featuredEquipment, setFeaturedEquipment] = useState<Equipment[]>([]);
  const [isLoadingEquipment, setIsLoadingEquipment] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingEquipment, setBookingEquipment] = useState<Equipment | null>(null);
  const [comparisonItems, setComparisonItems] = useState<Equipment[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // Modal states
  const [modals, setModals] = useState<ModalState>({
    isVoiceSearchOpen: false,
    is3DViewerOpen: false,
    isGroupBookingOpen: false,
    isSplitPaymentOpen: false,
    isInsuranceQuoteOpen: false,
    isDroneTrackingOpen: false,
    isQRCheckInOpen: false,
    isDamageDetectionOpen: false,
    isBlockchainOpen: false,
    isARTutorialOpen: false,
    isSmartPricingOpen: false,
    isLiveTrackerOpen: false,
    isDamageWizardOpen: false,
    isPriceNegotiatorOpen: false,
    isMaintenancePredictorOpen: false,
    isSmartSchedulerOpen: false,
    isFeatureShowcaseOpen: false,
    isAISearchOpen: false,
    isPhotoMessagingOpen: false,
    isEnhancedReviewOpen: false,
    isMultiPaymentOpen: false,
    isLiveChatOpen: false,
    isRealTimeChatOpen: false,
    isEquipmentMapEnhancedOpen: false,
    isAdvancedFiltersOpen: false,
    isDetailedComparisonOpen: false,
    isSavedSearchesOpen: false,
    isRecommendationsOpen: false,
    isQuickBookOpen: false,
    isQRCodeScannerOpen: false,
    isTrustScoreOpen: false,
    isSmartAlertsOpen: false,
    isBundleDealsOpen: false,
    isWarrantyTrackerOpen: false,
    isBulkBookingOpen: false,
    isMarketInsightsOpen: false,
    isWeatherAdvisorOpen: false,
    isSocialProofOpen: false,
    isOnboardingOpen: false,
    isBiometricAuthOpen: false,
    isPriceAlertsOpen: false,
    isSmartRecommendationsOpen: false,
    isAchievementsOpen: false,
  });

  // Modal data states
  const [viewerEquipment, setViewerEquipment] = useState<Equipment | null>(null);
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string; avatar?: string } | null>(null);
  const [reviewEquipment, setReviewEquipment] = useState<Equipment | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [messageConversationId, setMessageConversationId] = useState<string | null>(null);
  const [comparisonEquipment, setComparisonEquipment] = useState<Equipment[]>([]);
  const [quickBookEquipment, setQuickBookEquipment] = useState<Equipment | null>(null);
  // Search filter state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchMinPrice, setSearchMinPrice] = useState<number | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchMaxPrice, setSearchMaxPrice] = useState<number | undefined>(undefined);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_searchCondition, setSearchCondition] = useState<string>('');

  const setModal = useCallback((key: keyof ModalState, value: boolean) => {
    setModals(prev => ({ ...prev, [key]: value }));
  }, []);

  const modalData: ModalDataState = {
    viewerEquipment,
    bookingEquipment,
    chatRecipient,
    selectedEquipment,
    reviewEquipment,
    reviewBookingId,
    messageConversationId,
    comparisonEquipment,
    quickBookEquipment,
  };

  // Fetch equipment from database on mount
  const fetchEquipment = useCallback(async () => {
    setIsLoadingEquipment(true);
    try {
      const { data: featured } = await getEquipment({ featured: true, limit: 8 });
      setFeaturedEquipment(featured.length > 0 ? featured : sampleEquipment);
      const { data: all } = await getEquipment({ limit: 50 });
      setEquipment(all.length > 0 ? all : sampleEquipment);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      setFeaturedEquipment(sampleEquipment);
      setEquipment(sampleEquipment);
    } finally {
      setIsLoadingEquipment(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      import('./services/analytics').then(({ analytics }) => {
        analytics.pageView(`/${currentPage}`, `Islakayd - ${currentPage}`);
      });
    }
  }, [currentPage]);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('favorites')
        .select('equipment_id')
        .eq('user_id', user.id);
      if (data) {
        setFavorites(new Set(data.map(f => f.equipment_id)));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to load favorites:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setFavorites(new Set());
    }
  }, [user, loadFavorites]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        if (import.meta.env.DEV) console.error('Error fetching categories:', error);
        return;
      }

      if (data && data.length > 0) {
        const categoriesWithCounts = await Promise.all(
          data.map(async (cat) => {
            try {
              const { count } = await supabase
                .from('equipment')
                .select('*', { count: 'exact', head: true })
                .eq('category_id', cat.id)
                .eq('is_active', true);
              return { ...cat, equipment_count: count || 0 };
            } catch {
              return { ...cat, equipment_count: 0 };
            }
          })
        );
        setCategories(categoriesWithCounts);
      } else {
        setCategories(sampleCategories);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Error fetching categories:', error);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(false);
    setCurrentPage('browse');
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      import('./services/analytics').then(({ analytics }) => {
        analytics.trackSearch(query, { resultCount: equipment.length || sampleEquipment.length });
      });
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSearchCategory(category.slug);
    setCurrentPage('browse');
  };

  const handleEquipmentClick = (eq: Equipment) => {
    setSelectedEquipment(eq);
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      import('./services/analytics').then(({ analytics }) => {
        analytics.trackEquipmentView(eq.id, eq.title, eq.category?.name || 'Uncategorized');
      });
    }
  };

  const handleFavoriteToggle = async (equipmentId: string) => {
    if (!isAuthenticated || !user) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const isFav = favorites.has(equipmentId);
      if (isFav) {
        await removeFavorite(user.id, equipmentId);
        setFavorites(prev => { const n = new Set(prev); n.delete(equipmentId); return n; });
      } else {
        await addFavorite(user.id, equipmentId);
        setFavorites(prev => new Set(prev).add(equipmentId));
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to toggle favorite:', error);
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleBook = (eq: Equipment) => {
    if (!isAuthenticated) {
      setSelectedEquipment(null);
      setIsAuthOpen(true);
      return;
    }
    setBookingEquipment(eq);
    setIsBookingOpen(true);
    setSelectedEquipment(null);
  };

  const handleBookingComplete = (bookingData: unknown) => {
    if (import.meta.env.DEV) console.log('Booking completed:', bookingData);
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      import('./services/analytics').then(({ analytics }) => {
        const booking = bookingData as { id: string; total_amount: number };
        analytics.trackBooking(booking.id, booking.total_amount, 'USD');
      });
    }
    setIsBookingOpen(false);
    setBookingEquipment(null);
    alert('🎉 Booking confirmed! Check your email for confirmation details.');
  };

  const handleAddToComparison = (eq: Equipment) => {
    if (comparisonItems.length >= 4) { alert('You can compare up to 4 items at a time.'); return; }
    if (comparisonItems.find(item => item.id === eq.id)) { alert('This item is already in your comparison.'); return; }
    setComparisonItems(prev => [...prev, eq]);
    setTimeout(() => {
      if (comparisonItems.length + 1 >= 2) {
        const shouldOpen = window.confirm(`${eq.title} added to comparison! You now have ${comparisonItems.length + 1} items. View comparison now?`);
        if (shouldOpen) setIsComparisonOpen(true);
      }
    }, 100);
  };

  const handleQuickBook = (eq: Equipment) => {
    setQuickBookEquipment(eq);
    setModal('isQuickBookOpen', true);
  };

  const handleRemoveFromComparison = (equipmentId: string) => {
    setComparisonItems(prev => prev.filter(item => item.id !== equipmentId));
  };

  const handleMessage = async (eq: Equipment) => {
    if (!isAuthenticated || !user) {
      setSelectedEquipment(null);
      setIsAuthOpen(true);
      return;
    }
    setChatRecipient({
      id: eq.owner_id,
      name: eq.owner?.full_name || 'Equipment Owner',
      avatar: eq.owner?.avatar_url || undefined,
    });
    setSelectedEquipment(null);
    setModal('isLiveChatOpen', true);
  };

  const handleFeatureSelect = (featureId: string) => {
    if (!isAuthenticated) { setIsAuthOpen(true); return; }
    const demoEquipment = equipment[0] || featuredEquipment[0] || sampleEquipment[0];
    setBookingEquipment(demoEquipment);

    // Map feature IDs to modal states
    const modalMap: Record<string, keyof ModalState> = {
      'price-negotiator': 'isPriceNegotiatorOpen',
      'smart-scheduler': 'isSmartSchedulerOpen',
      'maintenance-predictor': 'isMaintenancePredictorOpen',
      'smart-pricing': 'isSmartPricingOpen',
      'group-booking': 'isGroupBookingOpen',
      'ai-search': 'isAISearchOpen',
      'multi-payment': 'isMultiPaymentOpen',
      'trust-score': 'isTrustScoreOpen',
      'smart-alerts': 'isSmartAlertsOpen',
      'bundle-deals': 'isBundleDealsOpen',
      'warranty-tracker': 'isWarrantyTrackerOpen',
      'bulk-booking': 'isBulkBookingOpen',
      'market-insights': 'isMarketInsightsOpen',
      'weather-advisor': 'isWeatherAdvisorOpen',
      'social-proof': 'isSocialProofOpen',
      'onboarding': 'isOnboardingOpen',
      'biometric-auth': 'isBiometricAuthOpen',
      'price-alerts': 'isPriceAlertsOpen',
      'smart-recommendations': 'isSmartRecommendationsOpen',
      'achievements': 'isAchievementsOpen',
      'qr-code-scanner': 'isQRCodeScannerOpen',
      'advanced-filters': 'isAdvancedFiltersOpen',
      'saved-searches': 'isSavedSearchesOpen',
      'recommendations': 'isRecommendationsOpen',
    };

    // Map feature IDs to page navigations
    const pageMap: Record<string, PageType> = {
      'referral-program': 'referrals',
      'analytics': 'analytics',
      'pwa-features': 'pwa',
      'ai-matching': 'ai-matching',
      'smart-contracts': 'smart-contracts',
      'ar-preview': 'ar-preview',
      'carbon-tracker': 'carbon-tracker',
      'equipment-financing': 'equipment-financing',
      'iot-telematics': 'iot-telematics',
      'ar-visualization': 'ar-visualization',
      'gps-tracking': 'gps-tracking',
      'crypto-payments': 'crypto-payments',
      'ai-insurance': 'ai-insurance',
      'sustainability-dashboard': 'sustainability-dashboard',
      'social-communities': 'social-communities',
      'voice-ai-assistant': 'voice-ai-assistant',
      'blockchain-contracts': 'blockchain-contracts',
      'vr-training': 'vr-training',
      'drone-delivery': 'drone-delivery',
      'industry-integrations': 'industry-integrations',
      'equipment-health': 'equipment-health',
      'cost-estimator': 'cost-estimator',
      'seasonal-deals': 'seasonal-deals',
      'rental-history': 'rental-history',
      'multi-language': 'multi-language',
      'availability-calendar': 'availability-calendar',
      'revenue-dashboard': 'revenue-dashboard',
      'certification-tracker': 'certification-tracker',
      'agreement-generator': 'agreement-generator',
      'support-tickets': 'support-tickets',
    };

    if (modalMap[featureId]) {
      setModal(modalMap[featureId], true);
    } else if (pageMap[featureId]) {
      setCurrentPage(pageMap[featureId]);
    } else {
      // Special cases
      switch (featureId) {
        case 'photo-messaging':
          setModal('isPhotoMessagingOpen', true);
          setMessageConversationId('demo-conversation-123');
          break;
        case 'enhanced-reviews':
          setModal('isEnhancedReviewOpen', true);
          setReviewEquipment(demoEquipment);
          setReviewBookingId('demo-booking-123');
          break;
        case 'live-chat':
          setChatRecipient({ id: demoEquipment.owner_id, name: demoEquipment.owner?.full_name || 'Equipment Owner', avatar: demoEquipment.owner?.avatar_url || undefined });
          setModal('isLiveChatOpen', true);
          break;
        case 'real-time-chat':
          setChatRecipient({ id: demoEquipment.owner_id, name: demoEquipment.owner?.full_name || 'Equipment Owner', avatar: demoEquipment.owner?.avatar_url || undefined });
          setModal('isRealTimeChatOpen', true);
          break;
        case 'enhanced-map':
          setModal('isEquipmentMapEnhancedOpen', true);
          break;
        case 'comparison': {
          const compareItems = equipment.length >= 3 ? [equipment[0], equipment[1], equipment[2]] : sampleEquipment.slice(0, 3);
          setComparisonEquipment(compareItems);
          setModal('isDetailedComparisonOpen', true);
          break;
        }
        case 'quick-book':
          setQuickBookEquipment(demoEquipment);
          setModal('isQuickBookOpen', true);
          break;
        case '3d-viewer':
          setViewerEquipment(demoEquipment);
          setModal('is3DViewerOpen', true);
          break;
        default:
          alert(`${featureId} feature coming soon!`);
      }
    }
    setModal('isFeatureShowcaseOpen', false);
  };

  const handleListEquipment = () => {
    if (!isAuthenticated) { setIsAuthOpen(true); return; }
    setCurrentPage('list-equipment');
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentPage('home');
  };

  const handleListingSubmit = () => {
    alert('Equipment listed successfully! It will be visible to renters shortly.');
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* PWA Components */}
      <InstallPrompt />
      <OfflineIndicator />

      {currentPage !== 'list-equipment' && (
        <Header
          onSearchClick={() => setIsSearchOpen(true)}
          onAuthClick={() => setIsAuthOpen(true)}
          isAuthenticated={isAuthenticated}
          onNavigate={handleNavigate}
          onListEquipment={handleListEquipment}
          onSignOut={handleSignOut}
          currentPage={currentPage}
        />
      )}

      {/* Home Page */}
      {currentPage === 'home' && (
        <>
          <main>
            <Hero onSearch={handleSearch} />
            <EquipmentShowcase
              equipment={featuredEquipment.slice(0, 5)}
              onEquipmentClick={handleEquipmentClick}
              onFavoriteClick={handleFavoriteToggle}
              favorites={favorites}
              onAddToComparison={handleAddToComparison}
              onQuickBook={handleQuickBook}
              showDetailedPreview={true}
            />
            <Categories categories={categories} onCategoryClick={handleCategoryClick} />
            <FeaturedListings
              equipment={featuredEquipment}
              onEquipmentClick={handleEquipmentClick}
              onFavoriteClick={handleFavoriteToggle}
              favorites={favorites}
              onAddToComparison={handleAddToComparison}
              isLoading={isLoadingEquipment}
            />
            <HowItWorks />
            <Testimonials />
            <CTASection onGetStarted={() => setIsAuthOpen(true)} />
          </main>
          <Footer onNavigate={handleNavigate} />
        </>
      )}

      {/* Page Router */}
      {currentPage !== 'home' && (
        <PageRenderer
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          categories={categories}
          equipment={equipment}
          searchQuery={searchQuery}
          searchCategory={searchCategory}
          setSearchQuery={setSearchQuery}
          setSearchCategory={setSearchCategory}
          onEquipmentClick={handleEquipmentClick}
          onFavoriteToggle={handleFavoriteToggle}
          favorites={favorites}
          onListEquipment={handleListEquipment}
          onListingSubmit={handleListingSubmit}
          onNavigate={handleNavigate}
        />
      )}

      {/* AI Assistant */}
      {currentPage !== 'list-equipment' && (
        <Suspense fallback={null}>
          <AIAssistantEnhanced />
        </Suspense>
      )}

      {/* Search Modal */}
      <Suspense fallback={null}>
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={handleSearch} />
      </Suspense>

      {/* Auth Modal */}
      <Suspense fallback={null}>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} onSuccess={() => setIsAuthOpen(false)} />
      </Suspense>

      {/* Equipment Detail */}
      {selectedEquipment && (
        <Suspense fallback={<PageLoader />}>
          <EquipmentDetail
            equipment={selectedEquipment}
            onClose={() => setSelectedEquipment(null)}
            onBook={handleBook}
            onMessage={handleMessage}
            isFavorite={favorites.has(selectedEquipment.id)}
            onFavoriteToggle={() => handleFavoriteToggle(selectedEquipment.id)}
          />
        </Suspense>
      )}

      {/* Booking System Modal */}
      {isBookingOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <BookingSystem
            equipment={bookingEquipment}
            onClose={() => { setIsBookingOpen(false); setBookingEquipment(null); }}
            onComplete={handleBookingComplete}
          />
        </Suspense>
      )}

      {/* Equipment Comparison Modal */}
      {isComparisonOpen && comparisonItems.length > 0 && (
        <Suspense fallback={<PageLoader />}>
          <EquipmentComparison
            items={comparisonItems}
            onClose={() => setIsComparisonOpen(false)}
            onRemove={handleRemoveFromComparison}
            onBook={(eq) => { setIsComparisonOpen(false); setBookingEquipment(eq); setIsBookingOpen(true); }}
          />
        </Suspense>
      )}

      {/* Comparison Floating Button */}
      {comparisonItems.length > 0 && !isComparisonOpen && (
        <button
          onClick={() => setIsComparisonOpen(true)}
          className="fixed bottom-24 right-6 z-40 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <span className="text-lg">⚖️</span>
          <span className="font-medium">Compare ({comparisonItems.length})</span>
        </button>
      )}

      {/* Quick Actions Menu */}
      {currentPage !== 'list-equipment' && isAuthenticated && (
        <QuickActionsMenu onNavigate={handleNavigate} unreadMessages={3} unreadNotifications={5} />
      )}

      {/* Skip Link for Accessibility */}
      <SkipLink />

      {/* All Premium Feature Modals */}
      <ModalRenderer
        modals={modals}
        data={modalData}
        equipment={equipment}
        favorites={favorites}
        setModal={setModal}
        setSelectedEquipment={setSelectedEquipment}
        setBookingEquipment={setBookingEquipment}
        setViewerEquipment={setViewerEquipment}
        setChatRecipient={setChatRecipient}
        setReviewEquipment={setReviewEquipment}
        setReviewBookingId={setReviewBookingId}
        setMessageConversationId={setMessageConversationId}
        setComparisonEquipment={setComparisonEquipment}
        setQuickBookEquipment={setQuickBookEquipment}
        setIsBookingOpen={setIsBookingOpen}
        handleSearch={handleSearch}
        handleFeatureSelect={handleFeatureSelect}
        setSearchQuery={setSearchQuery}
        setSearchCategory={setSearchCategory}
        setCurrentPage={(page) => setCurrentPage(page as PageType)}
        setSearchMinPrice={setSearchMinPrice}
        setSearchMaxPrice={setSearchMaxPrice}
        setSearchCondition={setSearchCondition}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* Feature Showcase Floating Button */}
      {currentPage !== 'list-equipment' && isAuthenticated && (
        <button
          aria-label="Open premium features"
          onClick={() => setModal('isFeatureShowcaseOpen', true)}
          className="fixed bottom-6 left-6 z-40 group"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-14 h-14 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs font-bold text-white">✨</span>
            </div>
          </div>
          <div className="absolute bottom-full left-0 mb-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Premium Features
            <div className="absolute top-full left-6 transform -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
          </div>
        </button>
      )}

      {/* Cookie Consent */}
      {showBanner && (
        <CookieConsentBanner onAccept={acceptAll} onDecline={declineAll} onCustomize={() => setShowSettings(true)} />
      )}
      <CookieSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={setSettings} onSave={saveSettings} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
