import { ArrowLeft, Clock, Truck, Plane, CheckCircle, AlertTriangle, Navigation, Battery, Wind, Eye, Settings } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useEffect } from 'react';

interface Delivery {
  id: string;
  equipment: string;
  pickupLocation: string;
  deliveryLocation: string;
  status: 'scheduled' | 'en-route' | 'delivered' | 'delayed' | 'cancelled';
  estimatedArrival: string;
  actualArrival?: string;
  droneId: string;
  trackingNumber: string;
  distance: number;
  weatherConditions: string;
  priority: 'standard' | 'express' | 'emergency';
}

interface Drone {
  id: string;
  model: string;
  status: 'available' | 'in-flight' | 'maintenance' | 'charging';
  batteryLevel: number;
  location: string;
  payloadCapacity: number;
  range: number;
  speed: number;
}

const mockDeliveries: Delivery[] = [
  {
    id: 'DEL001',
    equipment: 'Honda EU3000is Generator',
    pickupLocation: 'Equipment Warehouse A',
    deliveryLocation: 'Construction Site Alpha',
    status: 'en-route',
    estimatedArrival: '2026-02-15 16:30',
    droneId: 'DRONE-007',
    trackingNumber: 'TK20260215001',
    distance: 12.5,
    weatherConditions: 'Clear skies, 15°C',
    priority: 'standard',
  },
  {
    id: 'DEL002',
    equipment: 'DJI Phantom Drone',
    pickupLocation: 'Tech Hub Central',
    deliveryLocation: 'Film Production Studio',
    status: 'scheduled',
    estimatedArrival: '2026-02-15 18:00',
    droneId: 'DRONE-012',
    trackingNumber: 'TK20260215002',
    distance: 8.3,
    weatherConditions: 'Partly cloudy, 18°C',
    priority: 'express',
  },
  {
    id: 'DEL003',
    equipment: 'CAT Excavator Bucket',
    pickupLocation: 'Parts Depot North',
    deliveryLocation: 'Mining Operation Beta',
    status: 'delivered',
    estimatedArrival: '2026-02-15 14:00',
    actualArrival: '2026-02-15 13:45',
    droneId: 'DRONE-003',
    trackingNumber: 'TK20260215003',
    distance: 25.7,
    weatherConditions: 'Windy, 12°C',
    priority: 'standard',
  },
  {
    id: 'DEL004',
    equipment: 'Safety Gear Kit',
    pickupLocation: 'Safety Supply Center',
    deliveryLocation: 'Emergency Response Site',
    status: 'delayed',
    estimatedArrival: '2026-02-15 17:15',
    droneId: 'DRONE-009',
    trackingNumber: 'TK20260215004',
    distance: 15.2,
    weatherConditions: 'Heavy rain, 10°C',
    priority: 'emergency',
  },
];

const mockDrones: Drone[] = [
  {
    id: 'DRONE-007',
    model: 'SkyLift Pro X1',
    status: 'in-flight',
    batteryLevel: 78,
    location: 'En route to Construction Site Alpha',
    payloadCapacity: 50,
    range: 30,
    speed: 65,
  },
  {
    id: 'DRONE-012',
    model: 'AeroCargo Elite',
    status: 'available',
    batteryLevel: 95,
    location: 'Tech Hub Central',
    payloadCapacity: 75,
    range: 45,
    speed: 80,
  },
  {
    id: 'DRONE-003',
    model: 'SkyLift Pro X1',
    status: 'charging',
    batteryLevel: 23,
    location: 'Drone Station 1',
    payloadCapacity: 50,
    range: 30,
    speed: 65,
  },
  {
    id: 'DRONE-009',
    model: 'StormGuard Heavy',
    status: 'maintenance',
    batteryLevel: 0,
    location: 'Service Center',
    payloadCapacity: 100,
    range: 25,
    speed: 55,
  },
];

