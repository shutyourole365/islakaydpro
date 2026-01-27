import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  Activity,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface MaintenancePredictorProps {
  equipmentId: string;
  equipmentTitle: string;
  category: string;
  hoursUsed: number;
  lastMaintenanceDate: Date;
  onScheduleMaintenance: (date: Date, type: string) => void;
  onClose?: () => void;
}

interface MaintenanceItem {
  id: string;
  component: string;
  status: 'good' | 'attention' | 'critical';
  healthScore: number;
  prediction: string;
  recommendedAction: string;
  daysUntilService: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface UsagePattern {
  date: string;
  hours: number;
  strain: 'low' | 'normal' | 'high';
}

export default function MaintenancePredictor({
  equipmentId,
  equipmentTitle,
  hoursUsed,
  lastMaintenanceDate,
  onScheduleMaintenance,
}: MaintenancePredictorProps) {
  const [loading, setLoading] = useState(true);
  const [overallHealth, setOverallHealth] = useState(0);
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([]);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | null>(null);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  useEffect(() => {
    analyzeEquipment();
  }, [equipmentId]);

  const analyzeEquipment = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate AI analysis
    const mockItems: MaintenanceItem[] = [
      {
        id: '1',
        component: 'Engine Oil',
        status: 'attention',
        healthScore: 65,
        prediction: 'Based on usage patterns, oil change needed in ~12 days',
        recommendedAction: 'Schedule oil change within 2 weeks',
        daysUntilService: 12,
        priority: 'medium',
      },
      {
        id: '2',
        component: 'Hydraulic System',
        status: 'good',
        healthScore: 88,
        prediction: 'Hydraulic fluid levels optimal, next service in 45 days',
        recommendedAction: 'Continue normal operation',
        daysUntilService: 45,
        priority: 'low',
      },
      {
        id: '3',
        component: 'Air Filter',
        status: 'critical',
        healthScore: 32,
        prediction: 'Filter efficiency degraded, affecting performance',
        recommendedAction: 'Replace air filter immediately',
        daysUntilService: 0,
        priority: 'urgent',
      },
      {
        id: '4',
        component: 'Brake Pads',
        status: 'good',
        healthScore: 75,
        prediction: 'Normal wear pattern, service needed in 30 days',
        recommendedAction: 'Monitor during next inspection',
        daysUntilService: 30,
        priority: 'low',
      },
      {
        id: '5',
        component: 'Battery',
        status: 'attention',
        healthScore: 58,
        prediction: 'Battery capacity declining faster than expected',
        recommendedAction: 'Test battery, consider replacement within 20 days',
        daysUntilService: 20,
        priority: 'medium',
      },
      {
        id: '6',
        component: 'Tire Condition',
        status: 'good',
        healthScore: 82,
        prediction: 'Tread depth adequate, rotation recommended',
        recommendedAction: 'Rotate tires at next service',
        daysUntilService: 45,
        priority: 'low',
      },
    ];

    const mockUsage: UsagePattern[] = [
      { date: '2026-01-20', hours: 8, strain: 'normal' },
      { date: '2026-01-21', hours: 10, strain: 'high' },
      { date: '2026-01-22', hours: 6, strain: 'low' },
      { date: '2026-01-23', hours: 9, strain: 'normal' },
      { date: '2026-01-24', hours: 12, strain: 'high' },
      { date: '2026-01-25', hours: 7, strain: 'normal' },
      { date: '2026-01-26', hours: 4, strain: 'low' },
    ];

    setMaintenanceItems(mockItems);
    setUsagePatterns(mockUsage);
    setOverallHealth(Math.round(mockItems.reduce((acc, item) => acc + item.healthScore, 0) / mockItems.length));
    setLoading(false);
  };

