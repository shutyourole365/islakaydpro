import { useState, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Star,
  Heart,
  ArrowRight,
  RefreshCw,
  Zap,
  Target,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Eye,
} from 'lucide-react';
import type { Equipment } from '../../types';

interface SmartRecommendationsProps {
  equipment?: Equipment[];
  userId?: string;
  userLocation?: { lat: number; lng: number };
  recentViews?: string[];
  favorites?: Set<string>;
  onEquipmentClick?: (equipment: Equipment) => void;
  onEquipmentSelect?: (equipment: Equipment) => void;
  onFavoriteClick?: (equipmentId: string) => void;
  onClose?: () => void;
  className?: string;
}

interface RecommendationReason {
  type: 'similar' | 'trending' | 'nearby' | 'viewed' | 'popular' | 'new' | 'deal';
  label: string;
  icon: React.ReactNode;
  color: string;
}

export interface ScoredEquipment {
  equipment: Equipment;
  score: number;
  reasons: RecommendationReason[];
}

export default function SmartRecommendations({
  equipment = [],
  userId: _userId,
  userLocation,
  recentViews = [],
  favorites = new Set<string>(),
  onEquipmentClick,
  onEquipmentSelect,
  onFavoriteClick,
  onClose: _onClose,
  className = '',
}: SmartRecommendationsProps) {
  // Use onEquipmentSelect as fallback for onEquipmentClick
  const handleEquipmentClick = onEquipmentClick || onEquipmentSelect || (() => {});
  const handleFavoriteClick = onFavoriteClick || (() => {});
  
  // Reserved for future use
  void _userId;
  void _onClose;
  
  const [activeTab, setActiveTab] = useState<'for-you' | 'trending' | 'nearby' | 'deals'>('for-you');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Generate recommendation reasons
  const getReasons = (eq: Equipment): RecommendationReason[] => {
    const reasons: RecommendationReason[] = [];

    // Trending (high bookings)
    if (eq.total_bookings > 50) {
      reasons.push({
        type: 'trending',
        label: 'Trending',
        icon: <TrendingUp className="w-3 h-3" />,
        color: 'bg-orange-100 text-orange-700',
      });
    }

    // Nearby
    if (userLocation && eq.latitude && eq.longitude) {
      const distance = calculateDistance(userLocation.lat, userLocation.lng, eq.latitude, eq.longitude);
      if (distance < 25) {
        reasons.push({
          type: 'nearby',
          label: `${distance.toFixed(1)} mi away`,
          icon: <MapPin className="w-3 h-3" />,
          color: 'bg-blue-100 text-blue-700',
        });
      }
    }

    // Recently viewed category
    if (recentViews.includes(eq.category_id || '')) {
      reasons.push({
        type: 'viewed',
        label: 'Based on views',
        icon: <Eye className="w-3 h-3" />,
        color: 'bg-purple-100 text-purple-700',
      });
    }

    // Popular (high rating + reviews)
    if (eq.rating >= 4.8 && eq.total_reviews > 20) {
      reasons.push({
        type: 'popular',
        label: 'Top Rated',
        icon: <Star className="w-3 h-3" />,
        color: 'bg-amber-100 text-amber-700',
      });
    }

    // New listing
    const daysSinceCreated = Math.floor((Date.now() - new Date(eq.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated < 7) {
      reasons.push({
        type: 'new',
        label: 'New Listing',
        icon: <Zap className="w-3 h-3" />,
        color: 'bg-green-100 text-green-700',
      });
    }

    // Deal (weekly/monthly rate is good value)
    if (eq.weekly_rate && eq.weekly_rate < eq.daily_rate * 6) {
      reasons.push({
        type: 'deal',
        label: 'Great Value',
        icon: <Target className="w-3 h-3" />,
        color: 'bg-red-100 text-red-700',
      });
    }

    return reasons;
  };

  // Score and rank equipment
  const scoredEquipment = useMemo(() => {
    return equipment
      .filter(eq => !dismissedIds.has(eq.id))
      .map(eq => {
        let score = 0;
        const reasons = getReasons(eq);

        // Base score from rating
        score += eq.rating * 10;

        // Boost for high bookings
        score += Math.min(eq.total_bookings / 10, 20);

        // Boost for verified owner
        if (eq.owner?.is_verified) score += 15;

        // Boost for featured
        if (eq.is_featured) score += 10;

        // Boost based on reasons
        reasons.forEach(r => {
          if (r.type === 'nearby') score += 25;
          if (r.type === 'viewed') score += 20;
          if (r.type === 'trending') score += 15;
          if (r.type === 'popular') score += 10;
          if (r.type === 'new') score += 10;
          if (r.type === 'deal') score += 10;
        });

        // Boost if favorited
        if (favorites.has(eq.id)) score += 5;

        return { equipment: eq, score, reasons };
      })
      .sort((a, b) => b.score - a.score);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment, dismissedIds, favorites]);

  // Filter based on active tab
  const filteredEquipment = useMemo(() => {
    switch (activeTab) {
      case 'trending':
        return scoredEquipment.filter(se => se.reasons.some(r => r.type === 'trending'));
      case 'nearby':
        return scoredEquipment.filter(se => se.reasons.some(r => r.type === 'nearby'));
      case 'deals':
        return scoredEquipment.filter(se => se.reasons.some(r => r.type === 'deal'));
      default:
        return scoredEquipment;
    }
  }, [scoredEquipment, activeTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleFeedback = (equipmentId: string, isPositive: boolean) => {
    setFeedbackGiven(prev => new Set([...prev, equipmentId]));
    if (!isPositive) {
      setDismissedIds(prev => new Set([...prev, equipmentId]));
    }
    // In production, send feedback to backend for ML training
    console.log(`Feedback for ${equipmentId}: ${isPositive ? 'positive' : 'negative'}`);
  };

  const tabs = [
    { id: 'for-you', label: 'For You', icon: Sparkles },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'nearby', label: 'Nearby', icon: MapPin },
    { id: 'deals', label: 'Deals', icon: Target },
  ];

  return (
    <section className={`py-12 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Smart Recommendations</h2>
              <p className="text-gray-500">Personalized picks powered by AI</p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Equipment Grid */}
        {filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredEquipment.slice(0, 8).map(({ equipment: eq, reasons }, index) => (
              <div
                key={eq.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  animation: 'fadeInUp 0.5s ease-out forwards',
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                }}
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={eq.images[0]}
                    alt={eq.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Reason badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {reasons.slice(0, 2).map((reason, i) => (
                      <span
                        key={i}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${reason.color}`}
                      >
                        {reason.icon}
                        {reason.label}
                      </span>
                    ))}
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFavoriteClick(eq.id);
                    }}
                    className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      favorites.has(eq.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.has(eq.id) ? 'fill-white' : ''}`} />
                  </button>

                  {/* Quick view */}
                  <button
                    onClick={() => handleEquipmentClick(eq)}
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-900 font-medium text-sm opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                  >
                    Quick View
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate">{eq.title}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>{eq.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>{eq.total_reviews} reviews</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${eq.daily_rate}</span>
                      <span className="text-gray-500">/day</span>
                    </div>

                    {/* Feedback buttons */}
                    {!feedbackGiven.has(eq.id) ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(eq.id, true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                          title="Good recommendation"
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFeedback(eq.id, false);
                          }}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Not relevant"
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Thanks!</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recommendations found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filters or check back later</p>
            <button
              onClick={() => setActiveTab('for-you')}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              View All Recommendations
            </button>
          </div>
        )}

        {/* View all link */}
        {filteredEquipment.length > 8 && (
          <div className="text-center mt-8">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
              View All {filteredEquipment.length} Recommendations
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
