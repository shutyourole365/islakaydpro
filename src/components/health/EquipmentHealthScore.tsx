import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Wrench,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

type Status = 'Excellent' | 'Good' | 'Fair' | 'Poor';

interface Metric {
  name: string;
  score: number;
  status: Status;
  lastChecked: string;
}

interface EquipmentHealth {
  id: string;
  name: string;
  overallScore: number;
  status: Status;
  trend: 'up' | 'down';
  lastInspection: Date;
  nextMaintenance: Date;
  totalHours: number;
  metrics: Metric[];
}

interface Props {
  onBack: () => void;
}

const STATUS_STYLE: Record<Status, string> = {
  Excellent: 'bg-green-50 text-green-700',
  Good: 'bg-teal-50 text-teal-700',
  Fair: 'bg-amber-50 text-amber-700',
  Poor: 'bg-red-50 text-red-700',
};

function scoreStatus(score: number): Status {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Good';
  if (score >= 70) return 'Fair';
  return 'Poor';
}

const EQUIPMENT: EquipmentHealth[] = [
  {
    id: 'eq1',
    name: 'CAT 320 Excavator',
    overallScore: 94,
    status: 'Excellent',
    trend: 'up',
    lastInspection: new Date(2026, 1, 20),
    nextMaintenance: new Date(2026, 2, 15),
    totalHours: 1247,
    metrics: [
      { name: 'Engine Performance', score: 96, status: 'Excellent', lastChecked: '2026-02-20' },
      { name: 'Hydraulic System', score: 91, status: 'Excellent', lastChecked: '2026-02-20' },
      { name: 'Structural Integrity', score: 98, status: 'Excellent', lastChecked: '2026-02-18' },
      { name: 'Electrical Systems', score: 88, status: 'Good', lastChecked: '2026-02-20' },
      { name: 'Safety Equipment', score: 100, status: 'Excellent', lastChecked: '2026-02-20' },
      { name: 'Operating Temperature', score: 85, status: 'Good', lastChecked: '2026-02-20' },
    ],
  },
  {
    id: 'eq2',
    name: 'John Deere 1025R Tractor',
    overallScore: 82,
    status: 'Good',
    trend: 'up',
    lastInspection: new Date(2026, 1, 10),
    nextMaintenance: new Date(2026, 3, 5),
    totalHours: 860,
    metrics: [
      { name: 'Engine Performance', score: 84, status: 'Good', lastChecked: '2026-02-10' },
      { name: 'Hydraulic System', score: 80, status: 'Good', lastChecked: '2026-02-10' },
      { name: 'Structural Integrity', score: 90, status: 'Excellent', lastChecked: '2026-02-10' },
      { name: 'Electrical Systems', score: 78, status: 'Fair', lastChecked: '2026-02-10' },
      { name: 'Safety Equipment', score: 88, status: 'Good', lastChecked: '2026-02-10' },
      { name: 'Operating Temperature', score: 75, status: 'Fair', lastChecked: '2026-02-10' },
    ],
  },
  {
    id: 'eq3',
    name: 'DeWalt Power Tool Kit',
    overallScore: 68,
    status: 'Fair',
    trend: 'down',
    lastInspection: new Date(2026, 0, 15),
    nextMaintenance: new Date(2026, 2, 1),
    totalHours: 320,
    metrics: [
      { name: 'Battery Health', score: 62, status: 'Poor', lastChecked: '2026-01-15' },
      { name: 'Motor Performance', score: 70, status: 'Fair', lastChecked: '2026-01-15' },
      { name: 'Structural Integrity', score: 85, status: 'Good', lastChecked: '2026-01-15' },
      { name: 'Electrical Systems', score: 65, status: 'Poor', lastChecked: '2026-01-15' },
      { name: 'Safety Equipment', score: 72, status: 'Fair', lastChecked: '2026-01-15' },
      { name: 'Charger Condition', score: 58, status: 'Poor', lastChecked: '2026-01-15' },
    ],
  },
];

export default function EquipmentHealthScore({ onBack }: Props) {
  const [selectedId, setSelectedId] = useState<string>(EQUIPMENT[0].id);
  const selected = useMemo(
    () => EQUIPMENT.find((e) => e.id === selectedId) ?? EQUIPMENT[0],
    [selectedId]
  );

  const needsAttention = selected.metrics.filter((m) => m.score < 80);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="p-2 rounded-full hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipment Health Score</h1>
            <p className="text-sm text-gray-500">
              Track equipment condition and predict maintenance needs.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {EQUIPMENT.map((eq) => {
            const isSelected = eq.id === selected.id;
            return (
              <button
                key={eq.id}
                type="button"
                onClick={() => setSelectedId(eq.id)}
                className={`text-left rounded-2xl border bg-white p-4 transition-colors ${
                  isSelected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{eq.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[eq.status]}`}>
                    {eq.status}
                  </span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{eq.overallScore}</p>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
              <p className="text-sm text-gray-500">
                {selected.status} Condition
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <p className="text-4xl font-bold text-gray-900">{selected.overallScore}</p>
                {selected.trend === 'up' ? (
                  <TrendingUp className="w-5 h-5 text-green-500" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-500" />
                )}
                <span className="text-xs text-gray-500">{selected.trend}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <InfoCell
              icon={<Calendar className="w-4 h-4" />}
              label="Last Inspection"
              value={selected.lastInspection.toLocaleDateString()}
            />
            <InfoCell
              icon={<Wrench className="w-4 h-4" />}
              label="Next Maintenance"
              value={selected.nextMaintenance.toLocaleDateString()}
            />
            <InfoCell
              icon={<Clock className="w-4 h-4" />}
              label="Total Hours"
              value={`${selected.totalHours.toLocaleString()} hrs`}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Detailed Health Metrics</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {selected.metrics.map((m) => (
              <div key={m.name} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900">{m.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${STATUS_STYLE[scoreStatus(m.score)]}`}>
                    {scoreStatus(m.score)}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{m.score}</p>
                <p className="text-xs text-gray-500 mt-2">Checked {m.lastChecked}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Recommendations</h2>
          {needsAttention.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-800">
              <CheckCircle2 className="w-5 h-5" />
              <span>All systems healthy</span>
            </div>
          ) : (
            <div className="space-y-2">
              {needsAttention.map((m) => (
                <div key={m.name} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">
                      {m.name} needs attention
                    </p>
                    <p className="text-xs text-amber-700">
                      Schedule maintenance to restore optimal performance.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-gray-50">
      <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
        {icon}
        {label}
      </div>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}
