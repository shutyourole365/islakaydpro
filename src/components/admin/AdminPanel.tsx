import { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Package,
  DollarSign,
  Flag,
  Shield,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Ban,
  Edit,
  Mail,
  Activity,
  Clock,
} from 'lucide-react';

interface AdminPanelProps {
  onBack: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'suspended' | 'banned';
  verified: boolean;
  joinDate: string;
  listings: number;
  bookings: number;
}

interface Report {
  id: string;
  type: 'equipment' | 'user' | 'booking';
  reason: string;
  reporter: string;
  reported: string;
  status: 'pending' | 'resolved' | 'dismissed';
  date: string;
}

export default function AdminPanel({ onBack }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'equipment' | 'reports' | 'settings'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const platformStats = [
    { label: 'Total Users', value: '12,458', change: '+234', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Listings', value: '3,847', change: '+89', icon: Package, color: 'bg-green-100 text-green-600' },
    { label: 'Monthly Revenue', value: '$284,500', change: '+12.4%', icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
    { label: 'Pending Reports', value: '23', change: '-5', icon: Flag, color: 'bg-red-100 text-red-600' },
  ];

  const users: User[] = [
    { id: '1', name: 'John Smith', email: 'john@example.com', status: 'active', verified: true, joinDate: '2024-06-15', listings: 5, bookings: 12 },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', status: 'active', verified: true, joinDate: '2024-08-22', listings: 3, bookings: 28 },
    { id: '3', name: 'Mike Wilson', email: 'mike@example.com', status: 'suspended', verified: false, joinDate: '2025-01-10', listings: 0, bookings: 2 },
    { id: '4', name: 'Emily Davis', email: 'emily@example.com', status: 'active', verified: true, joinDate: '2024-03-05', listings: 8, bookings: 45 },
    { id: '5', name: 'Robert Brown', email: 'robert@example.com', status: 'banned', verified: false, joinDate: '2024-11-20', listings: 1, bookings: 0 },
  ];

  const reports: Report[] = [
    { id: '1', type: 'equipment', reason: 'Misleading description', reporter: 'User123', reported: 'Excavator XL200', status: 'pending', date: '2026-01-22' },
    { id: '2', type: 'user', reason: 'Fraudulent activity', reporter: 'User456', reported: 'Mike Wilson', status: 'pending', date: '2026-01-21' },
    { id: '3', type: 'booking', reason: 'No-show', reporter: 'OwnerABC', reported: 'Booking #12345', status: 'resolved', date: '2026-01-20' },
    { id: '4', type: 'equipment', reason: 'Damaged equipment', reporter: 'User789', reported: 'Camera Kit Pro', status: 'dismissed', date: '2026-01-19' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'equipment', label: 'Equipment', icon: Package },
    { id: 'reports', label: 'Reports', icon: Flag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'suspended':
        return 'bg-amber-100 text-amber-700';
      case 'banned':
        return 'bg-red-100 text-red-700';
    }
  };

  const getReportStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'resolved':
        return 'bg-green-100 text-green-700';
      case 'dismissed':
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Admin Panel
                <Shield className="w-6 h-6 text-teal-500" />
              </h1>
              <p className="text-gray-600">Manage users, content, and platform settings</p>
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
                  ? 'bg-gray-900 text-white'
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
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformStats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <span className={`text-sm font-medium ${
                      stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 transition-all text-left">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Verify Users</h3>
                  <p className="text-sm text-gray-500">15 pending verifications</p>
                </div>
              </button>

              <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 transition-all text-left">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Review Listings</h3>
                  <p className="text-sm text-gray-500">8 awaiting approval</p>
                </div>
              </button>

              <button className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-teal-200 transition-all text-left">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Flag className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Handle Reports</h3>
                  <p className="text-sm text-gray-500">23 open reports</p>
                </div>
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {[
                  { action: 'New user registered', detail: 'john.doe@email.com', time: '2 min ago', icon: Users },
                  { action: 'Equipment listed', detail: 'Professional Camera Kit', time: '15 min ago', icon: Package },
                  { action: 'Report resolved', detail: 'Misleading description case', time: '1 hour ago', icon: CheckCircle2 },
                  { action: 'User verified', detail: 'Sarah Johnson', time: '2 hours ago', icon: Shield },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                      <activity.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.detail}</p>
                    </div>
                    <span className="text-sm text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Verified</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                    <th className="px-6 py-4 font-medium">Listings</th>
                    <th className="px-6 py-4 font-medium">Bookings</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.verified ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{user.joinDate}</td>
                      <td className="px-6 py-4 text-gray-600">{user.listings}</td>
                      <td className="px-6 py-4 text-gray-600">{user.bookings}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="Email">
                            <Mail className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg" title="Ban">
                            <Ban className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Reason</th>
                    <th className="px-6 py-4 font-medium">Reporter</th>
                    <th className="px-6 py-4 font-medium">Reported</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="capitalize text-gray-900 font-medium">{report.type}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.reason}</td>
                      <td className="px-6 py-4 text-gray-600">{report.reporter}</td>
                      <td className="px-6 py-4 text-gray-600">{report.reported}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getReportStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button className="p-2 hover:bg-gray-100 rounded-lg" title="View">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-green-50 rounded-lg" title="Resolve">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg" title="Dismiss">
                            <XCircle className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Service Fee Rate</p>
                    <p className="text-sm text-gray-500">Platform fee charged on bookings</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={12}
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Require Verification</p>
                    <p className="text-sm text-gray-500">Users must verify identity to list equipment</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-teal-500 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Auto-approve Listings</p>
                    <p className="text-sm text-gray-500">Verified users can list without review</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-teal-500 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900">Maintenance Mode</p>
                    <p className="text-sm text-gray-500">Take the platform offline for maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-checked:bg-red-500 rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Equipment Tab Placeholder */}
        {activeTab === 'equipment' && (
          <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Equipment Management</h2>
            <p className="text-gray-500">View and manage all equipment listings on the platform.</p>
          </div>
        )}
      </div>
    </div>
  );
}
