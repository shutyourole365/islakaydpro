import { lazy } from 'react';

// Core lazy-loaded components
export const SecurityCenter = lazy(() => import('../components/security/SecurityCenter'));
export const AnalyticsDashboard = lazy(() => import('../components/dashboard/AnalyticsDashboard'));
export const AdminPanel = lazy(() => import('../components/admin/AdminPanel'));
export const NotificationCenter = lazy(() => import('../components/notifications/NotificationCenter'));
export const PaymentSettings = lazy(() => import('../components/payments/PaymentSettings'));

// Premium Features - Lazy loaded for performance
export const SubscriptionPlans = lazy(() => import('../components/subscription/SubscriptionPlans'));
export const CarbonFootprintTracker = lazy(() => import('../components/sustainability/CarbonFootprintTracker'));
export const AREquipmentTutorial = lazy(() => import('../components/tutorials/AREquipmentTutorial'));
export const GroupBooking = lazy(() => import('../components/booking/GroupBooking'));
export const DroneDeliveryTracking = lazy(() => import('../components/delivery/DroneDeliveryTracking'));
export const QRCheckInOut = lazy(() => import('../components/booking/QRCheckInOut'));
export const BlockchainContract = lazy(() => import('../components/contracts/BlockchainContract'));
export const AIDamageDetection = lazy(() => import('../components/inspection/AIDamageDetection'));
export const SplitPayment = lazy(() => import('../components/payments/SplitPayment'));
export const InstantInsuranceQuote = lazy(() => import('../components/insurance/InstantInsuranceQuote'));
export const SmartPricingEngine = lazy(() => import('../components/pricing/SmartPricingEngine'));
export const Equipment3DViewer = lazy(() => import('../components/equipment/Equipment3DViewer'));
export const VoiceSearch = lazy(() => import('../components/search/VoiceSearch'));
export const LiveLocationTracker = lazy(() => import('../components/booking/LiveLocationTracker'));
export const DamageReportWizard = lazy(() => import('../components/booking/DamageReportWizard'));
export const EquipmentMapEnhanced = lazy(() => import('../components/map/EquipmentMapEnhanced'));

// Additional Premium Features
export const LoyaltyProgram = lazy(() => import('../components/gamification/LoyaltyProgram'));
export const FleetManager = lazy(() => import('../components/fleet/FleetManager'));
export const PriceNegotiator = lazy(() => import('../components/negotiation/PriceNegotiator'));
export const MaintenancePredictor = lazy(() => import('../components/predictive/MaintenancePredictor'));
export const ReferralProgram = lazy(() => import('../components/referral/ReferralProgram'));
export const SmartScheduler = lazy(() => import('../components/scheduling/SmartScheduler'));

// NEW Premium Features - AI Matching, Smart Contracts, AR Preview
export const AIMatching = lazy(() => import('../components/features/AIMatching'));
export const SmartContracts = lazy(() => import('../components/features/SmartContracts'));
export const ARPreview = lazy(() => import('../components/features/ARPreview'));
export const CarbonTracker = lazy(() => import('../components/features/CarbonTracker'));
export const EquipmentFinancing = lazy(() => import('../components/features/EquipmentFinancing'));
export const IoTTelematics = lazy(() => import('../components/features/IoTTelematics'));
export const AREquipmentVisualization = lazy(() => import('../components/features/AREquipmentVisualization'));
export const GPSTracking = lazy(() => import('../components/features/GPSTracking'));
export const CryptoPayments = lazy(() => import('../components/features/CryptoPayments'));
export const AIInsurance = lazy(() => import('../components/features/AIInsurance'));
export const SustainabilityDashboard = lazy(() => import('../components/features/SustainabilityDashboard'));
export const SocialCommunities = lazy(() => import('../components/features/SocialCommunities'));
export const VoiceAIAssistant = lazy(() => import('../components/features/VoiceAIAssistant'));
export const BlockchainContracts = lazy(() => import('../components/features/BlockchainContracts'));
export const VRTraining = lazy(() => import('../components/features/VRTraining'));
export const DroneDelivery = lazy(() => import('../components/features/DroneDelivery'));
export const IndustryIntegrations = lazy(() => import('../components/features/IndustryIntegrations'));

// NEW Premium Features - Live Chat & Advanced Search
export const LiveChat = lazy(() => import('../components/chat/LiveChat'));
export const AdvancedFilters = lazy(() => import('../components/search/AdvancedFilters'));
export const DetailedComparison = lazy(() => import('../components/comparison/DetailedComparison'));
export const SavedSearches = lazy(() => import('../components/search/SavedSearches'));
export const EquipmentRecommendations = lazy(() => import('../components/recommendations/EquipmentRecommendations'));
export const QRCodeScanner = lazy(() => import('../components/scanner/QRCodeScanner'));
export const QuickBook = lazy(() => import('../components/booking/QuickBook'));

