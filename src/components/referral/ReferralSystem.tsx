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
import { getMyReferralCode, listMyReferrals, type ReferralRecord } from '../../services/referrals';

interface ReferralSystemProps {
  className?: string;
}

type Referral = ReferralRecord;

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
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    name: 'silver',
    minReferrals: 5,
    rewardMultiplier: 1.2,
    perks: ['20% bonus rewards', 'Priority support', 'Exclusive deals'],
    color: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300',
  },
  {
    name: 'gold',
    minReferrals: 15,
    rewardMultiplier: 1.5,
    perks: ['50% bonus rewards', 'VIP support', 'Free premium month', 'Early access'],
    color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  {
    name: 'platinum',
    minReferrals: 30,
    rewardMultiplier: 2,
    perks: ['100% bonus rewards', 'Dedicated account manager', 'Free equipment rental', 'Custom perks'],
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
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
    let cancelled = false;

    const loadReferralData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [code, rows] = await Promise.all([
          getMyReferralCode(user.id),
          listMyReferrals(user.id),
        ]);
        if (cancelled) return;
        setReferralCode(code ?? `ISLAKAYD-${user.id.slice(0, 8).toUpperCase()}`);
        setReferrals(rows);
      } catch (error) {
        if (!cancelled) console.error('Failed to load referral data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadReferralData();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

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
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'rewarded': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Program</h2>
            <p className="text-gray-600 dark:text-gray-400">Earn rewards by referring friends and colleagues</p>
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
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stats.successfulReferrals} successful referrals
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Referrals</span>
            </div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">{stats.totalReferrals}</div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-300">Successful</span>
            </div>
            <div className="text-2xl font-bold text-green-900 dark:text-green-200">{stats.successfulReferrals}</div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-200">{stats.pendingReferrals}</div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-300">Total Rewards</span>
            </div>
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">${stats.totalRewards}</div>
          </div>
        </div>
      </div>

      {/* Referral Code Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Referral Code</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 font-mono text-center dark:text-white">
            {referralCode}
          </div>
          <button
            onClick={handleCopyReferralCode}
            className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
           >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Share this code with friends. They'll get a discount on their first rental, and you'll earn rewards when they complete their first booking.
        </p>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tier Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tier Progress</h3>
          <div className="space-y-4">
            {REWARD_TIERS.map((tier) => {
              const isCurrentTier = tier.name === stats.currentTier;
              const isCompleted = stats.successfulReferrals >= tier.minReferrals;

              return (
                <div key={tier.name} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        isCurrentTier ? tier.color : isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {tier.name.charAt(0).toUpperCase() + tier.name.slice(1)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {tier.minReferrals}+ referrals
                      </span>
                    </div>
                    {isCurrentTier && (
                      <span className="text-sm font-medium text-blue-600">
                        {stats.successfulReferrals}/{tier.minReferrals}
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-600' : isCurrentTier ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{ width: `${isCompleted ? 100 : isCurrentTier ? stats.nextTierProgress : 0}%` }}
                    ></div>
                  </div>

                  {isCurrentTier && (
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {tier.rewardMultiplier}x reward multiplier
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Goal */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Goal</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.monthlyProgress}/{stats.monthlyGoal}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Referrals this month</div>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(stats.monthlyProgress / stats.monthlyGoal) * 100}%` }}
            ></div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {stats.monthlyGoal - stats.monthlyProgress} more referrals to reach your monthly goal
          </div>

          {stats.monthlyProgress >= stats.monthlyGoal && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-medium">Monthly goal achieved! 🎉</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Referrals List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Your Referrals</h3>

        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No referrals yet</h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Start sharing your referral code to earn rewards!</p>
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
                <div key={referral.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{referral.referredUser.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{referral.referredUser.email}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Share Your Referral Code</h3>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleShare('email')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-900 dark:text-white">Share via Email</span>
              </button>

              <button
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-gray-900 dark:text-white">Share via WhatsApp</span>
              </button>

              <button
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-blue-500 font-bold text-lg">𝕏</span>
                <span className="text-gray-900 dark:text-white">Share on X (Twitter)</span>
              </button>

              <button
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="w-5 h-5 bg-blue-600 rounded"></div>
                <span className="text-gray-900 dark:text-white">Share on Facebook</span>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
