import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Share2,
  Copy,
  Mail,
  MessageSquare,
  Trophy,
  DollarSign,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ReferralSystemProps {
  className?: string;
}

interface Referral {
  id: string;
  referredUser: {
    name: string;
    email: string;
    avatar?: string;
  };
  status: 'pending' | 'completed' | 'rewarded';
  joinedDate: Date;
  rewardEarned: number;
  rewardType: 'credit' | 'discount' | 'premium';
}

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalRewards: number;
  currentTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  nextTierProgress: number;
  monthlyGoal: number;
  monthlyProgress: number;
}

interface RewardTier {
  name: 'bronze' | 'silver' | 'gold' | 'platinum';
  minReferrals: number;
  rewardMultiplier: number;
  perks: string[];
  color: string;
}

const REWARD_TIERS: RewardTier[] = [
  {
    name: 'bronze',
    minReferrals: 0,
    rewardMultiplier: 1,
    perks: ['Basic referral rewards', 'Monthly newsletter'],
    color: 'text-amber-600 bg-amber-100',
  },
  {
    name: 'silver',
    minReferrals: 5,
    rewardMultiplier: 1.2,
    perks: ['20% bonus rewards', 'Priority support', 'Exclusive deals'],
    color: 'text-gray-600 bg-gray-100',
  },
  {
    name: 'gold',
    minReferrals: 15,
    rewardMultiplier: 1.5,
    perks: ['50% bonus rewards', 'VIP support', 'Free premium month', 'Early access'],
    color: 'text-yellow-600 bg-yellow-100',
  },
  {
    name: 'platinum',
    minReferrals: 30,
    rewardMultiplier: 2,
    perks: ['100% bonus rewards', 'Dedicated account manager', 'Free equipment rental', 'Custom perks'],
    color: 'text-purple-600 bg-purple-100',
  },
];

