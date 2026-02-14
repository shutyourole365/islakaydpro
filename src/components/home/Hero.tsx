import { useState } from 'react';
import { Search, MapPin, Calendar, Sparkles, ArrowRight, ChevronDown } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handlePopularClick = (item: string) => {
    setSearchQuery(item);
    onSearch(item);
  };

  const stats = [
    { value: '50K+', label: 'Equipment Listed' },
    { value: '120K+', label: 'Happy Renters' },
    { value: '98%', label: 'Satisfaction Rate' },
    { value: '24/7', label: 'AI Support' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
        <img
          src="https://images.pexels.com/photos/162553/keys-workshop-mechanic-tools-162553.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Equipment rental marketplace"
          className={`w-full h-full object-cover transition-opacity duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
      </div>

      <div className="absolute top-20 left-10 w-72 h-72 bg-teal-500/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-sm text-white/90">Powered by Advanced AI Technology</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Rent Any Equipment,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
            Anywhere, Anytime
          </span>
        </h1>

        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-12">
          The world's most intelligent equipment rental marketplace. From power tools to
          construction machinery -- find, compare, and rent with AI-powered precision.
        </p>

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-2 mb-12">
          <div className="flex flex-col md:flex-row items-stretch gap-2">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="What do you need? (e.g., Excavator, Camera, Drill)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl md:w-56">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl md:w-48">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute"
                placeholder="When"
              />
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all duration-300 shadow-lg shadow-teal-500/25"
            >
              <Search className="w-5 h-5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <span className="text-white/60 text-sm">Popular:</span>
          {['Excavators', 'Power Drills', 'Cameras', 'DJ Equipment', 'Party Tents'].map(
            (item) => (
              <button
                key={item}
                onClick={() => handlePopularClick(item)}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white/90 hover:bg-white/20 transition-colors border border-white/10"
              >
                {item}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/10 hover:bg-white/15 transition-colors"
            >
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#categories"
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors"
          >
            Browse Categories
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="w-6 h-6 text-white/40" />
      </div>
    </section>
  );
}
