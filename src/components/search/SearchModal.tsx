import { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  MapPin,
  Calendar,
  SlidersHorizontal,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, filters: SearchFilters) => void;
}

interface SearchFilters {
  location: string;
  dateRange: string;
  priceMin: number;
  priceMax: number;
  category: string;
}

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    dateRange: '',
    priceMin: 0,
    priceMax: 1000,
    category: '',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '/' && !isOpen) {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const recentSearches = [
    'Excavator rental near me',
    'DSLR camera for weekend',
    'Party tent 20x40',
    'Power drill DeWalt',
  ];

  const trendingSearches = [
    { query: 'Construction Equipment', count: '2.4k searches' },
    { query: 'Wedding Photography Gear', count: '1.8k searches' },
    { query: 'DJ Equipment', count: '1.2k searches' },
    { query: 'Moving Trucks', count: '980 searches' },
  ];

  const categories = [
    'All Categories',
    'Construction',
    'Power Tools',
    'Photography',
    'Audio & Video',
    'Landscaping',
    'Events',
    'Vehicles',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-2xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for equipment, tools, vehicles..."
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none text-lg"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                showFilters
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600">
              <MapPin className="w-4 h-4" />
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="bg-transparent focus:outline-none w-28"
              />
            </div>

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600">
              <Calendar className="w-4 h-4" />
              <input
                type="text"
                placeholder="Dates"
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="bg-transparent focus:outline-none w-24"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 bg-white focus:outline-none focus:border-teal-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showFilters && (
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range (per day)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filters.priceMin}
                      onChange={(e) =>
                        setFilters({ ...filters, priceMin: Number(e.target.value) })
                      }
                      placeholder="Min"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filters.priceMax}
                      onChange={(e) =>
                        setFilters({ ...filters, priceMax: Number(e.target.value) })
                      }
                      placeholder="Max"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition
                </label>
                <div className="flex items-center gap-2">
                  {['Any', 'New', 'Excellent', 'Good'].map((condition) => (
                    <button
                      key={condition}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-h-[400px] overflow-y-auto">
          {!query && (
            <>
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </div>
                <div className="space-y-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(search)}
                      className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-gray-700">{search}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <TrendingUp className="w-4 h-4" />
                  Trending Searches
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {trendingSearches.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setQuery(item.query)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.query}</p>
                        <p className="text-sm text-gray-500">{item.count}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {query && (
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4">
                Press Enter to search for "{query}"
              </p>
              <button
                onClick={() => onSearch(query, filters)}
                className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search Equipment
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-200 text-xs">
                  Enter
                </kbd>
                to search
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-200 text-xs">
                  Esc
                </kbd>
                to close
              </span>
            </div>
            <span>Powered by Kayd AI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