export default function DroneDelivery({ onBack }: { onBack: () => void }) {
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [showDroneFleet, setShowDroneFleet] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update drone positions and battery levels
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: Delivery['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'en-route': return 'bg-yellow-100 text-yellow-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'delayed': return 'bg-red-100 text-red-700';
      case 'cancelled': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDroneStatusColor = (status: Drone['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'in-flight': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      case 'charging': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: Delivery['priority']) => {
    switch (priority) {
      case 'emergency': return 'bg-red-100 text-red-700 border-red-300';
      case 'express': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'standard': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Plane className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Drone Delivery System</h1>
                <p className="text-blue-100">Autonomous aerial delivery for equipment and parts</p>
              </div>
            </div>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => setShowDroneFleet(!showDroneFleet)}
                variant="outline"
                className="flex items-center gap-2 bg-white/20 text-white border-white/30 hover:bg-white/30"
              >
                <Plane className="w-4 h-4" />
                {showDroneFleet ? 'Hide Fleet' : 'View Fleet'}
              </Button>
              <Button
                onClick={() => setShowScheduleForm(true)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Truck className="w-4 h-4 mr-2" />
                Schedule Delivery
              </Button>
            </div>
          </div>

          <div className="p-8">
            {/* Drone Fleet Overview */}
            {showDroneFleet && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Drone Fleet Status</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockDrones.map(drone => (
                    <div
                      key={drone.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedDrone?.id === drone.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-200'
                      }`}
                      onClick={() => setSelectedDrone(drone)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{drone.id}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDroneStatusColor(drone.status)}`}>
                          {drone.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{drone.model}</div>
                      <div className="space-y-1 text-xs text-gray-500">
                        <div>Battery: {drone.batteryLevel}%</div>
                        <div>Payload: {drone.payloadCapacity}kg</div>
                        <div>Range: {drone.range}km</div>
                        <div>Speed: {drone.speed}km/h</div>
                      </div>
                      <div className="mt-2 text-xs text-gray-400 truncate" title={drone.location}>
                        📍 {drone.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deliveries List */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Deliveries</h2>
              <div className="space-y-4">
                {mockDeliveries.map(delivery => (
                  <div
                    key={delivery.id}
                    className={`p-6 rounded-lg border cursor-pointer transition-all ${
                      selectedDelivery?.id === delivery.id
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-blue-200'
                    }`}
                    onClick={() => setSelectedDelivery(delivery)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{delivery.trackingNumber}</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(delivery.priority)}`}>
                          {delivery.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                          {delivery.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">{delivery.distance} km</div>
                        <div className="text-sm text-gray-500">Distance</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Equipment: <span className="font-medium">{delivery.equipment}</span></div>
                        <div className="text-sm text-gray-600 mb-1">Drone: <span className="font-medium">{delivery.droneId}</span></div>
                        <div className="text-sm text-gray-600">Weather: <span className="font-medium">{delivery.weatherConditions}</span></div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">From: <span className="font-medium">{delivery.pickupLocation}</span></div>
                        <div className="text-sm text-gray-600 mb-1">To: <span className="font-medium">{delivery.deliveryLocation}</span></div>
                        <div className="text-sm text-gray-600">ETA: <span className="font-medium">{formatTime(delivery.estimatedArrival)}</span></div>
                      </div>
                    </div>

                    {delivery.status === 'en-route' && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 text-blue-700">
                          <Navigation className="w-4 h-4" />
                          <span className="text-sm font-medium">Drone {delivery.droneId} is en route</span>
                        </div>
                      </div>
                    )}

                    {delivery.status === 'delayed' && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="text-sm font-medium">Delivery delayed due to weather conditions</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Details */}
            {selectedDelivery && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-blue-900">Delivery Details</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Live Tracking
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-1" />
                      Modify Route
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Tracking Number:</span>
                      <p className="text-gray-900 font-mono">{selectedDelivery.trackingNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Equipment:</span>
                      <p className="text-gray-900">{selectedDelivery.equipment}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Drone ID:</span>
                      <p className="text-gray-900">{selectedDelivery.droneId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Priority:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ml-2 ${getPriorityColor(selectedDelivery.priority)}`}>
                        {selectedDelivery.priority}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Pickup Location:</span>
                      <p className="text-gray-900">{selectedDelivery.pickupLocation}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Delivery Location:</span>
                      <p className="text-gray-900">{selectedDelivery.deliveryLocation}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Distance:</span>
                      <p className="text-gray-900">{selectedDelivery.distance} km</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Weather:</span>
                      <p className="text-gray-900">{selectedDelivery.weatherConditions}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-600">Estimated Arrival</div>
                    <div className="text-lg font-semibold text-gray-900">{formatTime(selectedDelivery.estimatedArrival)}</div>
                  </div>
                  {selectedDelivery.actualArrival && (
                    <div className="p-3 bg-white rounded border">
                      <div className="text-sm text-gray-600">Actual Arrival</div>
                      <div className="text-lg font-semibold text-green-600">{formatTime(selectedDelivery.actualArrival)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Delivery Statistics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {mockDeliveries.filter(d => d.status === 'delivered').length}
                </div>
                <div className="text-sm text-gray-600">Delivered Today</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Plane className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {mockDeliveries.filter(d => d.status === 'en-route').length}
                </div>
                <div className="text-sm text-gray-600">In Transit</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  {mockDeliveries.filter(d => d.status === 'scheduled').length}
                </div>
                <div className="text-sm text-gray-600">Scheduled</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">
                  {mockDeliveries.filter(d => d.status === 'delayed').length}
                </div>
                <div className="text-sm text-gray-600">Delayed</div>
              </div>
            </div>

            {/* System Features */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Navigation className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Autonomous Routing</h3>
                <p className="text-sm text-gray-600">AI-powered flight paths with obstacle avoidance</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Battery className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Smart Battery Mgmt</h3>
                <p className="text-sm text-gray-600">Automatic charging and battery optimization</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Wind className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900 mb-1">Weather Adaptive</h3>
                <p className="text-sm text-gray-600">Real-time weather monitoring and route adjustments</p>
              </div>
            </div>

            {/* Schedule Delivery Form */}
            {showScheduleForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h3 className="text-lg font-semibold mb-4">Schedule New Delivery</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Equipment/Item</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter equipment or item name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter pickup address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter delivery address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority Level</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option>Standard (24-48 hours)</option>
                        <option>Express (4-12 hours)</option>
                        <option>Emergency (1-4 hours)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={() => setShowScheduleForm(false)}
                    >
                      Schedule Delivery
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowScheduleForm(false)}
                    >
                      Cancel
                    </Button>
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