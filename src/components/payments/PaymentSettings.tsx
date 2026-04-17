import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  DollarSign,
  ExternalLink,
  TrendingUp,
  Wallet,
  RefreshCw,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowDownRight,
} from 'lucide-react';
import {
  createConnectAccount,
  getOwnerPayouts,
  getOwnerBalance,
  hasCompletedStripeConnect,
} from '../../services/payments';

interface PaymentSettingsProps {
  onBack: () => void;
}

interface Payout {
  id: string;
  amount: number;
  platform_fee: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  booking?: {
    start_date?: string;
    end_date?: string;
    equipment?: { title?: string; images?: string[] };
  };
}

export default function PaymentSettings({ onBack }: PaymentSettingsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'connect'>('overview');
  const [connectStatus, setConnectStatus] = useState<{
    hasAccount: boolean;
    isOnboarded: boolean;
    accountId?: string;
  } | null>(null);
  const [balance, setBalance] = useState<{ available: number; pending: number } | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const status = await hasCompletedStripeConnect();
      setConnectStatus(status);

      if (status.isOnboarded) {
        const [bal, payoutList] = await Promise.all([
          getOwnerBalance().catch(() => null),
          getOwnerPayouts().catch(() => []),
        ]);
        setBalance(bal);
        setPayouts(payoutList);
      }
    } catch (e) {
      setError('Could not load payment data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleConnectStripe() {
    setConnectLoading(true);
    setError('');
    try {
      const origin = window.location.origin;
      const { url } = await createConnectAccount({
        returnUrl: `${origin}/?tab=payments&connect=success`,
        refreshUrl: `${origin}/?tab=payments&connect=refresh`,
      });
      window.location.href = url;
    } catch (e) {
      setError('Failed to start Stripe Connect. Please try again.');
      setConnectLoading(false);
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'payouts', label: 'Payout History', icon: TrendingUp },
    { id: 'connect', label: 'Payout Setup', icon: Building2 },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Payments & Payouts</h1>
            <p className="text-sm text-gray-500">Powered by Stripe</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-medium">{error}</p>
              <button onClick={load} className="text-sm underline mt-1">Try again</button>
            </div>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Connect banner */}
                {!connectStatus?.isOnboarded && (
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 rounded-2xl p-6 text-white">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1">Set up payouts to start earning</h3>
                        <p className="text-white/80 text-sm mb-4">
                          Connect your Australian bank account via Stripe. Payouts are processed in AUD, usually within 2 business days.
                        </p>
                        <button
                          onClick={handleConnectStripe}
                          disabled={connectLoading}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition-colors disabled:opacity-70"
                        >
                          {connectLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Connecting…</>
                          ) : (
                            <><ExternalLink className="w-4 h-4" />Connect with Stripe</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Balance cards (only if connected) */}
                {connectStatus?.isOnboarded && balance && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Available balance
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        ${balance.available.toFixed(2)}
                        <span className="text-base font-normal text-gray-400 ml-1">AUD</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Ready to be paid out</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <RefreshCw className="w-4 h-4 text-amber-500" />
                        Pending
                      </div>
                      <p className="text-3xl font-bold text-gray-900">
                        ${balance.pending.toFixed(2)}
                        <span className="text-base font-normal text-gray-400 ml-1">AUD</span>
                      </p>
                      <p className="text-xs text-gray-400 mt-1">In transit from bookings</p>
                    </div>
                  </div>
                )}

                {/* How payouts work */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">How payouts work</h3>
                  <div className="space-y-4">
                    {[
                      {
                        icon: CreditCard,
                        color: 'bg-blue-100 text-blue-600',
                        title: 'Renter pays securely',
                        desc: 'Stripe processes all payments. Funds are held until rental is confirmed.',
                      },
                      {
                        icon: Shield,
                        color: 'bg-teal-100 text-teal-600',
                        title: 'Platform fee deducted',
                        desc: 'Islakayd deducts a 10% service fee to cover insurance, support and the platform.',
                      },
                      {
                        icon: DollarSign,
                        color: 'bg-green-100 text-green-600',
                        title: 'You get paid',
                        desc: 'Your share is transferred to your Australian bank account, usually within 2 business days.',
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── PAYOUT HISTORY TAB ── */}
            {activeTab === 'payouts' && (
              <div className="space-y-4">
                {!connectStatus?.isOnboarded ? (
                  <div className="text-center py-16 text-gray-400">
                    <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-gray-600">No payout history yet</p>
                    <p className="text-sm mt-1">Set up your bank account to start receiving payouts</p>
                    <button
                      onClick={() => setActiveTab('connect')}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-medium hover:bg-teal-600 transition-colors"
                    >
                      Set up payouts
                    </button>
                  </div>
                ) : payouts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-medium text-gray-600">No payouts yet</p>
                    <p className="text-sm mt-1">Payouts will appear here after your first completed booking</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-50">
                      {payouts.map((p) => (
                        <div key={p.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            p.status === 'completed' ? 'bg-green-100' : p.status === 'pending' ? 'bg-amber-100' : 'bg-red-100'
                          }`}>
                            {p.status === 'completed' ? (
                              <ArrowDownRight className="w-5 h-5 text-green-600" />
                            ) : p.status === 'failed' ? (
                              <AlertCircle className="w-5 h-5 text-red-500" />
                            ) : (
                              <RefreshCw className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {p.booking?.equipment?.title || 'Rental payout'}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(p.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}
                              <span className={`font-medium ${
                                p.status === 'completed' ? 'text-green-600' : p.status === 'pending' ? 'text-amber-600' : 'text-red-500'
                              }`}>
                                {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">+${p.amount.toFixed(2)}</p>
                            <p className="text-xs text-gray-400">AUD</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── CONNECT TAB ── */}
            {activeTab === 'connect' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      connectStatus?.isOnboarded ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {connectStatus?.isOnboarded ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {connectStatus?.isOnboarded ? 'Stripe Connect active' : 'Connect your bank account'}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {connectStatus?.isOnboarded
                          ? 'Your Australian bank account is connected and ready to receive payouts.'
                          : 'Link your Australian bank account so Islakayd can pay you when rentals are completed.'}
                      </p>
                      {!connectStatus?.isOnboarded && (
                        <button
                          onClick={handleConnectStripe}
                          disabled={connectLoading}
                          className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-md transition-all disabled:opacity-70"
                        >
                          {connectLoading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" />Connecting…</>
                          ) : (
                            <><ExternalLink className="w-4 h-4" />Set up via Stripe</>
                          )}
                        </button>
                      )}
                      {connectStatus?.isOnboarded && (
                        <button
                          onClick={handleConnectStripe}
                          disabled={connectLoading}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Manage on Stripe dashboard
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Your banking details are safe</p>
                    <p>Islakayd never sees your bank account details. Stripe is a PCI-compliant payment processor trusted by millions of Australian businesses.</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
