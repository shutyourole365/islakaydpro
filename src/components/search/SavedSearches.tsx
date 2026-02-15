import { useState } from 'react';
import { Search, Bell, BellOff, Trash2, Edit2, Plus, Filter, X } from 'lucide-react';

interface SavedSearch {
  id: string;
  name: string;
  filters: {
    query?: string;
    category?: string;
    location?: string;
    priceRange?: [number, number];
    dateRange?: [string, string];
  };
  alertsEnabled: boolean;
  createdAt: Date;
  matchCount: number;
}

interface SavedSearchesProps {
  onClose: () => void;
  onSearchClick: (filters: SavedSearch['filters']) => void;
}

export default function SavedSearches({ onClose, onSearchClick }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([
    {
      id: '1',
      name: 'Weekend Excavators LA',
      filters: {
        query: 'excavator',
        location: 'Los Angeles, CA',
        priceRange: [200, 600],
      },
      alertsEnabled: true,
      createdAt: new Date('2026-01-15'),
      matchCount: 12,
    },
    {
      id: '2',
      name: 'Professional Cameras SF',
      filters: {
        query: 'camera',
        category: 'Photography',
        location: 'San Francisco, CA',
        priceRange: [100, 300],
      },
      alertsEnabled: true,
      createdAt: new Date('2026-01-10'),
      matchCount: 24,
    },
    {
      id: '3',
      name: 'Power Tools Under $100',
      filters: {
        category: 'Power Tools',
        priceRange: [0, 100],
      },
      alertsEnabled: false,
      createdAt: new Date('2026-01-05'),
      matchCount: 45,
    },
  ]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleToggleAlert = (id: string) => {
    setSearches(searches.map(s =>
      s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s
    ));
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this saved search?')) {
      setSearches(searches.filter(s => s.id !== id));
    }
  };

  const handleStartEdit = (search: SavedSearch) => {
    setEditingId(search.id);
    setEditName(search.name);
  };

  const handleSaveEdit = (id: string) => {
    setSearches(searches.map(s =>
      s.id === id ? { ...s, name: editName } : s
    ));
    setEditingId(null);
    setEditName('');
  };

  const formatFilters = (filters: SavedSearch['filters']) => {
    const parts: string[] = [];
    if (filters.query) parts.push(`"${filters.query}"`);
    if (filters.category) parts.push(filters.category);
    if (filters.location) parts.push(filters.location);
    if (filters.priceRange) parts.push(`$${filters.priceRange[0]}-$${filters.priceRange[1]}`);
    return parts.join(' • ');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Saved Searches</h2>
              <p className="text-sm text-gray-600">
                {searches.length} saved • {searches.filter(s => s.alertsEnabled).length} with alerts
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

        {/* Searches List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {searches.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No saved searches yet
              </h3>
              <p className="text-gray-600 mb-6">
                Save your search criteria to find equipment faster
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Create Your First Search
              </button>
            </div>
          ) : (
            searches.map((search) => (
              <div
                key={search.id}
                className="group p-4 rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {editingId === search.id ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-teal-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(search.id)}
                          className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {search.name}
                        </h3>
                        <button
                          onClick={() => handleStartEdit(search)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-all"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    )}

                    <p className="text-sm text-gray-600 mb-3 flex items-center gap-2 flex-wrap">
                      <Filter className="w-4 h-4" />
                      {formatFilters(search.filters)}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-teal-600 font-medium">
                        <Search className="w-4 h-4" />
                        {search.matchCount} matches
                      </span>
                      <span className="text-gray-500">
                        Created {search.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleAlert(search.id)}
                      className={`p-2 rounded-lg transition-all ${
                        search.alertsEnabled
                          ? 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title={search.alertsEnabled ? 'Alerts enabled' : 'Alerts disabled'}
                    >
                      {search.alertsEnabled ? (
                        <Bell className="w-5 h-5" />
                      ) : (
                        <BellOff className="w-5 h-5" />
                      )}
                    </button>

                    <button
                      onClick={() => onSearchClick(search.filters)}
                      className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-medium rounded-lg hover:shadow-lg transition-all"
                    >
                      Search Now
                    </button>

                    <button
                      onClick={() => handleDelete(search.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {search.alertsEnabled && (
                  <div className="mt-3 px-3 py-2 bg-teal-50 rounded-lg border border-teal-100 flex items-start gap-2">
                    <Bell className="w-4 h-4 text-teal-600 mt-0.5" />
                    <div className="flex-1 text-sm text-teal-700">
                      <p className="font-medium">Email alerts enabled</p>
                      <p className="text-teal-600">
                        We'll notify you when new equipment matches this search
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {searches.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              💡 Tip: Enable alerts to get notified about price drops and new listings
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
