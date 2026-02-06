import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  X,
  Flashlight,
  FlashlightOff,
  SwitchCamera,
  QrCode,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
  Info,
  ChevronRight,
  History,
  Loader2,
} from 'lucide-react';

interface ScanResult {
  type: 'equipment' | 'booking' | 'user' | 'unknown';
  id: string;
  data?: Record<string, unknown>;
}

interface QRCodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (result: ScanResult) => void;
  className?: string;
}

export default function QRCodeScanner({
  isOpen,
  onClose,
  onScan,
  className = '',
}: QRCodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize camera
  useEffect(() => {
    if (!isOpen) return;

    const initCamera = async () => {
      try {
        // Get available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        setCameras(videoDevices);

        // Start camera stream
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: currentCamera === 0 ? 'environment' : 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsScanning(true);

          // Check for flash capability
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities?.() as MediaTrackCapabilities & { torch?: boolean };
          setHasFlash(capabilities?.torch === true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Unable to access camera. Please grant camera permissions.');
      }
    };

    initCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, currentCamera]);

  // Scan for QR codes
  useEffect(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastScanTime = 0;

    const scanFrame = () => {
      const now = Date.now();
      if (now - lastScanTime < 200) {
        animationId = requestAnimationFrame(scanFrame);
        return;
      }
      lastScanTime = now;

      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        animationId = requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Simulated QR detection (in production, use a library like jsQR)
      // This simulates finding a QR code after scanning
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const detected = simulateQRDetection(imageData);
      
      if (detected) {
        handleScanResult(detected);
      }

      animationId = requestAnimationFrame(scanFrame);
    };

    animationId = requestAnimationFrame(scanFrame);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isScanning]);

  // Simulate QR detection (replace with actual QR library in production)
  const simulateQRDetection = (_imageData: ImageData): string | null => {
    // In production, use jsQR or similar library
    // This is a placeholder that randomly "detects" QR codes for demo
    if (Math.random() < 0.001) { // Very low probability for demo
      const types = ['equipment', 'booking', 'user'];
      const type = types[Math.floor(Math.random() * types.length)];
      return `islakayd://${type}/demo-${Date.now()}`;
    }
    return null;
  };

  // Parse and handle scan result
  const handleScanResult = useCallback((qrData: string) => {
    setIsScanning(false);

    // Parse QR code format: islakayd://type/id or JSON
    let result: ScanResult;

    try {
      if (qrData.startsWith('islakayd://')) {
        const [, path] = qrData.split('://');
        const [type, id] = path.split('/');
        result = {
          type: type as ScanResult['type'],
          id,
        };
      } else if (qrData.startsWith('{')) {
        const data = JSON.parse(qrData);
        result = {
          type: data.type || 'unknown',
          id: data.id || 'unknown',
          data,
        };
      } else {
        result = {
          type: 'unknown',
          id: qrData,
        };
      }

      setScanResult(result);
      setRecentScans(prev => [result, ...prev.slice(0, 9)]);

      // Vibrate on successful scan
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch {
      setError('Invalid QR code format');
      setIsScanning(true);
    }
  }, []);

  // Toggle flash
  const toggleFlash = async () => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn } as MediaTrackConstraintSet],
      });
      setFlashOn(!flashOn);
    } catch (err) {
      console.error('Flash toggle error:', err);
    }
  };

  // Switch camera
  const switchCamera = () => {
    setCurrentCamera(prev => (prev + 1) % cameras.length);
  };

  // Confirm scan result
  const confirmScan = () => {
    if (scanResult) {
      onScan(scanResult);
      setScanResult(null);
      onClose();
    }
  };

  // Continue scanning
  const continueScan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  // Manual QR input (for demo)
  const manualScan = () => {
    const demoTypes: ScanResult['type'][] = ['equipment', 'booking', 'user'];
    const type = demoTypes[Math.floor(Math.random() * demoTypes.length)];
    handleScanResult(`islakayd://${type}/demo-${Date.now()}`);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 bg-black ${className}`}>
      {/* Camera View */}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Scan Frame */}
            <div className="w-64 h-64 relative">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-lg" />

              {/* Scanning line animation */}
              {isScanning && (
                <div className="absolute inset-x-4 top-4 h-0.5 bg-emerald-500 animate-scan-line" />
              )}
            </div>

            {/* Instruction text */}
            <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white text-center whitespace-nowrap">
              {isScanning ? 'Point camera at QR code' : 'Processing...'}
            </p>
          </div>
        </div>

        {/* Dark overlay outside scan area */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-black/60" />
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-transparent"
            style={{ boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
          />
        </div>

        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {hasFlash && (
              <button
                onClick={toggleFlash}
                className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
              >
                {flashOn ? (
                  <Flashlight className="w-5 h-5 text-yellow-400" />
                ) : (
                  <FlashlightOff className="w-5 h-5" />
                )}
              </button>
            )}

            {cameras.length > 1 && (
              <button
                onClick={switchCamera}
                className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white"
            >
              <History className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={manualScan}
              className="px-6 py-3 bg-white/20 backdrop-blur rounded-full text-white flex items-center gap-2"
            >
              <QrCode className="w-5 h-5" />
              Demo Scan
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="absolute top-20 left-4 right-4">
            <div className="bg-red-500/90 backdrop-blur rounded-xl p-4 flex items-center gap-3 text-white">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="flex-1">{error}</p>
              <button onClick={() => setError(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Recent Scans Panel */}
        {showHistory && recentScans.length > 0 && (
          <div className="absolute top-16 right-4 w-64 bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="p-3 bg-gray-50 border-b">
              <h3 className="font-medium text-gray-900">Recent Scans</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {recentScans.map((scan, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setScanResult(scan);
                    setShowHistory(false);
                  }}
                  className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 border-b last:border-0"
                >
                  {scan.type === 'equipment' && <Package className="w-4 h-4 text-emerald-600" />}
                  {scan.type === 'booking' && <Calendar className="w-4 h-4 text-blue-600" />}
                  {scan.type === 'user' && <Info className="w-4 h-4 text-violet-600" />}
                  {scan.type === 'unknown' && <QrCode className="w-4 h-4 text-gray-600" />}
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900 capitalize">{scan.type}</p>
                    <p className="text-xs text-gray-500 truncate">{scan.id}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scan Result Modal */}
        {scanResult && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
              {/* Success Header */}
              <div className="p-6 text-center bg-gradient-to-b from-emerald-50 to-white">
                <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">QR Code Scanned!</h3>
                <p className="text-gray-500 mt-1 capitalize">{scanResult.type} detected</p>
              </div>

              {/* Result Details */}
              <div className="p-4 border-t">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    {scanResult.type === 'equipment' && <Package className="w-5 h-5 text-emerald-600" />}
                    {scanResult.type === 'booking' && <Calendar className="w-5 h-5 text-blue-600" />}
                    {scanResult.type === 'user' && <Info className="w-5 h-5 text-violet-600" />}
                    {scanResult.type === 'unknown' && <QrCode className="w-5 h-5 text-gray-600" />}
                    <div>
                      <p className="text-sm text-gray-500">Type</p>
                      <p className="font-medium text-gray-900 capitalize">{scanResult.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Info className="w-5 h-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-500">ID</p>
                      <p className="font-medium text-gray-900 truncate">{scanResult.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t flex gap-3">
                <button
                  onClick={continueScan}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50"
                >
                  Scan Another
                </button>
                <button
                  onClick={confirmScan}
                  className="flex-1 py-3 bg-emerald-600 rounded-xl font-medium text-white hover:bg-emerald-700"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!isScanning && !scanResult && !error && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p>Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* CSS for scanning animation */}
      <style>{`
        @keyframes scan-line {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(240px); }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
        .pb-safe {
          padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
        }
      `}</style>
    </div>
  );
}
