import { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, ArrowRight, Hammer, Shield, Star, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HeroProps {
  onSearch: (query: string, location: string) => void;
  onPlanProject?: () => void;
}

const QUICK_SEARCHES = ['Power Drill', 'Trailer', 'Scaffolding', 'Pressure Washer', 'Concrete Mixer', 'Generator'];

export default function Hero({ onSearch, onPlanProject }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [stats, setStats] = useState<{ equipment: number; owners: number; categories: number } | null>(null);

  // Pull real live counts from Supabase
  useEffect(() => {
    Promise.all([
      supabase.from('equipment').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
    ]).then(([eq, profiles, cats]) => {
      setStats({
        equipment: eq.count ?? 0,
        owners: profiles.count ?? 0,
        categories: cats.count ?? 0,
      });
    }).catch(() => {});
  }, []);

  const handleSearch = () => onSearch(searchQuery, location);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg"
          alt="Tools and equipment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/55 to-black/80" />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-24 left-8 w-64 h-64 bg-teal-500/25 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-24 right-8 w-80 h-80 bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
          <Shield className="w-4 h-4 text-teal-400" />
          <span className="text-sm text-white/90">Australia's peer-to-peer tool &amp; equipment rental platform</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-5 leading-tight tracking-tight">
          Borrow the tools.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            Get the job done.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10">
          Rent tools and equipment from real people nearby — or earn money from the gear sitting in your shed.
          Trusted, insured, and AI-assisted.
        </p>

        {/* Search bar */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-2 mb-6">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="What do you need? e.g. pressure washer, scaffold..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKey}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl sm:w-44">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Suburb or city"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKey}
                className="w-full bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
              />
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-lg shadow-teal-500/30"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Quick searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <span className="text-white/50 text-xs">Quick:</span>
          {QUICK_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => { setSearchQuery(item); onSearch(item, location); }}
              className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-white/20 transition-colors border border-white/10"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Live stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Hammer className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-white leading-none">
                {stats ? (stats.equipment > 0 ? `${stats.equipment}+` : 'Growing') : '…'}
              </div>
              <div className="text-xs text-white/50">Listings available</div>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-white leading-none">
                {stats ? (stats.owners > 0 ? `${stats.owners}+` : 'Join early') : '…'}
              </div>
              <div className="text-xs text-white/50">Members</div>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-white leading-none">
                {stats ? (stats.categories > 0 ? `${stats.categories}` : 'All') : '…'}
              </div>
              <div className="text-xs text-white/50">Categories</div>
            </div>
          </div>
          <div className="w-px h-8 bg-white/20 hidden sm:block" />
          <div className="flex items-center gap-2 text-white/80">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-white leading-none">AI-powered</div>
              <div className="text-xs text-white/50">Trust & matching</div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#categories"
            className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors shadow-lg"
          >
            Browse All Gear
            <ArrowRight className="w-5 h-5" />
          </a>
          {onPlanProject && (
            <button
              onClick={onPlanProject}
              className="flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-full transition-colors border border-white/25 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              Plan My Project with AI
            </button>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-60">
        <div className="w-5 h-8 border-2 border-white/40 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </div>
      </div>
    </section>
  );
}
