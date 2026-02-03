import { useState } from 'react';
import { SlidersHorizontal, X, Check, DollarSign, Star, Zap, Shield } from 'lucide-react';

interface AdvancedFiltersProps {
  onApply: (filters: FilterOptions) => void;
  onClose: () => void;
}

export interface FilterOptions {
  priceRange: [number, number];
  availability: {
    startDate: string;
    endDate: string;
  } | null;
  location: {
    address: string;
    radius: number;
  } | null;
  rating: number | null;
  features: string[];
  condition: string[];
  deliveryOptions: string[];
  instantBook: boolean;
  verifiedOwners: boolean;
  insurance: boolean;
}

export default function AdvancedFilters({ onApply, onClose }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 1000],
    availability: null,
    location: null,
    rating: null,
    features: [],
    condition: [],
    deliveryOptions: [],
    instantBook: false,
    verifiedOwners: false,
    insurance: false,
  });

  const featuresList = [
    'GPS Tracking',
    'Climate Control',
    'Safety Equipment',
    'Remote Start',
    'Bluetooth',
    'Backup Camera',
    'Power Steering',
    'Air Conditioning',
  ];

  const conditionOptions = ['New', 'Excellent', 'Good', 'Fair'];
  // const deliveryOptionsList = ['Self Pickup', 'Owner Delivery', 'Third-Party Courier'];

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      priceRange: [0, 1000],
      availability: null,
      location: null,
      rating: null,
      features: [],
      condition: [],
      deliveryOptions: [],
      instantBook: false,
      verifiedOwners: false,
      insurance: false,
    });
  };

  const activeFiltersCount = [
    filters.rating !== null,
    filters.features.length > 0,
    filters.condition.length > 0,
    filters.deliveryOptions.length > 0,
    filters.instantBook,
    filters.verifiedOwners,
    filters.insurance,
  ].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
              <p className="text-sm text-gray-600">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Price Range (per day)</h3>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceRange: [Number(e.target.value), filters.priceRange[1]],
                  })
                }
                placeholder="Min"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    priceRange: [filters.priceRange[0], Number(e.target.value)],
                  })
                }
                placeholder="Max"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
              />
            </div>
            <input
              type="range"
              min="0"
              max="2000"
              step="50"
              value={filters.priceRange[1]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  priceRange: [filters.priceRange[0], Number(e.target.value)],
                })
              }
              className="w-full accent-teal-500"
            />
          </div>

          {/* Rating */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Minimum Rating</h3>
            </div>
            <div className="flex gap-2">
              {[4.5, 4.0, 3.5, 3.0].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      rating: filters.rating === rating ? null : rating,
                    })
                  }
                  className={`flex-1 px-4 py-2.5 rounded-xl border transition-all ${
                    filters.rating === rating
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <span className="font-semibold">{rating}+</span>
                  <Star className="w-3 h-3 inline ml-1 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Features</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {featuresList.map((feature) => (
                <button
                  key={feature}
                  onClick={() => {
                    const newFeatures = filters.features.includes(feature)
                      ? filters.features.filter((f) => f !== feature)
                      : [...filters.features, feature];
                    setFilters({ ...filters, features: newFeatures });
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                    filters.features.includes(feature)
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      filters.features.includes(feature)
                        ? 'bg-teal-500 border-teal-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {filters.features.includes(feature) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  {feature}
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-gray-900">Condition</h3>
            </div>
            <div className="flex gap-2">
              {conditionOptions.map((condition) => (
                <button
                  key={condition}
                  onClick={() => {
                    const newConditions = filters.condition.includes(condition)
                      ? filters.condition.filter((c) => c !== condition)
                      : [...filters.condition, condition];
                    setFilters({ ...filters, condition: newConditions });
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl border text-sm transition-all ${
                    filters.condition.includes(condition)
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Toggles */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Quick Options</h3>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Instant Book</p>
                    <p className="text-sm text-gray-500">Book without waiting for approval</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.instantBook}
                  onChange={(e) =>
                    setFilters({ ...filters, instantBook: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-teal-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Verified Owners Only</p>
                    <p className="text-sm text-gray-500">Equipment from verified accounts</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.verifiedOwners}
                  onChange={(e) =>
                    setFilters({ ...filters, verifiedOwners: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-teal-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-gray-300 cursor-pointer transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Insurance Available</p>
                    <p className="text-sm text-gray-500">Equipment with damage protection</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={filters.insurance}
                  onChange={(e) =>
                    setFilters({ ...filters, insurance: e.target.checked })
                  }
                  className="w-5 h-5 rounded accent-teal-500"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Reset All
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all"
          >
            Apply Filters ({activeFiltersCount})
          </button>
        </div>
      </div>
    </div>
  );
}
