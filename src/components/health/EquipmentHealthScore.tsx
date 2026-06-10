import { useState } from 'react';
import { ArrowLeft, Activity, Shield, Wrench, AlertTriangle, CheckCircle, TrendingUp, Clock, Zap, ThermometerSun } from 'lucide-react';

interface EquipmentHealthScoreProps {
  onBack: () => void;
}

interface HealthMetric {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  lastChecked: string;
  icon: React.ReactNode;
}

interface EquipmentHealthData {
  id: string;
  name: string;
  overallScore: number;
  trend: 'up' | 'down' | 'stable';
  lastInspection: string;
  nextMaintenance: string;
  totalHours: number;
  metrics: HealthMetric[];
}

const statusColors = {
  excellent: { bg: 'bg-green-100', text: 'text-green-700', ring: 'ring-green-500', fill: 'bg-green-500' },
  good: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-500', fill: 'bg-blue-500' },
  fair: { bg: 'bg-yellow-100', text: 'text-yellow-700', ring: 'ring-yellow-500', fill: 'bg-yellow-500' },
  poor: { bg: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-500', fill: 'bg-red-500' },
};

const sampleEquipmentHealth: EquipmentHealthData[] = [
  {
    id: '1',
    name: 'CAT 320 Excavator',
    overallScore: 94,
    trend: 'up',
    lastInspection: '2026-02-20',
    nextMaintenance: '2026-03-15',
    totalHours: 1247,
    metrics: [
      { name: 'Engine Performance', score: 96, status: 'excellent', lastChecked: '2026-02-20', icon: <Zap className="w-4 h-4" /> },
      { name: 'Hydraulic System', score: 91, status: 'excellent', lastChecked: '2026-02-18', icon: <Activity className="w-4 h-4" /> },
      { name: 'Structural Integrity', score: 98, status: 'excellent', lastChecked: '2026-02-15', icon: <Shield className="w-4 h-4" /> },
      { name: 'Electrical Systems', score: 88, status: 'good', lastChecked: '2026-02-20', icon: <Zap className="w-4 h-4" /> },
      { name: 'Safety Equipment', score: 100, status: 'excellent', lastChecked: '2026-02-22', icon: <CheckCircle className="w-4 h-4" /> },
      { name: 'Operating Temperature', score: 85, status: 'good', lastChecked: '2026-02-24', icon: <ThermometerSun className="w-4 h-4" /> },
    ],
  },
  {
    id: '2',
    name: 'John Deere 1025R Tractor',
    overallScore: 87,
    trend: 'stable',
    lastInspection: '2026-02-18',
    nextMaintenance: '2026-03-05',
    totalHours: 832,
    metrics: [
      { name: 'Engine Performance', score: 89, status: 'good', lastChecked: '2026-02-18', icon: <Zap className="w-4 h-4" /> },
      { name: 'Hydraulic System', score: 84, status: 'good', lastChecked: '2026-02-16', icon: <Activity className="w-4 h-4" /> },
      { name: 'Structural Integrity', score: 92, status: 'excellent', lastChecked: '2026-02-14', icon: <Shield className="w-4 h-4" /> },
      { name: 'Electrical Systems', score: 86, status: 'good', lastChecked: '2026-02-18', icon: <Zap className="w-4 h-4" /> },
      { name: 'Safety Equipment', score: 95, status: 'excellent', lastChecked: '2026-02-20', icon: <CheckCircle className="w-4 h-4" /> },
      { name: 'Operating Temperature', score: 78, status: 'fair', lastChecked: '2026-02-24', icon: <ThermometerSun className="w-4 h-4" /> },
    ],
  },
  {
    id: '3',
    name: 'DeWalt Power Tool Kit',
    overallScore: 72,
    trend: 'down',
    lastInspection: '2026-02-10',
    nextMaintenance: '2026-02-28',
    totalHours: 456,
    metrics: [
      { name: 'Battery Health', score: 68, status: 'fair', lastChecked: '2026-02-10', icon: <Zap className="w-4 h-4" /> },
      { name: 'Motor Condition', score: 75, status: 'fair', lastChecked: '2026-02-10', icon: <Activity className="w-4 h-4" /> },
      { name: 'Tool Housing', score: 82, status: 'good', lastChecked: '2026-02-08', icon: <Shield className="w-4 h-4" /> },
      { name: 'Chuck/Blade Wear', score: 65, status: 'fair', lastChecked: '2026-02-10', icon: <Wrench className="w-4 h-4" /> },
      { name: 'Safety Features', score: 90, status: 'excellent', lastChecked: '2026-02-12', icon: <CheckCircle className="w-4 h-4" /> },
      { name: 'Charger Status', score: 52, status: 'poor', lastChecked: '2026-02-24', icon: <AlertTriangle className="w-4 h-4" /> },
    ],
  },
];

function ScoreRing({ score, size = 'lg' }: { score: number; size?: 'sm' | 'md' | 'lg' }) {
  const radius = size === 'lg' ? 54 : size === 'md' ? 40 : 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const svgSize = size === 'lg' ? 128 : size === 'md' ? 96 : 64;
  const strokeWidth = size === 'lg' ? 8 : 6;
  const color = score >= 90 ? '#22c55e' : score >= 75 ? '#3b82f6' : score >= 60 ? '#eab308' : '#ef4444';
  const fontSize = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-sm';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        <circle cx={svgSize / 2} cy={svgSize / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} />
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className={`absolute ${fontSize} font-bold`} style={{ color }}>{score}</span>
    </div>
  );
}

