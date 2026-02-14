import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RotateCcw, ZoomIn, ZoomOut, Eye, EyeOff, Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEquipment } from '../../services/database';
import type { Equipment } from '../../types';

interface ARVRSession {
  id: string;
  equipmentId: string;
  type: 'ar' | 'vr';
  status: 'active' | 'paused' | 'completed';
  startTime: Date;
  duration: number;
  interactions: ARVRInteraction[];
}

interface ARVRInteraction {
  id: string;
  type: 'view' | 'rotate' | 'zoom' | 'inspect' | 'measure';
  timestamp: Date;
  data: any;
}

interface VirtualTour {
  id: string;
  equipmentId: string;
  title: string;
  description: string;
  duration: number;
  waypoints: VirtualWaypoint[];
  media: {
    images: string[];
    videos: string[];
    models: string[];
  };
}

interface VirtualWaypoint {
  id: string;
  title: string;
  description: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  media: string[];
  hotspots: VirtualHotspot[];
}

interface VirtualHotspot {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'info' | 'measurement' | 'damage' | 'feature';
  title: string;
  content: string;
  media?: string;
}

export default function ARVRExperience() {
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [activeSession, setActiveSession] = useState<ARVRSession | null>(null);
  const [virtualTours, setVirtualTours] = useState<VirtualTour[]>([]);
  const [currentTour, setCurrentTour] = useState<VirtualTour | null>(null);
  const [currentWaypoint, setCurrentWaypoint] = useState<VirtualWaypoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'tours' | 'sessions'>('preview');
  const [arSupported, setArSupported] = useState(false);
  const [vrSupported, setVrSupported] = useState(false);

  // AR/VR controls
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showHotspots, setShowHotspots] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (user) {
      loadEquipment();
      checkARVRSupport();
    }
  }, [user]);

  const loadEquipment = async () => {
    if (!user) return;

    try {
      const equipmentData = await getEquipment({ ownerId: user.id });
      const equipmentList = Array.isArray(equipmentData) ? equipmentData : equipmentData.data || [];
      setEquipment(equipmentList);

      // Load virtual tours (simulated)
      const mockTours: VirtualTour[] = equipmentList.slice(0, 3).map((eq: Equipment, index: number) => ({
        id: `tour-${eq.id}`,
        equipmentId: eq.id,
        title: `${eq.title} Virtual Inspection`,
        description: `Complete virtual tour of the ${eq.title} with detailed inspection points`,
        duration: 300 + index * 60, // 5-8 minutes
        waypoints: [
          {
            id: 'wp-1',
            title: 'Exterior Overview',
            description: 'Complete exterior inspection from all angles',
            position: { x: 0, y: 0, z: 5 },
            rotation: { x: 0, y: 0, z: 0 },
            media: [`https://example.com/360/${eq.id}/exterior.jpg`],
            hotspots: [
              {
                id: 'hs-1',
                position: { x: 1, y: 0, z: 0 },
                type: 'info',
                title: 'Engine Compartment',
                content: 'Access panel for engine maintenance'
              }
            ]
          },
          {
            id: 'wp-2',
            title: 'Interior Controls',
            description: 'Dashboard and control systems inspection',
            position: { x: 0, y: 1, z: 0 },
            rotation: { x: 0, y: 90, z: 0 },
            media: [`https://example.com/360/${eq.id}/interior.jpg`],
            hotspots: []
          }
        ],
        media: {
          images: [`https://example.com/360/${eq.id}/exterior.jpg`, `https://example.com/360/${eq.id}/interior.jpg`],
          videos: [`https://example.com/videos/${eq.id}/demo.mp4`],
          models: [`https://example.com/models/${eq.id}/3d.glb`]
        }
      }));

      setVirtualTours(mockTours);
    } catch (error) {
      console.error('Failed to load equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkARVRSupport = () => {
    // Check for WebXR support
    if ('xr' in navigator) {
      (navigator as any).xr.isSessionSupported('immersive-ar').then((supported: boolean) => {
        setArSupported(supported);
      });
      (navigator as any).xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
        setVrSupported(supported);
      });
    }
  };

  const startARSession = async (equipment: Equipment) => {
    if (!arSupported) {
      alert('AR is not supported on this device');
      return;
    }

    try {
      const session = await (navigator as any).xr.requestSession('immersive-ar');
      setSelectedEquipment(equipment);
      setActiveSession({
        id: `ar-${Date.now()}`,
        equipmentId: equipment.id,
        type: 'ar',
        status: 'active',
        startTime: new Date(),
        duration: 0,
        interactions: []
      });
    } catch (error) {
      console.error('Failed to start AR session:', error);
    }
  };

  const startVRSession = async (equipment: Equipment) => {
    if (!vrSupported) {
      alert('VR is not supported on this device');
      return;
    }

    try {
      const session = await (navigator as any).xr.requestSession('immersive-vr');
      setSelectedEquipment(equipment);
      setActiveSession({
        id: `vr-${Date.now()}`,
        equipmentId: equipment.id,
        type: 'vr',
        status: 'active',
        startTime: new Date(),
        duration: 0,
        interactions: []
      });
    } catch (error) {
      console.error('Failed to start VR session:', error);
    }
  };

  const startVirtualTour = (tour: VirtualTour) => {
    setCurrentTour(tour);
    setCurrentWaypoint(tour.waypoints[0]);
    setSelectedEquipment(equipment.find(eq => eq.id === tour.equipmentId) || null);
  };

  const nextWaypoint = () => {
    if (!currentTour || !currentWaypoint) return;

    const currentIndex = currentTour.waypoints.findIndex(wp => wp.id === currentWaypoint.id);
    if (currentIndex < currentTour.waypoints.length - 1) {
      setCurrentWaypoint(currentTour.waypoints[currentIndex + 1]);
    }
  };

  const previousWaypoint = () => {
    if (!currentTour || !currentWaypoint) return;

    const currentIndex = currentTour.waypoints.findIndex(wp => wp.id === currentWaypoint.id);
    if (currentIndex > 0) {
      setCurrentWaypoint(currentTour.waypoints[currentIndex - 1]);
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + (direction === 'in' ? 0.1 : -0.1))));
  };

  const handleRotate = (axis: 'x' | 'y' | 'z', delta: number) => {
    setRotation(prev => ({
      ...prev,
      [axis]: prev[axis] + delta
    }));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-8 h-8" />
          <h1 className="text-2xl font-bold">AR/VR Experience</h1>
        </div>
        <p className="text-indigo-100">
          Immersive equipment inspection and virtual tours with augmented and virtual reality
        </p>
      </div>

      {/* Device Support */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="font-semibold mb-3">Device Capabilities</h3>
        <div className="flex gap-4">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            arSupported ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <Eye className="w-4 h-4" />
            AR {arSupported ? 'Supported' : 'Not Supported'}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            vrSupported ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
          }`}>
            <Eye className="w-4 h-4" />
            VR {vrSupported ? 'Supported' : 'Not Supported'}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'preview', label: '3D Preview', icon: Eye },
          { id: 'tours', label: 'Virtual Tours', icon: Camera },
          { id: 'sessions', label: 'AR/VR Sessions', icon: Play }
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
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Equipment Selection */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Select Equipment</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {equipment.map(eq => (
                <div
                  key={eq.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEquipment?.id === eq.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEquipment(eq)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{eq.title}</h4>
                      <p className="text-sm text-gray-600">{eq.brand} {eq.model}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startARSession(eq);
                        }}
                        disabled={!arSupported}
                        className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
                      >
                        AR
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startVRSession(eq);
                        }}
                        disabled={!vrSupported}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        VR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3D Preview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedEquipment ? `${selectedEquipment.title} Preview` : '3D Preview'}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleZoom('out')}
                  className="p-2 border rounded hover:bg-gray-50"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleZoom('in')}
                  className="p-2 border rounded hover:bg-gray-50"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation({ x: 0, y: 0, z: 0 })}
                  className="p-2 border rounded hover:bg-gray-50"
                  title="Reset View"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={toggleFullscreen}
                  className="p-2 border rounded hover:bg-gray-50"
                  title="Fullscreen"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{
                  transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`
                }}
              />

              {selectedEquipment ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <Camera className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-gray-600">3D Model Preview</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedEquipment.brand} {selectedEquipment.model}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-4" />
                    <p>Select equipment to preview in 3D</p>
                  </div>
                </div>
              )}

              {/* Rotation Controls */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={() => handleRotate('y', -15)}
                  className="p-2 bg-white rounded shadow hover:bg-gray-50"
                  title="Rotate Left"
                >
                  ←
                </button>
                <button
                  onClick={() => handleRotate('y', 15)}
                  className="p-2 bg-white rounded shadow hover:bg-gray-50"
                  title="Rotate Right"
                >
                  →
                </button>
                <button
                  onClick={() => handleRotate('x', -15)}
                  className="p-2 bg-white rounded shadow hover:bg-gray-50"
                  title="Rotate Up"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleRotate('x', 15)}
                  className="p-2 bg-white rounded shadow hover:bg-gray-50"
                  title="Rotate Down"
                >
                  ↓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tours' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {virtualTours.map(tour => (
              <div key={tour.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                  <Camera className="w-6 h-6 mb-2" />
                  <h3 className="font-bold">{tour.title}</h3>
                </div>

                <div className="p-4">
                  <p className="text-sm text-gray-600 mb-4">{tour.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{tour.waypoints.length} waypoints</span>
                    <span>{Math.floor(tour.duration / 60)} min</span>
                  </div>

                  <button
                    onClick={() => startVirtualTour(tour)}
                    className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Start Tour
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Current Tour */}
          {currentTour && currentWaypoint && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">{currentTour.title}</h3>
                  <p className="text-sm text-gray-600">{currentWaypoint.title}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={previousWaypoint}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                    disabled={currentTour.waypoints[0].id === currentWaypoint.id}
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextWaypoint}
                    className="px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600"
                    disabled={currentTour.waypoints[currentTour.waypoints.length - 1].id === currentWaypoint.id}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-4">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-700">{currentWaypoint.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Hotspots</h4>
                  <div className="space-y-2">
                    {currentWaypoint.hotspots.map(hotspot => (
                      <div key={hotspot.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${
                            hotspot.type === 'info' ? 'bg-blue-500' :
                            hotspot.type === 'measurement' ? 'bg-green-500' :
                            hotspot.type === 'damage' ? 'bg-red-500' : 'bg-purple-500'
                          }`}></div>
                          <span className="font-medium text-sm">{hotspot.title}</span>
                        </div>
                        <p className="text-sm text-gray-600">{hotspot.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">AR/VR Session History</h3>
            <p className="text-sm text-gray-600">Track your immersive equipment inspection sessions</p>
          </div>

          <div className="p-6">
            {activeSession ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium">Active {activeSession.type.toUpperCase()} Session</p>
                    <p className="text-sm text-gray-600">
                      Started {activeSession.startTime.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
                <p className="text-gray-600">Start an AR or VR session to begin immersive inspection</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Mock session history */}
              {[
                { id: '1', type: 'AR', equipment: 'Excavator XL-2000', duration: 450, date: new Date(Date.now() - 86400000) },
                { id: '2', type: 'VR', equipment: 'Forklift Pro-500', duration: 320, date: new Date(Date.now() - 172800000) },
                { id: '3', type: 'AR', equipment: 'Generator MaxPower', duration: 180, date: new Date(Date.now() - 259200000) }
              ].map(session => (
                <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      session.type === 'AR' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {session.type}
                    </div>
                    <div>
                      <p className="font-medium">{session.equipment}</p>
                      <p className="text-sm text-gray-600">
                        {session.date.toLocaleDateString()} • {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
                      </p>
                    </div>
                  </div>
                  <button className="px-3 py-1 border rounded hover:bg-gray-50 text-sm">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}