import { Suspense } from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Equipment, SearchFilters } from '../types';
import { PageLoader } from './types';
import {
  GroupBooking,
  DroneDeliveryTracking,
  QRCheckInOut,
  BlockchainContract,
  AIDamageDetection,
  SplitPayment,
  InstantInsuranceQuote,
  SmartPricingEngine,
  Equipment3DViewer,
  VoiceSearch,
  LiveLocationTracker,
  DamageReportWizard,
  EquipmentMapEnhanced,
  PriceNegotiator,
  MaintenancePredictor,
  SmartScheduler,
  AISearchEngine,
  PhotoMessaging,
  EnhancedReviewSystem,
  MultiPaymentSystem,
  LiveChat,
  AdvancedFilters,
  DetailedComparison,
  SavedSearches,
  EquipmentRecommendations,
  QRCodeScanner,
  QuickBook,
  RenterTrustScore,
  SmartAlertsSystem,
  EquipmentBundleDeals,
  EquipmentWarrantyTracker,
  BulkBookingSystem,
  MarketplaceInsights,
  WeatherAdvisor,
  SocialProof,
  OnboardingFlow,
  BiometricAuth,
  PriceAlerts,
  SmartRecommendations,
  AchievementsSystem,
} from './lazyComponents';
import FeatureShowcase from '../components/ui/FeatureShowcase';

export interface ModalState {
  isVoiceSearchOpen: boolean;
  is3DViewerOpen: boolean;
  isGroupBookingOpen: boolean;
  isSplitPaymentOpen: boolean;
  isInsuranceQuoteOpen: boolean;
  isDroneTrackingOpen: boolean;
  isQRCheckInOpen: boolean;
  isDamageDetectionOpen: boolean;
  isBlockchainOpen: boolean;
  isARTutorialOpen: boolean;
  isSmartPricingOpen: boolean;
  isLiveTrackerOpen: boolean;
  isDamageWizardOpen: boolean;
  isPriceNegotiatorOpen: boolean;
  isMaintenancePredictorOpen: boolean;
  isSmartSchedulerOpen: boolean;
  isFeatureShowcaseOpen: boolean;
  isAISearchOpen: boolean;
  isPhotoMessagingOpen: boolean;
  isEnhancedReviewOpen: boolean;
  isMultiPaymentOpen: boolean;
  isLiveChatOpen: boolean;
  isRealTimeChatOpen: boolean;
  isEquipmentMapEnhancedOpen: boolean;
  isAdvancedFiltersOpen: boolean;
  isDetailedComparisonOpen: boolean;
  isSavedSearchesOpen: boolean;
  isRecommendationsOpen: boolean;
  isQuickBookOpen: boolean;
  isQRCodeScannerOpen: boolean;
  isTrustScoreOpen: boolean;
  isSmartAlertsOpen: boolean;
  isBundleDealsOpen: boolean;
  isWarrantyTrackerOpen: boolean;
  isBulkBookingOpen: boolean;
  isMarketInsightsOpen: boolean;
  isWeatherAdvisorOpen: boolean;
  isSocialProofOpen: boolean;
  isOnboardingOpen: boolean;
  isBiometricAuthOpen: boolean;
  isPriceAlertsOpen: boolean;
  isSmartRecommendationsOpen: boolean;
  isAchievementsOpen: boolean;
}

export interface ModalDataState {
  viewerEquipment: Equipment | null;
  bookingEquipment: Equipment | null;
  chatRecipient: { id: string; name: string; avatar?: string } | null;
  selectedEquipment: Equipment | null;
  reviewEquipment: Equipment | null;
  reviewBookingId: string | null;
  messageConversationId: string | null;
  comparisonEquipment: Equipment[];
  quickBookEquipment: Equipment | null;
}

