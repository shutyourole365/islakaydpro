import { useState } from 'react';
import { Search, MapPin, Calendar, ArrowRight, ShieldCheck, Star, Zap } from 'lucide-react';
import { useScrollReveal, useCountUp } from '../../hooks/useScrollReveal';

interface HeroProps {
  onSearch: (query: string, location: string) => void;
}

const heroImages = [
  {
    src: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Construction excavator on a worksite',
    label: 'Construction',
  },
  {
    src: 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Professional camera equipment',
    label: 'Photography',
  },
  {
    src: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Power tools on a workbench',
    label: 'Power Tools',
  },
  {
    src: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=900',
    alt: 'Event tent and party setup',
    label: 'Events',
  },
];

const popularSearches = ['Excavators', 'Power Drills', 'Cameras', 'DJ Equipment', 'Party Tents'];

const stats = [
  { value: 50, suffix: 'K+', label: 'Equipment listed' },
  { value: 120, suffix: 'K+', label: 'Happy renters' },
  { value: 98, suffix: '%', label: 'Satisfaction rate' },
  { value: 50, prefix: '$', suffix: 'K', label: 'Damage protection' },
];

function Stat({ stat, active }: { stat: (typeof stats)[number]; active: boolean }) {
  const count = useCountUp(stat.value, active);
  return (
    <div>
      <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
        {stat.prefix ?? ''}
        {count}
        {stat.suffix ?? ''}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
    </div>
  );
}

export default function Hero({ onSearch }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [statsRef, statsVisible] = useScrollReveal<HTMLDivElement>({ threshold: 0.3 });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, location);
  };

  return (
    <section className="relative bg-aurora bg-white dark:bg-gray-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 lg:pt-40 lg:pb-20">
        {/* Eyebrow */}
        <div className="flex justify-center mb-6 animate-fade-in-down">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-200/70 dark:border-teal-800/50 bg-white/70 dark:bg-gray-900/50 backdrop-blur text-sm font-medium text-gray-700 dark:text-gray-200 shadow-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
            </span>
            The equipment rental marketplace
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-6xl sm:text-7xl lg:text-8xl font-extrabold tracking-tighter text-gray-900 dark:text-white mb-6 text-balance animate-fade-in-up">
          Rent anything.
          <br />
          <span className="text-gradient-animated">Build everything.</span>
        </h1>

        <p className="text-center text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 text-pretty">
          From power tools to heavy machinery — rent verified equipment from owners near
          you, or earn by listing your own.
        </p>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto mb-6 bg-white dark:bg-gray-900 rounded-2xl md:rounded-full shadow-brand ring-1 ring-gray-200/80 dark:ring-gray-800 p-2 transition-shadow hover:shadow-brand-lg"
          role="search"
        >
          <div className="flex flex-col md:flex-row md:items-center md:divide-x divide-gray-200 dark:divide-gray-800">
            <label className="flex-1 flex items-center gap-3 px-5 py-3 cursor-text">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="sr-only">What do you need?</span>
              <input
                type="text"
                placeholder="What do you need?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
            </label>

            <label className="flex items-center gap-3 px-5 py-3 md:w-48 cursor-text">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="sr-only">Location</span>
              <input
                type="text"
                placeholder="Where"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
            </label>

            <label className="hidden lg:flex items-center gap-3 px-5 py-3 w-44 cursor-text">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <span className="sr-only">Dates</span>
              <input
                type="text"
                placeholder="When"
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
            </label>

            <div className="p-1 md:pl-3">
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 bg-[length:200%_auto] hover:bg-[position:right_center] text-white font-semibold rounded-xl md:rounded-full shadow-brand transition-all duration-300"
              >
                <Search className="w-5 h-5" />
                <span className="md:hidden lg:inline">Search</span>
              </button>
            </div>
          </div>
        </form>

        {/* Popular searches */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
          <span className="text-sm text-gray-400 dark:text-gray-500 mr-1">Popular:</span>
          {popularSearches.map((item) => (
            <button
              key={item}
              onClick={() => onSearch(item, '')}
              className="px-4 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Category imagery */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {heroImages.map((image) => (
            <button
              key={image.label}
              onClick={() => onSearch(image.label, '')}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden text-left shadow-soft hover:shadow-brand transition-shadow focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <span className="text-white font-semibold drop-shadow">{image.label}</span>
                <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  <ArrowRight className="w-4 h-4 text-gray-900" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Stats + trust row */}
        <div
          ref={statsRef}
          className={`reveal ${statsVisible ? 'reveal-visible' : ''} flex flex-col lg:flex-row items-center justify-between gap-8 border-t border-gray-100 dark:border-gray-800 pt-10`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-12 gap-y-6">
            {stats.map((stat) => (
              <Stat key={stat.label} stat={stat} active={statsVisible} />
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-x-8 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal-600" /> Verified owners</span>
            <span className="flex items-center gap-2"><Star className="w-4 h-4 text-teal-600" /> Reviewed rentals</span>
            <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-teal-600" /> Instant booking</span>
          </div>
        </div>
      </div>
    </section>
  );
}
