import { useState, useEffect } from 'react';
import {
  Crown,
  Star,
  Gift,
  Zap,
  Trophy,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock,
  Percent,
  Truck,
  Shield,
  Headphones,
  Award,
  Target,
} from 'lucide-react';

interface LoyaltyProgramProps {
  userId: string;
  onClose?: () => void;
}

interface LoyaltyTier {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: string[];
  multiplier: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: 'discount' | 'perk' | 'exclusive';
  icon: React.ReactNode;
  available: boolean;
  expiresIn?: string;
}

interface PointsActivity {
  id: string;
  type: 'earned' | 'redeemed' | 'bonus' | 'expired';
  points: number;
  description: string;
  date: string;
}

export default function LoyaltyProgram(_props: LoyaltyProgramProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rewards' | 'history' | 'challenges'>('overview');
  const [isAnimating, setIsAnimating] = useState(false);

  // Mock user loyalty data (in production, fetch from database)
  const [loyaltyData] = useState({
    currentPoints: 4750,
    lifetimePoints: 12500,
    currentTier: 'gold',
    pointsToNextTier: 250,
    nextTierName: 'Platinum',
    streakDays: 15,
    completedChallenges: 8,
  });

  const tiers: LoyaltyTier[] = [
    {
      id: 'bronze',
      name: 'Bronze',
      icon: <Star className="w-6 h-6" />,
      color: 'text-amber-600',
      bgGradient: 'from-amber-400 to-amber-600',
      minPoints: 0,
      maxPoints: 999,
      benefits: ['5% points back on rentals', 'Birthday bonus', 'Email deals'],
      multiplier: 1,
    },
    {
      id: 'silver',
      name: 'Silver',
      icon: <Award className="w-6 h-6" />,
      color: 'text-gray-500',
      bgGradient: 'from-gray-300 to-gray-500',
      minPoints: 1000,
      maxPoints: 4999,
      benefits: ['10% points back', 'Priority support', 'Early access', 'Free cancellation'],
      multiplier: 1.5,
    },
    {
      id: 'gold',
      name: 'Gold',
      icon: <Crown className="w-6 h-6" />,
      color: 'text-yellow-500',
      bgGradient: 'from-yellow-400 to-amber-500',
      minPoints: 5000,
      maxPoints: 14999,
      benefits: ['15% points back', 'Free delivery', 'VIP support', 'Exclusive deals', 'Extended protection'],
      multiplier: 2,
    },
    {
      id: 'platinum',
      name: 'Platinum',
      icon: <Trophy className="w-6 h-6" />,
      color: 'text-purple-500',
      bgGradient: 'from-purple-400 to-indigo-600',
      minPoints: 15000,
      maxPoints: null,
      benefits: ['20% points back', 'Free premium insurance', 'Concierge service', 'Partner perks', 'Elite access'],
      multiplier: 3,
    },
  ];

  const rewards: Reward[] = [
    {
      id: '1',
      name: '$25 Rental Credit',
      description: 'Apply to any equipment rental',
      pointsCost: 2500,
      category: 'discount',
      icon: <Percent className="w-5 h-5" />,
      available: true,
    },
    {
      id: '2',
      name: 'Free Delivery',
      description: 'Free delivery on your next rental',
      pointsCost: 1500,
      category: 'perk',
      icon: <Truck className="w-5 h-5" />,
      available: true,
    },
    {
      id: '3',
      name: 'Premium Insurance',
      description: '1 week of premium protection',
      pointsCost: 3000,
      category: 'perk',
      icon: <Shield className="w-5 h-5" />,
      available: true,
    },
    {
      id: '4',
      name: 'VIP Support Pass',
      description: '24/7 priority support for 30 days',
      pointsCost: 2000,
      category: 'exclusive',
      icon: <Headphones className="w-5 h-5" />,
      available: true,
    },
    {
      id: '5',
      name: '$100 Rental Credit',
      description: 'Big savings on large equipment',
      pointsCost: 8000,
      category: 'discount',
      icon: <Gift className="w-5 h-5" />,
      available: loyaltyData.currentPoints >= 8000,
    },
  ];

  const activities: PointsActivity[] = [
    { id: '1', type: 'earned', points: 450, description: 'Completed rental - Excavator', date: '2 hours ago' },
    { id: '2', type: 'bonus', points: 200, description: '5-day streak bonus', date: 'Yesterday' },
    { id: '3', type: 'earned', points: 125, description: 'Left a review', date: '2 days ago' },
    { id: '4', type: 'redeemed', points: -1500, description: 'Redeemed free delivery', date: '3 days ago' },
    { id: '5', type: 'earned', points: 300, description: 'Referral bonus - John D.', date: '1 week ago' },
  ];

  const challenges = [
    { id: '1', name: 'First Rental', description: 'Complete your first rental', points: 500, completed: true, progress: 100 },
    { id: '2', name: 'Review Master', description: 'Leave 5 reviews', points: 250, completed: false, progress: 60 },
    { id: '3', name: '7-Day Streak', description: 'Log in for 7 consecutive days', points: 300, completed: true, progress: 100 },
    { id: '4', name: 'Social Butterfly', description: 'Refer 3 friends', points: 1000, completed: false, progress: 33 },
    { id: '5', name: 'Big Spender', description: 'Spend $1,000 in rentals', points: 1500, completed: false, progress: 75 },
  ];

  const currentTier = tiers.find(t => t.id === loyaltyData.currentTier)!;
  const nextTier = tiers.find(t => t.minPoints > currentTier.minPoints);
  const progressToNextTier = nextTier 
    ? ((loyaltyData.currentPoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRedeem = (reward: Reward) => {
    if (loyaltyData.currentPoints >= reward.pointsCost) {
      alert(`🎉 Successfully redeemed: ${reward.name}! Check your email for details.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Card */}
        <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${currentTier.bgGradient} p-8 text-white mb-8`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {currentTier.icon}
                  <span className="text-white/80 font-medium">{currentTier.name} Member</span>
                </div>
                <h1 className="text-4xl font-bold mb-1">
                  {loyaltyData.currentPoints.toLocaleString()}
                </h1>
                <p className="text-white/80">Available Points</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-white/80 mb-1">
                  <Zap className="w-4 h-4" />
                  <span>{currentTier.multiplier}x Multiplier</span>
                </div>
                <div className="flex items-center gap-1 text-white/80">
                  <TrendingUp className="w-4 h-4" />
                  <span>{loyaltyData.lifetimePoints.toLocaleString()} lifetime</span>
                </div>
              </div>
            </div>

            {nextTier && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress to {nextTier.name}</span>
                  <span className="text-sm">{loyaltyData.pointsToNextTier} points to go</span>
                </div>
                <div className="h-3 bg-white/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full transition-all duration-1000"
                    style={{ width: isAnimating ? '0%' : `${progressToNextTier}%` }}
                  />
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Clock className="w-5 h-5" />
                  {loyaltyData.streakDays}
                </div>
                <p className="text-sm text-white/80">Day Streak</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Target className="w-5 h-5" />
                  {loyaltyData.completedChallenges}
                </div>
                <p className="text-sm text-white/80">Challenges</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold">
                  <Sparkles className="w-5 h-5" />
                  {currentTier.multiplier}x
                </div>
                <p className="text-sm text-white/80">Earn Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['overview', 'rewards', 'history', 'challenges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tier Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Tier Journey</h2>
              <div className="space-y-4">
                {tiers.map((tier, index) => {
                  const isCurrentTier = tier.id === loyaltyData.currentTier;
                  const isAchieved = loyaltyData.currentPoints >= tier.minPoints;
                  const isPast = tiers.findIndex(t => t.id === loyaltyData.currentTier) > index;

                  return (
                    <div key={tier.id} className={`flex items-center gap-4 p-4 rounded-xl ${
                      isCurrentTier ? `bg-gradient-to-r ${tier.bgGradient} text-white` : 'bg-gray-50'
                    }`}>
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCurrentTier ? 'bg-white/20' : isAchieved || isPast ? 'bg-teal-100' : 'bg-gray-200'
                      }`}>
                        {isAchieved || isPast ? (
                          <CheckCircle2 className={`w-6 h-6 ${isCurrentTier ? 'text-white' : 'text-teal-600'}`} />
                        ) : (
                          <Lock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isCurrentTier ? '' : tier.color}`}>{tier.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isCurrentTier ? 'bg-white/20' : 'bg-gray-200'
                          }`}>
                            {tier.multiplier}x
                          </span>
                        </div>
                        <p className={`text-sm ${isCurrentTier ? 'text-white/80' : 'text-gray-500'}`}>
                          {tier.minPoints.toLocaleString()}+ points
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Benefits */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Benefits</h2>
              <div className="space-y-3">
                {currentTier.benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <div 
                key={reward.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border-2 transition-all ${
                  reward.available && loyaltyData.currentPoints >= reward.pointsCost
                    ? 'border-transparent hover:border-teal-500 hover:shadow-lg cursor-pointer'
                    : 'border-transparent opacity-60'
                }`}
                onClick={() => reward.available && handleRedeem(reward)}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  reward.category === 'discount' ? 'bg-green-100 text-green-600' :
                  reward.category === 'perk' ? 'bg-blue-100 text-blue-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {reward.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{reward.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-600">{reward.pointsCost.toLocaleString()} pts</span>
                  {loyaltyData.currentPoints >= reward.pointsCost ? (
                    <span className="text-sm text-teal-600 font-medium flex items-center gap-1">
                      Redeem <ChevronRight className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400">
                      Need {(reward.pointsCost - loyaltyData.currentPoints).toLocaleString()} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'earned' ? 'bg-green-100 text-green-600' :
                    activity.type === 'bonus' ? 'bg-purple-100 text-purple-600' :
                    activity.type === 'redeemed' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'earned' ? <TrendingUp className="w-5 h-5" /> :
                     activity.type === 'bonus' ? <Sparkles className="w-5 h-5" /> :
                     activity.type === 'redeemed' ? <Gift className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.date}</p>
                  </div>
                  <span className={`font-bold ${activity.points > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {activity.points > 0 ? '+' : ''}{activity.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className={`bg-white rounded-2xl p-6 shadow-sm ${
                challenge.completed ? 'border-2 border-green-200' : ''
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{challenge.name}</h3>
                      {challenge.completed && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{challenge.description}</p>
                  </div>
                  <span className="font-bold text-teal-600">+{challenge.points} pts</span>
                </div>
                <div className="relative">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        challenge.completed ? 'bg-green-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${challenge.progress}%` }}
                    />
                  </div>
                  <span className="absolute right-0 -top-6 text-sm text-gray-500">{challenge.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
