import { useState } from 'react';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Clock,
  Download,
  Filter,
  TrendingUp,
  Wallet,
  RefreshCw,
  Shield,
} from 'lucide-react';

interface PaymentSettingsProps {
  onBack: () => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  last4: string;
  expiry?: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  type: 'payout' | 'payment' | 'refund';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function PaymentSettings({ onBack }: PaymentSettingsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'methods' | 'transactions' | 'payouts'>('overview');
  const [showAddMethod, setShowAddMethod] = useState(false);

  const balance = {
    available: 2450.00,
    pending: 850.00,
    total: 3300.00,
  };

  const paymentMethods: PaymentMethod[] = [
    { id: '1', type: 'card', name: 'Visa ending in', last4: '4242', expiry: '12/28', isDefault: true },
    { id: '2', type: 'card', name: 'Mastercard ending in', last4: '5555', expiry: '08/27', isDefault: false },
    { id: '3', type: 'bank', name: 'Chase Bank ending in', last4: '9876', isDefault: false },
  ];

  const transactions: Transaction[] = [
    { id: '1', type: 'payout', amount: 1250.00, description: 'Weekly payout to Chase Bank', date: '2026-01-22', status: 'completed' },
    { id: '2', type: 'payment', amount: 450.00, description: 'Booking #12345 - CAT Excavator', date: '2026-01-21', status: 'completed' },
    { id: '3', type: 'payment', amount: 125.00, description: 'Booking #12346 - Camera Kit', date: '2026-01-20', status: 'pending' },
    { id: '4', type: 'refund', amount: -75.00, description: 'Refund for Booking #12340', date: '2026-01-18', status: 'completed' },
    { id: '5', type: 'payment', amount: 295.00, description: 'Booking #12344 - DJ Equipment', date: '2026-01-15', status: 'completed' },
  ];

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
    }
  };

  const getTypeIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'payout':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-green-600" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-red-600" />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Wallet },
    { id: 'methods', label: 'Payment Methods', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: DollarSign },
    { id: 'payouts', label: 'Payouts', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payments & Payouts</h1>
              <p className="text-gray-600">Manage your payment methods and view transactions</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-teal-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl p-6 text-white">
                <p className="text-white/80 text-sm mb-1">Available Balance</p>
                <p className="text-3xl font-bold">${balance.available.toLocaleString()}</p>
                <button className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                  Withdraw Funds
                </button>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">Pending Balance</p>
                <p className="text-3xl font-bold text-gray-900">${balance.pending.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-4 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Clears in 2-3 business days
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <p className="text-gray-500 text-sm mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-gray-900">${balance.total.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  +12% this month
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'This Week', value: '$450', change: '+15%' },
                  { label: 'This Month', value: '$2,850', change: '+12%' },
                  { label: 'Last Month', value: '$2,400', change: '+8%' },
                  { label: 'All Time', value: '$24,500', change: null },
                ].map((stat, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{tx.description}</p>
                        <p className="text-sm text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'methods' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Your Payment Methods</h2>
              <button
                onClick={() => setShowAddMethod(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Method
              </button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`bg-white rounded-xl p-4 border ${
                    method.isDefault ? 'border-teal-200 bg-teal-50/50' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        method.type === 'card' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {method.type === 'card' ? (
                          <CreditCard className="w-6 h-6 text-blue-600" />
                        ) : (
                          <Building2 className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {method.name} {method.last4}
                          </p>
                          {method.isDefault && (
                            <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-medium rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        {method.expiry && (
                          <p className="text-sm text-gray-500">Expires {method.expiry}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!method.isDefault && (
                        <button className="px-3 py-1.5 text-sm text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                          Set as default
                        </button>
                      )}
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">Your payment information is secure</p>
                <p className="text-sm text-blue-700 mt-1">
                  We use industry-standard encryption to protect your financial data. 
                  All transactions are processed through secure payment partners.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">Transaction</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getTypeIcon(tx.type)}
                          </div>
                          <span className="font-medium text-gray-900">{tx.description}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{tx.date}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-semibold ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payouts Tab */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Payout Method</p>
                    <p className="text-sm text-gray-500">Where you receive your earnings</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">Chase Bank •••• 9876</span>
                    <button className="text-teal-600 hover:text-teal-700 font-medium text-sm">Change</button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Payout Schedule</p>
                    <p className="text-sm text-gray-500">How often you get paid</p>
                  </div>
                  <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option>Weekly (every Monday)</option>
                    <option>Bi-weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Minimum Payout</p>
                    <p className="text-sm text-gray-500">Only payout when balance exceeds</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">$</span>
                    <input
                      type="number"
                      defaultValue={50}
                      className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Next Payout */}
            <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Next Scheduled Payout</h3>
              <p className="text-3xl font-bold">${balance.available.toLocaleString()}</p>
              <p className="text-white/80 mt-2">
                Will be deposited to Chase Bank •••• 9876 on Monday, Jan 27, 2026
              </p>
            </div>
          </div>
        )}

        {/* Add Payment Method Modal */}
        {showAddMethod && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddMethod(false)} />
            <div className="relative bg-white rounded-2xl p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add Payment Method</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <button className="p-4 border-2 border-teal-500 bg-teal-50 rounded-xl text-center">
                    <CreditCard className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                    <span className="font-medium text-gray-900">Credit Card</span>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-xl text-center hover:border-gray-300 transition-colors">
                    <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <span className="font-medium text-gray-600">Bank Account</span>
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowAddMethod(false)}
                    className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="flex-1 py-3 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors">
                    Add Card
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
