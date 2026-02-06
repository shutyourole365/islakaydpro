import { useState, useMemo } from 'react';
import {
  History,
  Calendar,
  User,
  MapPin,
  Star,
  DollarSign,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  Camera,
  MessageSquare,
  Package,
  TrendingUp,
  Shield,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'rental' | 'maintenance' | 'inspection' | 'damage' | 'location' | 'review' | 'price_change' | 'verification';
  date: Date;
  title: string;
  description: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  metadata?: Record<string, unknown>;
  images?: string[];
}

interface EquipmentTimelineProps {
  equipmentId: string;
  equipmentName: string;
  events?: TimelineEvent[];
  className?: string;
}

const demoEvents: TimelineEvent[] = [
  {
    id: '1',
    type: 'rental',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    title: 'Rental Completed',
    description: 'Returned in excellent condition. 3-day rental for commercial construction project.',
    user: { id: 'u1', name: 'John Martinez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    metadata: { duration: 3, total: 450, rating: 5 },
  },
  {
    id: '2',
    type: 'maintenance',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    title: 'Scheduled Maintenance',
    description: 'Oil change, filter replacement, and general inspection completed.',
    metadata: { cost: 125, nextDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
  },
  {
    id: '3',
    type: 'review',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    title: 'New Review',
    description: 'Great excavator! Perfect for our foundation work. Owner was very helpful with delivery.',
    user: { id: 'u2', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
    metadata: { rating: 5 },
  },
  {
    id: '4',
    type: 'rental',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    title: 'Rental Started',
    description: 'Equipment picked up for landscaping project.',
    user: { id: 'u1', name: 'John Martinez', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    metadata: { duration: 3, dailyRate: 150 },
  },
  {
    id: '5',
    type: 'inspection',
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    title: 'Pre-rental Inspection',
    description: 'Full inspection completed. All systems operational.',
    metadata: { status: 'passed', checklist: 12, issues: 0 },
    images: ['https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400'],
  },
  {
    id: '6',
    type: 'price_change',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    title: 'Price Updated',
    description: 'Daily rate adjusted based on market demand.',
    metadata: { oldPrice: 140, newPrice: 150, reason: 'High demand season' },
  },
  {
    id: '7',
    type: 'damage',
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    title: 'Minor Damage Reported',
    description: 'Small scratch on left panel. Repaired and documented.',
    metadata: { severity: 'minor', repairCost: 75, resolved: true },
    images: ['https://images.unsplash.com/photo-1580256081112-e49377338b7f?w=400'],
  },
  {
    id: '8',
    type: 'verification',
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    title: 'Equipment Verified',
    description: 'Ownership and documentation verified by Islakayd.',
    metadata: { badge: 'verified' },
  },
  {
    id: '9',
    type: 'location',
    date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    title: 'Equipment Listed',
    description: 'Equipment listed in San Francisco Bay Area.',
    metadata: { location: 'San Francisco, CA', coordinates: { lat: 37.7749, lng: -122.4194 } },
  },
];

const eventTypeConfig = {
  rental: { icon: Calendar, color: 'bg-blue-100 text-blue-600', label: 'Rental' },
  maintenance: { icon: Wrench, color: 'bg-amber-100 text-amber-600', label: 'Maintenance' },
  inspection: { icon: CheckCircle, color: 'bg-emerald-100 text-emerald-600', label: 'Inspection' },
  damage: { icon: AlertTriangle, color: 'bg-red-100 text-red-600', label: 'Damage' },
  location: { icon: MapPin, color: 'bg-violet-100 text-violet-600', label: 'Location' },
  review: { icon: Star, color: 'bg-yellow-100 text-yellow-600', label: 'Review' },
  price_change: { icon: DollarSign, color: 'bg-green-100 text-green-600', label: 'Price' },
  verification: { icon: Shield, color: 'bg-teal-100 text-teal-600', label: 'Verification' },
};

export default function EquipmentTimeline({
  equipmentId,
  equipmentName,
  events = demoEvents,
  className = '',
}: EquipmentTimelineProps) {
  const [selectedFilter, setSelectedFilter] = useState<TimelineEvent['type'] | 'all'>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Reserved for future use
  void equipmentId;

  const filteredEvents = useMemo(() => {
    const filtered = selectedFilter === 'all' 
      ? events 
      : events.filter(e => e.type === selectedFilter);
    return filtered.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [events, selectedFilter]);

  const stats = useMemo(() => {
    const rentals = events.filter(e => e.type === 'rental' && e.title.includes('Completed'));
    const reviews = events.filter(e => e.type === 'review');
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + ((r.metadata?.rating as number) || 0), 0) / reviews.length 
      : 0;
    
    return {
      totalRentals: rentals.length,
      totalRevenue: rentals.reduce((sum, r) => sum + ((r.metadata?.total as number) || 0), 0),
      avgRating: avgRating.toFixed(1),
      totalReviews: reviews.length,
    };
  }, [events]);

  const toggleExpand = (id: string) => {
    setExpandedEvents(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const exportTimeline = () => {
    const data = filteredEvents.map(e => ({
      date: e.date.toISOString(),
      type: e.type,
      title: e.title,
      description: e.description,
      user: e.user?.name,
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment-timeline-${equipmentId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <History className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Equipment History</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{equipmentName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={exportTimeline}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <Package className="w-4 h-4" />
              Rentals
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRentals}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <DollarSign className="w-4 h-4" />
              Revenue
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalRevenue}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <Star className="w-4 h-4" />
              Rating
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgRating}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
              <MessageSquare className="w-4 h-4" />
              Reviews
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReviews}</p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Events
            </button>
            {Object.entries(eventTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type as TimelineEvent['type'])}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedFilter === type
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No events found</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Events */}
            <div className="space-y-6">
              {filteredEvents.map((event, index) => {
                const config = eventTypeConfig[event.type];
                const Icon = config.icon;
                const isExpanded = expandedEvents.has(event.id);

                return (
                  <div key={event.id} className="relative pl-16">
                    {/* Timeline dot */}
                    <div className={`absolute left-0 w-12 h-12 rounded-full ${config.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Event card */}
                    <div 
                      className={`bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden transition-all ${
                        event.images || event.metadata ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => (event.images || event.metadata) && toggleExpand(event.id)}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 dark:text-white">{event.title}</h3>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{event.description}</p>
                            
                            {/* User info */}
                            {event.user && (
                              <div className="flex items-center gap-2 mt-3">
                                {event.user.avatar ? (
                                  <img 
                                    src={event.user.avatar} 
                                    alt={event.user.name}
                                    className="w-6 h-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                                    <User className="w-3 h-3 text-gray-600" />
                                  </div>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">{event.user.name}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">{formatDate(event.date)}</span>
                            {(event.images || event.metadata) && (
                              isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )
                            )}
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t dark:border-gray-600">
                            {/* Images */}
                            {event.images && event.images.length > 0 && (
                              <div className="flex gap-2 mb-4">
                                {event.images.map((img, i) => (
                                  <div key={i} className="relative">
                                    <img 
                                      src={img} 
                                      alt={`Event image ${i + 1}`}
                                      className="w-24 h-24 object-cover rounded-lg"
                                    />
                                    <div className="absolute bottom-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                                      <Camera className="w-3 h-3 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Metadata */}
                            {event.metadata && (
                              <div className="grid grid-cols-2 gap-3">
                                {event.type === 'rental' && (
                                  <>
                                    {event.metadata.duration && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Duration:</span>{' '}
                                        <span className="text-gray-900 dark:text-white">{String(event.metadata.duration)} days</span>
                                      </div>
                                    )}
                                    {event.metadata.total && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Total:</span>{' '}
                                        <span className="text-gray-900 dark:text-white">${event.metadata.total as number}</span>
                                      </div>
                                    )}
                                    {event.metadata.rating && (
                                      <div className="text-sm flex items-center gap-1">
                                        <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                                        <div className="flex items-center gap-0.5">
                                          {[...Array(5)].map((_, i) => (
                                            <Star 
                                              key={i} 
                                              className={`w-3 h-3 ${i < (event.metadata?.rating as number) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                                {event.type === 'maintenance' && (
                                  <>
                                    {event.metadata.cost && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Cost:</span>{' '}
                                        <span className="text-gray-900 dark:text-white">${event.metadata.cost as number}</span>
                                      </div>
                                    )}
                                    {event.metadata.nextDue && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Next Due:</span>{' '}
                                        <span className="text-gray-900 dark:text-white">
                                          {new Date(event.metadata.nextDue as Date).toLocaleDateString()}
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}
                                {event.type === 'inspection' && (
                                  <>
                                    {event.metadata.status && (
                                      <div className="text-sm flex items-center gap-1">
                                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                          event.metadata.status === 'passed' 
                                            ? 'bg-green-100 text-green-600' 
                                            : 'bg-red-100 text-red-600'
                                        }`}>
                                          {event.metadata.status as string}
                                        </span>
                                      </div>
                                    )}
                                    {event.metadata.checklist && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Checklist:</span>{' '}
                                        <span className="text-gray-900 dark:text-white">
                                          {event.metadata.checklist as number} items, {event.metadata.issues as number} issues
                                        </span>
                                      </div>
                                    )}
                                  </>
                                )}
                                {event.type === 'price_change' && (
                                  <>
                                    <div className="text-sm flex items-center gap-1">
                                      <TrendingUp className="w-4 h-4 text-green-500" />
                                      <span className="text-gray-500 dark:text-gray-400">
                                        ${event.metadata.oldPrice as number} → ${event.metadata.newPrice as number}
                                      </span>
                                    </div>
                                    {event.metadata.reason && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Reason:</span>{' '}
                                        <span className="text-gray-900 dark:text-white">{event.metadata.reason as string}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                                {event.type === 'damage' && (
                                  <>
                                    {event.metadata.severity && (
                                      <div className="text-sm flex items-center gap-1">
                                        <span className="text-gray-500 dark:text-gray-400">Severity:</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                                          event.metadata.severity === 'minor' 
                                            ? 'bg-yellow-100 text-yellow-600' 
                                            : 'bg-red-100 text-red-600'
                                        }`}>
                                          {event.metadata.severity as string}
                                        </span>
                                      </div>
                                    )}
                                    {event.metadata.repairCost && (
                                      <div className="text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Repair Cost:</span>{' '}
                                        <span className="text-gray-900 dark:text-white">${event.metadata.repairCost as number}</span>
                                      </div>
                                    )}
                                    {event.metadata.resolved !== undefined && (
                                      <div className="text-sm flex items-center gap-1">
                                        {event.metadata.resolved ? (
                                          <>
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-green-600">Resolved</span>
                                          </>
                                        ) : (
                                          <>
                                            <Clock className="w-4 h-4 text-amber-500" />
                                            <span className="text-amber-600">Pending</span>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Connector to next event */}
                    {index < filteredEvents.length - 1 && (
                      <div className="absolute left-6 -bottom-3 w-0.5 h-6 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
