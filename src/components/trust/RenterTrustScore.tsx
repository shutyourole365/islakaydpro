import { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Star,
  AlertTriangle,
  TrendingUp,
  Award,
  User,
  MessageSquare,
  X,
  ChevronRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  ThumbsUp,
  BarChart3,
  Lock,
  Info,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ── Types ──────────────────────────────────────────────────────────────────

interface TrustFactor {
  id: string;
  label: string;
  description: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
  color: string;
  status: 'complete' | 'partial' | 'missing';
  actionLabel?: string;
}

interface TrustData {
  total: number;
  level: 'new' | 'building' | 'fair' | 'good' | 'excellent';
  factors: TrustFactor[];
  recentActivity: Array<{
    date: string;
    event: string;
    change: number;
    type: 'positive' | 'negative' | 'neutral';
  }>;
  stats: {
    totalRentals: number;
    completedRentals: number;
    cancelledRentals: number;
    avgRating: number;
    totalReviews: number;
    responseRate: number;
    memberSince: string;
  };
  aiInsight?: string;
}

interface RenterTrustScoreProps {
  userId: string;
  viewMode?: 'full' | 'compact' | 'badge';
  onClose?: () => void;
}

// ── Level config ────────────────────────────────────────────────────────────

const LEVEL_CONFIG = {
  new:       { label: 'New Member',    color: 'text-gray-500',    bg: 'bg-gray-100 dark:bg-gray-800',      ring: 'ring-gray-300',   gradient: 'from-gray-400 to-gray-500' },
  building:  { label: 'Building Trust',color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20',  ring: 'ring-amber-300',  gradient: 'from-amber-400 to-orange-500' },
  fair:      { label: 'Fair Standing', color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20',    ring: 'ring-blue-300',   gradient: 'from-blue-400 to-cyan-500' },
  good:      { label: 'Good Standing', color: 'text-teal-600',    bg: 'bg-teal-50 dark:bg-teal-900/20',    ring: 'ring-teal-300',   gradient: 'from-teal-400 to-emerald-500' },
  excellent: { label: 'Trusted Member',color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', ring: 'ring-emerald-300', gradient: 'from-emerald-400 to-green-500' },
};

// ── Helpers ────────────────────────────────────────────────────────────────

function scoreToLevel(score: number): TrustData['level'] {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 50) return 'fair';
  if (score >= 25) return 'building';
  return 'new';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-AU', { year: 'numeric', month: 'short' });
}

// ── Data fetcher ────────────────────────────────────────────────────────────

async function fetchTrustData(userId: string): Promise<TrustData> {
  const [profileRes, bookingsRes, reviewsRes, sentReviewsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('bookings').select('id, status, created_at, total_amount').eq('renter_id', userId),
    supabase.from('reviews').select('id, rating, comment, communication, punctuality, created_at').eq('reviewee_id', userId).order('created_at', { ascending: false }),
    supabase.from('reviews').select('id').eq('reviewer_id', userId),
  ]);

  const profile = profileRes.data;
  const bookings = bookingsRes.data ?? [];
  const reviews = reviewsRes.data ?? [];
  const sentReviews = sentReviewsRes.data ?? [];

  // ── Compute stats ──
  const completedRentals = bookings.filter(b => b.status === 'completed').length;
  const cancelledRentals = bookings.filter(b => b.status === 'cancelled').length;
  const totalRentals = bookings.length;
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
    : 0;

  // Response rate: reviews left vs rentals completed (proxy)
  const responseRate = completedRentals > 0
    ? Math.min(100, Math.round((sentReviews.length / Math.max(completedRentals, 1)) * 100))
    : 0;

  // ── Score factors ──
  const verificationScore = (() => {
    let s = 0;
    if (profile?.email_verified)     s += 5;
    if (profile?.phone_verified)     s += 5;
    if (profile?.is_verified)        s += 5;
    if (profile?.identity_verified)  s += 5;
    return s;
  })();

  const rentalScore = Math.min(25, completedRentals * 3);
  const ratingScore = reviews.length > 0
    ? Math.min(25, Math.round(((avgRating - 1) / 4) * 25))
    : 0;
  const reviewScore = Math.min(10, sentReviews.length * 1);
  const cancelScore = cancelledRentals === 0 ? 10 : Math.max(0, 10 - cancelledRentals * 3);
  const securityScore = profile?.two_factor_enabled ? 5 : 0;

  const total = verificationScore + rentalScore + ratingScore + reviewScore + cancelScore + securityScore;
  const level = scoreToLevel(total);

  // ── Factor definitions ──
  const factors: TrustFactor[] = [
    {
      id: 'verification',
      label: 'Identity Verification',
      description: 'Email, phone, and ID verification adds trust for owners.',
      score: verificationScore,
      maxScore: 20,
      icon: <ShieldCheck className="w-4 h-4" />,
      color: 'teal',
      status: verificationScore >= 15 ? 'complete' : verificationScore > 0 ? 'partial' : 'missing',
      actionLabel: verificationScore < 20 ? 'Verify now' : undefined,
    },
    {
      id: 'rentals',
      label: 'Rental History',
      description: 'More completed rentals build confidence with equipment owners.',
      score: rentalScore,
      maxScore: 25,
      icon: <Award className="w-4 h-4" />,
      color: 'blue',
      status: rentalScore >= 20 ? 'complete' : rentalScore > 0 ? 'partial' : 'missing',
    },
    {
      id: 'rating',
      label: 'Owner Ratings',
      description: 'Average star rating from equipment owners who have rented to you.',
      score: ratingScore,
      maxScore: 25,
      icon: <Star className="w-4 h-4" />,
      color: 'yellow',
      status: ratingScore >= 20 ? 'complete' : ratingScore > 0 ? 'partial' : 'missing',
    },
    {
      id: 'reviews',
      label: 'Reviews Written',
      description: 'Leaving reviews after rentals shows you are an engaged community member.',
      score: reviewScore,
      maxScore: 10,
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'purple',
      status: reviewScore >= 8 ? 'complete' : reviewScore > 0 ? 'partial' : 'missing',
      actionLabel: reviewScore < 10 ? 'Leave a review' : undefined,
    },
    {
      id: 'cancellations',
      label: 'Low Cancellation Rate',
      description: 'Cancelling bookings hurts owners — a clean record builds trust.',
      score: cancelScore,
      maxScore: 10,
      icon: <ThumbsUp className="w-4 h-4" />,
      color: 'green',
      status: cancelScore >= 9 ? 'complete' : cancelScore > 5 ? 'partial' : 'missing',
    },
    {
      id: 'security',
      label: 'Account Security',
      description: 'Two-factor authentication protects your account and shows responsibility.',
      score: securityScore,
      maxScore: 5,
      icon: <Lock className="w-4 h-4" />,
      color: 'indigo',
      status: profile?.two_factor_enabled ? 'complete' : 'missing',
      actionLabel: !profile?.two_factor_enabled ? 'Enable 2FA' : undefined,
    },
  ];

  // ── Recent activity from bookings ──
  const recentActivity = [
    ...bookings
      .filter(b => b.status === 'completed')
      .slice(0, 3)
      .map(b => ({
        date: b.created_at,
        event: 'Completed a rental',
        change: 3,
        type: 'positive' as const,
      })),
    ...bookings
      .filter(b => b.status === 'cancelled')
      .slice(0, 2)
      .map(b => ({
        date: b.created_at,
        event: 'Booking cancelled',
        change: -3,
        type: 'negative' as const,
      })),
    ...reviews.slice(0, 2).map(r => ({
      date: r.created_at,
      event: `Received ${r.rating}★ review`,
      change: r.rating >= 4 ? 2 : -1,
      type: (r.rating >= 4 ? 'positive' : 'negative') as 'positive' | 'negative',
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return {
    total,
    level,
    factors,
    recentActivity,
    stats: {
      totalRentals,
      completedRentals,
      cancelledRentals,
      avgRating,
      totalReviews: reviews.length,
      responseRate,
      memberSince: profile?.created_at ?? '',
    },
    aiInsight: undefined, // fetched separately
  };
}

// ── AI Insight fetcher ──────────────────────────────────────────────────────

async function fetchAIInsight(data: TrustData): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const prompt = `You are a trust advisor for a peer-to-peer equipment rental platform.

A renter has the following trust profile:
- Trust Score: ${data.total}/100 (Level: ${data.level})
- Completed Rentals: ${data.stats.completedRentals}
- Cancelled Rentals: ${data.stats.cancelledRentals}
- Average Rating: ${data.stats.avgRating > 0 ? data.stats.avgRating.toFixed(1) + ' stars' : 'No ratings yet'}
- Total Reviews Received: ${data.stats.totalReviews}
- Member Since: ${data.stats.memberSince ? formatDate(data.stats.memberSince) : 'Unknown'}
- Weakest areas: ${data.factors.filter(f => f.status !== 'complete').map(f => f.label).join(', ') || 'None'}

Write a SHORT (2-3 sentences max) personalised insight about their trust standing and the SINGLE most impactful thing they can do to improve their score. Be direct, specific, and friendly. Do not use markdown formatting.`;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        provider: 'anthropic',
        stream: false,
      }),
    });

    if (!response.ok) return '';
    const json = await response.json();
    return json.content || '';
  } catch {
    return '';
  }
}