interface ModalRendererProps {
  modals: ModalState;
  data: ModalDataState;
  equipment: Equipment[];
  favorites: Set<string>;
  setModal: (key: keyof ModalState, value: boolean) => void;
  setSelectedEquipment: (eq: Equipment | null) => void;
  setBookingEquipment: (eq: Equipment | null) => void;
  setViewerEquipment: (eq: Equipment | null) => void;
  setChatRecipient: (r: { id: string; name: string; avatar?: string } | null) => void;
  setReviewEquipment: (eq: Equipment | null) => void;
  setReviewBookingId: (id: string | null) => void;
  setMessageConversationId: (id: string | null) => void;
  setComparisonEquipment: (items: Equipment[] | ((prev: Equipment[]) => Equipment[])) => void;
  setQuickBookEquipment: (eq: Equipment | null) => void;
  setIsBookingOpen: (open: boolean) => void;
  handleSearch: (query: string) => void;
  handleFeatureSelect: (featureId: string) => void;
  setSearchQuery: (q: string) => void;
  setSearchCategory: (c: string) => void;
  setCurrentPage: (page: string) => void;
  setSearchMinPrice: (p: number | undefined) => void;
  setSearchMaxPrice: (p: number | undefined) => void;
  setSearchCondition: (c: string) => void;
  onFavoriteToggle: (id: string) => void;
}

