import { useState, useEffect } from 'react';
import {
  Users,
  Gift,
  Copy,
  CheckCircle2,
  Mail,
  MessageSquare,
  Twitter,
  Facebook,
  Link2,
  DollarSign,
  Trophy,
} from 'lucide-react';

interface ReferralProgramProps {
  userId: string;
  userName: string;
  onClose?: () => void;
}

interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  referralCode: string;
  referralLink: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  referralsToNextTier: number;
}

interface Referral {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'signed_up' | 'first_rental' | 'active';
  date: Date;
  earnings: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  referrals: number;
  earnings: number;
  isCurrentUser: boolean;
}

export default function ReferralProgram({ userId, userName }: ReferralProgramProps) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'leaderboard'>('overview');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, [userId]);

  const loadReferralData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockStats: ReferralStats = {
      totalReferrals: 12,
      pendingReferrals: 3,
      successfulReferrals: 9,
      totalEarnings: 450,
      referralCode: 'ISLAKAYD-' + userId.slice(0, 6).toUpperCase(),
      referralLink: `https://islakayd.com/ref/${userId.slice(0, 8)}`,
      tier: 'silver',
      referralsToNextTier: 6,
    };

    const mockReferrals: Referral[] = [
      { id: '1', name: 'John D.', email: 'john@email.com', status: 'active', date: new Date('2026-01-15'), earnings: 50 },
      { id: '2', name: 'Sarah M.', email: 'sarah@email.com', status: 'first_rental', date: new Date('2026-01-18'), earnings: 50 },
      { id: '3', name: 'Mike R.', email: 'mike@email.com', status: 'signed_up', date: new Date('2026-01-20'), earnings: 25 },
      { id: '4', name: 'Emily K.', email: 'emily@email.com', status: 'pending', date: new Date('2026-01-24'), earnings: 0 },
      { id: '5', name: 'Chris P.', email: 'chris@email.com', status: 'active', date: new Date('2026-01-10'), earnings: 75 },
    ];

    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, name: 'Alex Johnson', referrals: 47, earnings: 2350, isCurrentUser: false },
      { rank: 2, name: 'Maria Garcia', referrals: 38, earnings: 1900, isCurrentUser: false },
      { rank: 3, name: 'David Chen', referrals: 31, earnings: 1550, isCurrentUser: false },
      { rank: 4, name: userName, referrals: 12, earnings: 450, isCurrentUser: true },
      { rank: 5, name: 'Lisa Wong', referrals: 10, earnings: 400, isCurrentUser: false },
    ];

    setStats(mockStats);
    setReferrals(mockReferrals);
    setLeaderboard(mockLeaderboard);
    setLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = async () => {
    if (!inviteEmail) return;
    setInviteSent(true);
    setTimeout(() => {
      setInviteSent(false);
      setInviteEmail('');
      alert('Invitation sent!');
    }, 1500);
  };

  const shareVia = (platform: string) => {
    const message = `Join Islakayd and get $25 off your first rental! Use my code: ${stats?.referralCode}`;
    const url = stats?.referralLink || '';
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(url)}`);
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'email':
        window.open(`mailto:?subject=Join Islakayd!&body=${encodeURIComponent(message + '\n' + url)}`);
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(message + ' ' + url)}`);
        break;
    }
  };

  const getTierColor = (tier: ReferralStats['tier']) => {
    switch (tier) {
      case 'bronze': return 'from-amber-600 to-orange-700';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'gold': return 'from-yellow-400 to-amber-500';
      case 'platinum': return 'from-violet-500 to-purple-600';
    }
  };

  const getStatusColor = (status: Referral['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-700';
      case 'signed_up': return 'bg-blue-100 text-blue-700';
      case 'first_rental': return 'bg-green-100 text-green-700';
      case 'active': return 'bg-teal-100 text-teal-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading referral program...</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`p-6 bg-gradient-to-r ${getTierColor(stats.tier)} text-white`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Referral Program</h2>
              <p className="text-sm text-white/80 capitalize">{stats.tier} Member</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">${stats.totalEarnings}</p>
            <p className="text-sm text-white/80">Total Earned</p>
          </div>
        </div>

        {/* Referral Code */}
        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-sm text-white/70 mb-2">Your Referral Code</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/20 rounded-lg px-4 py-2 font-mono font-bold text-lg">
              {stats.referralCode}
            </div>
            <button
              onClick={() => copyToClipboard(stats.referralCode)}
              className="p-3 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress to Next Tier */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-white/70">{stats.referralsToNextTier} more referrals to next tier</span>
            <span className="capitalize">{stats.tier === 'platinum' ? 'Max Level' : 
              stats.tier === 'gold' ? '→ Platinum' :
              stats.tier === 'silver' ? '→ Gold' : '→ Silver'}</span>
          </div>
          <div className="bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{ width: `${((15 - stats.referralsToNextTier) / 15) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Share Options */}
      <div className="p-4 bg-gray-50 border-b border-gray-100">
        <p className="text-sm text-gray-600 mb-3">Share your link</p>
        <div className="flex gap-2">
          <button
            onClick={() => shareVia('twitter')}
            className="flex-1 py-3 bg-[#1DA1F2] text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Twitter className="w-5 h-5" />
          </button>
          <button
            onClick={() => shareVia('facebook')}
            className="flex-1 py-3 bg-[#4267B2] text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Facebook className="w-5 h-5" />
          </button>
          <button
            onClick={() => shareVia('email')}
            className="flex-1 py-3 bg-gray-700 text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Mail className="w-5 h-5" />
          </button>
          <button
            onClick={() => shareVia('sms')}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <button
            onClick={() => copyToClipboard(stats.referralLink)}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-300 transition-colors"
          >
            <Link2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
        {(['overview', 'referrals', 'leaderboard'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'text-pink-600 border-b-2 border-pink-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-pink-500" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalReferrals}</p>
                <p className="text-xs text-gray-500">Total Referrals</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold text-gray-900">{stats.successfulReferrals}</p>
                <p className="text-xs text-gray-500">Successful</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
                <p className="text-xs text-gray-500">Earned</p>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-pink-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
              <div className="space-y-3">
                {[
                  { step: '1', text: 'Share your unique referral code or link', reward: '' },
                  { step: '2', text: 'Friend signs up with your code', reward: '+$25 credit' },
                  { step: '3', text: 'Friend completes first rental', reward: '+$25 credit' },
                  { step: '4', text: 'Both of you earn rewards!', reward: '🎉' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{item.text}</p>
                    </div>
                    {item.reward && (
                      <span className="text-sm font-medium text-pink-600">{item.reward}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Invite by Email */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Invite by Email</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="friend@email.com"
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-pink-500"
                />
                <button
                  onClick={sendInvite}
                  disabled={!inviteEmail || inviteSent}
                  className="px-6 py-3 bg-pink-600 text-white rounded-xl font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors"
                >
                  {inviteSent ? 'Sending...' : 'Invite'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="space-y-2">
            {referrals.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No referrals yet. Start sharing your code!</p>
              </div>
            ) : (
              referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <span className="text-pink-600 font-semibold">{referral.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{referral.name}</p>
                      <p className="text-sm text-gray-500">{referral.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(referral.status)}`}>
                      {referral.status.replace('_', ' ')}
                    </span>
                    {referral.earnings > 0 && (
                      <p className="text-sm font-medium text-green-600 mt-1">+${referral.earnings}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-2">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  entry.isCurrentUser ? 'bg-pink-50 border-2 border-pink-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    entry.rank === 1 ? 'bg-amber-400 text-white' :
                    entry.rank === 2 ? 'bg-gray-300 text-white' :
                    entry.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {entry.rank <= 3 ? (
                      <Trophy className="w-5 h-5" />
                    ) : (
                      <span className="font-bold">{entry.rank}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {entry.name} {entry.isCurrentUser && '(You)'}
                    </p>
                    <p className="text-sm text-gray-500">{entry.referrals} referrals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${entry.earnings}</p>
                  <p className="text-xs text-gray-500">earned</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
