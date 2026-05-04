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
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
      {/* Photo background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg"
          alt="Tools and equipment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/85" />
        {/* Mesh colour overlay using brand colours */}
        <div className="absolute inset-0 bg-mesh opacity-40" />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-teal-500/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-spark-400/20 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">

        {/* Trust badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 shadow-glow">
          <span className="w-2 h-2 rounded-full bg-spark-300 animate-pulse" />
          <Shield className="w-4 h-4 text-teal-300" />
          <span className="text-sm text-white/90 font-medium">
            Australia's peer-to-peer equipment rental platform
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-5 leading-[1.08] tracking-tight">
          Borrow the tools.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-teal-400 to-emerald-400">
            Get the job done.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
          Rent tools and equipment from real people nearby — or earn money from the gear sitting in your shed.
          Trusted, insured, and AI-assisted.
        </p>

        {/* Search bar */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] p-2 mb-5">
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
              className="flex items-center justify-center gap-2 px-7 py-3 bg-brand-gradient text-white font-semibold rounded-xl hover:opacity-90 transition-all duration-200 shadow-pop"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Quick searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          <span className="text-white/40 text-xs font-medium">Quick:</span>
          {QUICK_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => { setSearchQuery(item); onSearch(item, location); }}
              className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Live stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          {[
            { icon: <Hammer className="w-4 h-4 text-teal-300" />, value: stats ? (stats.equipment > 0 ? `${stats.equipment}+` : 'Growing') : '…', label: 'Listings available' },
            { icon: <Users className="w-4 h-4 text-emerald-300" />, value: stats ? (stats.owners > 0 ? `${stats.owners}+` : 'Join early') : '…', label: 'Members' },
            { icon: <Star className="w-4 h-4 text-spark-300" />, value: stats ? (stats.categories > 0 ? `${stats.categories}` : 'All') : '…', label: 'Categories' },
            { icon: <Shield className="w-4 h-4 text-teal-300" />, value: 'AI-powered', label: 'Trust & matching' },
          ].map((stat, i, arr) => (
            <div key={stat.label} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                {stat.icon}
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-white leading-none">{stat.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
              {i < arr.length - 1 && <div className="w-px h-8 bg-white/15 hidden sm:block ml-4" />}
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#categories"
            className="flex items-center gap-2 px-7 py-3.5 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-50 transition-colors shadow-elevated"
          >
            Browse All Gear
            <ArrowRight className="w-5 h-5" />
          </a>
          {onPlanProject && (
            <button
              onClick={onPlanProject}
              className="flex items-center gap-2 px-7 py-3.5 bg-spark-400/20 hover:bg-spark-400/30 text-white font-semibold rounded-full transition-colors border border-spark-300/30 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-spark-300" />
              Plan My Project with AI
            </button>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex items-start justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
