import { useState } from 'react';
import {
  Trophy,
  Star,
  Zap,
  Shield,
  Target,
  Flame,
  Crown,
  Rocket,
  Heart,
  Gift,
  Calendar,
  Camera,
  Truck,
  Wrench,
  MessageSquare,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  category: 'rental' | 'social' | 'milestone' | 'special';
  progress: number;
  maxProgress: number;
  xpReward: number;
  isUnlocked: boolean;
  unlockedAt?: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Badge {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  isEquipped: boolean;
}

interface AchievementsSystemProps {
  userLevel: number;
  currentXP: number;
  totalXP: number;
  achievements: Achievement[];
  badges: Badge[];
  onBadgeEquip: (badgeId: string) => void;
  className?: string;
}

const defaultAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first rental',
    icon: <Rocket className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    category: 'rental',
    progress: 1,
    maxProgress: 1,
    xpReward: 100,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 7),
    rarity: 'common',
  },
  {
    id: '2',
    title: 'Power Renter',
    description: 'Complete 10 rentals',
    icon: <Zap className="w-6 h-6" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    category: 'rental',
    progress: 7,
    maxProgress: 10,
    xpReward: 500,
    isUnlocked: false,
    rarity: 'rare',
  },
  {
    id: '3',
    title: 'Trusted Member',
    description: 'Get verified on the platform',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    category: 'milestone',
    progress: 1,
    maxProgress: 1,
    xpReward: 250,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 3),
    rarity: 'rare',
  },
  {
    id: '4',
    title: 'Social Butterfly',
    description: 'Send 50 messages',
    icon: <MessageSquare className="w-6 h-6" />,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    category: 'social',
    progress: 32,
    maxProgress: 50,
    xpReward: 300,
    isUnlocked: false,
    rarity: 'common',
  },
  {
    id: '5',
    title: 'Five Star',
    description: 'Receive a 5-star review',
    icon: <Star className="w-6 h-6" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    category: 'social',
    progress: 1,
    maxProgress: 1,
    xpReward: 200,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 2),
    rarity: 'rare',
  },
  {
    id: '6',
    title: 'Equipment Master',
    description: 'List 5 pieces of equipment',
    icon: <Wrench className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    category: 'milestone',
    progress: 2,
    maxProgress: 5,
    xpReward: 400,
    isUnlocked: false,
    rarity: 'rare',
  },
  {
    id: '7',
    title: 'Streak Master',
    description: 'Maintain a 30-day login streak',
    icon: <Flame className="w-6 h-6" />,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    category: 'milestone',
    progress: 12,
    maxProgress: 30,
    xpReward: 1000,
    isUnlocked: false,
    rarity: 'epic',
  },
  {
    id: '8',
    title: 'Legendary Host',
    description: 'Earn $10,000 in rental income',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    category: 'milestone',
    progress: 3500,
    maxProgress: 10000,
    xpReward: 2000,
    isUnlocked: false,
    rarity: 'legendary',
  },
  {
    id: '9',
    title: 'Photo Pro',
    description: 'Rent photography equipment 5 times',
    icon: <Camera className="w-6 h-6" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    category: 'rental',
    progress: 3,
    maxProgress: 5,
    xpReward: 300,
    isUnlocked: false,
    rarity: 'rare',
  },
  {
    id: '10',
    title: 'Heavy Lifter',
    description: 'Rent construction equipment',
    icon: <Truck className="w-6 h-6" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    category: 'rental',
    progress: 1,
    maxProgress: 1,
    xpReward: 150,
    isUnlocked: true,
    unlockedAt: new Date(Date.now() - 86400000 * 5),
    rarity: 'common',
  },
  {
    id: '11',
    title: 'Generous Spirit',
    description: 'Give 10 five-star reviews',
    icon: <Heart className="w-6 h-6" />,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    category: 'social',
    progress: 4,
    maxProgress: 10,
    xpReward: 350,
    isUnlocked: false,
    rarity: 'rare',
  },
  {
    id: '12',
    title: 'Early Bird',
    description: 'Book equipment a month in advance',
    icon: <Calendar className="w-6 h-6" />,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    category: 'rental',
    progress: 0,
    maxProgress: 1,
    xpReward: 200,
    isUnlocked: false,
    rarity: 'rare',
  },
];

const defaultBadges: Badge[] = [
  { id: 'b1', title: 'Verified', icon: <Shield className="w-5 h-5" />, color: 'from-teal-500 to-emerald-500', isEquipped: true },
  { id: 'b2', title: 'Top Renter', icon: <Trophy className="w-5 h-5" />, color: 'from-amber-500 to-orange-500', isEquipped: false },
  { id: 'b3', title: 'Super Host', icon: <Star className="w-5 h-5" />, color: 'from-purple-500 to-pink-500', isEquipped: true },
  { id: 'b4', title: 'Pioneer', icon: <Rocket className="w-5 h-5" />, color: 'from-blue-500 to-indigo-500', isEquipped: false },
];