export default function ReferralSystem({ className = '' }: ReferralSystemProps) {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadReferralData = async () => {
      if (!user) return;

      try {
        // Mock data - in real app, this would come from API
        const mockReferrals: Referral[] = [
          {
            id: '1',
            referredUser: { name: 'John Smith', email: 'john@example.com' },
            status: 'completed',
            joinedDate: new Date('2024-01-15'),
            rewardEarned: 50,
            rewardType: 'credit',
          },
          {
            id: '2',
            referredUser: { name: 'Sarah Johnson', email: 'sarah@example.com' },
            status: 'rewarded',
            joinedDate: new Date('2024-01-20'),
            rewardEarned: 75,
            rewardType: 'discount',
          },
          {
            id: '3',
            referredUser: { name: 'Mike Wilson', email: 'mike@example.com' },
            status: 'pending',
            joinedDate: new Date('2024-02-01'),
            rewardEarned: 0,
            rewardType: 'credit',
          },
        ];

        setReferrals(mockReferrals);
        setReferralCode(`ISLAKAYD-${user.id.slice(0, 8).toUpperCase()}`);
      } catch (error) {
        console.error('Failed to load referral data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReferralData();
  }, [user]);

  const stats: ReferralStats = useMemo(() => {
    const totalReferrals = referrals.length;
    const successfulReferrals = referrals.filter(r => r.status === 'completed' || r.status === 'rewarded').length;
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
    const totalRewards = referrals.reduce((sum, r) => sum + r.rewardEarned, 0);

    const currentTier = REWARD_TIERS.slice().reverse().find(tier => successfulReferrals >= tier.minReferrals) || REWARD_TIERS[0];
    const nextTier = REWARD_TIERS.find(tier => tier.minReferrals > successfulReferrals);
    const nextTierProgress = nextTier ? (successfulReferrals / nextTier.minReferrals) * 100 : 100;

    return {
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      totalRewards,
      currentTier: currentTier.name,
      nextTierProgress,
      monthlyGoal: 3,
      monthlyProgress: Math.min(3, successfulReferrals), // Mock monthly progress
    };
  }, [referrals]);

  const currentTierData = REWARD_TIERS.find(tier => tier.name === stats.currentTier)!;

  const handleCopyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral code:', error);
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareText = `Join Islakayd and get exclusive equipment rental deals! Use my referral code: ${referralCode}`;

    switch (platform) {
      case 'email':
        window.open(`mailto:?subject=Join Islakayd&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`);
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
        break;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'rewarded': return Trophy;
      case 'pending': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'rewarded': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Referral Program</h2>
            <p className="text-gray-600">Earn rewards by referring friends and colleagues</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share Referral Link
            </button>
          </div>
        </div>

        {/* Current Tier Badge */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${currentTierData.color}`}>
            {currentTierData.name.charAt(0).toUpperCase() + currentTierData.name.slice(1)} Tier
          </div>
          <div className="text-sm text-gray-600">
            {stats.successfulReferrals} successful referrals
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Referrals</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalReferrals}</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Successful</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{stats.successfulReferrals}</div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900">{stats.pendingReferrals}</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Total Rewards</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">${stats.totalRewards}</div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Code</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-center">
            {referralCode}
          </div>
          <button
            onClick={handleCopyReferralCode}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Share this code with friends. They'll get a discount on their first rental, and you'll earn rewards when they complete their first booking.
        </p>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tier Progress */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tier Progress</h3>
          <div className="space-y-4">
            {REWARD_TIERS.map((tier) => {
              const isCurrentTier = tier.name === stats.currentTier;
              const isCompleted = stats.successfulReferrals >= tier.minReferrals;

              return (
                <div key={tier.name} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isCurrentTier ? tier.color : isCompleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tier.name.charAt(0).toUpperCase() + tier.name.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {tier.minReferrals}+ referrals
                      </span>
                    </div>
                    {isCurrentTier && (
                      <span className="text-sm font-medium text-blue-600">
                        {stats.successfulReferrals}/{tier.minReferrals}
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-600' : isCurrentTier ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      style={{ width: `${isCompleted ? 100 : isCurrentTier ? stats.nextTierProgress : 0}%` }}
                    ></div>
                  </div>

                  {isCurrentTier && (
                    <div className="text-xs text-gray-600">
                      {tier.rewardMultiplier}x reward multiplier
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Goal */}
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Goal</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.monthlyProgress}/{stats.monthlyGoal}
            </div>
            <div className="text-sm text-gray-600">Referrals this month</div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(stats.monthlyProgress / stats.monthlyGoal) * 100}%` }}
            ></div>
          </div>

          <div className="text-sm text-gray-600 text-center">
            {stats.monthlyGoal - stats.monthlyProgress} more referrals to reach your monthly goal
          </div>

          {stats.monthlyProgress >= stats.monthlyGoal && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Monthly goal achieved! 🎉</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referrals</h3>

        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h4>
            <p className="text-gray-600 mb-4">Start sharing your referral code to earn rewards!</p>
            <button
              onClick={() => setShowShareModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Share Referral Code
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((referral) => {
              const StatusIcon = getStatusIcon(referral.status);
              return (
                <div key={referral.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{referral.referredUser.name}</div>
                      <div className="text-sm text-gray-600">{referral.referredUser.email}</div>
                      <div className="text-xs text-gray-500">
                        Joined {referral.joinedDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                        {referral.status}
                      </div>
                      {referral.rewardEarned > 0 && (
                        <div className="text-sm font-semibold text-green-600 mt-1">
                          +${referral.rewardEarned}
                        </div>
                      )}
                    </div>
                    <StatusIcon className={`w-5 h-5 ${
                      referral.status === 'completed' ? 'text-green-600' :
                      referral.status === 'rewarded' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Referral Code</h3>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleShare('email')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-600" />
                <span className="text-gray-900">Share via Email</span>
              </button>

              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-gray-900">Share via WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-blue-500 font-bold text-lg">𝕏</span>
                <span className="text-gray-900">Share on X (Twitter)</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-5 h-5 bg-blue-600 rounded"></div>
                <span className="text-gray-900">Share on Facebook</span>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCopyReferralCode}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}