export default function ModalRenderer({
  modals,
  data,
  equipment,
  favorites,
  setModal,
  setSelectedEquipment,
  setBookingEquipment,
  setViewerEquipment,
  setChatRecipient,
  setReviewEquipment,
  setReviewBookingId,
  setMessageConversationId,
  setComparisonEquipment,
  setQuickBookEquipment,
  setIsBookingOpen,
  handleSearch,
  handleFeatureSelect,
  setSearchQuery,
  setSearchCategory,
  setCurrentPage,
  setSearchMinPrice,
  setSearchMaxPrice,
  setSearchCondition,
  onFavoriteToggle,
}: ModalRendererProps) {
  const { user } = useAuth();

  return (
    <>
      {/* Voice Search Modal */}
      {modals.isVoiceSearchOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isVoiceSearchOpen', false)} />
            <div className="relative z-10 w-full max-w-lg">
              <VoiceSearch onSearch={(query) => { setModal('isVoiceSearchOpen', false); handleSearch(query); }} />
            </div>
          </div>
        </Suspense>
      )}

      {/* 3D Equipment Viewer Modal */}
      {modals.is3DViewerOpen && data.viewerEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('is3DViewerOpen', false)} />
            <div className="relative z-10 w-full max-w-4xl">
              <Equipment3DViewer
                images={data.viewerEquipment.images}
                title={data.viewerEquipment.title}
                onClose={() => { setModal('is3DViewerOpen', false); setViewerEquipment(null); }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Group Booking Modal */}
      {modals.isGroupBookingOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isGroupBookingOpen', false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <GroupBooking
                equipmentId={data.bookingEquipment.id}
                equipmentTitle={data.bookingEquipment.title}
                dailyRate={data.bookingEquipment.daily_rate}
                onClose={() => { setModal('isGroupBookingOpen', false); setBookingEquipment(null); }}
                onComplete={(d) => { console.log('Group booking:', d); setModal('isGroupBookingOpen', false); alert('Group booking confirmed!'); }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Split Payment Modal */}
      {modals.isSplitPaymentOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isSplitPaymentOpen', false)} />
            <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <SplitPayment
                totalAmount={1250}
                bookingId="demo-booking-123"
                equipmentTitle="CAT 320 Excavator"
                onClose={() => setModal('isSplitPaymentOpen', false)}
                onComplete={(d) => { console.log('Split payment:', d); setModal('isSplitPaymentOpen', false); alert('Payment split configured!'); }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Instant Insurance Quote Modal */}
      {modals.isInsuranceQuoteOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isInsuranceQuoteOpen', false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <InstantInsuranceQuote
                equipmentId={data.bookingEquipment.id}
                equipmentTitle={data.bookingEquipment.title}
                equipmentValue={data.bookingEquipment.daily_rate * 30}
                dailyRate={data.bookingEquipment.daily_rate}
                rentalDays={7}
                onClose={() => setModal('isInsuranceQuoteOpen', false)}
                onSelect={(plan) => { console.log('Insurance plan:', plan); setModal('isInsuranceQuoteOpen', false); alert(`${plan.name} insurance selected!`); }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Drone Delivery Tracking Modal */}
      {modals.isDroneTrackingOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isDroneTrackingOpen', false)} />
            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <DroneDeliveryTracking
                bookingId="demo-booking-123"
                equipmentTitle="CAT 320 Excavator"
                pickupLocation={{ address: '123 Equipment Way, LA', lat: 34.0522, lng: -118.2437 }}
                deliveryLocation={{ address: '456 Construction Site, LA', lat: 34.0622, lng: -118.2537 }}
                estimatedDelivery={new Date(Date.now() + 3600000)}
                onClose={() => setModal('isDroneTrackingOpen', false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* QR Check-In/Out Modal */}
      {modals.isQRCheckInOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isQRCheckInOpen', false)} />
            <div className="relative z-10 w-full max-w-md">
              <QRCheckInOut
                bookingId="demo-booking-123"
                equipmentId={data.bookingEquipment?.id || 'demo-equipment'}
                equipmentTitle="CAT 320 Excavator"
                mode="check-in"
                onComplete={(result) => { console.log('QR check result:', result); setModal('isQRCheckInOpen', false); alert('Check-in successful!'); }}
                onClose={() => setModal('isQRCheckInOpen', false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* AI Damage Detection Modal */}
      {modals.isDamageDetectionOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isDamageDetectionOpen', false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <AIDamageDetection
                equipmentId={data.bookingEquipment.id}
                equipmentTitle={data.bookingEquipment.title}
                type="post-rental"
                onComplete={(report) => { console.log('Damage report:', report); setModal('isDamageDetectionOpen', false); alert('Inspection complete!'); }}
                onClose={() => setModal('isDamageDetectionOpen', false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Blockchain Contract Modal */}
      {modals.isBlockchainOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isBlockchainOpen', false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <BlockchainContract
                bookingId="demo-booking-123"
                renterId={user?.id || ''}
                ownerId={data.bookingEquipment.owner_id}
                equipmentId={data.bookingEquipment.id}
                equipmentTitle={data.bookingEquipment.title}
                startDate={new Date()}
                endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                totalAmount={data.bookingEquipment.daily_rate * 7}
                depositAmount={data.bookingEquipment.deposit_amount}
                terms={{
                  cancellationPolicy: '48 hours notice required for full refund',
                  damagePolicy: 'Renter responsible for damages beyond normal wear',
                  usageRules: ['Equipment must be operated by trained personnel', 'No use for illegal activities'],
                  insuranceCoverage: 'Comprehensive damage protection included',
                  disputeResolution: 'Mediation followed by arbitration if needed'
                }}
                onSign={(signature) => { console.log('Contract signed:', signature); setModal('isBlockchainOpen', false); alert('Smart contract signed!'); }}
                onClose={() => setModal('isBlockchainOpen', false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Smart Pricing Engine Modal */}
      {modals.isSmartPricingOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isSmartPricingOpen', false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <button aria-label="Close smart pricing" onClick={() => setModal('isSmartPricingOpen', false)} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">✕</button>
              <SmartPricingEngine equipment={data.bookingEquipment} onPriceChange={(prices) => console.log('New prices:', prices)} />
            </div>
          </div>
        </Suspense>
      )}

      {/* Live Location Tracker Modal */}
      {modals.isLiveTrackerOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isLiveTrackerOpen', false)} />
            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <button aria-label="Close live tracker" onClick={() => setModal('isLiveTrackerOpen', false)} className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">✕</button>
              <LiveLocationTracker equipmentLocation={{ address: '123 Equipment Way, Los Angeles, CA 90001', lat: 34.0522, lng: -118.2437 }} pickupTime={new Date(Date.now() + 1800000)} />
            </div>
          </div>
        </Suspense>
      )}

      {/* Damage Report Wizard Modal */}
      {modals.isDamageWizardOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isDamageWizardOpen', false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <DamageReportWizard
                bookingId="demo-booking-123"
                equipmentTitle={data.bookingEquipment.title}
                equipmentImages={data.bookingEquipment.images}
                depositAmount={data.bookingEquipment.deposit_amount}
                onComplete={(report) => { console.log('Damage report:', report); setModal('isDamageWizardOpen', false); alert('Return inspection complete!'); }}
                onClose={() => setModal('isDamageWizardOpen', false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Price Negotiator Modal */}
      {modals.isPriceNegotiatorOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <PriceNegotiator
            equipmentId={data.bookingEquipment.id}
            equipmentTitle={data.bookingEquipment.title}
            originalDailyRate={data.bookingEquipment.daily_rate}
            rentalDays={7}
            ownerId={data.bookingEquipment.owner_id}
            ownerName={data.bookingEquipment.owner?.full_name || 'Owner'}
            onAccepted={(finalPrice: number) => { console.log('Negotiation accepted:', finalPrice); setModal('isPriceNegotiatorOpen', false); alert(`Offer accepted! Final price: $${finalPrice.toFixed(2)}`); }}
            onRejected={() => { setModal('isPriceNegotiatorOpen', false); alert('Negotiation ended'); }}
            onClose={() => setModal('isPriceNegotiatorOpen', false)}
          />
        </Suspense>
      )}

      {/* Maintenance Predictor Modal */}
      {modals.isMaintenancePredictorOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <MaintenancePredictor
            equipmentId={data.bookingEquipment.id}
            equipmentTitle={data.bookingEquipment.title}
            category={data.bookingEquipment.category?.name || 'Equipment'}
            hoursUsed={1850}
            lastMaintenanceDate={new Date('2025-12-10')}
            onScheduleMaintenance={(date: Date, type: string) => { console.log('Maintenance scheduled:', date, type); setModal('isMaintenancePredictorOpen', false); alert(`Maintenance scheduled: ${type} on ${date.toLocaleDateString()}`); }}
            onClose={() => setModal('isMaintenancePredictorOpen', false)}
          />
        </Suspense>
      )}

      {/* Smart Scheduler Modal */}
      {modals.isSmartSchedulerOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <SmartScheduler
            equipmentId={data.bookingEquipment.id}
            equipmentTitle={data.bookingEquipment.title}
            dailyRate={data.bookingEquipment.daily_rate}
            onSelectDates={(start: Date, end: Date, discount: number) => {
              console.log('Smart schedule:', start, end, discount);
              setModal('isSmartSchedulerOpen', false);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
              const total = data.bookingEquipment!.daily_rate * days * (1 - discount / 100);
              alert(`Booking optimized! ${days} days at ${discount}% off. Total: $${total.toFixed(2)}`);
            }}
            onClose={() => setModal('isSmartSchedulerOpen', false)}
          />
        </Suspense>
      )}

      {/* Feature Showcase Modal */}
      {modals.isFeatureShowcaseOpen && (
        <Suspense fallback={<PageLoader />}>
          <FeatureShowcase onFeatureSelect={handleFeatureSelect} onClose={() => setModal('isFeatureShowcaseOpen', false)} />
        </Suspense>
      )}

      {/* AI Search Engine Modal */}
      {modals.isAISearchOpen && (
        <Suspense fallback={<PageLoader />}>
          <AISearchEngine
            onSearch={(query, filters) => { setModal('isAISearchOpen', false); setSearchQuery(query); setSearchCategory(filters.category || ''); setCurrentPage('browse'); }}
            onClose={() => setModal('isAISearchOpen', false)}
          />
        </Suspense>
      )}

      {/* Photo Messaging Modal */}
      {modals.isPhotoMessagingOpen && data.messageConversationId && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isPhotoMessagingOpen', false)} />
            <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <PhotoMessaging
                conversationId={data.messageConversationId}
                onSendMessage={async (content, photos) => { console.log('Message sent:', { content, photos }); setModal('isPhotoMessagingOpen', false); alert('Message with photos sent successfully!'); }}
                onClose={() => { setModal('isPhotoMessagingOpen', false); setMessageConversationId(null); }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Enhanced Review System Modal */}
      {modals.isEnhancedReviewOpen && data.reviewEquipment && data.reviewBookingId && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isEnhancedReviewOpen', false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <EnhancedReviewSystem
                equipmentId={data.reviewEquipment.id}
                equipmentTitle={data.reviewEquipment.title}
                bookingId={data.reviewBookingId}
                onSubmit={async (reviewData) => { console.log('Review submitted:', reviewData); setModal('isEnhancedReviewOpen', false); setReviewEquipment(null); setReviewBookingId(null); alert('Thank you for your detailed review!'); }}
                onClose={() => { setModal('isEnhancedReviewOpen', false); setReviewEquipment(null); setReviewBookingId(null); }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Multi-Payment System Modal */}
      {modals.isMultiPaymentOpen && data.bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isMultiPaymentOpen', false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <MultiPaymentSystem
                bookingId="demo-booking-123"
                totalAmount={data.bookingEquipment.daily_rate * 7}
                depositAmount={data.bookingEquipment.deposit_amount}
                onPaymentComplete={async (paymentData) => { console.log('Payment completed:', paymentData); setModal('isMultiPaymentOpen', false); alert(`Payment successful! Method: ${paymentData.method}`); }}
                onClose={() => setModal('isMultiPaymentOpen', false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Live Chat Modal */}
      {modals.isLiveChatOpen && data.chatRecipient && (
        <Suspense fallback={<PageLoader />}>
          <LiveChat
            recipientId={data.chatRecipient.id}
            recipientName={data.chatRecipient.name}
            recipientAvatar={data.chatRecipient.avatar}
            equipmentId={data.selectedEquipment?.id}
            onClose={() => { setModal('isLiveChatOpen', false); setChatRecipient(null); }}
          />
        </Suspense>
      )}

      {/* Real Time Chat Modal */}
      {modals.isRealTimeChatOpen && data.chatRecipient && (
        <Suspense fallback={<PageLoader />}>
          <LiveChat
            recipientId={data.chatRecipient.id}
            recipientName={data.chatRecipient.name}
            equipmentId={data.selectedEquipment?.id}
            onClose={() => { setModal('isRealTimeChatOpen', false); setChatRecipient(null); }}
          />
        </Suspense>
      )}

      {/* Enhanced Equipment Map Modal */}
      {modals.isEquipmentMapEnhancedOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal('isEquipmentMapEnhancedOpen', false)} />
            <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-hidden">
              <EquipmentMapEnhanced
                equipment={equipment}
                onEquipmentClick={(eq: Equipment) => { setSelectedEquipment(eq); setModal('isEquipmentMapEnhancedOpen', false); }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Advanced Filters Modal */}
      {modals.isAdvancedFiltersOpen && (
        <Suspense fallback={<PageLoader />}>
          <AdvancedFilters
            onApply={(filters) => {
              setSearchMinPrice(filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined);
              setSearchMaxPrice(filters.priceRange[1] < 1000 ? filters.priceRange[1] : undefined);
              setSearchCondition(filters.condition.length > 0 ? filters.condition[0] : '');
              if (filters.location?.address) setSearchQuery(filters.location.address);
              setModal('isAdvancedFiltersOpen', false);
              setCurrentPage('browse');
            }}
            onClose={() => setModal('isAdvancedFiltersOpen', false)}
          />
        </Suspense>
      )}

      {/* Detailed Comparison Modal */}
      {modals.isDetailedComparisonOpen && data.comparisonEquipment.length > 0 && (
        <Suspense fallback={<PageLoader />}>
          <DetailedComparison
            items={data.comparisonEquipment}
            onClose={() => { setModal('isDetailedComparisonOpen', false); setComparisonEquipment([]); }}
            onRemove={(id) => setComparisonEquipment((items) => items.filter(i => i.id !== id))}
            onBook={(eq) => { setSelectedEquipment(eq); setIsBookingOpen(true); setModal('isDetailedComparisonOpen', false); }}
          />
        </Suspense>
      )}

      {/* Saved Searches Modal */}
      {modals.isSavedSearchesOpen && (
        <Suspense fallback={<PageLoader />}>
          <SavedSearches
            onClose={() => setModal('isSavedSearchesOpen', false)}
            onSearchClick={(filters: Partial<SearchFilters> & { query?: string; priceRange?: [number, number] }) => {
              if (filters.query) setSearchQuery(filters.query);
              if (filters.category) setSearchCategory(filters.category as string);
              if (filters.priceRange) {
                setSearchMinPrice(filters.priceRange[0] > 0 ? filters.priceRange[0] : undefined);
                setSearchMaxPrice(filters.priceRange[1] < 10000 ? filters.priceRange[1] : undefined);
              }
              setModal('isSavedSearchesOpen', false);
              setCurrentPage('browse');
            }}
          />
        </Suspense>
      )}

      {/* Equipment Recommendations Modal */}
      {modals.isRecommendationsOpen && (
        <Suspense fallback={<PageLoader />}>
          <EquipmentRecommendations
            currentEquipment={data.selectedEquipment || undefined}
            userLocation={user?.user_metadata?.location}
            onEquipmentClick={(eq) => { setSelectedEquipment(eq); setModal('isRecommendationsOpen', false); }}
            onFavoriteClick={(id) => onFavoriteToggle(id)}
            favorites={favorites}
          />
        </Suspense>
      )}

      {/* Quick Book Modal */}
      {modals.isQuickBookOpen && data.quickBookEquipment && (
        <Suspense fallback={<PageLoader />}>
          <QuickBook
            equipment={data.quickBookEquipment}
            lastBookingDates={{
              startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
              endDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
            }}
            savedPaymentMethod={{ type: 'card', last4: '4242' }}
            onConfirm={(bookingData) => { console.log('Quick booking confirmed:', bookingData); setModal('isQuickBookOpen', false); alert('Booking confirmed! Check your email for details.'); }}
            onClose={() => { setModal('isQuickBookOpen', false); setQuickBookEquipment(null); }}
          />
        </Suspense>
      )}

      {/* New Feature Modals */}
      {modals.isTrustScoreOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <RenterTrustScore userId={user?.id || ''} onClose={() => setModal('isTrustScoreOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isSmartAlertsOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <SmartAlertsSystem userId={user?.id} onClose={() => setModal('isSmartAlertsOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isBundleDealsOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <EquipmentBundleDeals mode="browse" onClose={() => setModal('isBundleDealsOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isWarrantyTrackerOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <EquipmentWarrantyTracker ownerId={user?.id} onClose={() => setModal('isWarrantyTrackerOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isBulkBookingOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <BulkBookingSystem onClose={() => setModal('isBulkBookingOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isMarketInsightsOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <MarketplaceInsights onClose={() => setModal('isMarketInsightsOpen', false)} />
          </div>
        </Suspense>
      )}

      {/* Additional Feature Modals */}
      {modals.isWeatherAdvisorOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <WeatherAdvisor location={data.bookingEquipment?.location || 'San Francisco, CA'} startDate={new Date().toISOString()} endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()} onClose={() => setModal('isWeatherAdvisorOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isSocialProofOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <SocialProof equipmentId={data.bookingEquipment?.id || 'demo'} onClose={() => setModal('isSocialProofOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isOnboardingOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <OnboardingFlow userType="renter" onComplete={() => setModal('isOnboardingOpen', false)} onSkip={() => setModal('isOnboardingOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isBiometricAuthOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <BiometricAuth onSuccess={() => { setModal('isBiometricAuthOpen', false); alert('Biometric authentication successful!'); }} onCancel={() => setModal('isBiometricAuthOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isPriceAlertsOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <PriceAlerts userId={user?.id || ''} onClose={() => setModal('isPriceAlertsOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isSmartRecommendationsOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <SmartRecommendations userId={user?.id} onEquipmentSelect={(eq) => { setSelectedEquipment(eq); setModal('isSmartRecommendationsOpen', false); }} onClose={() => setModal('isSmartRecommendationsOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isQRCodeScannerOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <QRCodeScanner isOpen={modals.isQRCodeScannerOpen} onScan={(d) => { console.log('QR Code scanned:', d); alert(`QR Code scanned: ${d}`); setModal('isQRCodeScannerOpen', false); }} onClose={() => setModal('isQRCodeScannerOpen', false)} />
          </div>
        </Suspense>
      )}

      {modals.isAchievementsOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <AchievementsSystem userId={user?.id || ''} onClose={() => setModal('isAchievementsOpen', false)} />
          </div>
        </Suspense>
      )}
    </>
  );
}