// ── Score Ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score, level }: { score: number; level: TrustData['level'] }) {
  const cfg = LEVEL_CONFIG[level];
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke="url(#trustGrad)" strokeWidth="10"
          strokeDasharray={`${progress} ${circumference}`}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={`text-${level === 'excellent' ? 'emerald' : level === 'good' ? 'teal' : level === 'fair' ? 'blue' : level === 'building' ? 'amber' : 'gray'}-400`} stopColor="currentColor" />
            <stop offset="100%" className={`text-${level === 'excellent' ? 'green' : level === 'good' ? 'emerald' : level === 'fair' ? 'cyan' : level === 'building' ? 'orange' : 'gray'}-600`} stopColor="currentColor" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{score}</div>
        <div className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</div>
      </div>
    </div>
  );
}

// ── Badge view ──────────────────────────────────────────────────────────────

function TrustBadge({ score, level }: { score: number; level: TrustData['level'] }) {
  const cfg = LEVEL_CONFIG[level];
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cfg.bg} ring-1 ${cfg.ring}`}>
      <Shield className={`w-3.5 h-3.5 ${cfg.color}`} />
      <span className={`text-xs font-semibold ${cfg.color}`}>{score}</span>
      <span className={`text-xs ${cfg.color} opacity-75`}>·</span>
      <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
    </div>
  );
}

// ── Factor Bar ──────────────────────────────────────────────────────────────

function FactorBar({ factor }: { factor: TrustFactor }) {
  const pct = Math.round((factor.score / factor.maxScore) * 100);
  const colorMap: Record<string, string> = {
    teal: 'bg-teal-500', blue: 'bg-blue-500', yellow: 'bg-yellow-500',
    purple: 'bg-purple-500', green: 'bg-green-500', indigo: 'bg-indigo-500',
  };
  const bar = colorMap[factor.color] ?? 'bg-teal-500';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`text-${factor.color}-500`}>{factor.icon}</div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{factor.label}</span>
          {factor.status === 'missing' && (
            <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">0 pts</span>
          )}
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{factor.score}<span className="text-gray-400 font-normal">/{factor.maxScore}</span></span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${bar} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{factor.description}</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function RenterTrustScore({ userId, viewMode = 'full', onClose }: RenterTrustScoreProps) {
  const [data, setData] = useState<TrustData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'factors' | 'history'>('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchTrustData(userId);
      setData(result);

      // Load AI insight async (non-blocking)
      setAiLoading(true);
      fetchAIInsight(result).then(insight => {
        setData(prev => prev ? { ...prev, aiInsight: insight } : prev);
        setAiLoading(false);
      });
    } catch (e) {
      console.error('TrustScore load error:', e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Badge mode ──
  if (viewMode === 'badge') {
    if (loading || !data) return <div className="w-24 h-7 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse" />;
    return <TrustBadge score={data.total} level={data.level} />;
  }

  // ── Compact mode ──
  if (viewMode === 'compact') {
    if (loading || !data) return <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />;
    const cfg = LEVEL_CONFIG[data.level];
    return (
      <div className={`flex items-center gap-4 p-4 rounded-xl ${cfg.bg} ring-1 ${cfg.ring}`}>
        <ScoreRing score={data.total} level={data.level} />
        <div>
          <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{data.stats.completedRentals} rentals · {data.stats.avgRating > 0 ? data.stats.avgRating.toFixed(1) + '★' : 'No ratings'}</p>
          {data.factors.find(f => f.status === 'missing')?.actionLabel && (
            <button className="mt-1 text-xs underline text-teal-600">
              {data.factors.find(f => f.status === 'missing')?.actionLabel}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ── Full mode ──
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-teal-600 to-emerald-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Trust Score</h2>
              <p className="text-xs text-teal-100">Your reputation on IslaKayd</p>
            </div>
          </div>
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          {(['overview', 'factors', 'history'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
              <p className="text-sm text-gray-500">Calculating your trust score...</p>
            </div>
          ) : data ? (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-6 space-y-6">
                  {/* Score ring + stats */}
                  <div className="flex flex-col items-center gap-2">
                    <ScoreRing score={data.total} level={data.level} />
                    <p className="text-xs text-gray-500 text-center max-w-xs">
                      Your score is based on verifications, rental history, ratings, and engagement.
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{data.stats.completedRentals}</div>
                      <div className="text-xs text-gray-500">Completed</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {data.stats.avgRating > 0 ? data.stats.avgRating.toFixed(1) : '—'}
                      </div>
                      <div className="text-xs text-gray-500">Avg Rating</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{data.stats.totalReviews}</div>
                      <div className="text-xs text-gray-500">Reviews</div>
                    </div>
                  </div>

                  {/* AI Insight */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-100 dark:border-teal-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">AI Insight</span>
                    </div>
                    {aiLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 text-teal-500 animate-spin" />
                        <span className="text-xs text-teal-600">Personalising your insight...</span>
                      </div>
                    ) : data.aiInsight ? (
                      <p className="text-sm text-teal-800 dark:text-teal-200">{data.aiInsight}</p>
                    ) : (
                      <p className="text-sm text-teal-800 dark:text-teal-200">Complete your verifications and start renting to build your trust score.</p>
                    )}
                  </div>

                  {/* Top action */}
                  {data.factors.filter(f => f.status !== 'complete' && f.actionLabel).slice(0, 1).map(f => (
                    <div key={f.id} className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Quick Win: +{f.maxScore - f.score} points</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">{f.label}</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-medium transition-colors">
                        {f.actionLabel} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Factors Tab */}
              {activeTab === 'factors' && (
                <div className="p-6 space-y-5">
                  <p className="text-sm text-gray-500">Each factor contributes to your total score out of 100.</p>
                  {data.factors.map(f => (
                    <FactorBar key={f.id} factor={f} />
                  ))}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="p-6 space-y-4">
                  {data.recentActivity.length === 0 ? (
                    <div className="text-center py-12">
                      <BarChart3 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">No activity yet. Complete your first rental to start building history.</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">Recent events that affected your score.</p>
                      <div className="space-y-3">
                        {data.recentActivity.map((event, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                event.type === 'positive' ? 'bg-green-100 dark:bg-green-900/30' :
                                event.type === 'negative' ? 'bg-red-100 dark:bg-red-900/30' :
                                'bg-gray-100 dark:bg-gray-700'
                              }`}>
                                {event.type === 'positive'
                                  ? <TrendingUp className="w-4 h-4 text-green-600" />
                                  : event.type === 'negative'
                                  ? <AlertTriangle className="w-4 h-4 text-red-500" />
                                  : <Info className="w-4 h-4 text-gray-400" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{event.event}</p>
                                <p className="text-xs text-gray-400">{formatDate(event.date)}</p>
                              </div>
                            </div>
                            <span className={`text-sm font-semibold ${
                              event.change > 0 ? 'text-green-600' :
                              event.change < 0 ? 'text-red-500' : 'text-gray-400'
                            }`}>
                              {event.change > 0 ? '+' : ''}{event.change}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Member since */}
                  {data.stats.memberSince && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">Member since {formatDate(data.stats.memberSince)}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-500">Could not load trust data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
