import { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, DollarSign, Tag, Search, Megaphone, ArrowLeft } from 'lucide-react';
import PostRequestModal, { type EquipmentRequest } from './PostRequestModal';

const STORAGE_KEY = 'equipmentRequests';

function loadRequests(): EquipmentRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : getSampleRequests();
  } catch {
    return getSampleRequests();
  }
}

function saveRequests(requests: EquipmentRequest[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch { /* ignore */ }
}

function getSampleRequests(): EquipmentRequest[] {
  return [
    {
      id: '1',
      title: 'CAT 320 Excavator — 2 weeks',
      category: 'Construction',
      location: 'Sydney, NSW',
      startDate: '2026-04-01',
      endDate: '2026-04-14',
      budget: '$800/day',
      description: 'Need operator certification documentation. Delivery to site preferred.',
      postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      contactName: 'James R.',
    },
    {
      id: '2',
      title: 'Sony FX3 Camera Kit with Lenses',
      category: 'Photography',
      location: 'Melbourne, VIC',
      startDate: '2026-03-20',
      endDate: '2026-03-22',
      budget: '$300 total',
      description: 'Weekend wedding shoot. Need 24-70mm and 85mm primes if possible.',
      postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      contactName: 'Priya S.',
    },
    {
      id: '3',
      title: 'Marquee Tent 10x20m for Corporate Event',
      category: 'Events',
      location: 'Brisbane, QLD',
      startDate: '2026-03-28',
      endDate: '2026-03-29',
      budget: '$500/day',
      description: 'Must include setup/teardown. White preferred.',
      postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      contactName: 'Tom W.',
    },
  ];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

interface EquipmentRequestBoardProps {
  onBack?: () => void;
}

export default function EquipmentRequestBoard({ onBack }: EquipmentRequestBoardProps) {
  const [requests, setRequests] = useState<EquipmentRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    setRequests(loadRequests());
  }, []);

  const handlePost = (data: Omit<EquipmentRequest, 'id' | 'postedAt'>) => {
    const newRequest: EquipmentRequest = {
      ...data,
      id: Date.now().toString(),
      postedAt: new Date().toISOString(),
    };
    const updated = [newRequest, ...requests];
    setRequests(updated);
    saveRequests(updated);
    setIsModalOpen(false);
  };

  const filtered = requests.filter(r => {
    const matchesSearch = !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(requests.map(r => r.category))].sort();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <Megaphone className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Equipment Wanted Board</h1>
                <p className="text-sm text-gray-500">Renters post what they need — owners respond</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-medium rounded-xl transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Post Request
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search requests…"
              className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Requests list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No requests found</p>
            <p className="text-sm mt-1">Be the first to post what you need!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(req => (
              <div key={req.id} className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-teal-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full">
                        <Tag className="w-3 h-3" />
                        {req.category}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(req.postedAt)}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{req.title}</h3>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {req.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(req.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                        {' — '}
                        {new Date(req.endDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {req.budget && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="w-3.5 h-3.5" /> {req.budget}
                        </span>
                      )}
                    </div>
                    {req.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{req.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-gray-400 mb-2">Posted by</p>
                    <p className="text-sm font-medium text-gray-700">{req.contactName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <PostRequestModal onSubmit={handlePost} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