export default function EquipmentHealthScore({ onBack }: EquipmentHealthScoreProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentHealthData>(sampleEquipmentHealth[0]);

  const getOverallStatus = (score: number) => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  };

  const overallStatus = getOverallStatus(selectedEquipment.overallScore);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2 hover:bg-gray-200 rounded-full transition-colors" aria-label="Go back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Health Score</h1>
            <p className="text-gray-500 mt-1">Monitor equipment condition and maintenance status in real-time</p>
          </div>
        </div>

        {/* Equipment Selector */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {sampleEquipmentHealth.map((eq) => {
            const status = getOverallStatus(eq.overallScore);
            return (
              <button
                key={eq.id}
                onClick={() => setSelectedEquipment(eq)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap ${
                  selectedEquipment.id === eq.id
                    ? 'border-teal-500 bg-teal-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <ScoreRing score={eq.overallScore} size="sm" />
                <div className="text-left">
                  <p className="font-semibold text-sm">{eq.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status].bg} ${statusColors[status].text}`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Score Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="text-center mb-6">
                <ScoreRing score={selectedEquipment.overallScore} size="lg" />
                <h2 className="text-xl font-bold mt-4">{selectedEquipment.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[overallStatus].bg} ${statusColors[overallStatus].text}`}>
                    {overallStatus.charAt(0).toUpperCase() + overallStatus.slice(1)} Condition
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    {selectedEquipment.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {selectedEquipment.trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
                    {selectedEquipment.trend === 'stable' && <Activity className="w-4 h-4 text-blue-500" />}
                    {selectedEquipment.trend}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Last Inspection
                  </span>
                  <span className="text-sm font-medium">{new Date(selectedEquipment.lastInspection).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Wrench className="w-4 h-4" /> Next Maintenance
                  </span>
                  <span className="text-sm font-medium">{new Date(selectedEquipment.nextMaintenance).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-gray-100">
                  <span className="text-sm text-gray-500 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Total Hours
                  </span>
                  <span className="text-sm font-medium">{selectedEquipment.totalHours.toLocaleString()} hrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Metrics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4">Detailed Health Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedEquipment.metrics.map((metric) => (
                  <div
                    key={metric.name}
                    className={`p-4 rounded-xl border-2 ${statusColors[metric.status].bg} border-opacity-50`}
                    style={{ borderColor: `${statusColors[metric.status].fill.replace('bg-', '')}20` }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={statusColors[metric.status].text}>{metric.icon}</span>
                        <span className="font-medium text-sm text-gray-900">{metric.name}</span>
                      </div>
                      <ScoreRing score={metric.score} size="sm" />
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className={`h-2 rounded-full ${statusColors[metric.status].fill} transition-all duration-500`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-medium ${statusColors[metric.status].text}`}>
                        {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        Checked {new Date(metric.lastChecked).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Recommendations */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
              <h3 className="text-lg font-bold mb-4">Maintenance Recommendations</h3>
              <div className="space-y-3">
                {selectedEquipment.metrics
                  .filter((m) => m.score < 80)
                  .map((metric) => (
                    <div key={metric.name} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-amber-800">{metric.name} needs attention</p>
                        <p className="text-xs text-amber-600 mt-1">
                          Score is {metric.score}/100. Schedule maintenance to prevent further degradation.
                        </p>
                      </div>
                    </div>
                  ))}
                {selectedEquipment.metrics.filter((m) => m.score < 80).length === 0 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-green-800">All systems healthy</p>
                      <p className="text-xs text-green-600 mt-1">No immediate maintenance required. Next scheduled check on {new Date(selectedEquipment.nextMaintenance).toLocaleDateString()}.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
