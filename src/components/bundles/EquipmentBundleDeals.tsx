import { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Percent,
  Calendar,
  ChevronRight,
  ChevronDown,
  Search,
  Edit2,
  Share2,
  Star,
  ShoppingCart,
  CheckCircle,
  X,
  Gift,
  Sparkles,
  Clock,
} from 'lucide-react';
import type { Equipment, EquipmentBundle } from '../../types';

interface EquipmentBundleDealsProps {
  ownerId?: string;
  mode?: 'browse' | 'manage';
  onBookBundle?: (bundle: EquipmentBundle) => void;
  onClose?: () => void;
}

// Mock equipment data
const mockEquipment: Equipment[] = [
  {
    id: 'eq1',
    owner_id: 'owner1',
    category_id: 'cat1',
    title: 'CAT 320 Excavator - 20 Ton',
    description: 'Professional-grade excavator',
    brand: 'Caterpillar',
    model: '320 GC',
    condition: 'excellent',
    daily_rate: 450,
    weekly_rate: 2800,
    monthly_rate: 9500,
    deposit_amount: 2000,
    location: 'Los Angeles, CA',
    latitude: null,
    longitude: null,
    images: ['https://images.unsplash.com/photo-1580901368919-7738efb0f228?w=400'],
    features: ['GPS Tracking', 'Climate Control'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 90,
    rating: 4.8,
    total_reviews: 24,
    total_bookings: 45,
    is_featured: true,
    is_active: true,
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'eq2',
    owner_id: 'owner1',
    category_id: 'cat1',
    title: 'John Deere Backhoe Loader',
    description: 'Versatile backhoe loader',
    brand: 'John Deere',
    model: '310L',
    condition: 'good',
    daily_rate: 350,
    weekly_rate: 2100,
    monthly_rate: 7500,
    deposit_amount: 1500,
    location: 'Los Angeles, CA',
    latitude: null,
    longitude: null,
    images: ['https://images.unsplash.com/photo-1621922688758-5d66ed7be5f3?w=400'],
    features: ['4WD', 'Extendahoe'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 60,
    rating: 4.5,
    total_reviews: 18,
    total_bookings: 32,
    is_featured: false,
    is_active: true,
    created_at: '2024-03-01T00:00:00Z',
    updated_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'eq3',
    owner_id: 'owner1',
    category_id: 'cat2',
    title: 'Skid Steer Loader',
    description: 'Compact skid steer',
    brand: 'Bobcat',
    model: 'S650',
    condition: 'excellent',
    daily_rate: 275,
    weekly_rate: 1650,
    monthly_rate: 5500,
    deposit_amount: 1000,
    location: 'Los Angeles, CA',
    latitude: null,
    longitude: null,
    images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400'],
    features: ['High Flow', 'Enclosed Cab'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 60,
    rating: 4.9,
    total_reviews: 31,
    total_bookings: 67,
    is_featured: false,
    is_active: true,
    created_at: '2024-04-15T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

// Mock bundles
const mockBundles: EquipmentBundle[] = [
  {
    id: 'bundle1',
    owner_id: 'owner1',
    name: 'Complete Site Preparation Package',
    description: 'Everything you need for site clearing and grading. Perfect for new construction projects.',
    equipment_ids: ['eq1', 'eq2', 'eq3'],
    original_total: 1075,
    bundle_price: 915,
    discount_percentage: 15,
    min_rental_days: 3,
    max_rental_days: 30,
    is_active: true,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'bundle2',
    owner_id: 'owner1',
    name: 'Excavation Duo',
    description: 'Excavator and backhoe combo for medium-sized excavation projects.',
    equipment_ids: ['eq1', 'eq2'],
    original_total: 800,
    bundle_price: 720,
    discount_percentage: 10,
    min_rental_days: 1,
    max_rental_days: 60,
    is_active: true,
    created_at: '2025-01-10T00:00:00Z',
    updated_at: '2025-01-10T00:00:00Z',
  },
];

export default function EquipmentBundleDeals({ ownerId, mode = 'browse', onBookBundle, onClose }: EquipmentBundleDealsProps) {
  const [bundles, setBundles] = useState<EquipmentBundle[]>(mockBundles);
  const [_selectedBundle, _setSelectedBundle] = useState<EquipmentBundle | null>(null);
  void _selectedBundle; void _setSelectedBundle; void ownerId;
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  
  // Form state for creating bundles
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    equipment_ids: [] as string[],
    discount_percentage: 10,
    min_rental_days: 1,
    max_rental_days: 30,
  });

  // Calculate bundle pricing
  const calculateBundlePricing = (equipmentIds: string[]) => {
    const equipment = mockEquipment.filter((eq) => equipmentIds.includes(eq.id));
    const originalTotal = equipment.reduce((sum, eq) => sum + eq.daily_rate, 0);
    const discountedTotal = originalTotal * (1 - formData.discount_percentage / 100);
    return { originalTotal, discountedTotal, savings: originalTotal - discountedTotal };
  };

  // Filter bundles
  const filteredBundles = bundles.filter((bundle) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return bundle.name.toLowerCase().includes(query) || bundle.description.toLowerCase().includes(query);
    }
    return true;
  });

  // Add equipment to bundle
  const toggleEquipmentInBundle = (equipmentId: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment_ids: prev.equipment_ids.includes(equipmentId)
        ? prev.equipment_ids.filter((id) => id !== equipmentId)
        : [...prev.equipment_ids, equipmentId],
    }));
  };

  // Save bundle
  const handleSaveBundle = () => {
    const pricing = calculateBundlePricing(formData.equipment_ids);
    const newBundle: EquipmentBundle = {
      id: Date.now().toString(),
      owner_id: ownerId || 'current_user',
      name: formData.name,
      description: formData.description,
      equipment_ids: formData.equipment_ids,
      original_total: pricing.originalTotal,
      bundle_price: pricing.discountedTotal,
      discount_percentage: formData.discount_percentage,
      min_rental_days: formData.min_rental_days,
      max_rental_days: formData.max_rental_days,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setBundles([newBundle, ...bundles]);
    setIsCreating(false);
    setFormData({
      name: '',
      description: '',
      equipment_ids: [],
      discount_percentage: 10,
      min_rental_days: 1,
      max_rental_days: 30,
    });
  };

  // Delete bundle
  const handleDeleteBundle = (bundleId: string) => {
    setBundles(bundles.filter((b) => b.id !== bundleId));
  };

  // Get equipment by ID
  const getEquipmentById = (id: string) => mockEquipment.find((eq) => eq.id === id);

  // Render bundle card
  const renderBundleCard = (bundle: EquipmentBundle) => {
    const bundleEquipment = bundle.equipment_ids.map(getEquipmentById).filter(Boolean) as Equipment[];
    const isExpanded = expandedBundle === bundle.id;

    return (
      <div key={bundle.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-white text-xs">
                  <Package className="w-3 h-3" />
                  {bundle.equipment_ids.length} Items
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 rounded-full text-white text-sm font-bold">
                <Percent className="w-4 h-4" />
                {bundle.discount_percentage}% OFF
              </span>
            </div>
          </div>
          <div className="absolute -bottom-6 left-4 flex -space-x-3">
            {bundleEquipment.slice(0, 4).map((eq, idx) => (
              <img
                key={eq.id}
                src={eq.images[0] || 'https://via.placeholder.com/48'}
                alt={eq.title}
                className="w-12 h-12 rounded-lg border-2 border-white object-cover"
                style={{ zIndex: 4 - idx }}
              />
            ))}
            {bundleEquipment.length > 4 && (
              <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                +{bundleEquipment.length - 4}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-10">
          <h3 className="font-bold text-gray-900 text-lg">{bundle.name}</h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{bundle.description}</p>

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mt-4">
            <span className="text-2xl font-bold text-teal-600">${bundle.bundle_price}</span>
            <span className="text-gray-400 line-through">${bundle.original_total}</span>
            <span className="text-sm text-gray-500">/day</span>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {bundle.min_rental_days}-{bundle.max_rental_days} days
            </span>
            <span className="flex items-center gap-1">
              <Gift className="w-4 h-4" />
              Save ${(bundle.original_total - bundle.bundle_price).toFixed(0)}/day
            </span>
          </div>

          {/* Expand/Collapse */}
          <button
            onClick={() => setExpandedBundle(isExpanded ? null : bundle.id)}
            className="w-full mt-4 py-2 text-sm text-teal-600 hover:text-teal-700 flex items-center justify-center gap-1 border-t pt-3"
          >
            {isExpanded ? (
              <>
                Hide Details <ChevronDown className="w-4 h-4" />
              </>
            ) : (
              <>
                View Bundle Contents <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t space-y-3">
              <h4 className="font-medium text-gray-900">Included Equipment:</h4>
              {bundleEquipment.map((eq) => (
                <div key={eq.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <img
                    src={eq.images[0] || 'https://via.placeholder.com/40'}
                    alt={eq.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{eq.title}</p>
                    <p className="text-xs text-gray-500">{eq.brand} • ${eq.daily_rate}/day normally</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-gray-600">{eq.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            {mode === 'browse' ? (
              <>
                <button
                  onClick={() => onBookBundle?.(bundle)}
                  className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Book Bundle
                </button>
                <button className="p-2.5 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
              </>
            ) : (
              <>
                <button className="flex-1 py-2 border rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteBundle(bundle.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render create form
  const renderCreateForm = () => {
    const pricing = calculateBundlePricing(formData.equipment_ids);

    return (
      <div className="border rounded-xl p-6 bg-gray-50">
        <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Create New Bundle
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Complete Site Preparation Package"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this bundle is perfect for..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Equipment ({formData.equipment_ids.length} selected)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {mockEquipment.map((eq) => (
                <label
                  key={eq.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.equipment_ids.includes(eq.id)
                      ? 'border-purple-500 bg-purple-50'
                      : 'hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.equipment_ids.includes(eq.id)}
                    onChange={() => toggleEquipmentInBundle(eq.id)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <img
                    src={eq.images[0] || 'https://via.placeholder.com/40'}
                    alt={eq.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{eq.title}</p>
                    <p className="text-xs text-gray-500">${eq.daily_rate}/day</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Discount %</label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.discount_percentage}
                onChange={(e) => setFormData({ ...formData, discount_percentage: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Days</label>
              <input
                type="number"
                min="1"
                value={formData.min_rental_days}
                onChange={(e) => setFormData({ ...formData, min_rental_days: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Days</label>
              <input
                type="number"
                min="1"
                value={formData.max_rental_days}
                onChange={(e) => setFormData({ ...formData, max_rental_days: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Pricing Preview */}
          {formData.equipment_ids.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Pricing Preview</h4>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Original Total:</span>
                <span className="text-gray-400 line-through">${pricing.originalTotal}/day</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Bundle Discount:</span>
                <span className="text-green-600">-${pricing.savings.toFixed(0)}/day ({formData.discount_percentage}%)</span>
              </div>
              <div className="flex items-center justify-between font-bold mt-2 pt-2 border-t">
                <span>Bundle Price:</span>
                <span className="text-purple-600">${pricing.discountedTotal.toFixed(0)}/day</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBundle}
              disabled={!formData.name || formData.equipment_ids.length < 2}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Create Bundle
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-5xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Equipment Bundle Deals</h2>
              <p className="text-purple-100 text-sm">
                {mode === 'browse' ? 'Save money with curated equipment packages' : 'Create and manage your bundle offers'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {mode === 'manage' && !isCreating && (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Create Bundle
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-200" />
          <input
            type="text"
            placeholder="Search bundles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Featured Banner */}
        {mode === 'browse' && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Gift className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">Bundle & Save!</h3>
                <p className="text-sm text-amber-700">
                  Get up to 20% off when you rent multiple equipment together
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Create Form */}
        {isCreating && renderCreateForm()}

        {/* Bundles Grid */}
        {!isCreating && (
          <>
            {filteredBundles.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">No bundles found</p>
                {mode === 'manage' && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Create Your First Bundle
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBundles.map(renderBundleCard)}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Stats */}
      {mode === 'browse' && bundles.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{filteredBundles.length} bundles available</span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Limited time offers
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
