import { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Star,
  Award,
  Medal,
  Crown,
  Zap,
  Heart,
  Users,
  Calendar,
  TrendingUp,
  Gift,
  Lock,
  CheckCircle,
} from 'lucide-react';
// No additional types needed
import { getBookings } from '../../services/database';
import { useAuth } from '../../contexts/AuthContext';

interface GamificationHubProps {
  className?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Trophy;
  color: string;
  bgColor: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  reward: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserStats {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  streakDays: number;
  referralCount: number;
  badgesEarned: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

export default function GamificationHub({ className = '' }: GamificationHubProps) {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'achievements' | 'leaderboard' | 'rewards'>('achievements');

  useEffect(() => {
    const loadGamificationData = async () => {
      if (!user) return;

      try {
        const bookings = await getBookings({ renterId: user.id });

        // Calculate user stats
        const totalBookings = bookings.length;
        const totalRevenue = bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.total_amount, 0);

        const averageRating = bookings.length > 0
          ? bookings.reduce((sum, b) => sum + (b.equipment?.rating || 0), 0) / bookings.length
          : 0;

        // Calculate experience and level
        const experience = totalBookings * 10 + Math.floor(totalRevenue / 10) + Math.floor(averageRating * 20);
        const level = Math.floor(experience / 100) + 1;
        const nextLevelExp = level * 100;

        setUserStats({
          totalBookings,
          totalRevenue,
          averageRating,
          streakDays: 7, // Mock data
          referralCount: 3, // Mock data
          badgesEarned: 0,
          level,
          experience,
          nextLevelExp,
        });

        // Define achievements
        const achievementList: Achievement[] = [
          {
            id: 'first-booking',
            title: 'First Steps',
            description: 'Complete your first equipment booking',
            icon: Star,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
            unlocked: totalBookings >= 1,
            progress: Math.min(totalBookings, 1),
            maxProgress: 1,
            reward: '10% off next booking',
            rarity: 'common',
          },
          {
            id: 'booking-streak',
            title: 'Consistent Renter',
            description: 'Book equipment for 7 consecutive days',
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            unlocked: false, // Mock logic
            progress: 5,
            maxProgress: 7,
            reward: 'Free delivery',
            rarity: 'rare',
          },
          {
            id: 'high-ratings',
            title: 'Five-Star Customer',
            description: 'Maintain a 4.8+ average rating',
            icon: Award,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            unlocked: averageRating >= 4.8,
            progress: Math.floor(averageRating * 10),
            maxProgress: 48,
            reward: 'Priority support',
            rarity: 'epic',
          },
          {
            id: 'revenue-milestone',
            title: 'Revenue Champion',
            description: 'Generate $10,000+ in total bookings',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            unlocked: totalRevenue >= 10000,
            progress: Math.min(Math.floor(totalRevenue), 10000),
            maxProgress: 10000,
            reward: 'Exclusive equipment access',
            rarity: 'legendary',
          },
          {
            id: 'referral-master',
            title: 'Referral Guru',
            description: 'Refer 10 friends who make bookings',
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-100',
            unlocked: false, // Mock
            progress: 3,
            maxProgress: 10,
            reward: '$50 bonus credit',
            rarity: 'epic',
          },
          {
            id: 'loyal-customer',
            title: 'Loyal Customer',
            description: 'Complete 50+ bookings',
            icon: Heart,
            color: 'text-red-600',
            bgColor: 'bg-red-100',
            unlocked: totalBookings >= 50,
            progress: Math.min(totalBookings, 50),
            maxProgress: 50,
            reward: 'VIP membership',
            rarity: 'legendary',
          },
        ];

        setAchievements(achievementList);

      } catch (error) {
        console.error('Failed to load gamification data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGamificationData();
  }, [user]);

  const unlockedAchievements = useMemo(() =>
    achievements.filter(a => a.unlocked),
    [achievements]
  );

  const lockedAchievements = useMemo(() =>
    achievements.filter(a => !a.unlocked),
    [achievements]
  );

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className={`bg-white rounded-xl p-6 border border-gray-100 ${className}`}>
        <div className="text-center text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Unable to load gamification data at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with Level */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Gamification Hub</h2>
            <p className="text-purple-100">Earn badges, unlock rewards, and level up!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">Level {userStats.level}</div>
            <div className="text-sm text-purple-100">
              {userStats.experience} / {userStats.nextLevelExp} XP
            </div>
          </div>
        </div>
        <div className="w-full bg-purple-700 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${(userStats.experience / userStats.nextLevelExp) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{userStats.totalBookings}</div>
          <div className="text-sm text-gray-600">Total Bookings</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-green-600">${userStats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Total Spent</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-yellow-600">{userStats.averageRating.toFixed(1)}</div>
          <div className="text-sm text-gray-600">Avg Rating</div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-100 text-center">
          <div className="text-2xl font-bold text-purple-600">{unlockedAchievements.length}</div>
          <div className="text-sm text-gray-600">Badges Earned</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'achievements', label: 'Achievements', icon: Trophy },
          { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
          { id: 'rewards', label: 'Rewards', icon: Gift },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === tab.id
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Achievements Tab */}
      {selectedTab === 'achievements' && (
        <div className="space-y-6">
          {/* Unlocked Achievements */}
          {unlockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Unlocked Achievements ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unlockedAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${achievement.bgColor}`}>
                          <Icon className={`w-6 h-6 ${achievement.color}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <div className="text-xs text-green-600 font-medium">{achievement.reward}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {lockedAchievements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-400" />
                Locked Achievements ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => {
                  const Icon = achievement.icon;
                  const progressPercent = (achievement.progress / achievement.maxProgress) * 100;
                  return (
                    <div
                      key={achievement.id}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4 opacity-75"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-gray-200">
                          <Icon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-700">{achievement.title}</h4>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                          <div className="text-xs text-gray-500 font-medium mb-2">{achievement.reward}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {achievement.progress} / {achievement.maxProgress}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {selectedTab === 'leaderboard' && (
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Crown className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Top Renters</h3>
          </div>
          <div className="space-y-4">
            {[
              { rank: 1, name: 'You', points: userStats.experience, avatar: '👤' },
              { rank: 2, name: 'Sarah M.', points: 2450, avatar: '👩' },
              { rank: 3, name: 'Mike R.', points: 2230, avatar: '👨' },
              { rank: 4, name: 'Emma L.', points: 2100, avatar: '👩' },
              { rank: 5, name: 'David K.', points: 1980, avatar: '👨' },
            ].map((user) => (
              <div
                key={user.rank}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  user.rank === 1 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  user.rank === 1 ? 'bg-yellow-500 text-white' :
                  user.rank === 2 ? 'bg-gray-400 text-white' :
                  user.rank === 3 ? 'bg-amber-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {user.rank}
                </div>
                <div className="text-2xl">{user.avatar}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.points} XP</div>
                </div>
                {user.rank <= 3 && (
                  <Medal className={`w-5 h-5 ${
                    user.rank === 1 ? 'text-yellow-500' :
                    user.rank === 2 ? 'text-gray-400' :
                    'text-amber-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rewards Tab */}
      {selectedTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Available Rewards</h3>
            </div>
            <div className="space-y-3">
              {[
                { title: '10% Off Next Booking', cost: 500, available: userStats.experience >= 500 },
                { title: 'Free Delivery', cost: 750, available: userStats.experience >= 750 },
                { title: 'Priority Support', cost: 1000, available: userStats.experience >= 1000 },
                { title: '$25 Credit', cost: 1200, available: userStats.experience >= 1200 },
              ].map((reward, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    reward.available
                      ? 'border-purple-200 bg-purple-50'
                      : 'border-gray-200 bg-gray-50 opacity-50'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900">{reward.title}</div>
                    <div className="text-sm text-gray-600">{reward.cost} XP</div>
                  </div>
                  <button
                    disabled={!reward.available}
                    className={`px-3 py-1 text-sm rounded font-medium ${
                      reward.available
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {reward.available ? 'Redeem' : 'Locked'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">How to Earn XP</h3>
            </div>
            <div className="space-y-3">
              {[
                { action: 'Complete a booking', xp: '+10 XP' },
                { action: 'Leave a review', xp: '+5 XP' },
                { action: 'Refer a friend', xp: '+25 XP' },
                { action: 'Maintain 5-star rating', xp: '+20 XP/month' },
                { action: 'Book during off-peak', xp: '+15 XP' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">{item.action}</span>
                  <span className="text-sm font-medium text-blue-600">{item.xp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}