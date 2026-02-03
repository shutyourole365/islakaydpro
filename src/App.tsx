import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import type { Category, Equipment } from './types';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Hero from './components/home/Hero';
import Categories from './components/home/Categories';
import FeaturedListings from './components/home/FeaturedListings';
import HowItWorks from './components/home/HowItWorks';
import Testimonials from './components/home/Testimonials';
import CTASection from './components/home/CTASection';
import SearchModal from './components/search/SearchModal';
import EquipmentDetail from './components/equipment/EquipmentDetail';
import AuthModal from './components/auth/AuthModal';
import AIAssistantEnhanced from './components/ai/AIAssistantEnhanced';
import BrowsePage from './components/browse/BrowsePage';
import Dashboard from './components/dashboard/Dashboard';
import ListEquipmentForm from './components/listing/ListEquipmentForm';
import BookingSystem from './components/booking/BookingSystem';
import EquipmentComparison from './components/comparison/EquipmentComparison';
import { SkipLink } from './components/ui/AccessibleComponents';
import QuickActionsMenu from './components/ui/QuickActionsMenu';
import FeatureShowcase from './components/ui/FeatureShowcase';
import InstallPrompt, { OfflineIndicator } from './components/pwa/InstallPrompt';
import { addFavorite, removeFavorite } from './services/database';

