import { useState } from 'react';
import {
  Bell,
  BellRing,
  Plus,
  Trash2,
  Edit2,
  X,
  TrendingDown,
  DollarSign,
  CheckCircle,
  Calendar,
  MapPin,
  Tag,
  Settings,
  Mail,
  Smartphone,
} from 'lucide-react';

interface PriceAlert {
  id: string;
  equipmentTitle: string;
  equipmentId: string;
  category: string;
  targetPrice: number;
  currentPrice: number;
  location: string;
  createdAt: string;
  lastTriggered?: string;
  isActive: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
}

interface PriceAlertsProps {
  userId: string;
  onClose: () => void;
}

const mockAlerts: PriceAlert[] = [
  {
    id: '1',
    equipmentTitle: 'CAT 320 Excavator',
    equipmentId: 'eq1',
    category: 'Construction',
    targetPrice: 400,
    currentPrice: 450,
    location: 'San Francisco, CA',
    createdAt: '2025-01-15T10:00:00Z',
    isActive: true,
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
  },
  {
    id: '2',
    equipmentTitle: 'John Deere Tractor',
    equipmentId: 'eq2',
    category: 'Agriculture',
    targetPrice: 200,
    currentPrice: 195,
    location: 'Los Angeles, CA',
    createdAt: '2025-01-10T14:30:00Z',
    lastTriggered: '2025-01-20T09:00:00Z',
    isActive: true,
    notifyEmail: true,
    notifyPush: false,
    notifySms: true,
  },
  {
    id: '3',
    equipmentTitle: 'DJ Equipment Package',
    equipmentId: 'eq3',
    category: 'Events',
    targetPrice: 150,
    currentPrice: 295,
    location: 'Miami, FL',
    createdAt: '2025-01-05T16:00:00Z',
    isActive: false,
    notifyEmail: true,
    notifyPush: true,
    notifySms: false,
  },
];

