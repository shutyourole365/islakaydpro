import { useState } from 'react';
import {
  Trophy,
  Star,
  Gift,
  Crown,
  TrendingUp,
  Calendar,
  Clock,
  ChevronRight,
  Lock,
  Check,
  Sparkles,
  Percent,
  Truck,
  Shield,
  Headphones,
  Target,
  Flame,
} from 'lucide-react';

type TierLevel = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'free_rental' | 'upgrade' | 'service' | 'exclusive';
  icon: typeof Gift;
  available: boolean;
  expiresAt?: Date;
  limitedQuantity?: number;
}

interface Activity {
  id: string;
  type: 'earn' | 'redeem';
  description: string;
  points: number;
  date: Date;
  bookingId?: string;
}

interface UserLoyalty {
  userId: string;
  tier: TierLevel;
  points: number;
  lifetimePoints: number;
  tierProgress: number;
  nextTierPoints: number;
  streak: number;
  memberSince: Date;
  recentActivity: Activity[];
  redeemedRewards: string[];
}

interface LoyaltyRewardsTrackerProps {
  userId?: string;
  onRedeemReward?: (rewardId: string) => void;
  onViewHistory?: () => void;
  className?: string;
}

const tierConfig: Record<TierLevel, {
  name: string;
  color: string;
  bgColor: string;
  icon: typeof Crown;
  minPoints: number;
  benefits: string[];
  multiplier: number;
}> = {
  bronze: {
    name: 'Bronze',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Star,
    minPoints: 0,
    benefits: ['Earn 1 point per $1 spent', 'Birthday bonus points', 'Member-only deals'],
    multiplier: 1,
  },
  silver: {
    name: 'Silver',
    color: 'text-gray-500',
    bgColor: 'bg-gray-200 dark:bg-gray-700',
    icon: Star,
    minPoints: 1000,
    benefits: ['Earn 1.25x points', 'Free equipment delivery', 'Priority support'],
    multiplier: 1.25,
  },
  gold: {
    name: 'Gold',
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: Trophy,
    minPoints: 5000,
    benefits: ['Earn 1.5x points', 'Free upgrades (subject to availability)', '24/7 support'],
    multiplier: 1.5,
  },
  platinum: {
    name: 'Platinum',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    icon: Crown,
    minPoints: 15000,
    benefits: ['Earn 2x points', 'Free premium insurance', 'Dedicated account manager'],
    multiplier: 2,
  },
  diamond: {
    name: 'Diamond',
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
    icon: Sparkles,
    minPoints: 50000,
    benefits: ['Earn 3x points', 'Exclusive equipment access', 'VIP concierge service'],
    multiplier: 3,
  },
};

const availableRewards: Reward[] = [
  {
    id: 'R1',
    name: '10% Off Next Rental',
    description: 'Save 10% on your next equipment rental',
    pointsCost: 500,
    category: 'discount',
    icon: Percent,
    available: true,
  },
  {
    id: 'R2',
    name: 'Free Delivery',
    description: 'Free delivery and pickup on any rental',
    pointsCost: 750,
    category: 'service',
    icon: Truck,
    available: true,
  },
  {
    id: 'R3',
    name: '25% Off Weekend Rental',
    description: 'Get 25% off any weekend rental',
    pointsCost: 1000,
    category: 'discount',
    icon: Percent,
    available: true,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'R4',
    name: 'Free Day Extension',
    description: 'Extend any rental by one day free',
    pointsCost: 1500,
    category: 'free_rental',
    icon: Calendar,
    available: true,
  },
  {
    id: 'R5',
    name: 'Equipment Upgrade',
    description: 'Upgrade to the next tier equipment free',
    pointsCost: 2000,
    category: 'upgrade',
    icon: TrendingUp,
    available: true,
    limitedQuantity: 5,
  },
  {
    id: 'R6',
    name: 'Premium Insurance',
    description: 'Free premium insurance for one rental',
    pointsCost: 2500,
    category: 'service',
    icon: Shield,
    available: true,
  },
  {
    id: 'R7',
    name: 'VIP Support',
    description: '30 days of priority VIP support',
    pointsCost: 3000,
    category: 'service',
    icon: Headphones,
    available: true,
  },
  {
    id: 'R8',
    name: 'Free Weekend Rental',
    description: 'One free weekend rental (up to $500 value)',
    pointsCost: 5000,
    category: 'free_rental',
    icon: Gift,
    available: true,
    limitedQuantity: 2,
  },
];

