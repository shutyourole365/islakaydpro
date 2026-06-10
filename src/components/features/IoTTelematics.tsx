import { ArrowLeft, Cpu, Activity, BarChart3, Bell, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';

interface EquipmentTelemetry {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'maintenance' | 'offline';
  location: string;
  temperature: number;
  hoursUsed: number;
  batteryLevel: number;
  alerts: string[];
  lastUpdate: string;
}

interface IoTTelematicsProps {
  onBack: () => void;
}

const mockTelemetry: EquipmentTelemetry[] = [
  {
    id: 'eq1',
    name: 'CAT 320 Excavator',
    status: 'active',
    location: 'Site A',
    temperature: 68,
    hoursUsed: 1240,
    batteryLevel: 92,
    alerts: ['Low hydraulic fluid'],
    lastUpdate: '2026-02-15 14:22',
  },
  {
    id: 'eq2',
    name: 'Honda EU3000is Generator',
    status: 'idle',
    location: 'Warehouse',
    temperature: 72,
    hoursUsed: 540,
    batteryLevel: 100,
    alerts: [],
    lastUpdate: '2026-02-15 13:55',
  },
  {
    id: 'eq3',
    name: 'Bobcat S650 Loader',
    status: 'maintenance',
    location: 'Site B',
    temperature: 80,
    hoursUsed: 2100,
    batteryLevel: 60,
    alerts: ['Scheduled maintenance'],
    lastUpdate: '2026-02-15 12:40',
  },
  {
    id: 'eq4',
    name: 'DJI Phantom Drone',
    status: 'offline',
    location: 'Site C',
    temperature: 65,
    hoursUsed: 320,
    batteryLevel: 0,
    alerts: ['Battery depleted'],
    lastUpdate: '2026-02-15 11:10',
  },
];

export default function IoTTelematics({ onBack }: IoTTelematicsProps) {
  const [telemetry, setTelemetry] = useState<EquipmentTelemetry[]>(mockTelemetry);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setTelemetry(prev => prev.map(eq => ({
        ...eq,
        temperature: eq.temperature + (Math.random() - 0.5) * 2,
        batteryLevel: Math.max(0, Math.min(100, eq.batteryLevel + (Math.random() - 0.5) * 1)),
        hoursUsed: eq.hoursUsed + 0.01,
        lastUpdate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const selectedEq = telemetry.find(eq => eq.id === selectedId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Features
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">IoT Telematics Integration</h1>
                <p className="text-blue-100">Real-time equipment monitoring & predictive maintenance</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowAlerts(!showAlerts)}
                variant="outline"
                className="flex items-center gap-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Bell className="w-4 h-4" />
                {showAlerts ? 'Hide Alerts' : 'Show Alerts'}
              </Button>
            </div>
          </div>

          <div className="p-8">
            {/* Equipment List */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Connected Equipment</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {telemetry.map(eq => (
                  <div
                    key={eq.id}
                    className={`p-4 rounded-lg border cursor-pointer ${selectedId === eq.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 bg-white'} transition-all`}
                    onClick={() => setSelectedId(eq.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-gray-900">{eq.name}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        eq.status === 'active' ? 'bg-green-100 text-green-700' :
                        eq.status === 'idle' ? 'bg-yellow-100 text-yellow-700' :
                        eq.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{eq.status}</span>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>Location: {eq.location}</span>
                      <span>Battery: {eq.batteryLevel.toFixed(0)}%</span>
                      <span>Temp: {eq.temperature.toFixed(1)}°F</span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">Last update: {eq.lastUpdate}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Details */}
            {selectedEq && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900 text-lg">{selectedEq.name}</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEq.status === 'active' ? 'bg-green-100 text-green-700' :
                    selectedEq.status === 'idle' ? 'bg-yellow-100 text-yellow-700' :
                    selectedEq.status === 'maintenance' ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>{selectedEq.status}</span>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="mb-2 text-sm text-gray-700">Location: <span className="font-semibold">{selectedEq.location}</span></div>
                    <div className="mb-2 text-sm text-gray-700">Temperature: <span className="font-semibold">{selectedEq.temperature.toFixed(1)}°F</span></div>
                    <div className="mb-2 text-sm text-gray-700">Battery Level: <span className="font-semibold">{selectedEq.batteryLevel.toFixed(0)}%</span></div>
                    <div className="mb-2 text-sm text-gray-700">Hours Used: <span className="font-semibold">{selectedEq.hoursUsed.toFixed(1)}</span></div>
                  </div>
                  <div>
                    <div className="mb-2 text-sm text-gray-700">Alerts:</div>
                    {selectedEq.alerts.length === 0 ? (
                      <div className="text-xs text-gray-400">No alerts</div>
                    ) : (
                      <ul className="list-disc pl-5 text-xs text-red-600">
                        {selectedEq.alerts.map((alert, idx) => (
                          <li key={idx}>{alert}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-400">Last update: {selectedEq.lastUpdate}</div>
              </div>
            )}

            {/* Predictive Maintenance */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Predictive Maintenance</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {telemetry.map(eq => (
                  <div key={eq.id} className="p-4 rounded-lg border border-gray-200 bg-white">
                    <BarChart3 className="w-5 h-5 text-blue-500 mb-2" />
                    <div className="text-sm text-gray-700 mb-1">{eq.name}</div>
                    <div className="text-xs text-gray-500 mb-1">Hours Used: {eq.hoursUsed.toFixed(1)}</div>
                    <div className="text-xs text-gray-500 mb-1">Battery: {eq.batteryLevel.toFixed(0)}%</div>
                    <div className="text-xs text-gray-500 mb-1">Status: {eq.status}</div>
                    <div className="text-xs text-gray-400">Last update: {eq.lastUpdate}</div>
                    {eq.status === 'maintenance' && (
                      <div className="mt-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">Scheduled maintenance</div>
                    )}
                    {eq.alerts.length > 0 && (
                      <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">{eq.alerts[0]}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Capabilities */}
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">What IoT Telematics Can Do:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Real-time equipment status monitoring</li>
                  <li>• Location tracking and geofencing</li>
                  <li>• Battery and temperature analytics</li>
                  <li>• Predictive maintenance scheduling</li>
                </ul>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Automated alerts for issues</li>
                  <li>• Usage analytics and reporting</li>
                  <li>• Integration with equipment sensors</li>
                  <li>• Remote diagnostics and control</li>
                </ul>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Cpu className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Sensor Integration</h3>
                <p className="text-sm text-gray-600">Connects to equipment sensors for real-time data</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Predictive Analytics</h3>
                <p className="text-sm text-gray-600">AI-driven maintenance and usage predictions</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Automated Alerts</h3>
                <p className="text-sm text-gray-600">Instant notifications for issues and maintenance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
