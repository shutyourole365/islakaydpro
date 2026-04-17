import { useMemo, useState } from 'react';
import { ArrowLeft, Sparkles, Copy, CheckCircle2, Tag, Clock } from 'lucide-react';

type Season = 'winter' | 'spring' | 'summer' | 'fall';
type DealType = 'percentage' | 'flat' | 'bundle';

interface Deal {
  id: string;
  title: string;
  description: string;
  season: Season;
  type: DealType;
  discountPercent?: number;
  discountAmount?: number;
  code: string;
  category: string;
  equipment: string[];
  image: string;
  featured: boolean;
  minRentalDays: number;
  usesTotal: number;
  usesRemaining: number;
  expiresAt: Date;
}

interface Props {
  onBack: () => void;
}

const NOW = new Date();
const dayMs = 1000 * 60 * 60 * 24;

const DEALS: Deal[] = [
  {
    id: 'd1',
    title: 'Winter Construction Blowout',
    description: 'Huge savings on heavy machinery bookings during off-season.',
    season: 'winter',
    type: 'percentage',
    discountPercent: 25,
    code: 'WINTER25',
    category: 'Heavy Equipment',
    equipment: ['Excavators', 'Bulldozers', 'Loaders'],
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
    featured: true,
    minRentalDays: 3,
    usesTotal: 100,
    usesRemaining: 58,
    expiresAt: new Date(NOW.getTime() + 25 * dayMs),
  },
  {
    id: 'd2',
    title: 'Spring Event Package',
    description: 'Everything you need for outdoor spring gatherings.',
    season: 'spring',
    type: 'percentage',
    discountPercent: 30,
    code: 'SPRING30',
    category: 'Event Equipment',
    equipment: ['Tents', 'Tables', 'Audio Systems'],
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400',
    featured: true,
    minRentalDays: 1,
    usesTotal: 80,
    usesRemaining: 42,
    expiresAt: new Date(NOW.getTime() + 40 * dayMs),
  },
  {
    id: 'd3',
    title: 'Summer Landscaping Bundle',
    description: 'Bundle tractors and mowers for landscaping projects.',
    season: 'summer',
    type: 'bundle',
    discountPercent: 20,
    code: 'SUMMER20',
    category: 'Landscaping',
    equipment: ['Tractors', 'Mowers', 'Trimmers'],
    image: 'https://images.unsplash.com/photo-1594771804886-a933bb2d609b?w=400',
    featured: false,
    minRentalDays: 2,
    usesTotal: 120,
    usesRemaining: 70,
    expiresAt: new Date(NOW.getTime() + 60 * dayMs),
  },
  {
    id: 'd4',
    title: 'Drone Photography Week',
    description: 'Flat discount on premium drone kits and photography gear.',
    season: 'summer',
    type: 'flat',
    discountAmount: 100,
    code: 'DRONE100',
    category: 'Photography',
    equipment: ['Drones', 'Cameras', 'Gimbals'],
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=400',
    featured: false,
    minRentalDays: 3,
    usesTotal: 50,
    usesRemaining: 12,
    expiresAt: new Date(NOW.getTime() + 7 * dayMs),
  },
  {
    id: 'd5',
    title: 'Flash Deal: Power Tools',
    description: 'Limited time discount on professional power tool kits.',
    season: 'fall',
    type: 'percentage',
    discountPercent: 15,
    code: 'FLASH15',
    category: 'Construction',
    equipment: ['Drills', 'Saws', 'Grinders'],
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400',
    featured: false,
    minRentalDays: 1,
    usesTotal: 40,
    usesRemaining: 8,
    expiresAt: new Date(NOW.getTime() + 2 * dayMs),
  },
];

const SEASON_LABEL: Record<Season, string> = {
  winter: 'Winter',
  spring: 'Spring',
  summer: 'Summer',
  fall: 'Fall',
};

function countdown(expiresAt: Date): string {
  const ms = expiresAt.getTime() - Date.now();
  if (ms <= 0) return 'Expires now';
  const d = Math.floor(ms / dayMs);
  const h = Math.floor((ms % dayMs) / (1000 * 60 * 60));
  return `${d}d ${h}h left`;
}

