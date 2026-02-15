import { useState } from 'react';
import { X, Check, Minus, Star, Share2 } from 'lucide-react';
import type { Equipment } from '../../types';

interface DetailedComparisonProps {
  items: Equipment[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onBook: (equipment: Equipment) => void;
}

export default function DetailedComparison({ items, onClose, onRemove, onBook }: DetailedComparisonProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'pricing' | 'specifications'>('overview');

  const comparisonRows = [
    {
      category: 'Basic Info',
      rows: [
        { label: 'Brand', getValue: (item: Equipment) => item.brand || 'N/A' },
        { label: 'Model', getValue: (item: Equipment) => item.model || 'N/A' },
        { label: 'Condition', getValue: (item: Equipment) => item.condition },
        { label: 'Location', getValue: (item: Equipment) => item.location || 'N/A' },
      ],
    },
    {
      category: 'Pricing',
      rows: [
        { 
          label: 'Daily Rate', 
          getValue: (item: Equipment) => `$${item.daily_rate}/day`,
          highlight: (items: Equipment[]) => {
            const min = Math.min(...items.map(i => i.daily_rate));
            return (item: Equipment) => item.daily_rate === min;
          },
        },
        { 
          label: 'Weekly Rate', 
          getValue: (item: Equipment) => item.weekly_rate ? `$${item.weekly_rate}/week` : 'N/A',
          highlight: (items: Equipment[]) => {
            const rates = items.map(i => i.weekly_rate).filter(Boolean) as number[];
            if (rates.length === 0) return () => false;
            const min = Math.min(...rates);
            return (item: Equipment) => item.weekly_rate === min;
          },
        },
        { 
          label: 'Monthly Rate', 
          getValue: (item: Equipment) => item.monthly_rate ? `$${item.monthly_rate}/month` : 'N/A' 
        },
        { 
          label: 'Deposit', 
          getValue: (item: Equipment) => `$${item.deposit_amount}`,
          highlight: (items: Equipment[]) => {
            const min = Math.min(...items.map(i => i.deposit_amount));
            return (item: Equipment) => item.deposit_amount === min;
          },
        },
      ],
    },
    {
      category: 'Ratings & Reviews',
      rows: [
        { 
          label: 'Rating', 
          getValue: (item: Equipment) => (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          ),
          highlight: (items: Equipment[]) => {
            const max = Math.max(...items.map(i => i.rating));
            return (item: Equipment) => item.rating === max;
          },
        },
        { 
          label: 'Total Reviews', 
          getValue: (item: Equipment) => item.total_reviews,
          highlight: (items: Equipment[]) => {
            const max = Math.max(...items.map(i => i.total_reviews));
            return (item: Equipment) => item.total_reviews === max;
          },
        },
        { label: 'Total Bookings', getValue: (item: Equipment) => item.total_bookings },
      ],
    },
    {
      category: 'Rental Terms',
      rows: [
        { label: 'Min Days', getValue: (item: Equipment) => `${item.min_rental_days} days` },
        { label: 'Max Days', getValue: (item: Equipment) => `${item.max_rental_days} days` },
        { label: 'Availability', getValue: (item: Equipment) => item.availability_status },
      ],
    },
  ];

  const featuresComparison = () => {
    const allFeatures = new Set<string>();
    items.forEach(item => item.features.forEach(f => allFeatures.add(f)));
    return Array.from(allFeatures);
  };

  const specificationsComparison = () => {
    const allSpecs = new Set<string>();
    items.forEach(item => Object.keys(item.specifications).forEach(s => allSpecs.add(s)));
    return Array.from(allSpecs);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Equipment Comparison</h2>
            <p className="text-sm text-gray-600">Compare {items.length} items side-by-side</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                // Share comparison logic
                alert('Share comparison link copied!');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50">
          {['overview', 'pricing', 'specifications'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as typeof viewMode)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                viewMode === mode
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
              {viewMode === mode && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
              )}
            </button>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-white z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 w-48">
                  {/* Empty corner cell */}
                </th>
                {items.map((item) => (
                  <th key={item.id} className="px-4 py-3 w-80">
                    <div className="space-y-3">
                      <div className="relative h-40 rounded-xl overflow-hidden">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onRemove(item.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 line-clamp-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium text-gray-900">
                            {item.rating.toFixed(1)}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({item.total_reviews})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onBook(item)}
                        className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                      >
                        Book Now
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {viewMode === 'overview' && comparisonRows.map((section) => (
                <>
                  <tr key={section.category} className="bg-gray-50">
                    <td colSpan={items.length + 1} className="px-4 py-3 font-semibold text-gray-900">
                      {section.category}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr key={row.label} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">
                        {row.label}
                      </td>
                      {items.map((item) => {
                        const value = row.getValue(item);
                        const isHighlighted = row.highlight?.(items)?.(item) ?? false;
                        return (
                          <td
                            key={item.id}
                            className={`px-4 py-3 text-sm ${
                              isHighlighted
                                ? 'bg-green-50 font-semibold text-green-700'
                                : 'text-gray-900'
                            }`}
                          >
                            {value}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </>
              ))}

              {/* Features Comparison */}
              {viewMode === 'overview' && (
                <>
                  <tr className="bg-gray-50">
                    <td colSpan={items.length + 1} className="px-4 py-3 font-semibold text-gray-900">
                      Features
                    </td>
                  </tr>
                  {featuresComparison().map((feature) => (
                    <tr key={feature} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700">
                        {feature}
                      </td>
                      {items.map((item) => (
                        <td key={item.id} className="px-4 py-3 text-center">
                          {item.features.includes(feature) ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <Minus className="w-5 h-5 text-gray-300 mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}

              {/* Specifications Comparison */}
              {viewMode === 'specifications' && (
                <>
                  <tr className="bg-gray-50">
                    <td colSpan={items.length + 1} className="px-4 py-3 font-semibold text-gray-900">
                      Technical Specifications
                    </td>
                  </tr>
                  {specificationsComparison().map((spec) => (
                    <tr key={spec} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-sm font-medium text-gray-700 capitalize">
                        {spec}
                      </td>
                      {items.map((item) => (
                        <td key={item.id} className="px-4 py-3 text-sm text-gray-900">
                          {item.specifications[spec] || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Best Price</p>
              <p className="font-semibold text-gray-900">
                ${Math.min(...items.map(i => i.daily_rate))}/day
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Highest Rated</p>
              <div className="flex items-center justify-center gap-1">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-gray-900">
                  {Math.max(...items.map(i => i.rating)).toFixed(1)}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Most Booked</p>
              <p className="font-semibold text-gray-900">
                {Math.max(...items.map(i => i.total_bookings))} bookings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
