import { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Star,
  MapPin,
  DollarSign,
  Check,
  ArrowLeftRight,
  Share2,
  Printer,
  Heart,
  Award,
  Info,
  Search,
} from 'lucide-react';
import type { Equipment } from '../../types';

interface EquipmentComparisonProps {
  items?: Equipment[];
  equipment?: Equipment[];
  selectedIds?: string[];
  onClose: () => void;
  onAddEquipment?: () => void;
  onRemove?: (id: string) => void;
  onRemoveEquipment?: (id: string) => void;
  onBook?: (equipment: Equipment) => void;
  onFavorite?: (id: string) => void;
  favorites?: Set<string>;
  maxItems?: number;
}

type ComparisonCategory = 'overview' | 'pricing' | 'specifications' | 'features' | 'reviews';

interface ComparisonRow {
  label: string;
  key: string;
  type: 'text' | 'price' | 'rating' | 'boolean' | 'list' | 'badge';
  getValue: (equipment: Equipment) => string | number | boolean | string[];
  highlight?: 'lowest' | 'highest' | 'best';
}

export default function EquipmentComparison({
  items = [],
  equipment = [],
  selectedIds = [],
  onClose,
  onAddEquipment = () => {},
  onRemove,
  onRemoveEquipment,
  onBook = () => {},
  onFavorite = () => {},
  favorites = new Set(),
  maxItems = 4,
}: EquipmentComparisonProps) {
  const [activeCategory, setActiveCategory] = useState<ComparisonCategory>('overview');
  const [highlightDifferences, setHighlightDifferences] = useState(true);

  // Support both `items` prop (from App.tsx) and `equipment` + `selectedIds` props
  const allEquipment = items.length > 0 ? items : equipment;
  const effectiveSelectedIds = items.length > 0 ? items.map(i => i.id) : selectedIds;
  const handleRemove = onRemove || onRemoveEquipment || (() => {});

  const selectedEquipment = useMemo(() => 
    allEquipment.filter(e => effectiveSelectedIds.includes(e.id)),
    [allEquipment, effectiveSelectedIds]
  );

  const categories: { id: ComparisonCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Info className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'specifications', label: 'Specs', icon: <Search className="w-4 h-4" /> },
    { id: 'features', label: 'Features', icon: <Check className="w-4 h-4" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-4 h-4" /> },
  ];

  const comparisonData: Record<ComparisonCategory, ComparisonRow[]> = {
    overview: [
      { label: 'Brand', key: 'brand', type: 'text', getValue: (e) => e.brand || 'N/A' },
      { label: 'Model', key: 'model', type: 'text', getValue: (e) => e.model || 'N/A' },
      { label: 'Condition', key: 'condition', type: 'badge', getValue: (e) => e.condition },
      { label: 'Location', key: 'location', type: 'text', getValue: (e) => e.location || 'N/A' },
      { label: 'Total Bookings', key: 'bookings', type: 'text', getValue: (e) => e.total_bookings, highlight: 'highest' },
      { label: 'Verified Owner', key: 'verified', type: 'boolean', getValue: (e) => e.owner?.is_verified || false },
    ],
    pricing: [
      { label: 'Daily Rate', key: 'daily', type: 'price', getValue: (e) => e.daily_rate, highlight: 'lowest' },
      { label: 'Weekly Rate', key: 'weekly', type: 'price', getValue: (e) => e.weekly_rate || e.daily_rate * 7 * 0.85, highlight: 'lowest' },
      { label: 'Monthly Rate', key: 'monthly', type: 'price', getValue: (e) => e.monthly_rate || e.daily_rate * 30 * 0.7, highlight: 'lowest' },
      { label: 'Deposit', key: 'deposit', type: 'price', getValue: (e) => e.deposit_amount, highlight: 'lowest' },
      { label: 'Min Rental', key: 'min_days', type: 'text', getValue: (e) => `${e.min_rental_days} day${e.min_rental_days > 1 ? 's' : ''}` },
      { label: 'Max Rental', key: 'max_days', type: 'text', getValue: (e) => `${e.max_rental_days} days` },
    ],
    specifications: [
      ...Object.keys(selectedEquipment[0]?.specifications || {}).map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1),
        key: `spec_${key}`,
        type: 'text' as const,
        getValue: (e: Equipment) => e.specifications?.[key] || 'N/A',
      })),
    ],
    features: [
      { label: 'Features', key: 'features', type: 'list', getValue: (e) => e.features },
    ],
    reviews: [
      { label: 'Overall Rating', key: 'rating', type: 'rating', getValue: (e) => e.rating, highlight: 'highest' },
      { label: 'Total Reviews', key: 'reviews', type: 'text', getValue: (e) => e.total_reviews, highlight: 'highest' },
      { label: 'Owner Rating', key: 'owner_rating', type: 'rating', getValue: (e) => e.owner?.rating || 0, highlight: 'highest' },
    ],
  };

  const getBestValue = (row: ComparisonRow) => {
    if (!row.highlight) return null;
    
    const values = selectedEquipment.map(e => Number(row.getValue(e)) || 0);
    
    if (row.highlight === 'lowest') {
      return Math.min(...values.filter(v => v > 0));
    } else if (row.highlight === 'highest' || row.highlight === 'best') {
      return Math.max(...values);
    }
    return null;
  };

  const isValueBest = (row: ComparisonRow, value: number | string | boolean | string[]) => {
    const bestValue = getBestValue(row);
    if (bestValue === null || typeof value !== 'number') return false;
    return value === bestValue;
  };

  const renderValue = (row: ComparisonRow, equipment: Equipment) => {
    const value = row.getValue(equipment);
    const isBest = highlightDifferences && isValueBest(row, value);

    switch (row.type) {
      case 'price':
        return (
          <span className={`font-semibold ${isBest ? 'text-green-600' : 'text-gray-900'}`}>
            ${typeof value === 'number' ? value.toLocaleString() : value}
            {isBest && <Award className="inline w-4 h-4 ml-1 text-green-500" />}
          </span>
        );
      
      case 'rating':
        return (
          <div className={`flex items-center gap-1 ${isBest ? 'text-amber-500' : 'text-gray-700'}`}>
            <Star className={`w-4 h-4 ${isBest ? 'fill-amber-500' : 'fill-gray-300'}`} />
            <span className="font-semibold">{typeof value === 'number' ? value.toFixed(1) : value}</span>
            {isBest && <Award className="w-4 h-4 ml-1 text-amber-500" />}
          </div>
        );
      
      case 'boolean':
        return value ? (
          <span className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            Yes
          </span>
        ) : (
          <span className="flex items-center gap-1 text-gray-400">
            <X className="w-4 h-4" />
            No
          </span>
        );
      
      case 'badge': {
        const condition = String(value).toLowerCase();
        const badgeColors: Record<string, string> = {
          excellent: 'bg-green-100 text-green-700',
          good: 'bg-blue-100 text-blue-700',
          fair: 'bg-yellow-100 text-yellow-700',
          poor: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${badgeColors[condition] || 'bg-gray-100 text-gray-700'}`}>
            {String(value)}
          </span>
        );
      }
      
      case 'list': {
        if (Array.isArray(value)) {
          return (
            <div className="space-y-1">
              {value.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-sm">
                  <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          );
        }
        return <span className="text-gray-500">None listed</span>;
      }
      
      default:
        return <span className={isBest ? 'font-semibold text-green-600' : 'text-gray-700'}>{String(value)}</span>;
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/compare?ids=${selectedIds.join(',')}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Comparison link copied to clipboard!');
    } catch {
      alert('Failed to copy link');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (selectedEquipment.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Equipment Selected</h2>
          <p className="text-gray-600 mb-6">
            Add equipment to compare their features, prices, and specifications side by side.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAddEquipment}
              className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Equipment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-teal-500" />
                Compare Equipment
              </h1>
              <p className="text-sm text-gray-500">
                {selectedEquipment.length} of {maxItems} items selected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
              />
              Highlight best values
            </label>
            <div className="h-6 w-px bg-gray-200" />
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Share comparison"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              title="Print comparison"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Equipment Header Row */}
            <div className="grid gap-px bg-gray-200" style={{ gridTemplateColumns: `200px repeat(${selectedEquipment.length}, 1fr) ${selectedEquipment.length < maxItems ? '100px' : ''}` }}>
              <div className="bg-gray-50 p-4" />
              
              {selectedEquipment.map((equip) => (
                <div key={equip.id} className="bg-white p-4">
                  <div className="relative">
                    <button
                      onClick={() => handleRemove(equip.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={equip.images[0]}
                      alt={equip.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                      {equip.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {equip.rating.toFixed(1)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {equip.location?.split(',')[0]}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onBook(equip)}
                        className="flex-1 py-2 bg-teal-500 text-white text-xs font-medium rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() => onFavorite(equip.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          favorites.has(equip.id)
                            ? 'bg-red-50 text-red-500'
                            : 'bg-gray-100 text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${favorites.has(equip.id) ? 'fill-red-500' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {selectedEquipment.length < maxItems && (
                <div className="bg-gray-50 p-4 flex items-center justify-center">
                  <button
                    onClick={onAddEquipment}
                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-teal-500 transition-colors"
                  >
                    <div className="w-12 h-12 border-2 border-dashed border-current rounded-xl flex items-center justify-center">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-xs">Add</span>
                  </button>
                </div>
              )}
            </div>

            {/* Comparison Rows */}
            {comparisonData[activeCategory].map((row, index) => (
              <div
                key={row.key}
                className={`grid gap-px bg-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                style={{ gridTemplateColumns: `200px repeat(${selectedEquipment.length}, 1fr) ${selectedEquipment.length < maxItems ? '100px' : ''}` }}
              >
                <div className={`p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                  <span className="text-sm font-medium text-gray-700">{row.label}</span>
                </div>
                
                {selectedEquipment.map((equip) => (
                  <div
                    key={equip.id}
                    className={`p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                  >
                    {renderValue(row, equip)}
                  </div>
                ))}
                
                {selectedEquipment.length < maxItems && (
                  <div className={`p-4 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Quick Actions Footer */}
          <div className="mt-6 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">Need help deciding?</h3>
                <p className="text-white/80 text-sm">
                  Our AI assistant can help you choose the best equipment for your needs.
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-teal-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Ask Kayd AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