export default function AchievementsSystem({
  userLevel = 12,
  currentXP = 2450,
  totalXP = 3000,
  achievements = defaultAchievements,
  badges = defaultBadges,
  onBadgeEquip,
  className = '',
}: AchievementsSystemProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'in-progress'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Achievement['category']>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const progressPercentage = (currentXP / totalXP) * 100;

  const filteredAchievements = achievements.filter(a => {
    if (activeTab === 'unlocked' && !a.isUnlocked) return false;
    if (activeTab === 'in-progress' && (a.isUnlocked || a.progress === 0)) return false;
    if (selectedCategory !== 'all' && a.category !== selectedCategory) return false;
    return true;
  });

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-500';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-amber-400 to-orange-500';
    }
  };

  const getRarityLabel = (rarity: Achievement['rarity']) => {
    return rarity.charAt(0).toUpperCase() + rarity.slice(1);
  };

  const categories = [
    { id: 'all', label: 'All', icon: Trophy },
    { id: 'rental', label: 'Rentals', icon: Wrench },
    { id: 'social', label: 'Social', icon: MessageSquare },
    { id: 'milestone', label: 'Milestones', icon: Target },
    { id: 'special', label: 'Special', icon: Sparkles },
  ];

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalPoints = achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.xpReward, 0);

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* Header with Level Progress */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-1">Achievements</h1>
              <p className="text-white/80">Track your progress and earn rewards</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{unlockedCount}/{achievements.length}</div>
              <div className="text-sm text-white/80">Unlocked</div>
            </div>
          </div>

          {/* Level Progress */}
          <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold">{userLevel}</span>
                </div>
                <div>
                  <div className="font-semibold text-lg">Level {userLevel}</div>
                  <div className="text-sm text-white/70">{totalPoints.toLocaleString()} total XP</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/70">Next level</div>
                <div className="font-semibold">{(totalXP - currentXP).toLocaleString()} XP to go</div>
              </div>
            </div>
            
            <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {currentXP.toLocaleString()} / {totalXP.toLocaleString()} XP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Equipped Badges */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Your Badges</h2>
            <button className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              Manage Badges
            </button>
          </div>
          
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {badges.map(badge => (
              <button
                key={badge.id}
                onClick={() => onBadgeEquip(badge.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                  badge.isEquipped
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${badge.color} flex items-center justify-center text-white`}>
                  {badge.icon}
                </div>
                <span className="font-medium text-gray-900">{badge.title}</span>
                {badge.isEquipped && (
                  <CheckCircle2 className="w-4 h-4 text-violet-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status tabs */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 shadow-sm">
            {['all', 'unlocked', 'in-progress'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-violet-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'unlocked' ? 'Unlocked' : 'In Progress'}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-violet-100 text-violet-700'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
                }`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement, index) => (
            <button
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={`relative bg-white rounded-2xl p-5 text-left transition-all hover:shadow-lg ${
                achievement.isUnlocked ? '' : 'opacity-90'
              }`}
              style={{
                animation: 'fadeInUp 0.4s ease-out forwards',
                animationDelay: `${index * 0.05}s`,
                opacity: 0,
              }}
            >
              {/* Rarity indicator */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${getRarityColor(achievement.rarity)} opacity-10 rounded-tr-2xl rounded-bl-[100px]`} />
              
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`relative w-14 h-14 rounded-xl ${achievement.bgColor} ${achievement.color} flex items-center justify-center flex-shrink-0`}>
                  {achievement.icon}
                  {!achievement.isUnlocked && (
                    <div className="absolute inset-0 bg-gray-200/80 rounded-xl flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getRarityColor(achievement.rarity)} text-white`}>
                      {getRarityLabel(achievement.rarity)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        {achievement.progress.toLocaleString()} / {achievement.maxProgress.toLocaleString()}
                      </span>
                      <span className="font-medium text-violet-600">+{achievement.xpReward} XP</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          achievement.isUnlocked
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : 'bg-gradient-to-r from-violet-400 to-purple-500'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      />
                    </div>
                  </div>

                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <div className="flex items-center gap-1.5 mt-3 text-xs text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No achievements found</h3>
            <p className="text-gray-500">Try a different filter to see more achievements</p>
          </div>
        )}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedAchievement(null)} />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className={`w-20 h-20 rounded-2xl ${selectedAchievement.bgColor} ${selectedAchievement.color} flex items-center justify-center mx-auto mb-4`}>
              {selectedAchievement.icon}
            </div>
            
            <div className="text-center mb-6">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRarityColor(selectedAchievement.rarity)} text-white mb-2`}>
                {getRarityLabel(selectedAchievement.rarity)}
              </span>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedAchievement.title}</h3>
              <p className="text-gray-500">{selectedAchievement.description}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold text-gray-900">
                  {selectedAchievement.progress.toLocaleString()} / {selectedAchievement.maxProgress.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    selectedAchievement.isUnlocked
                      ? 'from-green-400 to-emerald-500'
                      : 'from-violet-400 to-purple-500'
                  }`}
                  style={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-600">
                <Gift className="w-5 h-5" />
                <span className="font-semibold">+{selectedAchievement.xpReward} XP Reward</span>
              </div>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}