function discountLabel(deal: Deal): string {
  if (deal.type === 'flat' && deal.discountAmount !== undefined) {
    return `$${deal.discountAmount} OFF`;
  }
  if (deal.discountPercent !== undefined) {
    return `${deal.discountPercent}% OFF`;
  }
  return 'Special Offer';
}

export default function SeasonalDeals({ onBack }: Props) {
  const [seasonFilter, setSeasonFilter] = useState<'all' | Season>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const counts = useMemo(() => {
    const by = (s: Season) => DEALS.filter((d) => d.season === s).length;
    return {
      winter: by('winter'),
      spring: by('spring'),
      summer: by('summer'),
      fall: by('fall'),
    };
  }, []);

  const filtered = useMemo(() => {
    if (seasonFilter === 'all') return DEALS;
    return DEALS.filter((d) => d.season === seasonFilter);
  }, [seasonFilter]);

  const featured = DEALS.find((d) => d.featured) ?? DEALS[0];

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode((c) => (c === code ? null : c)), 2000);
    } catch {
      setCopiedCode(code);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seasonal Deals & Promotions</h1>
            <p className="text-sm text-gray-500">
              Save big with limited-time offers across every category.
            </p>
          </div>
        </div>

        <section className="rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white p-6 mb-8">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-90 mb-2">
            <Sparkles className="w-4 h-4" />
            Featured Deal
          </div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-1">{featured.title}</h2>
              <p className="text-sm opacity-90 mb-2">{featured.description}</p>
              <p className="text-4xl font-extrabold">{discountLabel(featured)}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => copyCode(featured.code)}
                className="px-4 py-2 rounded-xl bg-white/15 backdrop-blur text-white font-semibold hover:bg-white/25 transition-colors inline-flex items-center gap-2"
              >
                {copiedCode === featured.code ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Tag className="w-4 h-4" />
                    Code: {featured.code}
                  </>
                )}
              </button>
              <span className="text-xs opacity-90 inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {countdown(featured.expiresAt)}
              </span>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-2 mb-6">
          <SeasonChip
            label="All Deals"
            active={seasonFilter === 'all'}
            onClick={() => setSeasonFilter('all')}
          />
          {(Object.keys(SEASON_LABEL) as Season[]).map((s) => (
            <SeasonChip
              key={s}
              label={`${SEASON_LABEL[s]} (${counts[s]})`}
              active={seasonFilter === s}
              onClick={() => setSeasonFilter(s)}
            />
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">
            No deals for this season.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {filtered.map((deal) => {
              const progress = Math.round(
                ((deal.usesTotal - deal.usesRemaining) / deal.usesTotal) * 100
              );
              return (
                <article
                  key={deal.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-full object-cover"
                    />
                    {deal.featured && (
                      <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold">
                        Featured
                      </span>
                    )}
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 text-white text-xs">
                      {SEASON_LABEL[deal.season]}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{deal.title}</h3>
                      <div className="text-right">
                        {deal.type === 'flat' && deal.discountAmount !== undefined ? (
                          <p className="text-2xl font-extrabold text-red-600">
                            ${deal.discountAmount}
                          </p>
                        ) : (
                          <p className="text-2xl font-extrabold text-red-600">
                            {deal.discountPercent}%
                          </p>
                        )}
                        <span className="text-xs text-gray-500">OFF</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{deal.description}</p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium">
                        {deal.category}
                      </span>
                      {deal.equipment.map((eq) => (
                        <span
                          key={eq}
                          className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs"
                        >
                          {eq}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-gray-500 mb-2">
                      Min {deal.minRentalDays} day rental required
                    </div>

                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-teal-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mb-3">
                      <span>{deal.usesRemaining} uses left</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {countdown(deal.expiresAt)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => copyCode(deal.code)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-900 text-white font-mono text-sm hover:bg-gray-800"
                      >
                        {copiedCode === deal.code ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            {deal.code}
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700"
                      >
                        Use Deal
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SeasonChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active ? 'bg-teal-600 text-white' : 'bg-white border border-gray-200 text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}