// Balanced Approach Features
export const AISearchEngine = lazy(() => import('../components/search/AISearchEngine'));
export const PhotoMessaging = lazy(() => import('../components/messaging/PhotoMessaging'));
export const EnhancedReviewSystem = lazy(() => import('../components/reviews/EnhancedReviewSystem'));
export const PWAEnhancedFeatures = lazy(() => import('../components/pwa/PWAEnhancedFeatures'));
export const MultiPaymentSystem = lazy(() => import('../components/payments/MultiPaymentSystem'));

// NEW Features - Health Score, Cost Estimator, Seasonal Deals, History Timeline, Multi-Language
export const EquipmentHealthScore = lazy(() => import('../components/health/EquipmentHealthScore'));
export const RentalCostEstimator = lazy(() => import('../components/estimator/RentalCostEstimator'));
export const SeasonalDeals = lazy(() => import('../components/promotions/SeasonalDeals'));
export const RentalHistoryTimeline = lazy(() => import('../components/timeline/RentalHistoryTimeline'));
export const MultiLanguageSupport = lazy(() => import('../components/i18n/MultiLanguageSupport'));

// New Feature Components - Trust, Alerts, Bundles, Warranties, Insights
export const RenterTrustScore = lazy(() => import('../components/trust/RenterTrustScore'));
export const SmartAlertsSystem = lazy(() => import('../components/alerts/SmartAlertsSystem'));
export const EquipmentAvailabilityCalendar = lazy(() => import('../components/availability/EquipmentAvailabilityCalendar'));
export const OwnerRevenueDashboard = lazy(() => import('../components/revenue/OwnerRevenueDashboard'));
export const EquipmentCertificationTracker = lazy(() => import('../components/certification/EquipmentCertificationTracker'));
export const RentalAgreementGenerator = lazy(() => import('../components/agreements/RentalAgreementGenerator'));
export const CustomerSupportTickets = lazy(() => import('../components/tickets/CustomerSupportTickets'));
export const EquipmentBundleDeals = lazy(() => import('../components/bundles/EquipmentBundleDeals'));
export const EquipmentWarrantyTracker = lazy(() => import('../components/warranty/EquipmentWarrantyTracker'));
export const BulkBookingSystem = lazy(() => import('../components/booking/BulkBookingSystem'));
export const MarketplaceInsights = lazy(() => import('../components/insights/MarketplaceInsights'));

// Additional Feature Components - Weather, Social, Onboarding, Security
export const WeatherAdvisor = lazy(() => import('../components/weather/WeatherAdvisor'));
export const SocialProof = lazy(() => import('../components/social/SocialProof'));
export const OnboardingFlow = lazy(() => import('../components/onboarding/OnboardingFlow'));
export const BiometricAuth = lazy(() => import('../components/security/BiometricAuth'));
export const PriceAlerts = lazy(() => import('../components/pricing/PriceAlerts'));
export const SmartRecommendations = lazy(() => import('../components/recommendations/SmartRecommendations'));
export const AchievementsSystem = lazy(() => import('../components/gamification/AchievementsSystem'));

// Legal Pages
export const TermsOfService = lazy(() => import('../components/legal/TermsOfService'));
export const PrivacyPolicy = lazy(() => import('../components/legal/PrivacyPolicy'));
export const CookiePolicy = lazy(() => import('../components/legal/CookiePolicy'));
export const RefundPolicy = lazy(() => import('../components/legal/RefundPolicy'));
export const Accessibility = lazy(() => import('../components/legal/Accessibility'));
export const CancellationPolicy = lazy(() => import('../components/legal/CancellationPolicy'));

// Company Pages
export const AboutUs = lazy(() => import('../components/company/AboutUs'));
export const Careers = lazy(() => import('../components/company/Careers'));
export const Press = lazy(() => import('../components/company/Press'));
export const Blog = lazy(() => import('../components/company/Blog'));
export const Partnerships = lazy(() => import('../components/company/Partnerships'));
export const Investors = lazy(() => import('../components/company/Investors'));

// Support Pages
export const HelpCenter = lazy(() => import('../components/support/HelpCenter'));
export const Safety = lazy(() => import('../components/support/Safety'));
export const TrustAndVerification = lazy(() => import('../components/support/TrustAndVerification'));
export const ContactUs = lazy(() => import('../components/support/ContactUs'));

// Utility Pages
export const PricingCalculator = lazy(() => import('../components/utility/PricingCalculator'));
export const InsuranceOptions = lazy(() => import('../components/utility/InsuranceOptions'));
export const HostResources = lazy(() => import('../components/utility/HostResources'));
export const HostCommunity = lazy(() => import('../components/utility/HostCommunity'));
export const MaintenanceScheduler = lazy(() => import('../components/maintenance/MaintenanceScheduler'));
export const SchedulingOptimizer = lazy(() => import('../components/scheduling/SchedulingOptimizer'));
export const ReferralSystem = lazy(() => import('../components/referral/ReferralSystem'));
