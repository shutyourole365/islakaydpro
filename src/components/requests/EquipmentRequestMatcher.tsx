import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Star,
  Zap,
  Loader2,
  X,
  Check,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import {
  createEquipmentRequest,
  getActiveRequests,
  findMatches,
  updateRequestStatus,
  type EquipmentRequest,
  type RequestMatch,
} from '../../services/requestMatchingService';

export default function EquipmentRequestMatcher() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'my-requests'>('browse');
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [matches, setMatches] = useState<RequestMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    start_date: '',
    end_date: '',
    max_daily_rate: 100,
    min_rating: 4,
    must_have_features: '',
  });

  const categories = [
    'Construction Equipment',
    'Landscaping Tools',
    'Event Equipment',
    'Audio/Visual',
    'Party Supplies',
    'Furniture',
    'Vehicles',
    'Other',
  ];

  useEffect(() => {
    if (!user?.id) return;
    loadRequests();
  }, [user?.id, activeTab]);

  const loadRequests = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await getActiveRequests(user.id);
      setRequests(data);
    } catch (error) {
      console.error('Failed to load requests:', error);
      showToast('Failed to load requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!user?.id || !formData.title.trim() || !formData.category) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      showToast('End date must be after start date', 'error');
      return;
    }

    try {
      setLoading(true);
      const features = formData.must_have_features
        .split(',')
        .map(f => f.trim())
        .filter(f => f);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await createEquipmentRequest(user.id, {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        start_date: formData.start_date,
        end_date: formData.end_date,
        max_daily_rate: formData.max_daily_rate,
        min_rating: formData.min_rating,
        must_have_features: features,
        expires_at: expiresAt.toISOString(),
      });

      showToast('Request created successfully!', 'success');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        location: '',
        start_date: '',
        end_date: '',
        max_daily_rate: 100,
        min_rating: 4,
        must_have_features: '',
      });
      loadRequests();
    } catch (error) {
      console.error('Failed to create request:', error);
      showToast('Failed to create request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFindMatches = async (requestId: string) => {
    try {
      setLoading(true);
      const foundMatches = await findMatches(requestId);
      setMatches(foundMatches);
      await updateRequestStatus(requestId, 'matched');
      showToast(`Found ${foundMatches.length} matching equipment!`, 'success');
    } catch (error) {
      console.error('Failed to find matches:', error);
      showToast('Failed to find matches', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await updateRequestStatus(requestId, 'cancelled');
      setRequests(prev => prev.filter(r => r.id !== requestId));
      showToast('Request cancelled', 'success');
    } catch (error) {
      console.error('Failed to cancel request:', error);
      showToast('Failed to cancel request', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Equipment Request Matching</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Find equipment that matches your needs with intelligent matching
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'browse', label: 'Browse Matches', icon: Search },
          { id: 'create', label: 'Create Request', icon: Plus },
          { id: 'my-requests', label: 'My Requests', icon: TrendingUp },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as 'browse' | 'create' | 'my-requests')}
            className={`pb-4 px-2 font-medium flex items-center gap-2 transition ${
              activeTab === id
                ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Create Request Tab */}
      {activeTab === 'create' && (
        <div className="space-y-4">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full p-8 border-2 border-dashed border-teal-300 dark:border-teal-700 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-colors"
            >
              <Plus className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 dark:text-white">Create Equipment Request</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Post what you're looking for and we'll find matches
              </p>
            </button>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">New Equipment Request</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What are you looking for? *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Excavator for construction site"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what you need and any specific requirements"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Max Daily Rate
                    </label>
                    <input
                      type="number"
                      value={formData.max_daily_rate}
                      onChange={(e) => setFormData({ ...formData, max_daily_rate: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Star className="w-4 h-4 inline mr-1" />
                      Min Rating
                    </label>
                    <select
                      value={formData.min_rating}
                      onChange={(e) => setFormData({ ...formData, min_rating: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="0">No minimum</option>
                      <option value="3">3 stars+</option>
                      <option value="4">4 stars+</option>
                      <option value="4.5">4.5 stars+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Required Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.must_have_features}
                    onChange={(e) => setFormData({ ...formData, must_have_features: e.target.value })}
                    placeholder="e.g., GPS, AC, Heated seats"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCreateRequest}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Post Request
                  </button>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* My Requests Tab */}
      {activeTab === 'my-requests' && (
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">No active requests yet</p>
              <button
                onClick={() => setActiveTab('create')}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
              >
                Create Your First Request
              </button>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{request.description}</p>
                  </div>
                  <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium capitalize">
                    {request.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {request.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(request.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    Max ${request.max_daily_rate}/day
                  </div>
                  {request.min_rating && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Star className="w-4 h-4" />
                      {request.min_rating}+ stars
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {request.status === 'open' && (
                    <>
                      <button
                        onClick={() => handleFindMatches(request.id)}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                        Find Matches
                      </button>
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Browse Matches Tab */}
      {activeTab === 'browse' && (
        <div>
          {matches.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {requests.length === 0
                  ? 'Create a request to see matches'
                  : 'Find matches for one of your requests'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {matches.map((match) => (
                <div key={match.equipment.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{match.equipment.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{match.equipment.owner?.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-gray-900 dark:text-white">{match.matchScore}%</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Match</p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {match.matchReasons.map((reason, i) => (
                      <p key={i} className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> {reason}
                      </p>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                    <div className="text-gray-600 dark:text-gray-400">
                      <p className="font-medium text-gray-900 dark:text-white">${match.equipment.daily_rate}/day</p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <p className="font-medium text-gray-900 dark:text-white">{match.equipment.rating}/5</p>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      <p className="font-medium text-gray-900 dark:text-white">{match.equipment.location}</p>
                    </div>
                  </div>

                  <button className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
