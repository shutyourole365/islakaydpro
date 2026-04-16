import { useState } from 'react';
import { ArrowLeft, Tag, Clock, Star, Gift, ChevronRight, Flame, Snowflake, Sun, Leaf } from 'lucide-react';

interface SeasonalDealsProps {
  onBack: () => void;
}

interface Deal {
  id: string;
  title: string;
  description: string;
  discount: number;
  type: 'percentage' | 'flat' | 'bundle';
  category: string;
  code: string;
  expiresAt: string;
  minRentalDays: number;
  usesLeft: number;
  totalUses: number;
  featured: boolean;
  season: 'winter' | 'spring' | 'summer' | 'fall';
  equipment?: string[];
}

const seasonConfig = {
  winter: { icon: <Snowflake className="w-5 h-5" />, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  spring: { icon: <Leaf className="w-5 h-5" />, gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-50', text: 'text-green-700' },
  summer: { icon: <Sun className="w-5 h-5" />, gradient: 'from-orange-500 to-yellow-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  fall: { icon: <Leaf className="w-5 h-5" />, gradient: 'from-amber-500 to-red-500', bg: 'bg-amber-50', text: 'text-amber-700' },
};

const sampleDeals: Deal[] = [
  {
    id: '1',
    title: 'Winter Construction Blowout',
    description: 'Save big on heavy equipment rentals during the winter season. Perfect for indoor projects and site prep.',
    discount: 25,
    type: 'percentage',
    category: 'Heavy Equipment',
    code: 'WINTER25',
    expiresAt: '2026-03-20',
    minRentalDays: 3,
    usesLeft: 47,
    totalUses: 200,
    featured: true,
    season: 'winter',
    equipment: ['Excavators', 'Bulldozers', 'Cranes'],
  },
  {
    id: '2',
    title: 'Spring Event Package',
    description: 'Get ready for spring events with discounted tent, sound, and lighting packages.',
    discount: 30,
    type: 'percentage',
    category: 'Event Equipment',
    code: 'SPRING30',
    expiresAt: '2026-05-31',
    minRentalDays: 1,
    usesLeft: 89,
    totalUses: 150,
    featured: true,
    season: 'spring',
    equipment: ['Tents', 'Sound Systems', 'Lighting'],
  },
  {
    id: '3',
    title: 'Drone Photography Week',
    description: 'Capture stunning aerial footage at a fraction of the cost. Includes free extra battery.',
    discount: 100,
    type: 'flat',
    category: 'Photography',
    code: 'DRONE100',
    expiresAt: '2026-03-15',
    minRentalDays: 7,
    usesLeft: 23,
    totalUses: 50,
    featured: false,
    season: 'winter',
    equipment: ['DJI Mavic 3 Pro', 'DJI Air 3', 'Camera Kits'],
  },
  {
    id: '4',
    title: 'Summer Landscaping Bundle',
    description: 'Rent a tractor + power tools combo and save. Ideal for large landscaping projects.',
    discount: 20,
    type: 'bundle',
    category: 'Landscaping',
    code: 'SUMMER20',
    expiresAt: '2026-08-31',
    minRentalDays: 5,
    usesLeft: 120,
    totalUses: 300,
    featured: true,
    season: 'summer',
    equipment: ['Compact Tractors', 'Power Tools', 'Pressure Washers'],
  },
  {
    id: '5',
    title: 'Flash Deal: Power Tools',
    description: '48-hour flash sale on all power tool kits. First come, first served!',
    discount: 40,
    type: 'percentage',
    category: 'Power Tools',
    code: 'FLASH40',
    expiresAt: '2026-02-26',
    minRentalDays: 1,
    usesLeft: 8,
    totalUses: 25,
    featured: false,
    season: 'winter',
    equipment: ['DeWalt Kits', 'Milwaukee Kits', 'Bosch Tools'],
  },
  {
    id: '6',
    title: 'Fall Harvest Equipment',
    description: 'Special rates on agricultural equipment for the harvest season.',
    discount: 15,
    type: 'percentage',
    category: 'Agriculture',
    code: 'HARVEST15',
    expiresAt: '2026-11-30',
    minRentalDays: 7,
    usesLeft: 200,
    totalUses: 500,
    featured: false,
    season: 'fall',
    equipment: ['Tractors', 'Combines', 'Tillers'],
  },
];

function CountdownTimer({ expiresAt }: { expiresAt: string }) {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));

  if (days <= 2) {
    return (
      <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
        <Flame className="w-4 h-4" /> {days}d {hours}h left
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-gray-500 text-sm">
      <Clock className="w-4 h-4" /> Expires {expiry.toLocaleDateString()}
    </span>
  );
}

export default function SeasonalDeals({ onBack }: SeasonalDealsProps) {
  const [filter, setFilter] = useState<'all' | 'winter' | 'spring' | 'summer' | 'fall'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const filteredDeals = filter === 'all' ? sampleDeals : sampleDeals.filter((d) => d.season === filter);
  const featuredDeals = sampleDeals.filter((d) => d.featured);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seasonal Deals & Promotions</h1>
            <p className="text-gray-500 mt-1">Save big with limited-time offers on equipment rentals</p>
          </div>
        </div>

        {/* Featured Banner */}
        {featuredDeals.length > 0 && (
          <div className="mb-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase tracking-wider">Featured Deal</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{featuredDeals[0].title}</h2>
            <p className="text-teal-100 mb-4">{featuredDeals[0].description}</p>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="bg-white/20 px-4 py-2 rounded-lg font-bold text-lg">
                {featuredDeals[0].type === 'flat' ? `$${featuredDeals[0].discount} OFF` : `${featuredDeals[0].discount}% OFF`}
              </span>
              <button
                onClick={() => handleCopyCode(featuredDeals[0].code)}
                className="bg-white text-teal-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-teal-50 transition-colors"
              >
                {copiedCode === featuredDeals[0].code ? 'Copied!' : `Code: ${featuredDeals[0].code}`}
              </button>
              <CountdownTimer expiresAt={featuredDeals[0].expiresAt} />
            </div>
          </div>
        )}

        {/* Season Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              filter === 'all' ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Deals ({sampleDeals.length})
          </button>
          {(['winter', 'spring', 'summer', 'fall'] as const).map((season) => {
            const config = seasonConfig[season];
            const count = sampleDeals.filter((d) => d.season === season).length;
            return (
              <button
                key={season}
                onClick={() => setFilter(season)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === season
                    ? `bg-gradient-to-r ${config.gradient} text-white`
                    : `${config.bg} ${config.text} hover:opacity-80`
                }`}
              >
                {config.icon}
                {season.charAt(0).toUpperCase() + season.slice(1)} ({count})
              </button>
            );
          })}
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDeals.map((deal) => {
            const config = seasonConfig[deal.season];
            const usagePercent = ((deal.totalUses - deal.usesLeft) / deal.totalUses) * 100;
            return (
              <div key={deal.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                {/* Deal Header */}
                <div className={`bg-gradient-to-r ${config.gradient} p-4 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium bg-white/20 px-2 py-0.5 rounded-full">
                      {config.icon} {deal.category}
                    </span>
                    {deal.featured && (
                      <span className="flex items-center gap-1 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-bold">
                        <Star className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>
                  <div className="text-3xl font-bold">
                    {deal.type === 'flat' ? `$${deal.discount}` : `${deal.discount}%`}
                    <span className="text-lg ml-1">OFF</span>
                  </div>
                </div>

                {/* Deal Body */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{deal.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{deal.description}</p>

                  {/* Equipment Tags */}
                  {deal.equipment && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {deal.equipment.map((eq) => (
                        <span key={eq} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{eq}</span>
                      ))}
                    </div>
                  )}

                  {/* Usage Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>{deal.usesLeft} uses left</span>
                      <span>{usagePercent.toFixed(0)}% claimed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full bg-gradient-to-r ${config.gradient}`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>Min {deal.minRentalDays} day{deal.minRentalDays > 1 ? 's' : ''}</span>
                    <CountdownTimer expiresAt={deal.expiresAt} />
                  </div>

                  {/* Action */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyCode(deal.code)}
                      className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Tag className="w-4 h-4" />
                      {copiedCode === deal.code ? 'Copied!' : deal.code}
                    </button>
                    <button className="flex-1 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors flex items-center justify-center gap-1">
                      Use Deal <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredDeals.length === 0 && (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No deals available for this season</h3>
            <p className="text-sm text-gray-400 mt-1">Check back later for new promotions!</p>
          </div>
        )}
      </div>
    </div>
  );
}
