import { useState, useEffect, useDeferredValue, useMemo } from 'react';
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
}: BrowsePageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [location, setLocation] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [condition, setCondition] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMapEquipment, setSelectedMapEquipment] = useState<string | undefined>();

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
      case 'newest':
        filtered.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      default:
        filtered.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }

    return filtered;
  }, [deferredSearchQuery, selectedCategory, location, priceRange, condition, sortBy, equipment, categories]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setLocation('');
    setPriceRange([0, 1000]);
    setCondition('');
    setSortBy('featured');
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    location,
    condition,
    priceRange[0] > 0 || priceRange[1] < 1000,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment..."
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            <div className="hidden md:flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Location"
                className="bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none w-32"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
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

              <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'
                  }`}
                  title="Grid view"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'
                  }`}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'map' ? 'bg-gray-100 text-gray-900' : 'text-gray-400'
                  }`}
                  title="Map view"
                >
                  <Map className="w-4 h-4" />
                </button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 bg-white focus:outline-none focus:border-teal-500"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="border-t border-gray-100 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      placeholder="Max"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condition
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Any Condition</option>
                    <option value="new">New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
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
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{filteredEquipment.length}</span>{' '}
            results found
            {searchQuery && (
              <span>
                {' '}
                for "<span className="font-medium">{searchQuery}</span>"
              </span>
            )}
          </p>
        </div>

        {filteredEquipment.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No equipment found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
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
                  onClick={() => {
                    setSelectedMapEquipment(item.id);
                    onEquipmentClick(item);
                  }}
                  onMouseEnter={() => setSelectedMapEquipment(item.id)}
                  onMouseLeave={() => setSelectedMapEquipment(undefined)}
                  className={`w-full bg-white rounded-xl overflow-hidden border transition-all duration-200 flex text-left ${
                    selectedMapEquipment === item.id
                      ? 'border-teal-500 shadow-lg'
                      : 'border-gray-100 hover:border-gray-200 hover:shadow-md'
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
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{item.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-gray-900">${item.daily_rate}</span>
                        <span className="text-sm text-gray-500">/day</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredEquipment.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                  <button
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
                  <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors mb-2">
                    {item.title}
                  </h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="line-clamp-1">{item.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>
                        {item.min_rental_days}-{item.max_rental_days} days
                      </span>
                    </div>
                    <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {item.condition}
                    </span>
                  </div>

                  <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${item.daily_rate}
                      </span>
                      <span className="text-gray-500">/day</span>
                    </div>
                    {item.weekly_rate && (
                      <span className="text-sm text-gray-500">
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
                className="w-full bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex"
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
                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                    <button
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

                  <p className="text-gray-600 line-clamp-2 mb-4">{item.description}</p>

                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {item.rating.toFixed(1)} ({item.total_reviews} reviews)
                    </div>
                    <span className="capitalize px-2 py-0.5 bg-gray-100 rounded">
                      {item.condition}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        ${item.daily_rate}
                      </span>
                      <span className="text-gray-500">/day</span>
                      {item.weekly_rate && (
                        <span className="text-sm text-gray-500 ml-3">
                          ${item.weekly_rate}/week
                        </span>
                      )}
                    </div>
                    <span className="px-4 py-2 bg-teal-500 text-white font-medium rounded-xl">
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
