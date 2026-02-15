import { ArrowLeft, Eye, RotateCcw, ZoomIn, ZoomOut, Move3D, Smartphone, Camera, Maximize } from 'lucide-react';
import { Button } from '../ui/Button';
import { useState, useRef, useEffect } from 'react';

interface AREquipmentVisualizationProps {
  onBack: () => void;
  equipment?: {
    id: string;
    title: string;
    model: string;
    dimensions: string;
    weight: string;
  };
}

export default function AREquipmentVisualization({ onBack, equipment }: AREquipmentVisualizationProps) {
  const [isARSupported, setIsARSupported] = useState(false);
  const [isARActive, setIsARActive] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check for AR support
    const checkARSupport = async () => {
      if ('xr' in navigator) {
        try {
          const xr = (navigator as Navigator & { xr: any }).xr;
          const supported = await xr.isSessionSupported('immersive-ar');
          setIsARSupported(supported);
        } catch (error) {
          console.log('AR not supported:', error);
        }
      }
    };

    checkARSupport();
  }, []);

  const startARSession = async () => {
    try {
      if (!isARSupported) {
        alert('AR is not supported on this device. Try using a modern mobile device with AR capabilities.');
        return;
      }

      await (navigator as Navigator & { xr: any }).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test']
      });

      setIsARActive(true);

      // In a real implementation, this would initialize the AR scene
      // For demo purposes, we'll show a camera view with overlay
      if (videoRef.current) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
          });
          videoRef.current.srcObject = stream;
        } catch (error) {
          console.log('Camera access denied:', error);
        }
      }

    } catch (error) {
      console.error('Failed to start AR session:', error);
    }
  };

  const stopARSession = () => {
    setIsARActive(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => Math.max(0.5, Math.min(3, prev + (direction === 'in' ? 0.2 : -0.2))));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 45) % 360);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const demoEquipment = equipment || {
    id: 'demo-1',
    title: 'CAT 320 Excavator',
    model: '320 GC',
    dimensions: '9.8m x 3.3m x 3.1m',
    weight: '20,000 kg'
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
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">AR Equipment Visualization</h1>
                <p className="text-blue-100">See equipment in your space before you rent</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Equipment Info */}
            <div className="mb-8 bg-gray-50 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{demoEquipment.title}</h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Model:</span>
                  <span className="ml-2 text-gray-900">{demoEquipment.model}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Dimensions:</span>
                  <span className="ml-2 text-gray-900">{demoEquipment.dimensions}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Weight:</span>
                  <span className="ml-2 text-gray-900">{demoEquipment.weight}</span>
                </div>
              </div>
            </div>

            {/* AR Viewport */}
            <div className="mb-8">
              <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: '500px' }}>
                {!isARActive ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Eye className="w-12 h-12" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">AR Preview Ready</h3>
                      <p className="text-gray-300 mb-6">Visualize this equipment in your actual work environment</p>
                      <Button
                        onClick={startARSession}
                        className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                      >
                        <Camera className="w-5 h-5 mr-2" />
                        Start AR Experience
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Camera Feed */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* AR Overlay */}
                    <canvas
                      ref={canvasRef}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                    />

                    {/* Equipment 3D Model Overlay (simulated) */}
                    <div
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                      style={{
                        transform: `translate(-50%, -50%) scale(${zoom}) rotate(${rotation}deg)`,
                      }}
                    >
                      <div className="relative">
                        {/* Simulated 3D equipment model */}
                        <div className="w-32 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-2xl border-4 border-white">
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                          <div className="absolute bottom-2 left-2 right-2 h-2 bg-gray-700 rounded"></div>
                        </div>
                        {/* Dimension indicators */}
                        <div className="absolute -left-16 top-1/2 transform -translate-y-1/2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                          9.8m
                        </div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                          3.3m
                        </div>
                      </div>
                    </div>

                    {/* AR Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      <Button
                        onClick={() => handleZoom('out')}
                        variant="secondary"
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleRotate}
                        variant="secondary"
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleZoom('in')}
                        variant="secondary"
                        size="sm"
                        className="bg-black/50 hover:bg-black/70 text-white border-white/20"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Exit AR Button */}
                    <Button
                      onClick={stopARSession}
                      variant="secondary"
                      size="sm"
                      className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white"
                    >
                      Exit AR
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">AR Features</h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Real-time camera overlay
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Interactive scaling & rotation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Dimension visualization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Space requirement checking
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Benefits</h3>
                <ul className="space-y-2 text-green-800">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Reduce booking uncertainty
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Check equipment fit on-site
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Visualize operational space
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Make informed rental decisions
                  </li>
                </ul>
              </div>
            </div>

            {/* Compatibility Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Smartphone className="w-6 h-6 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-900 mb-2">Device Compatibility</h3>
                  <p className="text-yellow-800 mb-3">
                    AR visualization works best on modern mobile devices with AR capabilities (iOS 11+ or Android 7+ with ARCore).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">iPhone 6s+</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">iPad Pro</span>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Android ARCore devices</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={startARSession}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                disabled={!isARSupported}
              >
                <Eye className="w-5 h-5 mr-2" />
                {isARSupported ? 'Start AR Experience' : 'AR Not Supported'}
              </Button>
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                className="px-8 py-3"
              >
                <Maximize className="w-5 h-5 mr-2" />
                Fullscreen
              </Button>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="px-8 py-3"
              >
                <Move3D className="w-5 h-5 mr-2" />
                Share Visualization
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}