import { useState } from 'react';
import { Search, Sparkles, Mic, X, TrendingUp, MapPin, DollarSign, Calendar } from 'lucide-react';

interface AISearchEngineProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClose: () => void;
}

interface SearchFilters {
  query: string;
  location?: string;
  priceRange?: { min: number; max: number };
  dates?: { start: string; end: string };
  category?: string;
}

interface SearchSuggestion {
  text: string;
  intent: string;
  filters: Partial<SearchFilters>;
  confidence: number;
}

export default function AISearchEngine({ onSearch, onClose }: AISearchEngineProps) {
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  // AI Natural Language Processing
  const analyzeQuery = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setAiInsights([]);
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate AI processing (in production, this would call your AI service)
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerQuery = searchQuery.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];
    const insights: string[] = [];

    // Intent detection patterns
    if (lowerQuery.includes('dig') || lowerQuery.includes('excavat') || lowerQuery.includes('trench')) {
      newSuggestions.push({
        text: 'Excavators and Digging Equipment',
        intent: 'construction_digging',
        filters: { category: 'Construction', query: 'excavator' },
        confidence: 0.95,
      });
      insights.push('💡 Based on "dig", I found construction equipment');
    }

    if (lowerQuery.includes('pool') || lowerQuery.includes('pond') || lowerQuery.includes('foundation')) {
      newSuggestions.push({
        text: 'Heavy Equipment for Large Projects',
        intent: 'large_excavation',
        filters: { category: 'Construction', query: 'excavator backhoe' },
        confidence: 0.88,
      });
      insights.push('🏗️ Large project detected - showing heavy machinery');
    }

    if (lowerQuery.includes('wedding') || lowerQuery.includes('party') || lowerQuery.includes('event')) {
      newSuggestions.push({
        text: 'Event Equipment & Party Supplies',
        intent: 'event_planning',
        filters: { category: 'Events', query: 'tent lighting' },
        confidence: 0.92,
      });
      insights.push('🎉 Event equipment recommended for your occasion');
    }

    if (lowerQuery.includes('photo') || lowerQuery.includes('camera') || lowerQuery.includes('video')) {
      newSuggestions.push({
        text: 'Photography & Video Equipment',
        intent: 'photography',
        filters: { category: 'Photography', query: 'camera lens' },
        confidence: 0.90,
      });
      insights.push('📸 Professional photography gear available');
    }

    if (lowerQuery.match(/\$\d+/) || lowerQuery.includes('cheap') || lowerQuery.includes('budget')) {
      const priceMatch = lowerQuery.match(/\$(\d+)/);
      const maxPrice = priceMatch ? parseInt(priceMatch[1]) : 100;
      newSuggestions.push({
        text: `Equipment Under $${maxPrice}/day`,
        intent: 'budget_search',
        filters: { priceRange: { min: 0, max: maxPrice } },
        confidence: 0.85,
      });
      insights.push(`💰 Filtering by your budget: $${maxPrice}/day max`);
    }

    if (lowerQuery.includes('near') || lowerQuery.includes('around') || lowerQuery.match(/\d{5}/)) {
      const locationMatch = lowerQuery.match(/near\s+([a-z\s]+)|around\s+([a-z\s]+)|(\d{5})/i);
      const location = locationMatch ? locationMatch[1] || locationMatch[2] || locationMatch[3] : '';
      newSuggestions.push({
        text: `Equipment Near ${location}`,
        intent: 'location_search',
        filters: { location: location.trim() },
        confidence: 0.87,
      });
      insights.push('📍 Showing equipment in your area');
    }

    if (lowerQuery.includes('weekend') || lowerQuery.includes('week') || lowerQuery.includes('month')) {
      const duration = lowerQuery.includes('weekend') ? '2 days' : 
                      lowerQuery.includes('week') ? '7 days' : '30 days';
      insights.push(`📅 Rental duration: ${duration} - weekly/monthly discounts available`);
    }

    if (lowerQuery.includes('pro') || lowerQuery.includes('professional') || lowerQuery.includes('commercial')) {
      newSuggestions.push({
        text: 'Professional-Grade Equipment',
        intent: 'professional',
        filters: { query: lowerQuery + ' professional commercial' },
        confidence: 0.83,
      });
      insights.push('⭐ Showing verified professional equipment');
    }

    // Generic fallback
    if (newSuggestions.length === 0) {
      newSuggestions.push({
        text: `Search for "${searchQuery}"`,
        intent: 'generic',
        filters: { query: searchQuery },
        confidence: 0.70,
      });
      insights.push('🔍 Searching all available equipment');
    }

    setSuggestions(newSuggestions);
    setAiInsights(insights);
    setIsAnalyzing(false);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    analyzeQuery(value);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSearch(suggestion.filters.query || query, suggestion.filters as SearchFilters);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const bestSuggestion = suggestions[0];
      if (bestSuggestion) {
        handleSuggestionClick(bestSuggestion);
      } else {
        onSearch(query, { query });
        onClose();
      }
    }
  };

  const trendingSearches = [
    { icon: '🏗️', text: 'Construction Equipment', query: 'excavator bulldozer' },
    { icon: '📸', text: 'Photography Gear', query: 'camera dslr mirrorless' },
    { icon: '🎉', text: 'Event Supplies', query: 'tent lighting tables' },
    { icon: '🔧', text: 'Power Tools', query: 'drill saw power tools' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">AI-Powered Search</h2>
                <p className="text-teal-100 text-sm">Ask naturally, we'll understand</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <input
                type="text"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder='Try "I need something to dig a pool" or "camera for wedding this weekend"'
                className="w-full pl-12 pr-24 py-4 rounded-2xl bg-white/20 text-white placeholder-white/60 focus:outline-none focus:bg-white/30 transition-colors text-lg"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isAnalyzing && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-sm">AI analyzing...</span>
                  </div>
                )}
                {!isAnalyzing && (
                  <button
                    type="button"
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Voice search"
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {/* AI Insights */}
          {aiInsights.length > 0 && (
            <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
              <div className="space-y-2">
                {aiInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-blue-800">
                    <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">AI SUGGESTIONS</h3>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-teal-600 transition-colors">
                        {suggestion.text}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{suggestion.intent.replace('_', ' ')}</span>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${suggestion.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(suggestion.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                      <Search className="w-4 h-4 text-teal-600" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {!query && (
            <div className="p-6">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <TrendingUp className="w-4 h-4" />
                Trending Searches
              </div>
              <div className="grid grid-cols-2 gap-3">
                {trendingSearches.map((trend, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(trend.query);
                      analyzeQuery(trend.query);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                  >
                    <span className="text-2xl">{trend.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{trend.text}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Examples */}
          {!query && (
            <div className="px-6 pb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">TRY ASKING...</h3>
              <div className="space-y-2">
                {[
                  { icon: <MapPin className="w-4 h-4" />, text: 'Find excavators near Los Angeles under $300/day' },
                  { icon: <Calendar className="w-4 h-4" />, text: 'Camera equipment for weekend wedding shoot' },
                  { icon: <DollarSign className="w-4 h-4" />, text: 'Cheapest power tools for home renovation' },
                  { icon: <Sparkles className="w-4 h-4" />, text: 'Professional DJ equipment for party on Saturday' },
                ].map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(example.text);
                      analyzeQuery(example.text);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left text-sm text-gray-600"
                  >
                    <div className="text-teal-500">{example.icon}</div>
                    <span>"{example.text}"</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-200 text-xs">Enter</kbd>
                to search
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white rounded border border-gray-200 text-xs">Esc</kbd>
                to close
              </span>
            </div>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-teal-500" />
              Powered by AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
