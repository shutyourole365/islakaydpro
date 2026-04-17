import { useMemo } from 'react';
import { X, Wrench, AlertTriangle, CheckCircle2, Calendar, Clock } from 'lucide-react';

interface MaintenancePredictorProps {
  equipmentId: string;
  equipmentTitle: string;
  category: string;
  hoursUsed: number;
  lastMaintenanceDate: Date;
  onScheduleMaintenance: () => void;
  onClose: () => void;
}

export default function MaintenancePredictor({
  equipmentTitle,
  category,
  hoursUsed,
  lastMaintenanceDate,
  onScheduleMaintenance,
  onClose,
}: MaintenancePredictorProps) {
  const daysSince = useMemo(() => {
    const diff = Date.now() - lastMaintenanceDate.getTime();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  }, [lastMaintenanceDate]);

  const riskLevel: 'low' | 'medium' | 'high' = hoursUsed > 750 || daysSince > 90
    ? 'high'
    : hoursUsed > 400 || daysSince > 30
      ? 'medium'
      : 'low';

  const riskColor = riskLevel === 'high'
    ? 'bg-red-50 text-red-700 border-red-200'
    : riskLevel === 'medium'
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-green-50 text-green-700 border-green-200';

  const RiskIcon = riskLevel === 'low' ? CheckCircle2 : AlertTriangle;

  const nextDue = new Date(lastMaintenanceDate);
  nextDue.setDate(nextDue.getDate() + 90);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Wrench className="w-6 h-6 text-teal-600" />
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Predictor</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm text-gray-500">Equipment</p>
            <p className="text-base font-semibold text-gray-900">{equipmentTitle}</p>
            {category && <p className="text-sm text-gray-500 mt-1">Category: {category}</p>}
          </div>

          <div className={`flex items-start gap-3 p-4 rounded-2xl border ${riskColor}`}>
            <RiskIcon className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-semibold capitalize">{riskLevel} risk</p>
              <p className="text-sm mt-1">
                Based on usage of {hoursUsed} hours and {daysSince} days since last service.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Clock className="w-4 h-4" />
                Hours used
              </div>
              <p className="text-2xl font-bold text-gray-900">{hoursUsed}</p>
            </div>
            <div className="p-4 rounded-2xl bg-gray-50">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Next due
              </div>
              <p className="text-base font-semibold text-gray-900">
                {nextDue.toLocaleDateString()}
              </p>
            </div>
          </div>

          <button
            onClick={onScheduleMaintenance}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-shadow"
          >
            Schedule Maintenance
          </button>
        </div>
      </div>
    </div>
  );
}
