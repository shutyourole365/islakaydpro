import { useMemo, useState } from 'react';
import { ArrowLeft, Filter, MapPin, Star, Calendar, DollarSign } from 'lucide-react';

type Status = 'completed' | 'active' | 'upcoming' | 'cancelled';

interface Rental {
  id: string;
  equipment: string;
  image: string;
  category: string;
  status: Status;
  start: Date;
  end: Date;
  cost: number;
  owner: string;
  location: string;
  rating?: number;
  review?: string;
}

interface Props {
  onBack: () => void;
}

const RENTALS: Rental[] = [
  {
    id: 'r1',
    equipment: 'CAT 320 Excavator',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
    category: 'Heavy Equipment',
    status: 'active',
    start: new Date(2026, 3, 10),
    end: new Date(2026, 3, 17),
    cost: 3150,
    owner: 'Big Steel Rentals',
    location: 'Portland, OR',
    rating: undefined,
  },
  {
    id: 'r2',
    equipment: 'Sony A7IV Camera Kit',
    image: 'https://images.unsplash.com/photo-1606980625672-eb8f9ad06080?w=400',
    category: 'Photography',
    status: 'completed',
    start: new Date(2026, 1, 5),
    end: new Date(2026, 1, 9),
    cost: 680,
    owner: 'Pro Camera Rentals',
    location: 'Los Angeles, CA',
    rating: 5,
    review: 'Exceptional quality and super smooth pickup experience.',
  },
  {
    id: 'r3',
    equipment: 'DJI Mavic 3 Pro Drone Kit',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
    category: 'Photography',
    status: 'upcoming',
    start: new Date(2026, 4, 1),
    end: new Date(2026, 4, 5),
    cost: 920,
    owner: 'SkyView Drone Rentals',
    location: 'Seattle, WA',
  },
  {
    id: 'r4',
    equipment: 'Wedding Tent Package',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    category: 'Events',
    status: 'cancelled',
    start: new Date(2026, 2, 20),
    end: new Date(2026, 2, 22),
    cost: 1400,
    owner: 'Elegant Events Co',
    location: 'Austin, TX',
  },
  {
    id: 'r5',
    equipment: 'Premium DJ Package',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400',
    category: 'Events',
    status: 'completed',
    start: new Date(2026, 0, 12),
    end: new Date(2026, 0, 19),
    cost: 3150,
    owner: 'Night Wave Events',
    location: 'Miami, FL',
    rating: 5,
    review: 'Great setup and punctual delivery. Guests loved the lights.',
  },
  {
    id: 'r6',
    equipment: 'John Deere 1025R Tractor',
    image: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=400',
    category: 'Agricultural',
    status: 'completed',
    start: new Date(2025, 10, 3),
    end: new Date(2025, 10, 10),
    cost: 1260,
    owner: 'Green Valley Rentals',
    location: 'Sacramento, CA',
    rating: 4,
    review: 'Reliable, well maintained, owner was responsive.',
  },
  {
    id: 'r7',
    equipment: 'DeWalt Pro Tool Kit',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
    category: 'Construction',
    status: 'completed',
    start: new Date(2025, 9, 15),
    end: new Date(2025, 9, 18),
    cost: 280,
    owner: 'Build Rite Tools',
    location: 'Denver, CO',
    rating: 4,
    review: 'Good kit, minor wear but everything worked perfectly.',
  },
];

const STATUS_LABEL: Record<Status, string> = {
  completed: 'Completed',
  active: 'Active',
  upcoming: 'Upcoming',
  cancelled: 'Cancelled',
};

const STATUS_STYLE: Record<Status, string> = {
  completed: 'bg-green-50 text-green-700',
  active: 'bg-teal-50 text-teal-700',
  upcoming: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-700',
};

function daysBetween(start: Date, end: Date): number {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function RentalHistoryTimeline({ onBack }: Props) {
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const stats = useMemo(() => {
    const totalSpent = RENTALS
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + r.cost, 0);
    const rated = RENTALS.filter((r) => r.rating !== undefined);
    const avgRating = rated.length > 0
      ? rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length
      : 0;
    const activeOrUpcoming = RENTALS.filter(
      (r) => r.status === 'active' || r.status === 'upcoming'
    ).length;
    return { total: RENTALS.length, totalSpent, avgRating, activeOrUpcoming };
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return RENTALS;
    return RENTALS.filter((r) => r.status === filter);
  }, [filter]);

  const counts = useMemo(() => {
    const by = (status: Status) => RENTALS.filter((r) => r.status === status).length;
    return {
      all: RENTALS.length,
      completed: by('completed'),
      active: by('active'),
      upcoming: by('upcoming'),
      cancelled: by('cancelled'),
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rental History</h1>
            <p className="text-sm text-gray-500">
              Your complete rental timeline across all categories.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Stat label="Total Rentals" value={`${stats.total}`} icon={<Calendar className="w-5 h-5 text-teal-600" />} />
          <Stat
            label="Total Spent"
            value={`$${stats.totalSpent.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5 text-green-600" />}
          />
          <Stat
            label="Avg Rating Given"
            value={stats.avgRating.toFixed(1)}
            icon={<Star className="w-5 h-5 text-amber-500" />}
          />
          <Stat
            label="Active/Upcoming"
            value={`${stats.activeOrUpcoming}`}
            icon={<Calendar className="w-5 h-5 text-blue-500" />}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <button
            onClick={() => setFilterOpen((o) => !o)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-700"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <span className="text-sm text-gray-500">{filtered.length} rental{filtered.length === 1 ? '' : 's'}</span>
        </div>

        {filterOpen && (
          <div className="flex flex-wrap gap-2 mb-4">
            <FilterChip label="All" active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterChip
              label={`Completed (${counts.completed})`}
              active={filter === 'completed'}
              onClick={() => setFilter('completed')}
            />
            <FilterChip
              label={`Active (${counts.active})`}
              active={filter === 'active'}
              onClick={() => setFilter('active')}
            />
            <FilterChip
              label={`Upcoming (${counts.upcoming})`}
              active={filter === 'upcoming'}
              onClick={() => setFilter('upcoming')}
            />
            <FilterChip
              label={`Cancelled (${counts.cancelled})`}
              active={filter === 'cancelled'}
              onClick={() => setFilter('cancelled')}
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
            No rentals match this filter.
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />
            <div className="space-y-4">
              {filtered.map((r) => {
                const days = daysBetween(r.start, r.end);
                return (
                  <div key={r.id} className="relative pl-12">
                    <div className={`absolute left-2 top-5 w-5 h-5 rounded-full border-4 border-white ${STATUS_STYLE[r.status].replace('text-', 'bg-').replace('bg-50', '500')}`} />
                    <article className="bg-white rounded-2xl border border-gray-100 p-4">
                      <div className="flex gap-4">
                        <img
                          src={r.image}
                          alt={r.equipment}
                          className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900">{r.equipment}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLE[r.status]}`}>
                              {STATUS_LABEL[r.status]}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-2">{r.category}</p>
                          <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-600">
                            <span>
                              {r.start.toLocaleDateString()} - {r.end.toLocaleDateString()} ({days}d)
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {r.location}
                            </span>
                            <span>{r.owner}</span>
                            <span className="font-semibold text-gray-900">
                              ${r.cost.toLocaleString()}
                            </span>
                          </div>
                          {r.review && (
                            <div className="mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: r.rating ?? 0 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-3 h-3 text-amber-500 fill-amber-500"
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-gray-600">{r.review}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
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

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
        active ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}
