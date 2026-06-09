import { useState, useEffect } from 'react';
import { Gift, TrendingUp, Zap, Award, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../ui/Toast';
import {
  getLoyaltyAccount,
  getRewardHistory,
  getTierBenefits,
  calculateTierProgress,
  type LoyaltyAccount,
  type LoyaltyReward,
} from '../../services/loyaltyService';

export default function LoyaltyProgramPanel() {
  const { user } = useAuth();
  const { error: showError } = useToast();
  const [account, setAccount] = useState<LoyaltyAccount | null>(null);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    loadLoyaltyData();
  }, [user?.id]);

  const loadLoyaltyData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [accountData, rewardsData] = await Promise.all([
        getLoyaltyAccount(user.id),
        getRewardHistory(user.id),
      ]);

      setAccount(accountData);
      setRewards(rewardsData);
    } catch (err) {
      console.error('Failed to load loyalty data:', err);
      showError('Failed to load loyalty program');
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' };
      case 'gold':
        return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-700 dark:text-yellow-300' };
      case 'silver':
        return { bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-300' };
      default:
        return { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' };
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return '💎';
      case 'gold':
        return '✨';
      case 'silver':
        return '🌟';
      default:
        return '🔶';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!account) {
    return <div className="text-center py-8">Failed to load loyalty account</div>;
  }

  const tierBenefit = getTierBenefits(account.tierLevel);
  const tierProgress = calculateTierProgress(account);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loyalty Program</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Earn points on every rental and unlock exclusive rewards
        </p>
      </div>

      {/* Tier Card */}
      <div
        className={`rounded-2xl p-8 border-2 ${
          getTierColor(account.tierLevel).bg
        } ${getTierColor(account.tierLevel).border}`}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{getTierIcon(account.tierLevel)}</span>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Tier</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                  {account.tierLevel}
                </h3>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Member since</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {new Date(account.joinedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Points and Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Points</p>
            <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{account.totalPoints}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rentals</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{account.totalRentals}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${account.totalSpent.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tier Benefits */}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Your Benefits</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {tierBenefit.benefits.map((benefit, idx) => (
              <li key={idx} className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Zap className="w-4 h-4 text-teal-500" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Tier Progress */}
      {tierProgress.nextTier && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Progress to next tier</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {tierProgress.nextTier.tier}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">{tierProgress.progressPercent}%</p>
            </div>
          </div>

          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden mb-4">
            <div
              className="bg-teal-500 h-full transition-all"
              style={{ width: `${tierProgress.progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Points needed</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {tierProgress.pointsToNextTier} more
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Rentals needed</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {tierProgress.rentalsToNextTier} more
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How it Works */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-3">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-2">How to earn points</p>
            <ul className="space-y-1 text-xs">
              <li>✓ 1 point per $1 spent on rentals (boosted by tier level)</li>
              <li>✓ Bonus points for writing reviews</li>
              <li>✓ Referral bonuses when friends join</li>
              <li>✓ Milestone bonuses for rental milestones</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Reward History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-500" />
          Recent Activity
        </h3>

        {rewards.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            No reward activity yet. Start renting to earn points!
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {rewards.map(reward => (
              <div
                key={reward.id}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {reward.type.charAt(0).toUpperCase() + reward.type.slice(1)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        reward.pointsEarned > 0
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {reward.pointsEarned > 0
                          ? `+${reward.pointsEarned} points`
                          : `-${reward.pointsUsed} points`}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{reward.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {new Date(reward.transactionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Gift className="w-5 h-5 text-teal-500 flex-shrink-0" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tier Benefits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['bronze', 'silver', 'gold', 'platinum'].map(tier => (
          <div
            key={tier}
            className={`rounded-lg p-4 border ${
              account.tierLevel === tier
                ? `border-2 border-teal-500 ${getTierColor(tier).bg}`
                : `border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{tier}</h4>
              <span className="text-xl">{getTierIcon(tier)}</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {tier === 'bronze' && '0+ Points'}
              {tier === 'silver' && '500+ Points'}
              {tier === 'gold' && '1,500+ Points'}
              {tier === 'platinum' && '3,500+ Points'}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {tier === 'bronze' && '0+ Rentals'}
              {tier === 'silver' && '5+ Rentals'}
              {tier === 'gold' && '15+ Rentals'}
              {tier === 'platinum' && '30+ Rentals'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