export default function PriceAlerts({ userId, onClose }: PriceAlertsProps) {
  void userId; // For future API integration
  const [alerts, setAlerts] = useState<PriceAlert[]>(mockAlerts);
  const [activeTab, setActiveTab] = useState<'active' | 'triggered' | 'settings'>('active');
  const [isCreating, setIsCreating] = useState(false);
  const [newAlert, setNewAlert] = useState({
    equipmentTitle: '',
    category: '',
    targetPrice: 0,
    location: '',
  });

  const triggeredAlerts = alerts.filter(a => a.currentPrice <= a.targetPrice);
  const activeAlerts = alerts.filter(a => a.isActive && a.currentPrice > a.targetPrice);

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const createAlert = () => {
    const alert: PriceAlert = {
      id: `alert-${Date.now()}`,
      equipmentTitle: newAlert.equipmentTitle,
      equipmentId: `eq-${Date.now()}`,
      category: newAlert.category,
      targetPrice: newAlert.targetPrice,
      currentPrice: newAlert.targetPrice * 1.2,
      location: newAlert.location,
      createdAt: new Date().toISOString(),
      isActive: true,
      notifyEmail: true,
      notifyPush: true,
      notifySms: false,
    };
    setAlerts(prev => [alert, ...prev]);
    setIsCreating(false);
    setNewAlert({ equipmentTitle: '', category: '', targetPrice: 0, location: '' });
  };

  const getPriceStatus = (current: number, target: number) => {
    const diff = ((current - target) / target) * 100;
    if (current <= target) return { status: 'met', color: 'text-green-600', bg: 'bg-green-100' };
    if (diff <= 10) return { status: 'close', color: 'text-amber-600', bg: 'bg-amber-100' };
    return { status: 'above', color: 'text-gray-600', bg: 'bg-gray-100' };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Price Alerts</h2>
              <p className="text-orange-100 text-sm">
                Get notified when prices drop to your target
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{alerts.length}</div>
            <div className="text-xs text-orange-100">Total Alerts</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{activeAlerts.length}</div>
            <div className="text-xs text-orange-100">Active</div>
          </div>
          <div className="bg-white/20 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-green-300">{triggeredAlerts.length}</div>
            <div className="text-xs text-orange-100">Triggered</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          {[
            { id: 'active', label: 'Active', icon: Bell },
            { id: 'triggered', label: 'Triggered', icon: CheckCircle },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'active' | 'triggered' | 'settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-orange-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[50vh]">
        {/* Create Alert Button */}
        {(activeTab === 'active' || activeTab === 'triggered') && !isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full mb-4 p-4 border-2 border-dashed border-orange-200 rounded-xl text-orange-600 hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Price Alert
          </button>
        )}

        {/* Create Alert Form */}
        {isCreating && (
          <div className="mb-6 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <h3 className="font-semibold text-orange-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Price Alert
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Equipment name or search term"
                value={newAlert.equipmentTitle}
                onChange={(e) => setNewAlert(prev => ({ ...prev, equipmentTitle: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newAlert.category}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, category: e.target.value }))}
                  className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Any Category</option>
                  <option value="Construction">Construction</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Events">Events</option>
                  <option value="Tools">Tools</option>
                </select>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="Target Price"
                    value={newAlert.targetPrice || ''}
                    onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: Number(e.target.value) }))}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <input
                type="text"
                placeholder="Location (optional)"
                value={newAlert.location}
                onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={createAlert}
                  disabled={!newAlert.equipmentTitle || !newAlert.targetPrice}
                  className="flex-1 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Alert
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active Alerts */}
        {activeTab === 'active' && (
          <div className="space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active price alerts</p>
                <p className="text-sm">Create an alert to get notified when prices drop</p>
              </div>
            ) : (
              activeAlerts.map(alert => {
                const priceStatus = getPriceStatus(alert.currentPrice, alert.targetPrice);
                return (
                  <div key={alert.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{alert.equipmentTitle}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {alert.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {alert.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAlert(alert.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4 text-gray-400" />
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Target</div>
                          <div className="font-bold text-orange-600">${alert.targetPrice}/day</div>
                        </div>
                        <TrendingDown className="w-5 h-5 text-gray-300" />
                        <div>
                          <div className="text-xs text-gray-500">Current</div>
                          <div className={`font-bold ${priceStatus.color}`}>${alert.currentPrice}/day</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${priceStatus.bg} ${priceStatus.color}`}>
                        {priceStatus.status === 'close' ? 'Almost There!' : `$${alert.currentPrice - alert.targetPrice} above target`}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Triggered Alerts */}
        {activeTab === 'triggered' && (
          <div className="space-y-3">
            {triggeredAlerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No triggered alerts yet</p>
                <p className="text-sm">When prices drop to your target, they'll appear here</p>
              </div>
            ) : (
              triggeredAlerts.map(alert => (
                <div key={alert.id} className="p-4 border-2 border-green-200 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">{alert.equipmentTitle}</h4>
                      <p className="text-sm text-green-700">Price target reached!</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="text-xs text-green-600">Your Target</div>
                        <div className="font-bold text-gray-900">${alert.targetPrice}/day</div>
                      </div>
                      <TrendingDown className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="text-xs text-green-600">Current Price</div>
                        <div className="font-bold text-green-600">${alert.currentPrice}/day</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
                      Book Now
                    </button>
                  </div>
                  {alert.lastTriggered && (
                    <div className="mt-3 text-xs text-green-600 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Triggered on {new Date(alert.lastTriggered).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { id: 'email', label: 'Email Notifications', icon: Mail, description: 'Get alerts via email' },
                  { id: 'push', label: 'Push Notifications', icon: Bell, description: 'Browser and mobile notifications' },
                  { id: 'sms', label: 'SMS Notifications', icon: Smartphone, description: 'Text message alerts' },
                ].map(pref => (
                  <div key={pref.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        <pref.icon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{pref.label}</div>
                        <div className="text-sm text-gray-500">{pref.description}</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Alert Frequency</h3>
              <div className="space-y-2">
                {['Instant', 'Daily digest', 'Weekly summary'].map(freq => (
                  <label key={freq} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                    <input
                      type="radio"
                      name="frequency"
                      defaultChecked={freq === 'Instant'}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">{freq}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
