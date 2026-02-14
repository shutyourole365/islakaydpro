import { useState, useEffect, useCallback } from 'react';
import { MapPin, Battery, Wifi, WifiOff, AlertTriangle, CheckCircle, Activity, Thermometer, Gauge } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEquipment } from '../../services/database';
import type { Equipment } from '../../types';

interface IoTDevice {
  id: string;
  equipmentId: string;
  deviceType: 'gps' | 'sensor' | 'lock' | 'camera';
  status: 'online' | 'offline' | 'maintenance' | 'error';
  batteryLevel: number;
  lastSeen: Date;
  location?: {
    lat: number;
    lng: number;
    accuracy: number;
  };
  sensors?: {
    temperature?: number;
    vibration?: number;
    fuel?: number;
    usage?: number;
  };
  alerts: IoTAlert[];
}

interface IoTAlert {
  id: string;
  type: 'battery' | 'location' | 'sensor' | 'maintenance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export default function IoTEquipmentMonitor() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'alerts'>('overview');

  useEffect(() => {
    if (user) {
      loadIoTDevices();
    }
  }, [user]);

  const loadIoTDevices = async () => {
    if (!user) return;

    try {
      const equipmentData = await getEquipment({ ownerId: user.id });
      const equipment = Array.isArray(equipmentData) ? equipmentData : equipmentData.data || [];

      // Simulate IoT devices (in real app, this would come from IoT service)
      const mockDevices: IoTDevice[] = equipment.slice(0, 8).map((eq: Equipment, index: number) => ({
        id: `iot-${eq.id}`,
        equipmentId: eq.id,
        deviceType: ['gps', 'sensor', 'lock', 'camera'][index % 4] as any,
        status: Math.random() > 0.1 ? 'online' : ['offline', 'maintenance', 'error'][Math.floor(Math.random() * 3)] as any,
        batteryLevel: Math.floor(Math.random() * 100),
        lastSeen: new Date(Date.now() - Math.random() * 3600000), // Within last hour
        location: Math.random() > 0.2 ? {
          lat: 40.7128 + (Math.random() - 0.5) * 0.1,
          lng: -74.0060 + (Math.random() - 0.5) * 0.1,
          accuracy: Math.floor(Math.random() * 10) + 1
        } : undefined,
        sensors: Math.random() > 0.3 ? {
          temperature: 20 + Math.random() * 30,
          vibration: Math.random() * 10,
          fuel: Math.random() * 100,
          usage: Math.random() * 100
        } : undefined,
        alerts: []
      }));

      // Add some alerts
      mockDevices.forEach(device => {
        if (device.batteryLevel < 20) {
          device.alerts.push({
            id: `alert-${device.id}-battery`,
            type: 'battery',
            severity: 'high',
            message: 'Battery level critically low',
            timestamp: new Date(),
            resolved: false
          });
        }
        if (device.status === 'offline') {
          device.alerts.push({
            id: `alert-${device.id}-offline`,
            type: 'location',
            severity: 'critical',
            message: 'Device offline - unable to track',
            timestamp: new Date(),
            resolved: false
          });
        }
      });

      setDevices(mockDevices);
    } catch (error) {
      console.error('Failed to load IoT devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'maintenance': return 'text-yellow-500';
      case 'error': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle;
      case 'offline': return WifiOff;
      case 'maintenance': return AlertTriangle;
      case 'error': return AlertTriangle;
      default: return Activity;
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const resolveAlert = (deviceId: string, alertId: string) => {
    setDevices(prev => prev.map(device =>
      device.id === deviceId
        ? {
            ...device,
            alerts: device.alerts.map(alert =>
              alert.id === alertId ? { ...alert, resolved: true } : alert
            )
          }
        : device
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const totalAlerts = devices.reduce((sum, d) => sum + d.alerts.filter(a => !a.resolved).length, 0);
  const criticalAlerts = devices.reduce((sum, d) =>
    sum + d.alerts.filter(a => !a.resolved && a.severity === 'critical').length, 0
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-8 h-8" />
          <h1 className="text-2xl font-bold">IoT Equipment Monitor</h1>
        </div>
        <p className="text-blue-100">
          Real-time monitoring and control of your IoT-enabled equipment fleet
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Online Devices</p>
              <p className="text-2xl font-bold text-green-600">{onlineDevices}/{devices.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-red-600">{totalAlerts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{criticalAlerts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Battery</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(devices.reduce((sum, d) => sum + d.batteryLevel, 0) / devices.length)}%
              </p>
            </div>
            <Battery className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'devices', label: 'Devices', icon: Wifi },
          { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm ${
              activeTab === id
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Device Status Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Device Status Overview</h3>
            <div className="space-y-4">
              {['online', 'offline', 'maintenance', 'error'].map(status => {
                const count = devices.filter(d => d.status === status).length;
                const percentage = (count / devices.length) * 100;
                const StatusIcon = getStatusIcon(status);

                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`w-5 h-5 ${getStatusColor(status)}`} />
                      <span className="capitalize text-gray-700">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status === 'online' ? 'bg-green-500' :
                            status === 'offline' ? 'bg-red-500' :
                            status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {devices.slice(0, 5).map(device => (
                <div key={device.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      device.status === 'online' ? 'bg-green-500' :
                      device.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium">Device {device.id.slice(-4)}</p>
                      <p className="text-xs text-gray-500 capitalize">{device.deviceType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {device.lastSeen.toLocaleTimeString()}
                    </p>
                    <p className="text-xs text-gray-500">{device.batteryLevel}% battery</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map(device => (
            <div
              key={device.id}
              className="bg-white rounded-lg shadow-sm border p-6 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDevice(device)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {React.createElement(getStatusIcon(device.status), {
                    className: `w-5 h-5 ${getStatusColor(device.status)}`
                  })}
                  <span className="font-semibold text-gray-900 capitalize">
                    {device.deviceType}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  device.status === 'online' ? 'bg-green-100 text-green-800' :
                  device.status === 'offline' ? 'bg-red-100 text-red-800' :
                  device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {device.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Battery</span>
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold">{device.batteryLevel}%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Seen</span>
                  <span className="text-sm font-semibold">
                    {device.lastSeen.toLocaleTimeString()}
                  </span>
                </div>

                {device.location && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Location</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-semibold">Tracked</span>
                    </div>
                  </div>
                )}

                {device.sensors && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Sensor Data</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {device.sensors.temperature && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="w-3 h-3" />
                          <span>{device.sensors.temperature.toFixed(1)}°C</span>
                        </div>
                      )}
                      {device.sensors.usage && (
                        <div className="flex items-center gap-1">
                          <Gauge className="w-3 h-3" />
                          <span>{device.sensors.usage.toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {device.alerts.filter(a => !a.resolved).length > 0 && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        {device.alerts.filter(a => !a.resolved).length} active alert(s)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {devices.flatMap(device =>
            device.alerts.filter(alert => !alert.resolved).map(alert => (
              <div key={alert.id} className={`p-4 border rounded-lg ${getAlertSeverityColor(alert.severity)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5" />
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-sm opacity-75">
                        Device {device.id.slice(-4)} • {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => resolveAlert(device.id, alert.id)}
                    className="px-3 py-1 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))
          )}

          {totalAlerts === 0 && (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No active alerts at this time.</p>
            </div>
          )}
        </div>
      )}

      {/* Device Detail Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Device Details</h2>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Device ID</label>
                  <p className="text-lg font-semibold">{selectedDevice.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Type</label>
                  <p className="text-lg font-semibold capitalize">{selectedDevice.deviceType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <p className={`text-lg font-semibold ${getStatusColor(selectedDevice.status)}`}>
                    {selectedDevice.status}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Battery</label>
                  <p className="text-lg font-semibold">{selectedDevice.batteryLevel}%</p>
                </div>
              </div>

              {selectedDevice.location && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Location</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">
                        {selectedDevice.location.lat.toFixed(6)}, {selectedDevice.location.lng.toFixed(6)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Accuracy: ±{selectedDevice.location.accuracy}m
                    </p>
                  </div>
                </div>
              )}

              {selectedDevice.sensors && (
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-2 block">Sensor Readings</label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(selectedDevice.sensors).map(([key, value]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {key === 'temperature' && <Thermometer className="w-4 h-4 text-red-500" />}
                          {key === 'vibration' && <Activity className="w-4 h-4 text-orange-500" />}
                          {key === 'fuel' && <Gauge className="w-4 h-4 text-blue-500" />}
                          {key === 'usage' && <Activity className="w-4 h-4 text-green-500" />}
                          <span className="text-sm font-medium capitalize">{key}</span>
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {typeof value === 'number' ? value.toFixed(1) : value}
                          {key === 'temperature' ? '°C' : key === 'fuel' || key === 'usage' ? '%' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}