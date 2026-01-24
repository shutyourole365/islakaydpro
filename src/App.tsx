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
import InstallPrompt, { OfflineIndicator } from './components/pwa/InstallPrompt';
import { addFavorite, removeFavorite } from './services/database';

// Lazy load new feature components
const OnboardingFlow = lazy(() => import('./components/onboarding/OnboardingFlow'));
const SmartRecommendations = lazy(() => import('./components/recommendations/SmartRecommendations'));
const RealTimeChat = lazy(() => import('./components/chat/RealTimeChat'));
const AchievementsSystem = lazy(() => import('./components/gamification/AchievementsSystem'));
const ARPreview = lazy(() => import('./components/ar/ARPreview'));
const PriceAlerts = lazy(() => import('./components/alerts/PriceAlerts'));

// Lazy load heavy components for better performance
const SecurityCenter = lazy(() => import('./components/security/SecurityCenter'));
const AnalyticsDashboard = lazy(() => import('./components/dashboard/AnalyticsDashboard'));
const AdminPanel = lazy(() => import('./components/admin/AdminPanel'));
const NotificationCenter = lazy(() => import('./components/notifications/NotificationCenter'));
const PaymentSettings = lazy(() => import('./components/payments/PaymentSettings'));

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

type PageType = 'home' | 'browse' | 'dashboard' | 'list-equipment' | 'security' | 'analytics' | 'admin' | 'notifications' | 'payments';

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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
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
      console.error('Failed to load favorites:', error);
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
      console.error('Error fetching categories:', error);
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
  };

  const handleCategoryClick = (category: Category) => {
    setSearchCategory(category.slug);
    setCurrentPage('browse');
  };

  const handleEquipmentClick = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
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
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleBook = (equipment: Equipment, _dates: { start: string; end: string }) => {
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
    console.log('Booking completed:', bookingData);
    setIsBookingOpen(false);
    setBookingEquipment(null);
    // Show success notification
    alert('🎉 Booking confirmed! Check your email for confirmation details.');
  };

  /* TODO: Wire up to equipment cards for comparison feature
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
  };
  */

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