// Demo user data
const demoUser: UserLoyalty = {
  userId: 'user-1',
  tier: 'gold',
  points: 3250,
  lifetimePoints: 8500,
  tierProgress: 65,
  nextTierPoints: 15000,
  streak: 12,
  memberSince: new Date('2024-01-15'),
  recentActivity: [
    { id: 'A1', type: 'earn', description: 'Excavator rental - 5 days', points: 450, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), bookingId: 'BK-001' },
    { id: 'A2', type: 'earn', description: 'Streak bonus (12 weeks)', points: 120, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { id: 'A3', type: 'redeem', description: '10% Off Next Rental', points: -500, date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    { id: 'A4', type: 'earn', description: 'Bulldozer rental - 3 days', points: 275, date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), bookingId: 'BK-002' },
    { id: 'A5', type: 'earn', description: 'Referral bonus', points: 500, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
  ],
  redeemedRewards: ['R1'],
};

export default function LoyaltyRewardsTracker({
  userId: _userId,
  onRedeemReward,
  onViewHistory,
  className = '',
}: LoyaltyRewardsTrackerProps) {
  void _userId;
  const [user] = useState<UserLoyalty>(demoUser);
  const [activeTab, setActiveTab] = useState<'rewards' | 'activity' | 'benefits'>('rewards');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const currentTier = tierConfig[user.tier];
  const nextTier = Object.entries(tierConfig).find(
    ([, config]) => config.minPoints > tierConfig[user.tier].minPoints
  );

  const pointsToNextTier = nextTier
    ? nextTier[1].minPoints - user.lifetimePoints
    : 0;

  const handleRedeem = (reward: Reward) => {
    if (user.points >= reward.pointsCost) {
      setSelectedReward(reward);
    }
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      onRedeemReward?.(selectedReward.id);
      setSelectedReward(null);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden ${className}`}>
      {/* Header - Tier Card */}
      <div className={`p-6 ${currentTier.bgColor}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-white/80 dark:bg-gray-800/80`}>
              <currentTier.icon className={`w-7 h-7 ${currentTier.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Tier</p>
              <h2 className={`text-2xl font-bold ${currentTier.color}`}>
                {currentTier.name} Member
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Available Points</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {user.points.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Progress to {nextTier[1].name}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {user.lifetimePoints.toLocaleString()} / {nextTier[1].minPoints.toLocaleString()}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                style={{
                  width: `${(user.lifetimePoints / nextTier[1].minPoints) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Earn {pointsToNextTier.toLocaleString()} more points to unlock {nextTier[1].name}
            </p>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-center gap-1 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="font-bold">{user.streak}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Week Streak</p>
          </div>
          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="font-bold text-gray-900 dark:text-white">
              {currentTier.multiplier}x
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points Multiplier</p>
          </div>
          <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
            <div className="font-bold text-gray-900 dark:text-white">
              {user.lifetimePoints.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Lifetime Points</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        {[
          { id: 'rewards', label: 'Rewards', icon: Gift },
          { id: 'activity', label: 'Activity', icon: Clock },
          { id: 'benefits', label: 'Benefits', icon: Trophy },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 py-4 flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6 max-h-[400px] overflow-y-auto">
        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {availableRewards.map(reward => {
              const canAfford = user.points >= reward.pointsCost;
              const isRedeemed = user.redeemedRewards.includes(reward.id);

              return (
                <div
                  key={reward.id}
                  className={`p-4 border dark:border-gray-700 rounded-xl ${
                    !canAfford || isRedeemed ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      canAfford && !isRedeemed
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                    }`}>
                      <reward.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {reward.name}
                        </h4>
                        {reward.limitedQuantity && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full">
                            Only {reward.limitedQuantity} left
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {reward.description}
                      </p>
                      {reward.expiresAt && (
                        <p className="text-xs text-amber-600 mt-1">
                          Expires {reward.expiresAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {reward.pointsCost.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
                    </div>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford || isRedeemed}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isRedeemed
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 cursor-default'
                          : canAfford
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isRedeemed ? (
                        <Check className="w-5 h-5" />
                      ) : canAfford ? (
                        'Redeem'
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            {user.recentActivity.map(activity => (
              <div
                key={activity.id}
                className="flex items-center gap-4 p-3 border dark:border-gray-700 rounded-xl"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'earn'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                }`}>
                  {activity.type === 'earn' ? (
                    <TrendingUp className="w-5 h-5" />
                  ) : (
                    <Gift className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.date.toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-bold ${
                  activity.type === 'earn'
                    ? 'text-green-600'
                    : 'text-blue-600'
                }`}>
                  {activity.type === 'earn' ? '+' : ''}{activity.points.toLocaleString()}
                </span>
              </div>
            ))}
            <button
              onClick={onViewHistory}
              className="w-full py-3 text-blue-600 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              View Full History
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Benefits Tab */}
        {activeTab === 'benefits' && (
          <div className="space-y-6">
            {/* Current Tier Benefits */}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                Your {currentTier.name} Benefits
              </h3>
              <div className="space-y-2">
                {currentTier.benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                  >
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Tier Preview */}
            {nextTier && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Unlock with {nextTier[1].name}
                </h3>
                <div className="space-y-2">
                  {nextTier[1].benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg opacity-60"
                    >
                      <Lock className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-500 dark:text-gray-400">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How to Earn Points */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                How to Earn Points
              </h4>
              <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                <li>• Rent equipment: {currentTier.multiplier} point per $1</li>
                <li>• Complete your profile: 100 points</li>
                <li>• Leave reviews: 25 points each</li>
                <li>• Refer friends: 500 points per referral</li>
                <li>• Weekly streak bonus: 10 points × streak weeks</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Redeem Confirmation Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <selectedReward.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Redeem Reward?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {selectedReward.name}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                {selectedReward.pointsCost.toLocaleString()} points will be deducted
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedReward(null)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmRedeem}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
