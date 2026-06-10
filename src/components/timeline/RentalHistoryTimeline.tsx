import { useState } from 'react';
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Package, Star, DollarSign, MapPin, Filter, ChevronDown } from 'lucide-react';

interface RentalHistoryTimelineProps {
  onBack: () => void;
}

interface RentalEvent {
  id: string;
  equipmentName: string;
  equipmentImage: string;
  ownerName: string;
  location: string;
  startDate: string;
  endDate: string;
  totalCost: number;
  status: 'completed' | 'active' | 'upcoming' | 'cancelled';
  rating?: number;
  review?: string;
  category: string;
}

const statusConfig = {
  completed: { icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-500', bg: 'bg-green-100', border: 'border-green-500', label: 'Completed' },
  active: { icon: <Clock className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-500', label: 'Active' },
  upcoming: { icon: <Calendar className="w-5 h-5" />, color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-500', label: 'Upcoming' },
  cancelled: { icon: <XCircle className="w-5 h-5" />, color: 'text-red-500', bg: 'bg-red-100', border: 'border-red-500', label: 'Cancelled' },
};

const sampleRentals: RentalEvent[] = [
  {
    id: '1',
    equipmentName: 'DJI Mavic 3 Pro Drone Kit',
    equipmentImage: 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg',
    ownerName: 'SkyView Drone Rentals',
    location: 'Seattle, WA',
    startDate: '2026-03-10',
    endDate: '2026-03-14',
    totalCost: 680,
    status: 'upcoming',
    category: 'Photography',
  },
  {
    id: '2',
    equipmentName: 'CAT 320 Excavator',
    equipmentImage: 'https://images.pexels.com/photos/2058128/pexels-photo-2058128.jpeg',
    ownerName: 'Heavy Equipment Rentals LLC',
    location: 'Los Angeles, CA',
    startDate: '2026-02-20',
    endDate: '2026-02-27',
    totalCost: 3150,
    status: 'active',
    category: 'Heavy Equipment',
  },
  {
    id: '3',
    equipmentName: 'Sony A7IV Camera Kit',
    equipmentImage: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg',
    ownerName: 'Pro Camera Rentals',
    location: 'San Francisco, CA',
    startDate: '2026-02-10',
    endDate: '2026-02-13',
    totalCost: 425,
    status: 'completed',
    rating: 5,
    review: 'Exceptional quality. Camera was in perfect condition and delivered on time.',
    category: 'Photography',
  },
  {
    id: '4',
    equipmentName: 'Premium DJ Equipment Package',
    equipmentImage: 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg',
    ownerName: 'Miami Event Rentals',
    location: 'Miami, FL',
    startDate: '2026-02-01',
    endDate: '2026-02-02',
    totalCost: 295,
    status: 'completed',
    rating: 4,
    review: 'Great setup, sound quality was excellent. Would rent again.',
    category: 'Events',
  },
  {
    id: '5',
    equipmentName: 'DeWalt Power Tool Kit',
    equipmentImage: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
    ownerName: 'Tool Time Rentals',
    location: 'Austin, TX',
    startDate: '2026-01-20',
    endDate: '2026-01-25',
    totalCost: 450,
    status: 'completed',
    rating: 5,
    review: 'Everything was in the kit as described. Batteries lasted the entire project.',
    category: 'Power Tools',
  },
  {
    id: '6',
    equipmentName: 'Wedding Tent Package',
    equipmentImage: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
    ownerName: 'Southern Events',
    location: 'Nashville, TN',
    startDate: '2026-01-12',
    endDate: '2026-01-14',
    totalCost: 990,
    status: 'cancelled',
    category: 'Events',
  },
  {
    id: '7',
    equipmentName: 'John Deere 1025R Tractor',
    equipmentImage: 'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg',
    ownerName: 'Rocky Mountain Equipment',
    location: 'Denver, CO',
    startDate: '2025-12-15',
    endDate: '2025-12-22',
    totalCost: 1575,
    status: 'completed',
    rating: 4,
    category: 'Agriculture',
  },
];

export default function RentalHistoryTimeline({ onBack }: RentalHistoryTimelineProps) {
  const [filter, setFilter] = useState<'all' | 'completed' | 'active' | 'upcoming' | 'cancelled'>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredRentals = filter === 'all' ? sampleRentals : sampleRentals.filter((r) => r.status === filter);

  const stats = {
    total: sampleRentals.length,
    totalSpent: sampleRentals.filter((r) => r.status === 'completed').reduce((sum, r) => sum + r.totalCost, 0),
    avgRating: sampleRentals.filter((r) => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) / sampleRentals.filter((r) => r.rating).length,
    active: sampleRentals.filter((r) => r.status === 'active').length,
    upcoming: sampleRentals.filter((r) => r.status === 'upcoming').length,
  };

  const getDaysBetween = (start: string, end: string) => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rental History</h1>
            <p className="text-gray-500 mt-1">Your complete rental timeline and activity</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Total Rentals</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">${stats.totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Total Spent</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <p className="text-2xl font-bold text-gray-900">{stats.avgRating.toFixed(1)}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">Avg Rating Given</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.active + stats.upcoming}</p>
            <p className="text-xs text-gray-500 mt-1">Active/Upcoming</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          <span className="text-sm text-gray-500">{filteredRentals.length} rental{filteredRentals.length !== 1 ? 's' : ''}</span>
        </div>

        {showFilters && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {(['all', 'active', 'upcoming', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-teal-500 text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && ` (${sampleRentals.filter((r) => r.status === f).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-6">
            {filteredRentals.map((rental) => {
              const config = statusConfig[rental.status];
              const days = getDaysBetween(rental.startDate, rental.endDate);
              return (
                <div key={rental.id} className="relative flex gap-4 ml-1">
                  {/* Timeline dot */}
                  <div className={`relative z-10 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 border-2 ${config.border}`}>
                    <span className={config.color}>{config.icon}</span>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      <div className="sm:w-32 h-24 sm:h-auto flex-shrink-0">
                        <img
                          src={rental.equipmentImage}
                          alt={rental.equipmentName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 text-sm">{rental.equipmentName}</h3>
                          <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium whitespace-nowrap`}>
                            {config.label}
                          </span>
                        </div>

                        <p className="text-xs text-gray-500 mb-2">{rental.ownerName}</p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()} ({days}d)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {rental.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" /> ${rental.totalCost.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" /> {rental.category}
                          </span>
                        </div>

                        {rental.rating && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${i < rental.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                            </div>
                            {rental.review && (
                              <p className="text-xs text-gray-600 italic">"{rental.review}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {filteredRentals.length === 0 && (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No rentals found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
