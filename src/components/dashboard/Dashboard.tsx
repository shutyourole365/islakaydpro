import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Calendar,
  Heart,
  MessageSquare,
  Settings,
  Bell,
  User,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Plus,
  TrendingUp,
  DollarSign,
  Eye,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { Equipment, Booking } from '../../types';

interface DashboardProps {
  onBack: () => void;
  onEquipmentClick: (equipment: Equipment) => void;
  onListEquipment: () => void;
  favorites: Set<string>;
  equipment: Equipment[];
  onRemoveFavorite: (id: string) => void;
}

type TabType = 'overview' | 'bookings' | 'listings' | 'favorites' | 'messages' | 'settings';

const sampleBookings: Booking[] = [
  {
    id: '1',
    equipment_id: '1',
    renter_id: 'user1',
    owner_id: 'owner1',
    start_date: '2024-02-15',
    end_date: '2024-02-20',
    total_days: 5,
    daily_rate: 450,
    subtotal: 2250,
    service_fee: 270,
    deposit_amount: 2000,
    total_amount: 4520,
    status: 'confirmed',
    payment_status: 'paid',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    equipment_id: '2',
    renter_id: 'user1',
    owner_id: 'owner2',
    start_date: '2024-02-10',
    end_date: '2024-02-12',
    total_days: 2,
    daily_rate: 125,
    subtotal: 250,
    service_fee: 30,
    deposit_amount: 500,
    total_amount: 780,
    status: 'completed',
    payment_status: 'paid',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    equipment_id: '3',
    renter_id: 'user1',
    owner_id: 'owner3',
    start_date: '2024-03-01',
    end_date: '2024-03-05',
    total_days: 4,
    daily_rate: 75,
    subtotal: 300,
    service_fee: 36,
    deposit_amount: 300,
    total_amount: 636,
    status: 'pending',
    payment_status: 'pending',
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function Dashboard({
  onBack,
  onEquipmentClick,
  onListEquipment,
  favorites,
  equipment,
  onRemoveFavorite,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const favoriteEquipment = equipment.filter((item) => favorites.has(item.id));

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    { id: 'listings', label: 'My Listings', icon: Package },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Active Bookings', value: '2', icon: Calendar, color: 'bg-blue-500' },
    { label: 'Total Spent', value: '$5,936', icon: DollarSign, color: 'bg-green-500' },
    { label: 'Saved Items', value: favorites.size.toString(), icon: Heart, color: 'bg-red-500' },
    { label: 'Reviews Given', value: '8', icon: Star, color: 'bg-amber-500' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Manage your rentals, listings, and account</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                  J
                </div>
                <div>
                  <p className="font-semibold text-gray-900">John Doe</p>
                  <p className="text-sm text-gray-500">Member since 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>4.9 rating (12 reviews)</span>
              </div>
            </div>

            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-teal-50 text-teal-700 border-l-4 border-teal-500'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                      <div
                        className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4`}
                      >
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                    <button
                      onClick={() => setActiveTab('bookings')}
                      className="text-teal-600 text-sm font-medium hover:text-teal-700"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {sampleBookings.slice(0, 2).map((booking) => {
                      const equipmentItem = equipment.find(
                        (e) => e.id === booking.equipment_id
                      );
                      return (
                        <div
                          key={booking.id}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                        >
                          <img
                            src={equipmentItem?.images[0] || ''}
                            alt=""
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {equipmentItem?.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.start_date} - {booking.end_date}
                            </p>
                          </div>
                          {getStatusBadge(booking.status)}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-8 text-white">
                  <h2 className="text-xl font-bold mb-2">Start Earning Today</h2>
                  <p className="text-white/80 mb-6">
                    List your equipment and earn extra income when you're not using it.
                  </p>
                  <button
                    onClick={onListEquipment}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    List Equipment
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">My Bookings</h2>
                </div>
                <div className="divide-y divide-gray-100">
                  {sampleBookings.map((booking) => {
                    const equipmentItem = equipment.find(
                      (e) => e.id === booking.equipment_id
                    );
                    return (
                      <div key={booking.id} className="p-6">
                        <div className="flex items-start gap-4">
                          <img
                            src={equipmentItem?.images[0] || ''}
                            alt=""
                            className="w-24 h-24 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {equipmentItem?.title}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1.5">
                                  <MapPin className="w-4 h-4" />
                                  {equipmentItem?.location}
                                </p>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" />
                                {booking.start_date} - {booking.end_date}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {booking.total_days} days
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-semibold text-gray-900">
                                ${booking.total_amount.toFixed(2)}
                              </p>
                              <button
                                onClick={() => equipmentItem && onEquipmentClick(equipmentItem)}
                                className="flex items-center gap-2 px-4 py-2 text-teal-600 font-medium hover:bg-teal-50 rounded-xl transition-colors"
                              >
                                View Details
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'listings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
                  <button
                    onClick={onListEquipment}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white font-medium rounded-xl hover:bg-teal-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Listing
                  </button>
                </div>

                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Package className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No listings yet
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Start earning money by listing your equipment. It's free to list and
                    you set your own prices.
                  </p>
                  <button
                    onClick={onListEquipment}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Listing
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Saved Equipment ({favoriteEquipment.length})
                </h2>

                {favoriteEquipment.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No favorites yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Save equipment you're interested in to easily find them later
                    </p>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors"
                    >
                      Browse Equipment
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteEquipment.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 flex"
                      >
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-32 h-32 object-cover"
                        />
                        <div className="flex-1 p-4">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">{item.location}</p>
                          <p className="font-semibold text-gray-900 mb-3">
                            ${item.daily_rate}/day
                          </p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onEquipmentClick(item)}
                              className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => onRemoveFavorite(item.id)}
                              className="px-4 py-2 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
                </div>
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-600">
                    When you contact equipment owners or receive inquiries, they'll appear
                    here
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Account Settings
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold">
                        J
                      </div>
                      <div>
                        <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          Change Photo
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue="John Doe"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="john@example.com"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Location
                        </label>
                        <input
                          type="text"
                          placeholder="City, State"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Bio
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about yourself..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal-500 resize-none"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button className="px-6 py-3 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {[
                      { label: 'Email notifications for new messages', checked: true },
                      { label: 'Email notifications for booking updates', checked: true },
                      { label: 'Marketing and promotional emails', checked: false },
                      { label: 'SMS notifications', checked: false },
                    ].map((item, index) => (
                      <label
                        key={index}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer"
                      >
                        <span className="text-gray-700">{item.label}</span>
                        <input
                          type="checkbox"
                          defaultChecked={item.checked}
                          className="w-5 h-5 rounded border-gray-300 text-teal-500 focus:ring-teal-500"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
