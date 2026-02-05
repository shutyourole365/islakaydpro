import { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Phone,
  Mail,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Download,
  RefreshCw,
  ChevronRight,
  Search,
  Filter,
  Bell,
  X,
} from 'lucide-react';
import type { EquipmentWarranty, Equipment } from '../../types';

interface WarrantyTrackerProps {
  equipmentId?: string;
  ownerId?: string;
  onClose?: () => void;
}

interface WarrantyFormData {
  warranty_type: 'manufacturer' | 'extended' | 'third_party';
  provider: string;
  coverage_details: string;
  start_date: string;
  end_date: string;
  claim_contact: string;
  claim_phone: string;
}

// Mock data for demonstration
const mockWarranties: (EquipmentWarranty & { equipment?: Equipment })[] = [
  {
    id: '1',
    equipment_id: 'eq1',
    warranty_type: 'manufacturer',
    provider: 'Caterpillar Inc.',
    coverage_details: 'Full coverage including parts and labor for manufacturing defects. Excludes wear items and damage from misuse.',
    start_date: '2025-01-15',
    end_date: '2027-01-15',
    claim_contact: 'warranty@caterpillar.com',
    claim_phone: '1-800-CAT-WARRANTY',
    documents: ['warranty_certificate.pdf', 'coverage_details.pdf'],
    status: 'active',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
    equipment: {
      id: 'eq1',
      owner_id: 'owner1',
      category_id: 'cat1',
      title: 'CAT 320 Excavator',
      description: null,
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
      images: [],
      features: [],
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
  },
  {
    id: '2',
    equipment_id: 'eq2',
    warranty_type: 'extended',
    provider: 'EquipGuard Extended Warranty',
    coverage_details: 'Extended coverage for 3 additional years. Includes hydraulic system, electrical components, and engine.',
    start_date: '2024-06-01',
    end_date: '2026-03-15',
    claim_contact: 'claims@equipguard.com',
    claim_phone: '1-888-555-0123',
    documents: ['extended_warranty.pdf'],
    status: 'active',
    created_at: '2024-06-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
    equipment: {
      id: 'eq2',
      owner_id: 'owner1',
      category_id: 'cat2',
      title: 'John Deere Backhoe Loader',
      description: null,
      brand: 'John Deere',
      model: '310L',
      condition: 'good',
      daily_rate: 350,
      weekly_rate: 2100,
      monthly_rate: 7500,
      deposit_amount: 1500,
      location: 'San Diego, CA',
      latitude: null,
      longitude: null,
      images: [],
      features: [],
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
  },
  {
    id: '3',
    equipment_id: 'eq3',
    warranty_type: 'third_party',
    provider: 'AllState Equipment Protection',
    coverage_details: 'Comprehensive coverage for accidental damage and theft.',
    start_date: '2024-01-01',
    end_date: '2025-01-01',
    claim_contact: 'equipment@allstate.com',
    claim_phone: '1-800-ALL-STATE',
    documents: [],
    status: 'expired',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
  },
];

export default function EquipmentWarrantyTracker({ equipmentId, ownerId, onClose }: WarrantyTrackerProps) {
  void equipmentId; void ownerId; // Parameters for future API integration
  const [warranties, setWarranties] = useState<(EquipmentWarranty & { equipment?: Equipment })[]>(mockWarranties);
  const [selectedWarranty, setSelectedWarranty] = useState<EquipmentWarranty | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'expiring'>('all');
  const [filterType, setFilterType] = useState<'all' | 'manufacturer' | 'extended' | 'third_party'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState<WarrantyFormData>({
    warranty_type: 'manufacturer',
    provider: '',
    coverage_details: '',
    start_date: '',
    end_date: '',
    claim_contact: '',
    claim_phone: '',
  });

  // Calculate days until expiry
  const getDaysUntilExpiry = (endDate: string): number => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get status badge color
  const getStatusColor = (status: string, endDate: string) => {
    if (status === 'expired') return 'bg-red-100 text-red-800';
    if (status === 'claimed') return 'bg-purple-100 text-purple-800';
    const daysUntil = getDaysUntilExpiry(endDate);
    if (daysUntil <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // Get status icon
  const getStatusIcon = (status: string, endDate: string) => {
    if (status === 'expired') return <AlertTriangle className="w-4 h-4 text-red-500" />;
    if (status === 'claimed') return <FileText className="w-4 h-4 text-purple-500" />;
    const daysUntil = getDaysUntilExpiry(endDate);
    if (daysUntil <= 30) return <Clock className="w-4 h-4 text-yellow-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  // Filter warranties
  const filteredWarranties = warranties.filter((warranty) => {
    // Filter by equipment if provided
    if (equipmentId && warranty.equipment_id !== equipmentId) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        warranty.provider.toLowerCase().includes(query) ||
        warranty.equipment?.title?.toLowerCase().includes(query) ||
        warranty.coverage_details.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Filter by status
    if (filterStatus !== 'all') {
      if (filterStatus === 'expiring') {
        const daysUntil = getDaysUntilExpiry(warranty.end_date);
        if (daysUntil > 30 || daysUntil < 0) return false;
      } else if (warranty.status !== filterStatus) {
        return false;
      }
    }

    // Filter by type
    if (filterType !== 'all' && warranty.warranty_type !== filterType) return false;

    return true;
  });

  // Summary stats
  const stats = {
    total: warranties.length,
    active: warranties.filter((w) => w.status === 'active').length,
    expiringSoon: warranties.filter((w) => {
      const days = getDaysUntilExpiry(w.end_date);
      return w.status === 'active' && days > 0 && days <= 30;
    }).length,
    expired: warranties.filter((w) => w.status === 'expired').length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would call the API
    const newWarranty: EquipmentWarranty = {
      id: Date.now().toString(),
      equipment_id: equipmentId || '',
      ...formData,
      documents: [],
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setWarranties([newWarranty, ...warranties]);
    setIsAddingNew(false);
    setFormData({
      warranty_type: 'manufacturer',
      provider: '',
      coverage_details: '',
      start_date: '',
      end_date: '',
      claim_contact: '',
      claim_phone: '',
    });
  };

  const handleSetReminder = (warranty: EquipmentWarranty) => {
    // In production, this would create a smart alert
    alert(`Reminder set for warranty expiry: ${warranty.provider}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Equipment Warranty Tracker</h2>
              <p className="text-teal-100 text-sm">Manage and track all your equipment warranties</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-teal-100">Total Warranties</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs text-teal-100">Active</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-300">{stats.expiringSoon}</p>
            <p className="text-xs text-teal-100">Expiring Soon</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-300">{stats.expired}</p>
            <p className="text-xs text-teal-100">Expired</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search warranties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
              showFilters ? 'bg-teal-50 border-teal-500 text-teal-700' : 'hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Warranty
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex gap-4 mt-4 pt-4 border-t">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="mt-1 block w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wide">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as typeof filterType)}
                className="mt-1 block w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value="manufacturer">Manufacturer</option>
                <option value="extended">Extended</option>
                <option value="third_party">Third Party</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Add Warranty Form */}
      {isAddingNew && (
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Add New Warranty</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Type</label>
                <select
                  value={formData.warranty_type}
                  onChange={(e) => setFormData({ ...formData, warranty_type: e.target.value as WarrantyFormData['warranty_type'] })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="manufacturer">Manufacturer Warranty</option>
                  <option value="extended">Extended Warranty</option>
                  <option value="third_party">Third Party</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <input
                  type="text"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Warranty provider name"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Details</label>
              <textarea
                value={formData.coverage_details}
                onChange={(e) => setFormData({ ...formData, coverage_details: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                rows={3}
                placeholder="Describe what the warranty covers..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim Contact Email</label>
                <input
                  type="email"
                  value={formData.claim_contact}
                  onChange={(e) => setFormData({ ...formData, claim_contact: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="claims@provider.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Claim Phone</label>
                <input
                  type="tel"
                  value={formData.claim_phone}
                  onChange={(e) => setFormData({ ...formData, claim_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="1-800-XXX-XXXX"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Save Warranty
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Warranty List */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {filteredWarranties.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No warranties found</p>
            <p className="text-sm">Add a warranty to start tracking</p>
          </div>
        ) : (
          filteredWarranties.map((warranty) => {
            const daysUntil = getDaysUntilExpiry(warranty.end_date);
            
            return (
              <div
                key={warranty.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedWarranty(selectedWarranty?.id === warranty.id ? null : warranty)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(warranty.status, warranty.end_date)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{warranty.provider}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(warranty.status, warranty.end_date)}`}>
                          {warranty.status === 'active' && daysUntil <= 30
                            ? `Expires in ${daysUntil} days`
                            : warranty.status.charAt(0).toUpperCase() + warranty.status.slice(1)}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full capitalize">
                          {warranty.warranty_type.replace('_', ' ')}
                        </span>
                      </div>
                      {warranty.equipment && (
                        <p className="text-sm text-gray-600 mt-0.5">{warranty.equipment.title}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(warranty.start_date).toLocaleDateString()} - {new Date(warranty.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${selectedWarranty?.id === warranty.id ? 'rotate-90' : ''}`} />
                </div>

                {/* Expanded Details */}
                {selectedWarranty?.id === warranty.id && (
                  <div className="mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Coverage Details</h5>
                      <p className="text-sm text-gray-600">{warranty.coverage_details}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {warranty.claim_contact && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <a href={`mailto:${warranty.claim_contact}`} className="text-teal-600 hover:underline">
                            {warranty.claim_contact}
                          </a>
                        </div>
                      )}
                      {warranty.claim_phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <a href={`tel:${warranty.claim_phone}`} className="text-teal-600 hover:underline">
                            {warranty.claim_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {warranty.documents.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Documents</h5>
                        <div className="flex flex-wrap gap-2">
                          {warranty.documents.map((doc, idx) => (
                            <button
                              key={idx}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
                            >
                              <FileText className="w-4 h-4 text-gray-500" />
                              {doc}
                              <Download className="w-3 h-3 text-gray-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSetReminder(warranty)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                      >
                        <Bell className="w-4 h-4" />
                        Set Reminder
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {filteredWarranties.length} of {warranties.length} warranties</span>
          <button className="flex items-center gap-1 text-teal-600 hover:text-teal-700">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
