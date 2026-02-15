import { ArrowLeft, MapPin, Navigation, AlertTriangle, Clock, Shield, Eye, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';

interface GPSTrackingProps {
  onBack: () => void;
  equipment?: {
    id: string;
    title: string;
    location: string;
    rentalStatus: 'active' | 'returned' | 'overdue';
  };
}

export default function GPSTracking({ onBack, equipment }: GPSTrackingProps) {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [geofenceRadius, setGeofenceRadius] = useState(100); // meters
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    type: 'geofence' | 'speed' | 'theft';
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }>>([]);
  const [trackingHistory, setTrackingHistory] = useState<Array<{
    timestamp: Date;
    location: {lat: number, lng: number};
    speed: number;
  }>>([]);

  const demoEquipment = equipment || {
    id: 'demo-1',
    title: 'CAT 320 Excavator',
    location: 'Construction Site A',
    rentalStatus: 'active'
  };

  useEffect(() => {
    // Simulate GPS tracking
    if (isTracking) {
      const interval = setInterval(() => {
        // Simulate movement around Sydney area
        const baseLat = -33.8688;
        const baseLng = 151.2093;
        const newLocation = {
          lat: baseLat + (Math.random() - 0.5) * 0.01,
          lng: baseLng + (Math.random() - 0.5) * 0.01
        };
        setCurrentLocation(newLocation);

        // Add to tracking history
        setTrackingHistory(prev => [...prev.slice(-9), {
          timestamp: new Date(),
          location: newLocation,
          speed: Math.floor(Math.random() * 30) + 10 // 10-40 km/h
        }]);

        // Simulate random alerts
        if (Math.random() < 0.1) { // 10% chance every update
          const alertTypes = ['geofence', 'speed', 'theft'];
          const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
          const newAlert = {
            id: Date.now().toString(),
            type: randomType as 'geofence' | 'speed' | 'theft',
            message: getAlertMessage(randomType),
            timestamp: new Date(),
            severity: (Math.random() < 0.3 ? 'high' : Math.random() < 0.6 ? 'medium' : 'low') as 'low' | 'medium' | 'high'
          };
          setAlerts(prev => [newAlert, ...prev.slice(0, 4)]); // Keep last 5 alerts
        }
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const getAlertMessage = (type: string) => {
    switch (type) {
      case 'geofence':
        return 'Equipment has exited the designated work area';
      case 'speed':
        return 'Equipment exceeding speed limit on public roads';
      case 'theft':
        return 'Unauthorized movement detected - possible theft attempt';
      default:
        return 'Unknown alert';
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    // Simulate initial location
    setCurrentLocation({ lat: -33.8688, lng: 151.2093 });
  };

  const stopTracking = () => {
    setIsTracking(false);
    setCurrentLocation(null);
  };

  const clearAlerts = () => {
    setAlerts([]);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'geofence': return <MapPin className="w-4 h-4" />;
      case 'speed': return <Navigation className="w-4 h-4" />;
      case 'theft': return <Shield className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          onClick={onBack}
          variant="ghost"
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Equipment
        </Button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Navigation className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">GPS Equipment Tracking</h1>
                <p className="text-green-100">Real-time location monitoring & geofencing</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Equipment Status */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{demoEquipment.title}</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  demoEquipment.rentalStatus === 'active'
                    ? 'bg-green-100 text-green-800'
                    : demoEquipment.rentalStatus === 'overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {demoEquipment.rentalStatus.charAt(0).toUpperCase() + demoEquipment.rentalStatus.slice(1)}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Location:</span>
                  <span className="ml-2 text-gray-900">{demoEquipment.location}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Tracking Status:</span>
                  <span className={`ml-2 font-medium ${isTracking ? 'text-green-600' : 'text-red-600'}`}>
                    {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Geofence:</span>
                  <span className="ml-2 text-gray-900">{geofenceRadius}m radius</span>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Map View */}
              <div className="space-y-6">
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center relative overflow-hidden">
                  {/* Simulated Map */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
                    {/* Grid lines */}
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(10)].map((_, i) => (
                        <div key={`h-${i}`} className="absolute w-full h-px bg-gray-400" style={{ top: `${i * 10}%` }} />
                      ))}
                      {[...Array(10)].map((_, i) => (
                        <div key={`v-${i}`} className="absolute h-full w-px bg-gray-400" style={{ left: `${i * 10}%` }} />
                      ))}
                    </div>

                    {/* Equipment marker */}
                    {currentLocation && (
                      <div
                        className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"
                        style={{
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      >
                        <div className="absolute -top-8 -left-8 w-16 h-16 border-2 border-red-300 rounded-full opacity-50"></div>
                      </div>
                    )}

                    {/* Geofence circle */}
                    <div
                      className="absolute border-2 border-blue-500 rounded-full opacity-30"
                      style={{
                        left: '50%',
                        top: '50%',
                        width: `${geofenceRadius * 0.1}px`,
                        height: `${geofenceRadius * 0.1}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                  </div>

                  <div className="text-center text-gray-600 z-10">
                    <MapPin className="w-12 h-12 mx-auto mb-2" />
                    <p className="font-medium">Interactive Map View</p>
                    <p className="text-sm">Real-time equipment location tracking</p>
                  </div>
                </div>

                {/* Tracking Controls */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tracking Controls</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Geofence Radius</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="50"
                          max="500"
                          value={geofenceRadius}
                          onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                          className="w-20"
                        />
                        <span className="text-sm text-gray-600 w-12">{geofenceRadius}m</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!isTracking ? (
                        <Button
                          onClick={startTracking}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Start Tracking
                        </Button>
                      ) : (
                        <Button
                          onClick={stopTracking}
                          variant="outline"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          Stop Tracking
                        </Button>
                      )}

                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alerts & History */}
              <div className="space-y-6">
                {/* Active Alerts */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
                    {alerts.length > 0 && (
                      <Button onClick={clearAlerts} variant="outline" size="sm">
                        Clear All
                      </Button>
                    )}
                  </div>

                  {alerts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No active alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {alerts.map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3 rounded-lg border-l-4 ${
                            alert.severity === 'high'
                              ? 'border-red-500 bg-red-50'
                              : alert.severity === 'medium'
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-blue-500 bg-blue-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-1 rounded ${getSeverityColor(alert.severity)}`}>
                              {getAlertIcon(alert.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                              <p className="text-xs text-gray-500">
                                {alert.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tracking History */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {trackingHistory.slice(-5).reverse().map((entry, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            Location update • {entry.speed} km/h
                          </p>
                          <p className="text-xs text-gray-500">
                            {entry.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <Eye className="w-4 h-4 text-blue-500 cursor-pointer" />
                      </div>
                    ))}
                    {trackingHistory.length === 0 && (
                      <div className="text-center py-4 text-gray-500">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tracking history yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">GPS Features</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Real-time location tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Customizable geofencing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Speed monitoring & alerts
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Theft prevention system
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Benefits</h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Equipment recovery in case of theft
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Compliance with usage restrictions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Usage analytics for optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Peace of mind for owners
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={isTracking ? stopTracking : startTracking}
                className={isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isTracking ? 'Stop Tracking' : 'Start Tracking'}
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Configure Alerts
              </Button>
              <Button variant="outline">
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}