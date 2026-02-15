import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  TrendingUp,
  Clock,
  Users,
  Zap,
  Target,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import type { Equipment, Booking } from '../../types';
import { getEquipment, getBookings } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface AdvancedSearchProps {
  onEquipmentSelect?: (equipment: Equipment) => void;
  className?: string;
}

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  priceRange: [number, number];
  rating: number;
  availability: string;
  features: string[];
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance' | 'newest';
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface AISuggestion {
  type: 'popular' | 'trending' | 'similar' | 'seasonal' | 'personalized';
  title: string;
  description: string;
  equipment?: Equipment[];
  query?: string;
}

export default function AdvancedSearch({ onEquipmentSelect, className = '' }: AdvancedSearchProps) {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    location: '',
    priceRange: [0, 1000],
    rating: 0,
    availability: '',
    features: [],
    sortBy: 'relevance',
  });

  const deferredQuery = useDeferredValue(filters.query);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [equipmentData, bookingsData] = await Promise.all([
          getEquipment({ limit: 200 }),
          getBookings({}),
        ]);

        setEquipment(equipmentData.data);
        setBookings(bookingsData);

        // Generate AI suggestions
        generateAISuggestions(equipmentData.data, bookingsData);
      } catch (error) {
        console.error('Failed to load search data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const generateAISuggestions = (equipmentList: Equipment[], bookingsList: Booking[]) => {
    const suggestions: AISuggestion[] = [];

    // Popular equipment
    const popularEquipment = equipmentList
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 3);

    if (popularEquipment.length > 0) {
      suggestions.push({
        type: 'popular',
        title: 'Most Popular Equipment',
        description: 'Highly rated equipment trusted by our community',
        equipment: popularEquipment,
      });
    }

    // Trending based on recent bookings
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const recentBookings = bookingsList.filter(b =>
      new Date(b.created_at) > lastWeek
    );

    const trendingIds = [...new Set(recentBookings.map(b => b.equipment_id))];
    const trendingEquipment = equipmentList
      .filter(eq => trendingIds.includes(eq.id))
      .slice(0, 3);

    if (trendingEquipment.length > 0) {
      suggestions.push({
        type: 'trending',
        title: 'Trending This Week',
        description: 'Equipment getting lots of attention recently',
        equipment: trendingEquipment,
      });
    }

    // Seasonal suggestions
    const currentMonth = new Date().getMonth();
    const seasonalEquipment = equipmentList
      .filter(eq => {
        // Construction equipment more popular in spring/summer
        if ([2, 3, 4, 5].includes(currentMonth)) {
          return eq.category?.name?.toLowerCase().includes('construction');
        }
        // Landscaping in spring/fall
        if ([2, 3, 8, 9].includes(currentMonth)) {
          return eq.category?.name?.toLowerCase().includes('landscaping');
        }
        return false;
      })
      .slice(0, 3);

    if (seasonalEquipment.length > 0) {
      suggestions.push({
        type: 'seasonal',
        title: 'Seasonal Favorites',
        description: 'Perfect equipment for this time of year',
        equipment: seasonalEquipment,
      });
    }

    // Personalized suggestions based on user history
    if (user) {
      const userBookings = bookingsList.filter(b => b.renter_id === user.id);
      const userCategories = [...new Set(
        userBookings
          .map(b => b.equipment?.category?.name)
          .filter(Boolean)
      )];

      const personalizedEquipment = equipmentList
        .filter(eq =>
          userCategories.some(cat =>
            eq.category?.name?.toLowerCase().includes(cat.toLowerCase())
          )
        )
        .slice(0, 3);

      if (personalizedEquipment.length > 0) {
        suggestions.push({
          type: 'personalized',
          title: 'Recommended for You',
          description: 'Based on your rental history',
          equipment: personalizedEquipment,
        });
      }
    }

    setAiSuggestions(suggestions);
  };

  const filteredEquipment = useMemo(() => {
    let results = equipment.filter(eq => {
      // Text search
      if (deferredQuery) {
        const searchTerm = deferredQuery.toLowerCase();
        const matchesQuery =
          eq.name.toLowerCase().includes(searchTerm) ||
          eq.description.toLowerCase().includes(searchTerm) ||
          eq.category?.name.toLowerCase().includes(searchTerm) ||
          eq.location?.toLowerCase().includes(searchTerm) ||
          eq.features.some(feature => feature.toLowerCase().includes(searchTerm));

        if (!matchesQuery) return false;
      }

      // Category filter
      if (filters.category && eq.category?.name !== filters.category) {
        return false;
      }

      // Location filter
      if (filters.location && !eq.location?.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }

      // Price range
      if (eq.daily_rate < filters.priceRange[0] || eq.daily_rate > filters.priceRange[1]) {
        return false;
      }

      // Rating filter
      if (filters.rating > 0 && (eq.rating || 0) < filters.rating) {
        return false;
      }

      // Features filter
      if (filters.features.length > 0) {
        const hasAllFeatures = filters.features.every(feature =>
          eq.features.some(eqFeature =>
            eqFeature.toLowerCase().includes(feature.toLowerCase())
          )
        );
        if (!hasAllFeatures) return false;
      }

      return true;
    });

    // Sorting
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price_low':
          return a.daily_rate - b.daily_rate;
        case 'price_high':
          return b.daily_rate - a.daily_rate;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'distance':
          // Mock distance sorting - in real app would use geolocation
          return Math.random() - 0.5;
        default:
          return 0;
      }
    });

    return results;
  }, [equipment, deferredQuery, filters]);

  const categories = useMemo(() => {
    return [...new Set(equipment.map(eq => eq.category?.name).filter(Boolean))];
  }, [equipment]);

  const availableFeatures = useMemo(() => {
    const allFeatures = equipment.flatMap(eq => eq.features);
    return [...new Set(allFeatures)].sort();
  }, [equipment]);

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (suggestion.query) {
      setFilters(prev => ({ ...prev, query: suggestion.query! }));
    } else if (suggestion.equipment && suggestion.equipment.length > 0) {
      onEquipmentSelect?.(suggestion.equipment[0]);
    }
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      category: '',
      location: '',
      priceRange: [0, 1000],
      rating: 0,
      availability: '',
      features: [],
      sortBy: 'relevance',
    });
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search equipment, features, locations..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
              showFilters
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* AI Suggestions */}
        {aiSuggestions.length > 0 && !filters.query && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">AI Suggestions</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {aiSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex-shrink-0 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-purple-200"
                >
                  {suggestion.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(filters.category || filters.location || filters.rating > 0 || filters.features.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {filters.category && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {filters.category}
              </span>
            )}
            {filters.location && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                📍 {filters.location}
              </span>
            )}
            {filters.rating > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">
                ⭐ {filters.rating}+ stars
              </span>
            )}
            {filters.features.map((feature, index) => (
              <span key={index} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                {feature}
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Rate: ${filters.priceRange[0]} - ${filters.priceRange[1]}
              </label>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={filters.priceRange[1]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                  }))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters(prev => ({ ...prev, rating: prev.rating === rating ? 0 : rating }))}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${
                      filters.rating >= rating
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${filters.rating >= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Features
            </label>
            <div className="flex flex-wrap gap-2">
              {availableFeatures.slice(0, 12).map((feature) => (
                <button
                  key={feature}
                  onClick={() => setFilters(prev => ({
                    ...prev,
                    features: prev.features.includes(feature)
                      ? prev.features.filter(f => f !== feature)
                      : [...prev.features, feature]
                  }))}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filters.features.includes(feature)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SearchFilters['sortBy'] }))}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="relevance">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="distance">Distance</option>
                <option value="newest">Newest</option>
              </select>
            </div>
            <div className="text-sm text-gray-600">
              {filteredEquipment.length} results found
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => (
          <div
            key={eq.id}
            onClick={() => onEquipmentSelect?.(eq)}
            className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer group"
          >
            <div className="relative mb-4">
              <img
                src={eq.images[0] || '/placeholder-equipment.jpg'}
                alt={eq.name}
                className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{eq.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {eq.name}
                </h3>
                <p className="text-sm text-gray-600">{eq.category?.name}</p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{eq.location || 'Location not specified'}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-lg font-bold text-gray-900">${eq.daily_rate}</span>
                  <span className="text-sm text-gray-600">/day</span>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  View Details
                </button>
              </div>

              <div className="flex flex-wrap gap-1">
                {eq.features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                  >
                    {feature}
                  </span>
                ))}
                {eq.features.length > 3 && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    +{eq.features.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No equipment found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters.</p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}