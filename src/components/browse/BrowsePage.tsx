import { useState, useDeferredValue, useMemo } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Grid,
  List,
  X,
  Star,
  Heart,
  Shield,
  Clock,
  ArrowLeft,
  Map,
  PackageOpen,
  Plus,
} from 'lucide-react';
import type { Equipment, Category } from '../../types';
import EquipmentMap from '../map/EquipmentMap';

interface BrowsePageProps {
  equipment: Equipment[];
  categories: Category[];
  initialQuery?: string;
  initialCategory?: string;
  onEquipmentClick: (equipment: Equipment) => void;
  onFavoriteClick: (equipmentId: string) => void;
  favorites: Set<string>;
  onBack: () => void;
  isLoading?: boolean;
  onListEquipment?: () => void;
}

export default function BrowsePage({
  equipment,
  categories,
  initialQuery = '',
  initialCategory = '',
  onEquipmentClick,
  onFavoriteClick,
  favorites,
  onBack,
  isLoading = false,
  onListEquipment,
}: BrowsePageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [condition, setCondition] = useState('');
  const [rentalDuration, setRentalDuration] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMapEquipment, setSelectedMapEquipment] = useState<string | undefined>();
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeRadius, setNearMeRadius] = useState(50); // km
  const [locating, setLocating] = useState(false);

  // Use deferred value for search to improve performance during typing
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // Memoize filtered equipment for better performance
  const filteredEquipment = useMemo(() => {
    let filtered = [...equipment];

    if (deferredSearchQuery) {
      const query = deferredSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => {
        const category = categories.find((c) => c.id === item.category_id);
        return category?.slug === selectedCategory || category?.name === selectedCategory;
      });
    }

    if (location) {
      filtered = filtered.filter((item) =>
        item.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (item) => item.daily_rate >= priceRange[0] && item.daily_rate <= priceRange[1]
    );

    if (condition) {
      filtered = filtered.filter((item) => item.condition === condition);
    }

    if (rentalDuration) {
      filtered = filtered.filter((item) => {
        const min = item.min_rental_days;
        const max = item.max_rental_days;
        switch (rentalDuration) {
          case 'short':
            return min <= 3;
          case 'week':
            return min <= 7 && max >= 4;
          case 'month':
            return min <= 29 && max >= 8;
          case 'long':
            return max >= 30;
          default:
            return true;
        }
      });
    }

    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.daily_rate - b.daily_rate);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.daily_rate - a.daily_rate);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        filtered.sort((a, b) => b.total_bookings - a.total_bookings);
        break;
      case 'newest':
        filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    // Near Me geo filter
    if (userCoords) {
      filtered = filtered.filter(item => {
        if (item.latitude == null || item.longitude == null) return false;
        return getDistanceKm(userCoords.lat, userCoords.lng, item.latitude, item.longitude) <= nearMeRadius;
      });
      // Sort by distance when near-me is active
      filtered.sort((a, b) => {
        const dA = a.latitude != null && a.longitude != null ? getDistanceKm(userCoords.lat, userCoords.lng, a.latitude, a.longitude) : 9999;
        const dB = b.latitude != null && b.longitude != null ? getDistanceKm(userCoords.lat, userCoords.lng, b.latitude, b.longitude) : 9999;
        return dA - dB;
      });
    }

    return filtered;
  }, [deferredSearchQuery, selectedCategory, location, priceRange, condition, rentalDuration, sortBy, equipment, categories, userCoords, nearMeRadius]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setLocation('');
    setPriceRange([0, 1000]);
    setCondition('');
    setRentalDuration('');
    setSortBy('featured');
    setUserCoords(null);
  };

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocation('Near Me');
        setViewMode('map');
        setLocating(false);
      },
      () => { setLocating(false); }
    );
  };

  // Haversine distance in km
  const getDistanceKm = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    location,
    condition,
    rentalDuration,
    priceRange[0] > 0 || priceRange[1] < 1000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
             >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex-1 flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-transparent focus-within:border-teal-500 transition-colors">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
              />
              {searchQuery && (
                <button aria-label="Clear search" onClick={() => setSearchQuery('')}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-transparent focus-within:border-teal-500 transition-colors">
                <MapPin className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); if (e.target.value !== 'Near Me') setUserCoords(null); }}
                  placeholder="Location"
                  className="bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none w-32"
                />
                {location && (
                  <button onClick={() => { setLocation(''); setUserCoords(null); }}>
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  </button>
                )}
              </div>
              <button
                onClick={handleNearMe}
                disabled={locating}
                title="Find equipment near me"
                className={`flex items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-medium transition-colors border ${userCoords ? 'bg-teal-500 text-white border-teal-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-teal-400 hover:text-teal-600'}`}
              >
                <MapPin className="w-4 h-4" />
                {locating ? '...' : 'Near Me'}
              </button>
              {userCoords && (
                <select
                  value={nearMeRadius}
                  onChange={e => setNearMeRadius(Number(e.target.value))}
                  className="px-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 focus:outline-none"
                >
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                  <option value={250}>250 km</option>
                </select>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-brand'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                All
              </button>
              {categories.slice(0, 6).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category.slug
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-brand'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                  showFilters || activeFiltersCount > 0
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-1 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'map' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-400'
                  }`}
                  title="Map view"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-200 bg-white dark:bg-gray-800 focus:outline-none focus:border-teal-500"
              >
                <option value="featured">Featured</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price Range (per day)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      placeholder="Min"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      placeholder="Max"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Any Condition</option>
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rental Length
                  </label>
                  <select
                    value={rentalDuration}
                    onChange={(e) => setRentalDuration(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Any Length</option>
                    <option value="short">1-3 days</option>
                    <option value="week">4-7 days</option>
                    <option value="month">1-4 weeks</option>
                    <option value="long">Monthly+</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                   >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">{filteredEquipment.length}</span>{' '}
            results found
            {searchQuery && (
              <span>
                {' '}
                for "<span className="font-medium">{searchQuery}</span>"
              </span>
            )}
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-700/60 rounded" />
                  <div className="h-3 w-1/3 bg-gray-100 dark:bg-gray-700/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEquipment.length === 0 ? (
          equipment.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <PackageOpen className="w-10 h-10 text-teal-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No equipment listed yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Be the first to list your gear and start earning. It only takes a couple of
                minutes to post a listing.
              </p>
              {onListEquipment && (
                <button
                  onClick={onListEquipment}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-brand hover:shadow-brand-lg transition-all"
                >
                  <Plus className="w-5 h-5" />
                  List your equipment
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No matches found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                {activeFiltersCount > 0
                  ? "We couldn't find equipment matching your filters. Try widening your search or clearing some filters."
                  : "We couldn't find any available equipment right now. Check back soon — new listings are added regularly."}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl shadow-brand hover:shadow-brand-lg transition-all"
                  >
                    Clear All Filters
                  </button>
                )}
                {onListEquipment && (
                  <button
                    onClick={onListEquipment}
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    List your equipment
                  </button>
                )}
              </div>
            </div>
          )
        ) : viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[600px] lg:h-[calc(100vh-280px)] lg:sticky lg:top-40">
              <EquipmentMap
                equipment={filteredEquipment}
                onEquipmentClick={(item) => {
                  setSelectedMapEquipment(item.id);
                  onEquipmentClick(item);
                }}
                selectedId={selectedMapEquipment}
                className="h-full"
              />
            </div>
            <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredEquipment.map((item) => (
                <button
                  key={item.id}
                  aria-label={`View ${item.title}`}
                  onClick={() => {
                    setSelectedMapEquipment(item.id);
                    onEquipmentClick(item);
                  }}
                  onMouseEnter={() => setSelectedMapEquipment(item.id)}
                  onMouseLeave={() => setSelectedMapEquipment(undefined)}
                  className={`w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden border transition-all duration-200 flex text-left ${
                    selectedMapEquipment === item.id
                      ? 'border-teal-500 shadow-brand'
                      : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md'
                  }`}
                >
                  <div className="w-32 h-28 flex-shrink-0 relative overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">${item.daily_rate}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">/day</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEquipment.map((item, index) => (
              <div
                key={item.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800/60 hover:shadow-brand hover:-translate-y-1 transition-all duration-300 animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${Math.min(index * 40, 320)}ms`, animationFillMode: 'both' }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  <button
                    aria-label={favorites.has(item.id) ? 'Remove from saved' : 'Save to favorites'}
                    aria-pressed={favorites.has(item.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavoriteClick(item.id);
                    }}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      favorites.has(item.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${favorites.has(item.id) ? 'fill-white' : ''}`}
                    />
                  </button>

                  {item.is_featured && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-semibold text-white flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Featured
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        {item.rating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full">
                      <Shield className="w-4 h-4 text-teal-500" />
                      <span className="text-xs font-medium text-gray-700">Verified</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onEquipmentClick(item)}
                  className="w-full p-5 text-left"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mb-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>
                        {item.min_rental_days}-{item.max_rental_days} days
                      </span>
                    </div>
                    <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                      {item.condition}
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${item.daily_rate}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/day</span>
                    </div>
                    {item.weekly_rate && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ${item.weekly_rate}/week
                      </span>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEquipment.map((item) => (
              <button
                key={item.id}
                onClick={() => onEquipmentClick(item)}
                className="w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800/60 hover:shadow-brand transition-all duration-300 flex"
              >
                <div className="w-64 h-48 flex-shrink-0 relative overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {item.is_featured && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-semibold text-white flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      Featured
                    </div>
                  )}
                </div>

                <div className="flex-1 p-6 text-left">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                    <button
                      aria-label={favorites.has(item.id) ? 'Remove from saved' : 'Save to favorites'}
                      aria-pressed={favorites.has(item.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onFavoriteClick(item.id);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        favorites.has(item.id)
                          ? 'text-red-500'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 ${favorites.has(item.id) ? 'fill-red-500' : ''}`}
                      />
                    </button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">{item.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {item.rating.toFixed(1)} ({item.total_reviews} reviews)
                    </div>
                    <span className="capitalize px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">
                      {item.condition}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${item.daily_rate}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">/day</span>
                      {item.weekly_rate && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-3">
                          ${item.weekly_rate}/week
                        </span>
                      )}
                    </div>
                    <span className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-xl shadow-brand">
                      View Details
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
