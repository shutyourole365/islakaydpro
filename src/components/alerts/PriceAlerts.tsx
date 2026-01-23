import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  TrendingDown,
  DollarSign,
  Check,
  X,
  Plus,
  Trash2,
  ChevronRight,
  AlertCircle,
  Sparkles,
  Target,
  Clock,
  Zap,
} from 'lucide-react';
import type { Equipment } from '../../types';

interface PriceAlert {
  id: string;
  equipmentId: string;
  equipmentTitle: string;
  equipmentImage: string;
  currentPrice: number;
  targetPrice: number;
  createdAt: Date;
  isActive: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  triggered?: boolean;
  triggeredAt?: Date;
}

interface PriceAlertsProps {
  equipment?: Equipment;
  existingAlerts?: PriceAlert[];
  onCreateAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt'>) => void;
  onDeleteAlert: (alertId: string) => void;
  onToggleAlert: (alertId: string, isActive: boolean) => void;
  className?: string;
}

const sampleAlerts: PriceAlert[] = [
  {
    id: '1',
    equipmentId: 'eq1',
    equipmentTitle: 'CAT 320 Excavator',
    equipmentImage: 'https://images.pexels.com/photos/2058128/pexels-photo-2058128.jpeg',
    currentPrice: 450,
    targetPrice: 380,
    createdAt: new Date(Date.now() - 86400000 * 3),
    isActive: true,
    notifyEmail: true,
    notifyPush: true,
  },
  {
    id: '2',
    equipmentId: 'eq2',
    equipmentTitle: 'Sony A7IV Camera Kit',
    equipmentImage: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg',
    currentPrice: 125,
    targetPrice: 100,
    createdAt: new Date(Date.now() - 86400000 * 7),
    isActive: true,
    notifyEmail: true,
    notifyPush: false,
    triggered: true,
    triggeredAt: new Date(Date.now() - 3600000),
  },
  {
    id: '3',
    equipmentId: 'eq3',
    equipmentTitle: 'DeWalt Power Tool Kit',
    equipmentImage: 'https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg',
    currentPrice: 75,
    targetPrice: 60,
    createdAt: new Date(Date.now() - 86400000 * 14),
    isActive: false,
    notifyEmail: true,
    notifyPush: true,
  },
];

export default function PriceAlerts({
  equipment,
  existingAlerts = sampleAlerts,
  onCreateAlert,
  onDeleteAlert,
  onToggleAlert,
  className = '',
}: PriceAlertsProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(existingAlerts);
  const [isCreating, setIsCreating] = useState(!!equipment);
  const [newAlert, setNewAlert] = useState({
    targetPrice: equipment ? Math.floor(equipment.daily_rate * 0.8) : 0,
    notifyEmail: true,
    notifyPush: true,
  });
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate price drop percentage
  const getDropPercentage = (current: number, target: number) => {
    return Math.round(((current - target) / current) * 100);
  };

  const handleCreateAlert = () => {
    if (!equipment) return;

    const alert: PriceAlert = {
      id: Date.now().toString(),
      equipmentId: equipment.id,
      equipmentTitle: equipment.title,
      equipmentImage: equipment.images[0],
      currentPrice: equipment.daily_rate,
      targetPrice: newAlert.targetPrice,
      createdAt: new Date(),
      isActive: true,
      notifyEmail: newAlert.notifyEmail,
      notifyPush: newAlert.notifyPush,
    };

    setAlerts(prev => [alert, ...prev]);
    onCreateAlert(alert);
    setIsCreating(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    onDeleteAlert(id);
  };

  const handleToggleAlert = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      onToggleAlert(id, !alert.isActive);
    }
  };

  const activeAlertsCount = alerts.filter(a => a.isActive).length;
  const triggeredAlertsCount = alerts.filter(a => a.triggered).length;

  return (
    <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Price Alerts</h2>
              <p className="text-white/80 text-sm">Get notified when prices drop</p>
            </div>
          </div>
          
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Alert
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{alerts.length}</div>
            <div className="text-xs text-white/70">Total Alerts</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{activeAlertsCount}</div>
            <div className="text-xs text-white/70">Active</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold">{triggeredAlertsCount}</div>
            <div className="text-xs text-white/70">Triggered</div>
          </div>
        </div>
      </div>

      {/* Success notification */}
      {showSuccess && (
        <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-900">Alert Created!</p>
            <p className="text-sm text-green-600">We'll notify you when the price drops</p>
          </div>
        </div>
      )}

      {/* Create new alert form */}
      {isCreating && equipment && (
        <div className="p-4 border-b border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-4 mb-4">
              <img
                src={equipment.images[0]}
                alt={equipment.title}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{equipment.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-gray-900">${equipment.daily_rate}</span>
                  <span className="text-gray-500">/day</span>
                </div>
              </div>
            </div>

            {/* Target price slider */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Target Price</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-orange-600">${newAlert.targetPrice}</span>
                  <span className="text-sm text-gray-500">/day</span>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    {getDropPercentage(equipment.daily_rate, newAlert.targetPrice)}% off
                  </span>
                </div>
              </div>
              <input
                type="range"
                min={Math.floor(equipment.daily_rate * 0.5)}
                max={equipment.daily_rate - 1}
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: Number(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-orange-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>50% off (${Math.floor(equipment.daily_rate * 0.5)})</span>
                <span>Current (${equipment.daily_rate})</span>
              </div>
            </div>

            {/* Notification options */}
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAlert.notifyEmail}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, notifyEmail: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Email</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newAlert.notifyPush}
                  onChange={(e) => setNewAlert(prev => ({ ...prev, notifyPush: e.target.checked }))}
                  className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Push Notification</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateAlert}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                <Bell className="w-5 h-5" />
                Create Alert
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts list */}
      <div className="divide-y divide-gray-100">
        {alerts.length > 0 ? (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-4 flex items-center gap-4 transition-colors ${
                alert.triggered ? 'bg-green-50' : alert.isActive ? '' : 'bg-gray-50 opacity-60'
              }`}
            >
              <div className="relative">
                <img
                  src={alert.equipmentImage}
                  alt={alert.equipmentTitle}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                {alert.triggered && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">{alert.equipmentTitle}</h4>
                
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">{alert.currentPrice}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <span className={`font-semibold ${alert.triggered ? 'text-green-600' : 'text-orange-600'}`}>
                      ${alert.targetPrice}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                    {getDropPercentage(alert.currentPrice, alert.targetPrice)}% off
                  </span>
                </div>

                {alert.triggered && alert.triggeredAt && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-sm text-green-600">
                    <Zap className="w-4 h-4" />
                    Price dropped! {new Date(alert.triggeredAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAlert(alert.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    alert.isActive
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                  title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                >
                  {alert.isActive ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                  title="Delete alert"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No price alerts yet</h3>
            <p className="text-gray-500 mb-4">Create alerts to get notified when prices drop</p>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Create Your First Alert
            </button>
          </div>
        )}
      </div>

      {/* Pro tip */}
      {alerts.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Pro Tip</p>
              <p className="text-sm text-gray-600">
                Set alerts for 15-25% below current prices for the best chance of getting notified about genuine deals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