// Lazy load heavy components for better performance
const SecurityCenter = lazy(() => import('./components/security/SecurityCenter'));
const AnalyticsDashboard = lazy(() => import('./components/dashboard/AnalyticsDashboard'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const NotificationCenter = lazy(() => import('./components/notifications/NotificationCenter'));
const PaymentSettings = lazy(() => import('./components/payments/PaymentSettings'));

// Premium Features - Lazy loaded for performance
const SubscriptionPlans = lazy(() => import('./components/subscription/SubscriptionPlans'));
const CarbonFootprintTracker = lazy(() => import('./components/sustainability/CarbonFootprintTracker'));
const AREquipmentTutorial = lazy(() => import('./components/tutorials/AREquipmentTutorial'));
const GroupBooking = lazy(() => import('./components/booking/GroupBooking'));
const DroneDeliveryTracking = lazy(() => import('./components/delivery/DroneDeliveryTracking'));
const QRCheckInOut = lazy(() => import('./components/booking/QRCheckInOut'));
const BlockchainContract = lazy(() => import('./components/contracts/BlockchainContract'));
const AIDamageDetection = lazy(() => import('./components/inspection/AIDamageDetection'));
const SplitPayment = lazy(() => import('./components/payments/SplitPayment'));
const InstantInsuranceQuote = lazy(() => import('./components/insurance/InstantInsuranceQuote'));
const SmartPricingEngine = lazy(() => import('./components/pricing/SmartPricingEngine'));
const Equipment3DViewer = lazy(() => import('./components/equipment/Equipment3DViewer'));
const VoiceSearch = lazy(() => import('./components/search/VoiceSearch'));
const LiveLocationTracker = lazy(() => import('./components/booking/LiveLocationTracker'));
const DamageReportWizard = lazy(() => import('./components/booking/DamageReportWizard'));

// Additional Premium Features
const LoyaltyProgram = lazy(() => import('./components/gamification/LoyaltyProgram'));
const FleetManager = lazy(() => import('./components/fleet/FleetManager'));
const PriceNegotiator = lazy(() => import('./components/negotiation/PriceNegotiator'));
const MaintenancePredictor = lazy(() => import('./components/predictive/MaintenancePredictor'));
const ReferralProgram = lazy(() => import('./components/referral/ReferralProgram'));
const SmartScheduler = lazy(() => import('./components/scheduling/SmartScheduler'));

// NEW Premium Features - Live Chat & Advanced Search
const LiveChat = lazy(() => import('./components/chat/LiveChat'));
const AdvancedFilters = lazy(() => import('./components/search/AdvancedFilters'));
const DetailedComparison = lazy(() => import('./components/comparison/DetailedComparison'));
const SavedSearches = lazy(() => import('./components/search/SavedSearches'));
const EquipmentRecommendations = lazy(() => import('./components/recommendations/EquipmentRecommendations'));
const QuickBook = lazy(() => import('./components/booking/QuickBook'));

// Balanced Approach Features - NEW Components
const AISearchEngine = lazy(() => import('./components/search/AISearchEngine'));
const PhotoMessaging = lazy(() => import('./components/messaging/PhotoMessaging'));
const EnhancedReviewSystem = lazy(() => import('./components/reviews/EnhancedReviewSystem'));
const PWAEnhancedFeatures = lazy(() => import('./components/pwa/PWAEnhancedFeatures'));
const MultiPaymentSystem = lazy(() => import('./components/payments/MultiPaymentSystem'));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

const sampleEquipment: Equipment[] = [
  {
    id: '1',
    owner_id: 'owner1',
    category_id: 'cat1',
    title: 'CAT 320 Excavator - 20 Ton',
    description: 'Professional-grade excavator perfect for construction, demolition, and earthmoving projects. Well-maintained with low hours. Includes operator manual and safety equipment.',
    brand: 'Caterpillar',
    model: '320 GC',
    condition: 'excellent',
    daily_rate: 450,
    weekly_rate: 2800,
    monthly_rate: 9500,
    deposit_amount: 2000,
    location: 'Los Angeles, CA',
    latitude: 34.0522,
    longitude: -118.2437,
    images: [
      'https://images.pexels.com/photos/2058128/pexels-photo-2058128.jpeg',
      'https://images.pexels.com/photos/1078884/pexels-photo-1078884.jpeg',
    ],
    features: ['GPS Navigation', 'AC Cabin', 'Low Hours', 'Recent Service'],
    specifications: { weight: '20 tons', engine: 'CAT C4.4', power: '162 HP', reach: '32 ft' },
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 90,
    rating: 4.9,
    total_reviews: 47,
    total_bookings: 89,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      id: 'owner1',
      full_name: 'Heavy Equipment Rentals LLC',
      avatar_url: null,
      bio: 'Professional equipment rental company',
      location: 'Los Angeles, CA',
      phone: null,
      is_verified: true,
      is_admin: false,
      two_factor_enabled: false,
      email_verified: true,
      phone_verified: false,
      last_login: null,
      account_status: 'active',
      rating: 4.9,
      total_reviews: 234,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    owner_id: 'owner2',
    category_id: 'cat2',
    title: 'Sony A7IV Full Frame Camera Kit',
    description: 'Complete professional photography kit including Sony A7IV body, 24-70mm f/2.8 GM lens, 70-200mm f/2.8 GM lens, flash, and accessories. Perfect for weddings, events, and commercial shoots.',
    brand: 'Sony',
    model: 'A7IV',
    condition: 'excellent',
    daily_rate: 125,
    weekly_rate: 700,
    monthly_rate: 2200,
    deposit_amount: 500,
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    images: [
      'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg',
      'https://images.pexels.com/photos/1983037/pexels-photo-1983037.jpeg',
    ],
    features: ['33MP Sensor', '4K Video', 'Fast Autofocus', 'Dual Card Slots', 'Premium Lenses'],
    specifications: { sensor: '33MP Full Frame', video: '4K 60fps', battery: '580 shots', weight: '659g' },
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 30,
    rating: 5.0,
    total_reviews: 62,
    total_bookings: 145,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      id: 'owner2',
      full_name: 'Pro Camera Rentals',
      avatar_url: null,
      bio: 'Premium camera gear for professionals',
      location: 'San Francisco, CA',
      phone: null,
      is_verified: true,
      is_admin: false,
      two_factor_enabled: false,
      email_verified: true,
      phone_verified: false,
      last_login: null,
      account_status: 'active',
      rating: 4.95,
      total_reviews: 189,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '3',
    owner_id: 'owner3',
    category_id: 'cat3',
    title: 'DeWalt 20V MAX Power Tool Combo Kit',
    description: '15-piece professional power tool set including drill, impact driver, circular saw, reciprocating saw, oscillating tool, and more. Includes 4 batteries and fast charger.',
    brand: 'DeWalt',
    model: 'DCK1500P4',
    condition: 'excellent',
    daily_rate: 75,
    weekly_rate: 400,
    monthly_rate: 1200,
    deposit_amount: 300,
    location: 'Austin, TX',
    latitude: 30.2672,
    longitude: -97.7431,
    images: [
      'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
      'https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg',
    ],
    features: ['15 Tools', '4 Batteries', 'Fast Charger', 'Hard Case', 'Brushless Motors'],
    specifications: { voltage: '20V MAX', battery: '5.0Ah', tools: '15 pieces', warranty: '3 years' },
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 30,
    rating: 4.8,
    total_reviews: 93,
    total_bookings: 267,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      id: 'owner3',
      full_name: 'Tool Time Rentals',
      avatar_url: null,
      bio: 'Quality tools for professionals and DIYers',
      location: 'Austin, TX',
      phone: null,
      is_verified: true,
      is_admin: false,
      two_factor_enabled: false,
      email_verified: true,
      phone_verified: false,
      last_login: null,
      account_status: 'active',
      rating: 4.85,
      total_reviews: 156,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '4',
    owner_id: 'owner4',
    category_id: 'cat4',
    title: 'Premium DJ Equipment Package',
    description: 'Complete DJ setup including Pioneer DDJ-1000 controller, QSC K12.2 speakers, subwoofer, lighting package, and all necessary cables. Perfect for weddings, parties, and events.',
    brand: 'Pioneer',
    model: 'DDJ-1000 Package',
    condition: 'excellent',
    daily_rate: 295,
    weekly_rate: 1500,
    monthly_rate: 4500,
    deposit_amount: 1000,
    location: 'Miami, FL',
    latitude: 25.7617,
    longitude: -80.1918,
    images: [
      'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg',
      'https://images.pexels.com/photos/3784566/pexels-photo-3784566.jpeg',
    ],
    features: ['Pro Controller', 'QSC Speakers', 'Subwoofer', 'Lighting', 'Setup Included'],
    specifications: { controller: 'DDJ-1000', speakers: '2x K12.2', subwoofer: 'KS112', power: '4000W' },
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 14,
    rating: 4.9,
    total_reviews: 78,
    total_bookings: 203,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      id: 'owner4',
      full_name: 'Miami Event Rentals',
      avatar_url: null,
      bio: 'Premium event equipment for unforgettable parties',
      location: 'Miami, FL',
      phone: null,
      is_verified: true,
      is_admin: false,
      two_factor_enabled: false,
      email_verified: true,
      phone_verified: false,
      last_login: null,
      account_status: 'active',
      rating: 4.92,
      total_reviews: 312,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '5',
    owner_id: 'owner5',
    category_id: 'cat5',
    title: 'John Deere 1025R Compact Tractor',
    description: 'Versatile compact utility tractor with front loader, perfect for landscaping, property maintenance, and light construction. Easy to operate with hydrostatic transmission.',
    brand: 'John Deere',
    model: '1025R',
    condition: 'excellent',
    daily_rate: 225,
    weekly_rate: 1200,
    monthly_rate: 3800,
    deposit_amount: 1500,
    location: 'Denver, CO',
    latitude: 39.7392,
    longitude: -104.9903,
    images: [
      'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg',
      'https://images.pexels.com/photos/1453499/pexels-photo-1453499.jpeg',
    ],
    features: ['Front Loader', 'Hydrostatic', '4WD', 'Power Steering', 'Diesel Engine'],
    specifications: { engine: '24.2 HP Diesel', transmission: 'Hydrostatic', lift: '681 lbs', pto: '18 HP' },
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 60,
    rating: 4.7,
    total_reviews: 34,
    total_bookings: 89,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      id: 'owner5',
      full_name: 'Rocky Mountain Equipment',
      avatar_url: null,
      bio: 'Agricultural and landscaping equipment rentals',
      location: 'Denver, CO',
      phone: null,
      is_verified: true,
      is_admin: false,
      two_factor_enabled: false,
      email_verified: true,
      phone_verified: false,
      last_login: null,
      account_status: 'active',
      rating: 4.78,
      total_reviews: 98,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '6',
    owner_id: 'owner6',
    category_id: 'cat6',
    title: '20x40 Premium Wedding Tent Package',
    description: 'Elegant frame tent package perfect for outdoor weddings and events. Includes tent, lighting, sidewalls, flooring, and professional setup. Accommodates up to 80 guests seated.',
    brand: 'Anchor Industries',
    model: 'Frame Tent 20x40',
    condition: 'excellent',
    daily_rate: 495,
    weekly_rate: 2500,
    monthly_rate: null,
    deposit_amount: 800,
    location: 'Nashville, TN',
    latitude: 36.1627,
    longitude: -86.7816,
    images: [
      'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
      'https://images.pexels.com/photos/169190/pexels-photo-169190.jpeg',
    ],
    features: ['800 sq ft', 'Lighting Included', 'Sidewalls', 'Professional Setup', 'Climate Control Ready'],
    specifications: { size: '20x40 ft', capacity: '80 seated', height: '10 ft', material: 'Commercial Grade' },
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 7,
    rating: 4.95,
    total_reviews: 156,
    total_bookings: 423,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      id: 'owner6',
      full_name: 'Southern Events',
      avatar_url: null,
      bio: 'Creating magical outdoor events since 2005',
      location: 'Nashville, TN',
      phone: null,
      is_verified: true,
      is_admin: false,
      two_factor_enabled: false,
      email_verified: true,
      phone_verified: false,
      last_login: null,
      account_status: 'active',
      rating: 4.97,
      total_reviews: 567,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '7',
    owner_id: 'owner7',
    category_id: 'cat7',
    title: 'DJI Mavic 3 Pro Drone Kit',
    description: 'Professional drone package with Hasselblad camera, 4/3 CMOS sensor, 46-min flight time. Includes extra batteries, ND filters, and hard case. FAA Part 107 compliant.',
    brand: 'DJI',
    model: 'Mavic 3 Pro',
    condition: 'excellent',
    daily_rate: 150,
    weekly_rate: 800,
    monthly_rate: 2400,
    deposit_amount: 600,
    location: 'Seattle, WA',
    latitude: 47.6062,
    longitude: -122.3321,
    images: [
      'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
      'https://images.pexels.com/photos/724921/pexels-photo-724921.jpeg',
    ],
    features: ['Hasselblad Camera', '46min Flight', '5.1K Video', 'Obstacle Sensing', 'Pro Controller'],
    specifications: { sensor: '4/3 CMOS 20MP', video: '5.1K 50fps', range: '15km', flight: '46 min' },
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 14,
    rating: 4.85,
    total_reviews: 89,
    total_bookings: 234,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      id: 'owner7',
      full_name: 'SkyView Drone Rentals',
      avatar_url: null,
      bio: 'Professional drone equipment for aerial photography',
      location: 'Seattle, WA',
      phone: null,
      is_verified: true,
      is_admin: false,
      two_factor_enabled: false,
      email_verified: true,
      phone_verified: false,
      last_login: null,
      account_status: 'active',
      rating: 4.88,
      total_reviews: 178,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '8',
    owner_id: 'owner8',
    category_id: 'cat8',
    title: 'Commercial Pressure Washer - 4000 PSI',
    description: 'Heavy-duty gas-powered pressure washer perfect for commercial cleaning, driveways, decks, and industrial applications. Includes surface cleaner attachment and multiple tips.',
    brand: 'Simpson',
    model: 'PS4240',
    condition: 'excellent',
    daily_rate: 95,
    weekly_rate: 450,
    monthly_rate: 1400,
    deposit_amount: 250,
    location: 'Phoenix, AZ',
    latitude: 33.4484,
    longitude: -112.0740,
    images: [
      'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg',
      'https://images.pexels.com/photos/4239031/pexels-photo-4239031.jpeg',
    ],
    features: ['4000 PSI', 'Honda Engine', 'Surface Cleaner', '50ft Hose', 'Multiple Tips'],
    specifications: { pressure: '4000 PSI', flow: '4.0 GPM', engine: 'Honda GX390', hose: '50 ft' },
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 30,
    rating: 4.75,
    total_reviews: 112,
    total_bookings: 389,
    is_featured: true,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    owner: {
      id: 'owner8',
      full_name: 'Desert Equipment Rental',
      avatar_url: null,
      bio: 'Reliable equipment for the Southwest',
      location: 'Phoenix, AZ',
      phone: null,
      is_verified: true,
      is_admin: false,
      two_factor_enabled: false,
      email_verified: true,
      phone_verified: false,
      last_login: null,
      account_status: 'active',
      rating: 4.8,
      total_reviews: 245,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];

type PageType = 'home' | 'browse' | 'dashboard' | 'list-equipment' | 'security' | 'analytics' | 'admin' | 'notifications' | 'payments' | 'subscription' | 'sustainability' | 'tutorials' | 'loyalty' | 'fleet' | 'referrals' | 'pwa';

function AppContent() {
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [categories, setCategories] = useState<Category[]>([]);
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
  // Premium feature states
  const [isVoiceSearchOpen, setIsVoiceSearchOpen] = useState(false);
  const [is3DViewerOpen, setIs3DViewerOpen] = useState(false);
  const [viewerEquipment, setViewerEquipment] = useState<Equipment | null>(null);
  const [isGroupBookingOpen, setIsGroupBookingOpen] = useState(false);
  const [isSplitPaymentOpen, setIsSplitPaymentOpen] = useState(false);
  const [isInsuranceQuoteOpen, setIsInsuranceQuoteOpen] = useState(false);
  const [isDroneTrackingOpen, setIsDroneTrackingOpen] = useState(false);
  const [isQRCheckInOpen, setIsQRCheckInOpen] = useState(false);
  const [isDamageDetectionOpen, setIsDamageDetectionOpen] = useState(false);
  const [isBlockchainOpen, setIsBlockchainOpen] = useState(false);
  const [isARTutorialOpen, setIsARTutorialOpen] = useState(false);
  const [isSmartPricingOpen, setIsSmartPricingOpen] = useState(false);
  const [isLiveTrackerOpen, setIsLiveTrackerOpen] = useState(false);
  const [isDamageWizardOpen, setIsDamageWizardOpen] = useState(false);
  // New premium features
  const [isPriceNegotiatorOpen, setIsPriceNegotiatorOpen] = useState(false);
  const [isMaintenancePredictorOpen, setIsMaintenancePredictorOpen] = useState(false);
  const [isSmartSchedulerOpen, setIsSmartSchedulerOpen] = useState(false);
  const [isFeatureShowcaseOpen, setIsFeatureShowcaseOpen] = useState(false);
  // New Balanced Approach modal states
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [isPhotoMessagingOpen, setIsPhotoMessagingOpen] = useState(false);
  const [isEnhancedReviewOpen, setIsEnhancedReviewOpen] = useState(false);
  const [isMultiPaymentOpen, setIsMultiPaymentOpen] = useState(false);
  const [reviewEquipment, setReviewEquipment] = useState<Equipment | null>(null);
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [messageConversationId, setMessageConversationId] = useState<string | null>(null);
  // NEWEST Features - Communication & Discovery modal states
  const [isLiveChatOpen, setIsLiveChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<{id: string; name: string; avatar?: string} | null>(null);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);
  const [isDetailedComparisonOpen, setIsDetailedComparisonOpen] = useState(false);
  const [comparisonEquipment, setComparisonEquipment] = useState<Equipment[]>([]);
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState(false);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState(false);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);
  const [quickBookEquipment, setQuickBookEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Track page views in analytics
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
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching categories:', error);
      }
      return;
    }

    if (data) {
      const categoriesWithCounts = data.map((cat, index) => ({
        ...cat,
        equipment_count: [1250, 890, 456, 678, 345, 234, 123, 567, 890, 432, 765, 321][index] || 100,
      }));
      setCategories(categoriesWithCounts);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as PageType);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchOpen(false);
    setCurrentPage('browse');
    
    // Track search event
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      import('./services/analytics').then(({ analytics }) => {
        analytics.trackSearch(query, { resultCount: sampleEquipment.length });
      });
    }
  };

  const handleCategoryClick = (category: Category) => {
    setSearchCategory(category.slug);
    setCurrentPage('browse');
  };

  const handleEquipmentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    
    // Track equipment view
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      import('./services/analytics').then(({ analytics }) => {
        analytics.trackEquipmentView(
          equipment.id,
          equipment.title,
          equipment.category?.name || 'Uncategorized'
        );
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
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(equipmentId);
          return newFavorites;
        });
      } else {
        await addFavorite(user.id, equipmentId);
        setFavorites(prev => new Set(prev).add(equipmentId));
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to toggle favorite:', error);
      }
      // Show user-friendly error
      alert('Failed to update favorites. Please try again.');
    }
  };

  const handleBook = (equipment: Equipment) => {
    if (!isAuthenticated) {
      setSelectedEquipment(null);
      setIsAuthOpen(true);
      return;
    }
    // Open the booking system modal
    setBookingEquipment(equipment);
    setIsBookingOpen(true);
    setSelectedEquipment(null);
  };

  const handleBookingComplete = (bookingData: unknown) => {
    if (import.meta.env.DEV) {
      console.log('Booking completed:', bookingData);
    }
    
    // Track booking completion
    if (import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
      import('./services/analytics').then(({ analytics }) => {
        const booking = bookingData as { id: string; total_amount: number };
        analytics.trackBooking(booking.id, booking.total_amount, 'USD');
      });
    }
    
    setIsBookingOpen(false);
    setBookingEquipment(null);
    // Show success notification
    alert('🎉 Booking confirmed! Check your email for confirmation details.');
  };

  const handleAddToComparison = (equipment: Equipment) => {
    if (comparisonItems.length >= 4) {
      alert('You can compare up to 4 items at a time.');
      return;
    }
    if (comparisonItems.find(item => item.id === equipment.id)) {
      alert('This item is already in your comparison.');
      return;
    }
    setComparisonItems(prev => [...prev, equipment]);
    // Show toast notification
    setTimeout(() => {
      if (comparisonItems.length + 1 >= 2) {
        const shouldOpen = window.confirm(`${equipment.title} added to comparison! You now have ${comparisonItems.length + 1} items. View comparison now?`);
        if (shouldOpen) setIsComparisonOpen(true);
      }
    }, 100);
  };

  const handleRemoveFromComparison = (equipmentId: string) => {
    setComparisonItems(prev => prev.filter(item => item.id !== equipmentId));
  };

  const handleMessage = (equipment: Equipment) => {
    // Equipment will be used when messaging is implemented
    console.log('Message about:', equipment.id);
    if (!isAuthenticated) {
      setSelectedEquipment(null);
      setIsAuthOpen(true);
      return;
    }
    alert('Message sent to owner! They will respond shortly.');
  };

  const handleFeatureSelect = (featureId: string) => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }

    // Select a random equipment for demo purposes
    const demoEquipment = sampleEquipment[0];
    setBookingEquipment(demoEquipment);

    switch (featureId) {
      case 'price-negotiator':
        setIsPriceNegotiatorOpen(true);
        break;
      case 'smart-scheduler':
        setIsSmartSchedulerOpen(true);
        break;
      case 'maintenance-predictor':
        setIsMaintenancePredictorOpen(true);
        break;
      case 'referral-program':
        setCurrentPage('referrals');
        break;
      case 'smart-pricing':
        setIsSmartPricingOpen(true);
        break;
      case 'group-booking':
        setIsGroupBookingOpen(true);
        break;
      case 'ai-search':
        setIsAISearchOpen(true);
        break;
      case 'analytics':
        setCurrentPage('analytics');
        break;
      case 'photo-messaging':
        setIsPhotoMessagingOpen(true);
        setMessageConversationId('demo-conversation-123');
        break;
      case 'enhanced-reviews':
        setIsEnhancedReviewOpen(true);
        setReviewEquipment(demoEquipment);
        setReviewBookingId('demo-booking-123');
        break;
      case 'pwa-features':
        setCurrentPage('pwa');
        break;
      case 'multi-payment':
        setIsMultiPaymentOpen(true);
        break;
      case 'live-chat':
        setChatRecipient({ 
          id: demoEquipment.owner_id, 
          name: demoEquipment.owner?.full_name || 'Equipment Owner',
          avatar: demoEquipment.owner?.avatar_url || undefined
        });
        setIsLiveChatOpen(true);
        break;
      case 'advanced-filters':
        setIsAdvancedFiltersOpen(true);
        break;
      case 'comparison':
        // Add 3 demo equipment items to comparison
        setComparisonEquipment([sampleEquipment[0], sampleEquipment[1], sampleEquipment[2]]);
        setIsDetailedComparisonOpen(true);
        break;
      case 'saved-searches':
        setIsSavedSearchesOpen(true);
        break;
      case 'recommendations':
        setIsRecommendationsOpen(true);
        break;
      case 'quick-book':
        setQuickBookEquipment(demoEquipment);
        setIsQuickBookOpen(true);
        break;
      default:
        alert(`${featureId} feature coming soon!`);
    }
    setIsFeatureShowcaseOpen(false);
  };

  const handleListEquipment = () => {
    if (!isAuthenticated) {
      setIsAuthOpen(true);
      return;
    }
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

      {currentPage === 'home' && (
        <>
          <main>
            <Hero onSearch={handleSearch} />

            <Categories
              categories={categories}
              onCategoryClick={handleCategoryClick}
            />

            <FeaturedListings
              equipment={sampleEquipment}
              onEquipmentClick={handleEquipmentClick}
              onFavoriteClick={handleFavoriteToggle}
              favorites={favorites}
              onAddToComparison={handleAddToComparison}
            />

            <HowItWorks />

            <Testimonials />

            <CTASection onGetStarted={() => setIsAuthOpen(true)} />
          </main>

          <Footer />
        </>
      )}

      {currentPage === 'browse' && (
        <>
          <BrowsePage
            equipment={sampleEquipment}
            categories={categories}
            initialQuery={searchQuery}
            initialCategory={searchCategory}
            onEquipmentClick={handleEquipmentClick}
            onFavoriteClick={handleFavoriteToggle}
            favorites={favorites}
            onBack={() => {
              setSearchQuery('');
              setSearchCategory('');
              setCurrentPage('home');
            }}
          />
          <Footer />
        </>
      )}

      {currentPage === 'dashboard' && (
        <>
          <Dashboard
            onBack={() => setCurrentPage('home')}
            onEquipmentClick={handleEquipmentClick}
            onListEquipment={handleListEquipment}
          />
          <Footer />
        </>
      )}

      {currentPage === 'security' && (
        <Suspense fallback={<PageLoader />}>
          <SecurityCenter onBack={() => setCurrentPage('dashboard')} />
          <Footer />
        </Suspense>
      )}

      {currentPage === 'analytics' && (
        <Suspense fallback={<PageLoader />}>
          <AnalyticsDashboard onBack={() => setCurrentPage('dashboard')} />
          <Footer />
        </Suspense>
      )}

      {currentPage === 'admin' && profile?.is_admin && (
        <Suspense fallback={<PageLoader />}>
          <AdminPanel onBack={() => setCurrentPage('dashboard')} />
          <Footer />
        </Suspense>
      )}

      {currentPage === 'notifications' && (
        <Suspense fallback={<PageLoader />}>
          <NotificationCenter onBack={() => setCurrentPage('dashboard')} />
          <Footer />
        </Suspense>
      )}

      {currentPage === 'payments' && (
        <Suspense fallback={<PageLoader />}>
          <PaymentSettings onBack={() => setCurrentPage('dashboard')} />
          <Footer />
        </Suspense>
      )}

      {currentPage === 'subscription' && (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-violet-50 to-purple-100">
            <div className="max-w-7xl mx-auto px-4">
              <SubscriptionPlans 
                currentPlan="free" 
                onClose={() => setCurrentPage('dashboard')}
              />
            </div>
          </div>
          <Footer />
        </Suspense>
      )}

      {currentPage === 'sustainability' && (
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
          <Footer />
        </Suspense>
      )}

      {currentPage === 'loyalty' && (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
            <div className="max-w-3xl mx-auto px-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <LoyaltyProgram userId={user?.id || ''} />
            </div>
          </div>
          <Footer />
        </Suspense>
      )}

      {currentPage === 'fleet' && (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-indigo-50 to-violet-100">
            <div className="max-w-6xl mx-auto px-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <FleetManager ownerId={user?.id || ''} />
            </div>
          </div>
          <Footer />
        </Suspense>
      )}

      {currentPage === 'list-equipment' && (
        <ListEquipmentForm
          categories={categories}
          onClose={() => setCurrentPage('home')}
          onSubmit={handleListingSubmit}
        />
      )}

      {currentPage !== 'list-equipment' && <AIAssistantEnhanced />}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSearch={handleSearch}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />

      {selectedEquipment && (
        <EquipmentDetail
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onBook={handleBook}
          onMessage={handleMessage}
          isFavorite={favorites.has(selectedEquipment.id)}
          onFavoriteToggle={() => handleFavoriteToggle(selectedEquipment.id)}
        />
      )}

      {/* Advanced Booking System Modal */}
      {isBookingOpen && bookingEquipment && (
        <BookingSystem
          equipment={bookingEquipment}
          onClose={() => {
            setIsBookingOpen(false);
            setBookingEquipment(null);
          }}
          onComplete={handleBookingComplete}
        />
      )}

      {/* Equipment Comparison Modal */}
      {isComparisonOpen && comparisonItems.length > 0 && (
        <EquipmentComparison
          items={comparisonItems}
          onClose={() => setIsComparisonOpen(false)}
          onRemove={handleRemoveFromComparison}
          onBook={(equipment) => {
            setIsComparisonOpen(false);
            setBookingEquipment(equipment);
            setIsBookingOpen(true);
          }}
        />
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
        <QuickActionsMenu
          onNavigate={handleNavigate}
          unreadMessages={3}
          unreadNotifications={5}
        />
      )}

      {/* Skip Link for Accessibility */}
      <SkipLink />

      {/* Voice Search Modal */}
      {isVoiceSearchOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsVoiceSearchOpen(false)} />
            <div className="relative z-10 w-full max-w-lg">
              <VoiceSearch
                onSearch={(query) => {
                  setIsVoiceSearchOpen(false);
                  handleSearch(query);
                }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* 3D Equipment Viewer Modal */}
      {is3DViewerOpen && viewerEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIs3DViewerOpen(false)} />
            <div className="relative z-10 w-full max-w-4xl">
              <Equipment3DViewer
                images={viewerEquipment.images}
                title={viewerEquipment.title}
                onClose={() => {
                  setIs3DViewerOpen(false);
                  setViewerEquipment(null);
                }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Group Booking Modal */}
      {isGroupBookingOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsGroupBookingOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <GroupBooking
                equipmentId={bookingEquipment.id}
                equipmentTitle={bookingEquipment.title}
                dailyRate={bookingEquipment.daily_rate}
                onClose={() => {
                  setIsGroupBookingOpen(false);
                  setBookingEquipment(null);
                }}
                onComplete={(data) => {
                  console.log('Group booking:', data);
                  setIsGroupBookingOpen(false);
                  alert('Group booking confirmed!');
                }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Split Payment Modal */}
      {isSplitPaymentOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSplitPaymentOpen(false)} />
            <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <SplitPayment
                totalAmount={1250}
                bookingId="demo-booking-123"
                equipmentTitle="CAT 320 Excavator"
                onClose={() => setIsSplitPaymentOpen(false)}
                onComplete={(data) => {
                  console.log('Split payment:', data);
                  setIsSplitPaymentOpen(false);
                  alert('Payment split configured!');
                }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Instant Insurance Quote Modal */}
      {isInsuranceQuoteOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsInsuranceQuoteOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <InstantInsuranceQuote
                equipmentId={bookingEquipment.id}
                equipmentTitle={bookingEquipment.title}
                equipmentValue={bookingEquipment.daily_rate * 30}
                dailyRate={bookingEquipment.daily_rate}
                rentalDays={7}
                onClose={() => setIsInsuranceQuoteOpen(false)}
                onSelect={(plan) => {
                  console.log('Insurance plan:', plan);
                  setIsInsuranceQuoteOpen(false);
                  alert(`${plan.name} insurance selected!`);
                }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Drone Delivery Tracking Modal */}
      {isDroneTrackingOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDroneTrackingOpen(false)} />
            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <DroneDeliveryTracking
                bookingId="demo-booking-123"
                equipmentTitle="CAT 320 Excavator"
                pickupLocation={{ address: '123 Equipment Way, LA', lat: 34.0522, lng: -118.2437 }}
                deliveryLocation={{ address: '456 Construction Site, LA', lat: 34.0622, lng: -118.2537 }}
                estimatedDelivery={new Date(Date.now() + 3600000)}
                onClose={() => setIsDroneTrackingOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* QR Check-In/Out Modal */}
      {isQRCheckInOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsQRCheckInOpen(false)} />
            <div className="relative z-10 w-full max-w-md">
              <QRCheckInOut
                bookingId="demo-booking-123"
                equipmentId={bookingEquipment?.id || 'demo-equipment'}
                equipmentTitle="CAT 320 Excavator"
                mode="check-in"
                onComplete={(result) => {
                  console.log('QR check result:', result);
                  setIsQRCheckInOpen(false);
                  alert('Check-in successful!');
                }}
                onClose={() => setIsQRCheckInOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* AI Damage Detection Modal */}
      {isDamageDetectionOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDamageDetectionOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <AIDamageDetection
                equipmentId={bookingEquipment.id}
                equipmentTitle={bookingEquipment.title}
                type="post-rental"
                onComplete={(report) => {
                  console.log('Damage report:', report);
                  setIsDamageDetectionOpen(false);
                  alert('Inspection complete!');
                }}
                onClose={() => setIsDamageDetectionOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Blockchain Contract Modal */}
      {isBlockchainOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBlockchainOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <BlockchainContract
                bookingId="demo-booking-123"
                renterId={user?.id || ''}
                ownerId={bookingEquipment.owner_id}
                equipmentId={bookingEquipment.id}
                equipmentTitle={bookingEquipment.title}
                startDate={new Date()}
                endDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)}
                totalAmount={bookingEquipment.daily_rate * 7}
                depositAmount={bookingEquipment.deposit_amount}
                terms={{ 
                  cancellationPolicy: '48 hours notice required for full refund', 
                  damagePolicy: 'Renter responsible for damages beyond normal wear', 
                  usageRules: ['Equipment must be operated by trained personnel', 'No use for illegal activities'], 
                  insuranceCoverage: 'Comprehensive damage protection included', 
                  disputeResolution: 'Mediation followed by arbitration if needed' 
                }}
                onSign={(signature) => {
                  console.log('Contract signed:', signature);
                  setIsBlockchainOpen(false);
                  alert('Smart contract signed!');
                }}
                onClose={() => setIsBlockchainOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* AR Equipment Tutorial Modal */}
      {isARTutorialOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsARTutorialOpen(false)} />
            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <AREquipmentTutorial
                equipmentId={bookingEquipment.id}
                equipmentTitle={bookingEquipment.title}
                equipmentType={bookingEquipment.category?.name || 'Equipment'}
                onComplete={() => {
                  setIsARTutorialOpen(false);
                  alert('Tutorial completed!');
                }}
                onClose={() => setIsARTutorialOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Smart Pricing Engine Modal */}
      {isSmartPricingOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSmartPricingOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsSmartPricingOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                ✕
              </button>
              <SmartPricingEngine
                equipment={bookingEquipment}
                onPriceChange={(prices) => console.log('New prices:', prices)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Live Location Tracker Modal */}
      {isLiveTrackerOpen && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLiveTrackerOpen(false)} />
            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setIsLiveTrackerOpen(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
              >
                ✕
              </button>
              <LiveLocationTracker
                equipmentLocation={{
                  address: '123 Equipment Way, Los Angeles, CA 90001',
                  lat: 34.0522,
                  lng: -118.2437,
                }}
                pickupTime={new Date(Date.now() + 1800000)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Damage Report Wizard Modal */}
      {isDamageWizardOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDamageWizardOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <DamageReportWizard
                bookingId="demo-booking-123"
                equipmentTitle={bookingEquipment.title}
                equipmentImages={bookingEquipment.images}
                depositAmount={bookingEquipment.deposit_amount}
                onComplete={(report) => {
                  console.log('Damage report:', report);
                  setIsDamageWizardOpen(false);
                  alert('Return inspection complete!');
                }}
                onClose={() => setIsDamageWizardOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Referrals Page */}
      {currentPage === 'referrals' && (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-teal-50 to-emerald-100">
            <div className="max-w-4xl mx-auto px-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <ReferralProgram 
                userId={user?.id || ''}
                userName={user?.email || 'User'}
                onClose={() => setCurrentPage('dashboard')}
              />
            </div>
          </div>
          <Footer />
        </Suspense>
      )}

      {/* Price Negotiator Modal */}
      {isPriceNegotiatorOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <PriceNegotiator
            equipmentId={bookingEquipment.id}
            equipmentTitle={bookingEquipment.title}
            originalDailyRate={bookingEquipment.daily_rate}
            rentalDays={7}
            ownerId={bookingEquipment.owner_id}
            ownerName={bookingEquipment.owner?.full_name || 'Owner'}
            onAccepted={(finalPrice: number) => {
              console.log('Negotiation accepted:', finalPrice);
              setIsPriceNegotiatorOpen(false);
              alert(`Offer accepted! Final price: $${finalPrice.toFixed(2)}`);
            }}
            onRejected={() => {
              setIsPriceNegotiatorOpen(false);
              alert('Negotiation ended');
            }}
            onClose={() => setIsPriceNegotiatorOpen(false)}
          />
        </Suspense>
      )}

      {/* Maintenance Predictor Modal */}
      {isMaintenancePredictorOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <MaintenancePredictor
            equipmentId={bookingEquipment.id}
            equipmentTitle={bookingEquipment.title}
            equipmentType={bookingEquipment.category?.name || 'Equipment'}
            purchaseDate={new Date('2023-01-15')}
            totalUsageHours={1850}
            lastMaintenanceDate={new Date('2025-12-10')}
            maintenanceHistory={[
              {
                date: new Date('2025-12-10'),
                type: 'Oil Change',
                cost: 150,
                description: 'Routine oil and filter replacement',
                partsReplaced: ['Oil Filter', 'Engine Oil'],
              },
              {
                date: new Date('2025-09-05'),
                type: 'Hydraulic Service',
                cost: 380,
                description: 'Hydraulic fluid replacement and seal inspection',
                partsReplaced: ['Hydraulic Fluid', 'Seals'],
              },
            ]}
            onScheduleMaintenance={(date: Date, type: string) => {
              console.log('Maintenance scheduled:', date, type);
              setIsMaintenancePredictorOpen(false);
              alert(`Maintenance scheduled: ${type} on ${date.toLocaleDateString()}`);
            }}
            onClose={() => setIsMaintenancePredictorOpen(false)}
          />
        </Suspense>
      )}

      {/* Smart Scheduler Modal */}
      {isSmartSchedulerOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <SmartScheduler
            equipmentId={bookingEquipment.id}
            equipmentTitle={bookingEquipment.title}
            dailyRate={bookingEquipment.daily_rate}
            onSelectDates={(start: Date, end: Date, discount: number) => {
              console.log('Smart schedule:', start, end, discount);
              setIsSmartSchedulerOpen(false);
              const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
              const total = bookingEquipment.daily_rate * days * (1 - discount / 100);
              alert(`Booking optimized! ${days} days at ${discount}% off. Total: $${total.toFixed(2)}`);
            }}
            onClose={() => setIsSmartSchedulerOpen(false)}
          />
        </Suspense>
      )}

      {/* Feature Showcase Modal */}
      {isFeatureShowcaseOpen && (
        <FeatureShowcase
          onFeatureSelect={handleFeatureSelect}
          onClose={() => setIsFeatureShowcaseOpen(false)}
        />
      )}

      {/* Feature Showcase Floating Button */}
      {currentPage !== 'list-equipment' && isAuthenticated && (
        <button
          onClick={() => setIsFeatureShowcaseOpen(true)}
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

      {/* AI Search Engine Modal */}
      {isAISearchOpen && (
        <Suspense fallback={<PageLoader />}>
          <AISearchEngine
            onSearch={(query, filters) => {
              setIsAISearchOpen(false);
              setSearchQuery(query);
              setSearchCategory(filters.category || '');
              setCurrentPage('browse');
            }}
            onClose={() => setIsAISearchOpen(false)}
          />
        </Suspense>
      )}

      {/* Photo Messaging Modal */}
      {isPhotoMessagingOpen && messageConversationId && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsPhotoMessagingOpen(false)} />
            <div className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <PhotoMessaging
                conversationId={messageConversationId}
                onSendMessage={async (content, photos) => {
                  console.log('Message sent:', { content, photos });
                  setIsPhotoMessagingOpen(false);
                  alert('Message with photos sent successfully!');
                }}
                onClose={() => {
                  setIsPhotoMessagingOpen(false);
                  setMessageConversationId(null);
                }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Enhanced Review System Modal */}
      {isEnhancedReviewOpen && reviewEquipment && reviewBookingId && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEnhancedReviewOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <EnhancedReviewSystem
                equipmentId={reviewEquipment.id}
                equipmentTitle={reviewEquipment.title}
                bookingId={reviewBookingId}
                onSubmit={async (reviewData) => {
                  console.log('Review submitted:', reviewData);
                  setIsEnhancedReviewOpen(false);
                  setReviewEquipment(null);
                  setReviewBookingId(null);
                  alert('Thank you for your detailed review!');
                }}
                onClose={() => {
                  setIsEnhancedReviewOpen(false);
                  setReviewEquipment(null);
                  setReviewBookingId(null);
                }}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Multi-Payment System Modal */}
      {isMultiPaymentOpen && bookingEquipment && (
        <Suspense fallback={<PageLoader />}>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMultiPaymentOpen(false)} />
            <div className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <MultiPaymentSystem
                bookingId="demo-booking-123"
                totalAmount={bookingEquipment.daily_rate * 7}
                depositAmount={bookingEquipment.deposit_amount}
                onPaymentComplete={async (paymentData) => {
                  console.log('Payment completed:', paymentData);
                  setIsMultiPaymentOpen(false);
                  alert(`Payment successful! Method: ${paymentData.method}`);
                }}
                onClose={() => setIsMultiPaymentOpen(false)}
              />
            </div>
          </div>
        </Suspense>
      )}

      {/* Live Chat Modal */}
      {isLiveChatOpen && chatRecipient && (
        <Suspense fallback={<PageLoader />}>
          <LiveChat
            recipientId={chatRecipient.id}
            recipientName={chatRecipient.name}
            recipientAvatar={chatRecipient.avatar}
            equipmentId={selectedEquipment?.id}
            onClose={() => {
              setIsLiveChatOpen(false);
              setChatRecipient(null);
            }}
          />
        </Suspense>
      )}

      {/* Advanced Filters Modal */}
      {isAdvancedFiltersOpen && (
        <Suspense fallback={<PageLoader />}>
          <AdvancedFilters
            onApply={(filters) => {
              console.log('Applied filters:', filters);
              setIsAdvancedFiltersOpen(false);
              // TODO: Apply filters to equipment search
            }}
            onClose={() => setIsAdvancedFiltersOpen(false)}
          />
        </Suspense>
      )}

      {/* Detailed Comparison Modal */}
      {isDetailedComparisonOpen && comparisonEquipment.length > 0 && (
        <Suspense fallback={<PageLoader />}>
          <DetailedComparison
            items={comparisonEquipment}
            onClose={() => {
              setIsDetailedComparisonOpen(false);
              setComparisonEquipment([]);
            }}
            onRemove={(id) => setComparisonEquipment(items => items.filter(i => i.id !== id))}
            onBook={(equipment) => {
              setSelectedEquipment(equipment);
              setIsBookingOpen(true);
              setIsDetailedComparisonOpen(false);
            }}
          />
        </Suspense>
      )}

      {/* Saved Searches Modal */}
      {isSavedSearchesOpen && (
        <Suspense fallback={<PageLoader />}>
          <SavedSearches
            onClose={() => setIsSavedSearchesOpen(false)}
            onSearchClick={(filters) => {
              console.log('Apply saved search:', filters);
              setIsSavedSearchesOpen(false);
              // TODO: Apply filters and navigate to browse
            }}
          />
        </Suspense>
      )}

      {/* Equipment Recommendations Modal */}
      {isRecommendationsOpen && (
        <Suspense fallback={<PageLoader />}>
          <EquipmentRecommendations
            currentEquipment={selectedEquipment || undefined}
            userLocation={user?.user_metadata?.location}
            onEquipmentClick={(equipment) => {
              setSelectedEquipment(equipment);
              setIsRecommendationsOpen(false);
            }}
            onFavoriteClick={(id) => {
              if (favorites.has(id)) {
                removeFavorite(user!.id, id);
                setFavorites(prev => { const next = new Set(prev); next.delete(id); return next; });
              } else {
                addFavorite(user!.id, id);
                setFavorites(prev => new Set(prev).add(id));
              }
            }}
            favorites={favorites}
          />
        </Suspense>
      )}

      {/* Quick Book Modal */}
      {isQuickBookOpen && quickBookEquipment && (
        <Suspense fallback={<PageLoader />}>
          <QuickBook
            equipment={quickBookEquipment}
            lastBookingDates={{
              startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
              endDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
            }}
            savedPaymentMethod={{ type: 'card', last4: '4242' }}
            onConfirm={(bookingData) => {
              console.log('Quick booking confirmed:', bookingData);
              setIsQuickBookOpen(false);
              alert('Booking confirmed! Check your email for details.');
            }}
            onClose={() => {
              setIsQuickBookOpen(false);
              setQuickBookEquipment(null);
            }}
          />
        </Suspense>
      )}

      {/* PWA Features Page */}
      {currentPage === 'pwa' && (
        <Suspense fallback={<PageLoader />}>
          <div className="pt-24 pb-16 min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
            <div className="max-w-4xl mx-auto px-4">
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
              <PWAEnhancedFeatures onClose={() => setCurrentPage('dashboard')} />
            </div>
          </div>
          <Footer />
        </Suspense>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
