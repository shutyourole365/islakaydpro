import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Percent } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import {
  getBundles,
  createBundle,
  deleteBundle,
  getRecurringBookings,
  type EquipmentBundle,
  type RecurringBooking,
} from '../../services/bookingService';

export default function SmartBookingManager() {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  const [bundles, setBundles] = useState<EquipmentBundle[]>([]);
  const [recurring, setRecurring] = useState<RecurringBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bundles' | 'recurring'>('bundles');
  const [showForm, setShowForm] = useState(false);
  const [bundleForm, setBundleForm] = useState({
    name: '',
    description: '',
    equipmentIds: [] as string[],
    bundleDiscountPercent: 10,
  });

  useEffect(() => {
    if (!user?.id) return;
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [bundlesData, recurringData] = await Promise.all([
        getBundles(user.id),
        getRecurringBookings(user.id),
      ]);
      setBundles(bundlesData);
      setRecurring(recurringData);
    } catch {
      showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      await createBundle(user.id, bundleForm);
      success('Bundle created');
      setBundleForm({ name: '', description: '', equipmentIds: [], bundleDiscountPercent: 10 });
      setShowForm(false);
      loadData();
    } catch {
      showError('Failed to create bundle');
    }
  };

  const handleDeleteBundle = async (id: string) => {
    if (!confirm('Delete this bundle?')) return;
    try {
      await deleteBundle(id);
      success('Bundle deleted');
      loadData();
    } catch {
      showError('Failed to delete bundle');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Bookings</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          New Bundle
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('bundles')}
          className={`pb-4 px-2 font-medium transition ${
            activeTab === 'bundles'
              ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Equipment Bundles ({bundles.length})
        </button>
        <button
          onClick={() => setActiveTab('recurring')}
          className={`pb-4 px-2 font-medium transition ${
            activeTab === 'recurring'
              ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Recurring Bookings ({recurring.length})
        </button>
      </div>

      {/* Bundle Form */}
      {showForm && activeTab === 'bundles' && (
        <form onSubmit={handleCreateBundle} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Bundle Name</label>
            <input
              type="text"
              value={bundleForm.name}
              onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Construction Starter Pack"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Description</label>
            <textarea
              value={bundleForm.description}
              onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-20"
              placeholder="Describe what's included in this bundle"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Discount Percentage</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={bundleForm.bundleDiscountPercent}
                onChange={(e) => setBundleForm({ ...bundleForm, bundleDiscountPercent: parseInt(e.target.value) })}
                className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-600 dark:text-gray-400">%</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition"
            >
              Create Bundle
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Bundles List */}
      {activeTab === 'bundles' && (
        <div className="grid grid-cols-1 gap-4">
          {bundles.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No bundles yet. Create your first bundle to offer package deals!
            </div>
          ) : (
            bundles.map((bundle) => (
              <div key={bundle.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{bundle.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{bundle.description}</p>
                    <div className="flex gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-sm">
                        <Percent className="w-3 h-3" />
                        {bundle.bundleDiscountPercent}% off
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-sm">
                        {bundle.equipmentIds.length} items
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition" title="Edit">
                      <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteBundle(bundle.id)}
                      className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recurring Bookings List */}
      {activeTab === 'recurring' && (
        <div className="grid grid-cols-1 gap-4">
          {recurring.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No recurring bookings yet. They'll appear here when customers set up recurring rentals.
            </div>
          ) : (
            recurring.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {booking.frequency.charAt(0).toUpperCase() + booking.frequency.slice(1)} Recurring
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Next: {new Date(booking.nextBookingDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-medium ${
                    booking.autoRenew
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}>
                    {booking.autoRenew ? 'Auto-renew' : 'Manual'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
