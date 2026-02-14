import { useState, useEffect, useRef, useCallback } from 'react';
import { Monitor, Maximize, Minimize, RotateCcw, Settings, Volume2, VolumeX, Zap, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getEquipment, getBookings } from '../../services/database';
import type { Equipment, Booking } from '../../types';

interface HologramProjection {
  id: string;
  type: 'equipment' | 'analytics' | 'simulation' | 'communication';
  title: string;
  description: string;
  data: any;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  opacity: number;
  interactive: boolean;
}

interface HolographicInterface {
  id: string;
  name: string;
  description: string;
  projections: HologramProjection[];
  layout: 'grid' | 'spiral' | 'orbital' | 'custom';
  theme: 'default' | 'cyberpunk' | 'minimal' | 'neon';
  audioEnabled: boolean;
  gestureControls: boolean;
}

interface GestureControl {
  type: 'pinch' | 'swipe' | 'rotate' | 'tap';
  action: string;
  sensitivity: number;
}

export default function HolographicInterface() {
  const { user } = useAuth();
  const [interfaces, setInterfaces] = useState<HolographicInterface[]>([]);
  const [activeInterface, setActiveInterface] = useState<HolographicInterface | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [gestureControls, setGestureControls] = useState(true);
  const [selectedProjection, setSelectedProjection] = useState<HologramProjection | null>(null);

  // Holographic controls
  const [projectionMode, setProjectionMode] = useState<'3d' | '2d' | 'mixed'>('3d');
  const [renderQuality, setRenderQuality] = useState<'low' | 'medium' | 'high' | 'ultra'>('high');
  const [ambientLighting, setAmbientLighting] = useState(true);
  const [particleEffects, setParticleEffects] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (user) {
      loadData();
      initializeHolographicSystem();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      const [equipmentData, bookingsData] = await Promise.all([
        getEquipment({ ownerId: user.id }),
        getBookings({ renterId: user.id })
      ]);

      setEquipment(Array.isArray(equipmentData) ? equipmentData : equipmentData.data || []);
      setBookings(Array.isArray(bookingsData) ? bookingsData : bookingsData.data || []);

      // Initialize holographic interfaces
      const mockInterfaces: HolographicInterface[] = [
        {
          id: 'interface-1',
          name: 'Equipment Dashboard',
          description: '3D holographic view of all equipment with real-time status',
          layout: 'grid',
          theme: 'default',
          audioEnabled: true,
          gestureControls: true,
          projections: equipment.slice(0, 6).map((eq, index) => ({
            id: `proj-${eq.id}`,
            type: 'equipment',
            title: eq.title,
            description: `${eq.brand} ${eq.model}`,
            data: eq,
            position: {
              x: (index % 3) * 2 - 2,
              y: Math.floor(index / 3) * 2 - 1,
              z: 0
            },
            rotation: { x: 0, y: 0, z: 0 },
            scale: 1,
            opacity: 1,
            interactive: true
          }))
        },
        {
          id: 'interface-2',
          name: 'Analytics Sphere',
          description: 'Immersive analytics with holographic data visualization',
          layout: 'orbital',
          theme: 'cyberpunk',
          audioEnabled: true,
          gestureControls: true,
          projections: [
            {
              id: 'analytics-revenue',
              type: 'analytics',
              title: 'Revenue Analytics',
              description: 'Real-time revenue and profit holograms',
              data: { type: 'revenue', value: 45230, change: 12.5 },
              position: { x: 3, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: 1.2,
              opacity: 0.9,
              interactive: true
            },
            {
              id: 'analytics-bookings',
              type: 'analytics',
              title: 'Booking Trends',
              description: 'Booking patterns and utilization rates',
              data: { type: 'bookings', count: bookings.length, utilization: 78.5 },
              position: { x: -3, y: 0, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: 1,
              opacity: 0.9,
              interactive: true
            },
            {
              id: 'analytics-equipment',
              type: 'analytics',
              title: 'Equipment Status',
              description: 'Equipment availability and maintenance status',
              data: { type: 'equipment', total: equipment.length, available: equipment.filter(e => e.is_available).length },
              position: { x: 0, y: 3, z: 0 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: 1,
              opacity: 0.9,
              interactive: true
            }
          ]
        },
        {
          id: 'interface-3',
          name: 'Communication Hub',
          description: 'Holographic communication interface for remote collaboration',
          layout: 'spiral',
          theme: 'neon',
          audioEnabled: true,
          gestureControls: true,
          projections: [
            {
              id: 'comm-video',
              type: 'communication',
              title: 'Video Conference',
              description: '3D holographic video calls',
              data: { participants: 4, quality: '4K', latency: 15 },
              position: { x: 0, y: 0, z: 2 },
              rotation: { x: 0, y: 0, z: 0 },
              scale: 1.5,
              opacity: 1,
              interactive: true
            }
          ]
        }
      ];

      setInterfaces(mockInterfaces);
      setActiveInterface(mockInterfaces[0]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeHolographicSystem = () => {
    // Initialize Web Audio API for spatial audio
    if (audioEnabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported');
      }
    }

    // Start holographic rendering animation
    startHolographicRendering();
  };

  const startHolographicRendering = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const render = () => {
      time += 0.016; // ~60fps

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set holographic style
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 2;

      // Render holographic grid
      renderHolographicGrid(ctx, canvas.width, canvas.height, time);

      // Render projections
      if (activeInterface) {
        activeInterface.projections.forEach(projection => {
          renderHologramProjection(ctx, projection, time);
        });
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  const renderHolographicGrid = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const gridSize = 50;
    const offset = time * 20;

    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x += gridSize) {
      const xOffset = (x + offset) % width;
      ctx.beginPath();
      ctx.moveTo(xOffset, 0);
      ctx.lineTo(xOffset, height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += gridSize) {
      const yOffset = (y + offset * 0.5) % height;
      ctx.beginPath();
      ctx.moveTo(0, yOffset);
      ctx.lineTo(width, yOffset);
      ctx.stroke();
    }
  };

  const renderHologramProjection = (ctx: CanvasRenderingContext2D, projection: HologramProjection, time: number) => {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;

    // Convert 3D position to 2D screen coordinates (simplified)
    const screenX = centerX + projection.position.x * 100;
    const screenY = centerY + projection.position.y * 100;
    const scale = projection.scale * (1 + Math.sin(time * 2) * 0.05); // Breathing effect

    ctx.save();
    ctx.globalAlpha = projection.opacity;
    ctx.translate(screenX, screenY);
    ctx.rotate(projection.rotation.y + time * 0.5);
    ctx.scale(scale, scale);

    // Render different projection types
    switch (projection.type) {
      case 'equipment':
        renderEquipmentHologram(ctx, projection);
        break;
      case 'analytics':
        renderAnalyticsHologram(ctx, projection);
        break;
      case 'communication':
        renderCommunicationHologram(ctx, projection);
        break;
    }

    ctx.restore();
  };

  const renderEquipmentHologram = (ctx: CanvasRenderingContext2D, projection: HologramProjection) => {
    const size = 60;

    // Equipment outline
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
    ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.rect(-size/2, -size/2, size, size);
    ctx.fill();
    ctx.stroke();

    // Equipment icon (simplified)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(0, -10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Title
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(projection.title.substring(0, 10), 0, size/2 + 15);
  };

  const renderAnalyticsHologram = (ctx: CanvasRenderingContext2D, projection: HologramProjection) => {
    const size = 80;

    // Data visualization
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
    ctx.fillStyle = 'rgba(255, 0, 255, 0.1)';

    // Circular data representation
    ctx.beginPath();
    ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Data bars
    const bars = 8;
    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2;
      const height = 20 + Math.sin(angle * 3) * 10;
      const x = Math.cos(angle) * (size/2 - 10);
      const y = Math.sin(angle) * (size/2 - 10);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - height);
      ctx.stroke();
    }

    // Value display
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(projection.data.value || projection.data.count || 'N/A', 0, 5);
  };

  const renderCommunicationHologram = (ctx: CanvasRenderingContext2D, projection: HologramProjection) => {
    const size = 100;

    // Video call interface
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 0, size/2, size/3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Participant indicators
    const participants = projection.data.participants || 1;
    for (let i = 0; i < participants; i++) {
      const angle = (i / participants) * Math.PI * 2;
      const x = Math.cos(angle) * (size/3);
      const y = Math.sin(angle) * (size/4);

      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handleProjectionInteraction = (projection: HologramProjection) => {
    setSelectedProjection(projection);

    // Play interaction sound
    if (audioEnabled && audioContextRef.current) {
      playInteractionSound();
    }
  };

  const playInteractionSound = () => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const resetInterface = () => {
    if (activeInterface) {
      setActiveInterface({
        ...activeInterface,
        projections: activeInterface.projections.map(p => ({
          ...p,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1,
          opacity: 1
        }))
      });
    }
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto p-6 space-y-6 ${fullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Monitor className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Holographic Interface</h1>
        </div>
        <p className="text-cyan-100">
          Immersive 3D holographic visualization and interaction system
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Interface Selection */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Interface:</label>
            <select
              value={activeInterface?.id || ''}
              onChange={(e) => {
                const interface_ = interfaces.find(i => i.id === e.target.value);
                setActiveInterface(interface_ || null);
              }}
              className="px-3 py-1 border rounded"
            >
              {interfaces.map(interface_ => (
                <option key={interface_.id} value={interface_.id}>
                  {interface_.name}
                </option>
              ))}
            </select>
          </div>

          {/* Projection Mode */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Mode:</label>
            <select
              value={projectionMode}
              onChange={(e) => setProjectionMode(e.target.value as any)}
              className="px-3 py-1 border rounded"
            >
              <option value="3d">3D</option>
              <option value="2d">2D</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          {/* Quality */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Quality:</label>
            <select
              value={renderQuality}
              onChange={(e) => setRenderQuality(e.target.value as any)}
              className="px-3 py-1 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="ultra">Ultra</option>
            </select>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAmbientLighting(!ambientLighting)}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                ambientLighting ? 'bg-cyan-100 text-cyan-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Zap className="w-4 h-4" />
              Lighting
            </button>

            <button
              onClick={() => setParticleEffects(!particleEffects)}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                particleEffects ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Eye className="w-4 h-4" />
              Particles
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                audioEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Audio
            </button>

            <button
              onClick={() => setGestureControls(!gestureControls)}
              className={`flex items-center gap-2 px-3 py-1 rounded ${
                gestureControls ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Settings className="w-4 h-4" />
              Gestures
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={resetInterface}
              className="p-2 border rounded hover:bg-gray-50"
              title="Reset Interface"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 border rounded hover:bg-gray-50"
              title={fullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {fullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Holographic Display */}
      <div className="bg-black rounded-lg overflow-hidden shadow-2xl" style={{ height: fullscreen ? 'calc(100vh - 200px)' : '600px' }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          style={{ imageRendering: 'pixelated' }}
          onClick={(e) => {
            // Simple click detection for projections (simplified)
            if (activeInterface) {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                // Find closest projection (simplified logic)
                const closest = activeInterface.projections[0]; // Just select first for demo
                handleProjectionInteraction(closest);
              }
            }
          }}
        />

        {/* Interface Info Overlay */}
        {activeInterface && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-3 rounded">
            <h3 className="font-bold">{activeInterface.name}</h3>
            <p className="text-sm opacity-80">{activeInterface.description}</p>
            <p className="text-xs opacity-60 mt-1">
              {activeInterface.projections.length} projections • {activeInterface.layout} layout
            </p>
          </div>
        )}

        {/* Projection Details */}
        {selectedProjection && (
          <div className="absolute bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded max-w-sm">
            <h4 className="font-bold mb-2">{selectedProjection.title}</h4>
            <p className="text-sm opacity-80 mb-3">{selectedProjection.description}</p>

            <div className="space-y-1 text-xs">
              <div>Position: ({selectedProjection.position.x.toFixed(1)}, {selectedProjection.position.y.toFixed(1)}, {selectedProjection.position.z.toFixed(1)})</div>
              <div>Scale: {selectedProjection.scale.toFixed(2)}</div>
              <div>Opacity: {(selectedProjection.opacity * 100).toFixed(0)}%</div>
              <div>Interactive: {selectedProjection.interactive ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Interface Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interfaces.map(interface_ => (
          <div
            key={interface_.id}
            className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${
              activeInterface?.id === interface_.id ? 'border-cyan-500 bg-cyan-50' : 'hover:border-gray-300'
            }`}
            onClick={() => setActiveInterface(interface_)}
          >
            <div className="flex items-center gap-3 mb-3">
              <Monitor className="w-6 h-6 text-cyan-500" />
              <div>
                <h3 className="font-semibold">{interface_.name}</h3>
                <p className="text-sm text-gray-600">{interface_.description}</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{interface_.projections.length} projections</span>
              <span className="capitalize">{interface_.theme}</span>
            </div>

            <div className="flex gap-2 mt-3">
              {interface_.audioEnabled && <Volume2 className="w-4 h-4 text-green-500" />}
              {interface_.gestureControls && <Settings className="w-4 h-4 text-blue-500" />}
            </div>
          </div>
        ))}
      </div>

      {/* Gesture Controls Info */}
      {gestureControls && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Gesture Controls Active</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <strong>Pinch:</strong> Zoom in/out projections
            </div>
            <div>
              <strong>Swipe:</strong> Rotate holographic view
            </div>
            <div>
              <strong>Tap:</strong> Select projection
            </div>
            <div>
              <strong>Rotate:</strong> Adjust projection orientation
            </div>
          </div>
        </div>
      )}
    </div>
  );
}