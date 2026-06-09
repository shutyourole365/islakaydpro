import { useState, useEffect } from 'react';
import { TrendingUp, Heart, Package, Zap, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import type { Equipment } from '../../types';
import {
  getSmartRecommendations,
  type Recommendation,
} from '../../services/recommendationService';
import { supabase } from '../../lib/supabase';

export default function SmartRecommendationsPanel() {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personalized' | 'trending'>('personalized');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) return;
    loadRecommendations();
    loadWishlist();
  }, [user?.id, activeTab]);

  const loadRecommendations = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      let data: Recommendation[];

      if (activeTab === 'personalized') {
        data = await getSmartRecommendations(user.id, 12);
      } else {
        // For trending, fetch top rated equipment across all users
        const { data: equipment, error } = await supabase
          .from('equipment')
          .select('*')
          .gte('rating', 4.5)
          .order('rental_count', { ascending: false })
          .limit(12);

        if (error) throw error;

        data = (equipment || []).map((e: Equipment) => ({
          id: String(e.id),
          equipmentId: String(e.id),
          equipmentName: e.title,
          reason: 'Trending on IslaKayden',
          relevanceScore: Math.round(4 * 20),
          basePrice: e.daily_rate,
          imageUrl: '',
          category: e.category_id || 'Other',
        }));
      }

      setRecommendations(data);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      showError('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('equipment_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const wishedIds = new Set((data || []).map(item => item.equipment_id));
      setWishlist(wishedIds);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  const toggleWishlist = async (equipmentId: string) => {
    if (!user?.id) return;

    try {
      if (wishlist.has(equipmentId)) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('equipment_id', equipmentId);

        const newWishlist = new Set(wishlist);
        newWishlist.delete(equipmentId);
        setWishlist(newWishlist);
      } else {
        await supabase
          .from('wishlist')
          .insert({
            user_id: user.id,
            equipment_id: equipmentId,
          });

        const newWishlist = new Set(wishlist);
        newWishlist.add(equipmentId);
        setWishlist(newWishlist);
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err);
      showError('Failed to update wishlist');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 dark:bg-green-900/20';
    if (score >= 60) return 'bg-blue-50 dark:bg-blue-900/20';
    if (score >= 40) return 'bg-yellow-50 dark:bg-yellow-900/20';
    return 'bg-gray-50 dark:bg-gray-900/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Smart Recommendations</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Discover equipment tailored to your rental history and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('personalized')}
          className={`pb-4 px-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'personalized'
              ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          For You
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`pb-4 px-2 font-medium transition flex items-center gap-2 ${
            activeTab === 'trending'
              ? 'border-b-2 border-teal-500 text-teal-600 dark:text-teal-400'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Zap className="w-4 h-4" />
          Trending
        </button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition"
          >
            {/* Image */}
            {rec.imageUrl && (
              <div className="h-48 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <img
                  src={rec.imageUrl}
                  alt={rec.equipmentName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{rec.equipmentName}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{rec.category}</p>
                </div>
                <button
                  onClick={() => toggleWishlist(rec.equipmentId)}
                  className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                  title={wishlist.has(rec.equipmentId) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart
                    className={`w-5 h-5 transition ${
                      wishlist.has(rec.equipmentId)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-400 dark:text-gray-600'
                    }`}
                  />
                </button>
              </div>

              {/* Reason */}
              <div className="text-sm text-teal-600 dark:text-teal-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {rec.reason}
              </div>

              {/* Score */}
              <div className={`p-3 rounded-lg ${getScoreBg(rec.relevanceScore)}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Match Score</span>
                  <span className={`text-lg font-bold ${getScoreColor(rec.relevanceScore)}`}>
                    {rec.relevanceScore}%
                  </span>
                </div>
                <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      rec.relevanceScore >= 80
                        ? 'bg-green-500'
                        : rec.relevanceScore >= 60
                        ? 'bg-blue-500'
                        : rec.relevanceScore >= 40
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${rec.relevanceScore}%` }}
                  />
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">Daily Rate</span>
                <span className="font-semibold text-teal-600 dark:text-teal-400">
                  ${rec.basePrice}/day
                </span>
              </div>

              {/* CTA */}
              <button className="w-full mt-3 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition font-medium flex items-center justify-center gap-2">
                <Package className="w-4 h-4" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No recommendations available at this time
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">How recommendations work</p>
            <ul className="space-y-1 text-xs">
              <li>✓ Your recommendations improve as you rent more equipment</li>
              <li>✓ We analyze your favorite categories and price preferences</li>
              <li>✓ Match score shows how well each item fits your profile</li>
              <li>✓ Trending section shows what's popular with all users</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
