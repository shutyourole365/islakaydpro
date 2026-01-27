/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, prefer-const */
import { useState, useEffect } from 'react';
import {
  Award,
  Star,
  Gift,
  Zap,
  Crown,
  Lock,
  CheckCircle2,
  TrendingUp,
  Flame,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface LoyaltyProgramProps {
  userId: string;
  onClose?: () => void;
}

interface UserRewards {
  points: number;
  level: number;
  levelName: string;
  nextLevel: string;
  pointsToNextLevel: number;
  totalEarned: number;
  currentStreak: number;
  longestStreak: number;
  badges: Badge[];
  availableRewards: Reward[];
  history: PointsHistory[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'free_rental' | 'upgrade' | 'exclusive';
  value: string;
  expiresIn?: number; // days
}

interface PointsHistory {
  id: string;
  action: string;
  points: number;
  date: Date;
}

export default function LoyaltyProgram({ userId, onClose: _onClose }: LoyaltyProgramProps) {
  // onClose reserved for modal close functionality
  const [rewards, setRewards] = useState<UserRewards | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'badges' | 'history'>('overview');
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<string | null>(null);

  useEffect(() => {
    loadRewards();
  }, [userId]);

  const loadRewards = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockRewards: UserRewards = {
      points: 2450,
      level: 3,
      levelName: 'Gold',
      nextLevel: 'Platinum',
      pointsToNextLevel: 550,
      totalEarned: 4200,
      currentStreak: 5,
      longestStreak: 12,
      badges: [
        { id: '1', name: 'First Rental', description: 'Complete your first rental', icon: '🎉', earnedAt: new Date('2025-12-01'), rarity: 'common' },
        { id: '2', name: 'Verified Pro', description: 'Get verified as a renter', icon: '✅', earnedAt: new Date('2025-12-05'), rarity: 'common' },
        { id: '3', name: '5-Star Reviewer', description: 'Leave 10 reviews with 5 stars', icon: '⭐', earnedAt: new Date('2025-12-15'), rarity: 'rare' },
        { id: '4', name: 'Eco Warrior', description: 'Save 100kg CO2 through rentals', icon: '🌱', earnedAt: new Date('2026-01-10'), rarity: 'rare' },
        { id: '5', name: 'Speed Demon', description: 'Book 5 times in one week', icon: '⚡', earnedAt: new Date('2026-01-20'), rarity: 'epic' },
        { id: '6', name: 'Community Champion', description: 'Refer 10 friends', icon: '🏆', rarity: 'legendary' },
        { id: '7', name: 'Night Owl', description: 'Book equipment after midnight', icon: '🦉', rarity: 'rare' },
        { id: '8', name: 'Big Spender', description: 'Spend $5000 on rentals', icon: '💎', rarity: 'legendary' },
      ],
      availableRewards: [
        { id: 'r1', name: '10% Off Next Rental', description: 'Get 10% off your next equipment rental', pointsCost: 500, type: 'discount', value: '10%', expiresIn: 30 },
        { id: 'r2', name: 'Free Delivery', description: 'Free delivery on your next order', pointsCost: 750, type: 'upgrade', value: 'Free shipping' },
        { id: 'r3', name: '25% Off Any Rental', description: 'Big discount on any equipment', pointsCost: 1500, type: 'discount', value: '25%', expiresIn: 60 },
        { id: 'r4', name: 'Free Day Rental', description: 'Rent any equipment free for 1 day', pointsCost: 2000, type: 'free_rental', value: '1 day free' },
        { id: 'r5', name: 'VIP Early Access', description: 'Get early access to new listings', pointsCost: 3000, type: 'exclusive', value: '30 days early access' },
        { id: 'r6', name: 'Premium Insurance', description: 'Free premium insurance on next rental', pointsCost: 1000, type: 'upgrade', value: 'Premium coverage' },
      ],
      history: [
        { id: 'h1', action: 'Completed rental', points: 150, date: new Date('2026-01-25') },
        { id: 'h2', action: 'Left a review', points: 50, date: new Date('2026-01-24') },
        { id: 'h3', action: 'Daily login bonus', points: 10, date: new Date('2026-01-24') },
        { id: 'h4', action: 'Referred a friend', points: 500, date: new Date('2026-01-20') },
        { id: 'h5', action: 'Completed rental', points: 200, date: new Date('2026-01-18') },
        { id: 'h6', action: 'Profile completed', points: 100, date: new Date('2026-01-15') },
        { id: 'h7', action: 'First booking bonus', points: 250, date: new Date('2026-01-10') },
      ],
    };

    setRewards(mockRewards);
    setLoading(false);
  };

  const handleRedeem = async (rewardId: string) => {
    setRedeemingId(rewardId);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const reward = rewards?.availableRewards.find(r => r.id === rewardId);
    if (reward && rewards) {
      setRewards({
        ...rewards,
        points: rewards.points - reward.pointsCost,
      });
      alert(`🎉 Congratulations! You've redeemed: ${reward.name}`);
    }
    setRedeemingId(null);
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'from-gray-400 to-gray-500';
      case 2: return 'from-amber-600 to-amber-700';
      case 3: return 'from-yellow-400 to-amber-500';
      case 4: return 'from-gray-300 to-gray-400';
      case 5: return 'from-violet-500 to-purple-600';
      default: return 'from-teal-500 to-emerald-500';
    }
  };

  const getRarityColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'rare': return 'bg-blue-50 border-blue-300 text-blue-700';
      case 'epic': return 'bg-purple-50 border-purple-300 text-purple-700';
      case 'legendary': return 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-400 text-amber-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading your rewards...</p>
      </div>
    );
  }

  if (!rewards) return null;

  const levelProgress = ((3000 - rewards.pointsToNextLevel) / 3000) * 100;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${getLevelColor(rewards.level)} text-white`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{rewards.levelName} Member</h2>
              <p className="text-white/80">Level {rewards.level} • {rewards.pointsToNextLevel} pts to {rewards.nextLevel}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{rewards.points.toLocaleString()}</div>
            <div className="text-sm text-white/80">Available Points</div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${levelProgress}%` }}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Flame className="w-6 h-6 mx-auto mb-1" />
            <div className="text-xl font-bold">{rewards.currentStreak}</div>
            <div className="text-xs text-white/70">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <Award className="w-6 h-6 mx-auto mb-1" />
            <div className="text-xl font-bold">{rewards.badges.filter(b => b.earnedAt).length}</div>
            <div className="text-xs text-white/70">Badges Earned</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1" />
            <div className="text-xl font-bold">{rewards.totalEarned.toLocaleString()}</div>
            <div className="text-xs text-white/70">Total Earned</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['overview', 'rewards', 'badges', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-amber-600 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-h-[400px] overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Daily Bonus */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Daily Login Bonus</p>
                    <p className="text-sm text-gray-600">Log in tomorrow for +15 pts!</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-amber-600">+10</span>
                  <span className="text-amber-600 text-sm"> pts</span>
                </div>
              </div>
            </div>

            {/* Ways to Earn */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Ways to Earn Points</h3>
              <div className="space-y-2">
                {[
                  { action: 'Complete a rental', points: 100, icon: '📦' },
                  { action: 'Leave a review', points: 50, icon: '⭐' },
                  { action: 'Refer a friend', points: 500, icon: '👥' },
                  { action: 'List equipment', points: 200, icon: '🏷️' },
                  { action: 'Daily login', points: 10, icon: '📅' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-gray-700">{item.action}</span>
                    </div>
                    <span className="font-semibold text-amber-600">+{item.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tier Benefits */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Your {rewards.levelName} Benefits</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { benefit: '10% rental discount', icon: <DollarSign className="w-4 h-4" /> },
                  { benefit: 'Priority support', icon: <Zap className="w-4 h-4" /> },
                  { benefit: 'Early access', icon: <Star className="w-4 h-4" /> },
                  { benefit: 'Free insurance upgrade', icon: <Gift className="w-4 h-4" /> },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-amber-700 text-sm">
                    {item.icon}
                    {item.benefit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="grid gap-4">
            {rewards.availableRewards.map((reward) => {
              const canAfford = rewards.points >= reward.pointsCost;
              return (
                <div
                  key={reward.id}
                  className={`p-4 rounded-xl border-2 ${
                    canAfford ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{reward.name}</h4>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          reward.type === 'discount' ? 'bg-green-100 text-green-700' :
                          reward.type === 'free_rental' ? 'bg-purple-100 text-purple-700' :
                          reward.type === 'upgrade' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {reward.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
                      {reward.expiresIn && (
                        <p className="text-xs text-gray-500 mt-1">Valid for {reward.expiresIn} days after redemption</p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-bold text-amber-600">{reward.pointsCost.toLocaleString()} pts</div>
                      <button
                        onClick={() => handleRedeem(reward.id)}
                        disabled={!canAfford || redeemingId === reward.id}
                        className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          canAfford
                            ? 'bg-amber-500 text-white hover:bg-amber-600'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {redeemingId === reward.id ? 'Redeeming...' : canAfford ? 'Redeem' : 'Not enough points'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {rewards.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border-2 text-center ${getRarityColor(badge.rarity)} ${
                  !badge.earnedAt && 'opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h4 className="font-semibold text-sm">{badge.name}</h4>
                <p className="text-xs mt-1 opacity-75">{badge.description}</p>
                {badge.earnedAt ? (
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-green-600">
                    <CheckCircle2 className="w-3 h-3" />
                    Earned
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
                    <Lock className="w-3 h-3" />
                    Locked
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {rewards.history.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.date.toLocaleDateString()}</p>
                </div>
                <span className={`font-semibold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.points > 0 ? '+' : ''}{item.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