  const getStatusColor = (status: MaintenanceItem['status']) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-700';
      case 'attention': return 'bg-amber-100 text-amber-700';
      case 'critical': return 'bg-red-100 text-red-700';
    }
  };

  const getPriorityColor = (priority: MaintenanceItem['priority']) => {
    switch (priority) {
      case 'low': return 'text-gray-500';
      case 'medium': return 'text-amber-600';
      case 'high': return 'text-orange-600';
      case 'urgent': return 'text-red-600';
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const criticalItems = maintenanceItems.filter(item => item.status === 'critical');
  const attentionItems = maintenanceItems.filter(item => item.status === 'attention');

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <div className="absolute inset-0 border-4 border-teal-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin" />
          <Activity className="absolute inset-0 m-auto w-8 h-8 text-teal-600" />
        </div>
        <p className="text-gray-600 font-medium">Analyzing equipment health...</p>
        <p className="text-sm text-gray-400 mt-1">AI is checking {equipmentTitle}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Predictive Maintenance</h2>
              <p className="text-sm text-white/80">{equipmentTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`p-2 rounded-lg transition-colors ${alertsEnabled ? 'bg-white/20' : 'bg-white/10'}`}
          >
            <Bell className={`w-5 h-5 ${alertsEnabled ? 'text-white' : 'text-white/50'}`} />
          </button>
        </div>

        {/* Overall Health Score */}
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="white"
                strokeWidth="10"
                strokeDasharray={`${overallHealth * 2.83} 283`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{overallHealth}%</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-white/80 text-sm mb-1">Overall Equipment Health</p>
            <p className="font-medium">
              {overallHealth >= 80 ? 'Excellent Condition' :
               overallHealth >= 60 ? 'Good - Minor Attention Needed' :
               overallHealth >= 40 ? 'Fair - Service Recommended' :
               'Poor - Immediate Service Required'}
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-white/70">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {hoursUsed} hours used
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Last service: {lastMaintenanceDate.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(criticalItems.length > 0 || attentionItems.length > 0) && (
        <div className="p-4 bg-red-50 border-b border-red-100">
          {criticalItems.length > 0 && (
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">
                  {criticalItems.length} Critical Issue{criticalItems.length > 1 ? 's' : ''} Detected
                </p>
                <p className="text-sm text-red-600">
                  {criticalItems.map(i => i.component).join(', ')} need immediate attention
                </p>
              </div>
            </div>
          )}
          {attentionItems.length > 0 && (
            <div className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">
                  {attentionItems.length} Item{attentionItems.length > 1 ? 's' : ''} Need Attention
                </p>
                <p className="text-sm text-amber-600">
                  {attentionItems.map(i => i.component).join(', ')} - schedule service soon
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Maintenance Items */}
      <div className="p-4 max-h-80 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-3">Component Analysis</h3>
        <div className="space-y-2">
          {maintenanceItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedItem?.id === item.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getStatusColor(item.status)}`}>
                    {item.status === 'good' ? <CheckCircle2 className="w-5 h-5" /> :
                     item.status === 'attention' ? <Clock className="w-5 h-5" /> :
                     <AlertTriangle className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.component}</p>
                    <p className={`text-sm ${getPriorityColor(item.priority)}`}>
                      {item.priority === 'urgent' ? 'Service immediately' :
                       item.daysUntilService === 0 ? 'Service overdue' :
                       `Service in ${item.daysUntilService} days`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${getHealthColor(item.healthScore)}`}>
                    {item.healthScore}%
                  </p>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${
                    selectedItem?.id === item.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>

              {selectedItem?.id === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">AI Prediction</p>
                      <p className="text-sm text-gray-700">{item.prediction}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Recommended Action</p>
                      <p className="text-sm text-gray-700">{item.recommendedAction}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const serviceDate = new Date();
                      serviceDate.setDate(serviceDate.getDate() + Math.max(item.daysUntilService, 1));
                      onScheduleMaintenance(serviceDate, item.component);
                    }}
                    className="w-full py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                  >
                    Schedule {item.component} Service
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage Patterns */}
      <div className="p-4 border-t border-gray-100">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Usage Pattern</h3>
        <div className="flex gap-1 h-16">
          {usagePatterns.map((pattern, index) => (
            <div key={index} className="flex-1 flex flex-col justify-end">
              <div
                className={`rounded-t transition-all ${
                  pattern.strain === 'high' ? 'bg-red-400' :
                  pattern.strain === 'normal' ? 'bg-teal-400' :
                  'bg-green-400'
                }`}
                style={{ height: `${(pattern.hours / 12) * 100}%` }}
              />
              <p className="text-xs text-gray-400 text-center mt-1">
                {new Date(pattern.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-400 rounded" /> Low strain
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-teal-400 rounded" /> Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-400 rounded" /> High strain
          </span>
        </div>
      </div>
    </div>
  );
}
