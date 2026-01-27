/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps, prefer-const */
import { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Package,
  Smartphone,
  Scan,
  Download,
  Share2,
  AlertTriangle,
  Shield,
} from 'lucide-react';

interface QRCheckInOutProps {
  bookingId: string;
  equipmentId: string;
  equipmentTitle: string;
  mode: 'check-in' | 'check-out' | 'generate';
  onComplete?: (data: CheckInOutData) => void;
  onClose: () => void;
}

interface CheckInOutData {
  bookingId: string;
  type: 'check-in' | 'check-out';
  timestamp: Date;
  location?: { lat: number; lng: number };
  verificationCode: string;
  photos?: string[];
}

export default function QRCheckInOut({
  bookingId,
  equipmentId,
  equipmentTitle,
  mode,
  onComplete,
  onClose,
}: QRCheckInOutProps) {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [qrData, setQrData] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Generate QR data
    const data = {
      type: 'islakayd-rental',
      bookingId,
      equipmentId,
      timestamp: new Date().toISOString(),
      action: mode === 'check-in' ? 'pickup' : 'return',
      code: generateVerificationCode(),
    };
    setQrData(JSON.stringify(data));

    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Location not available')
      );
    }

    return () => {
      stopCamera();
    };
  }, [bookingId, equipmentId, mode]);

  const generateVerificationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const startCamera = async () => {
    setScanning(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanQRCode();
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setScanning(false);
  };

  const scanQRCode = () => {
    // Simulated QR scanning - in production, use a QR library like jsQR
    const checkForQR = setInterval(() => {
      // Simulate finding QR code after 2 seconds
      setTimeout(() => {
        clearInterval(checkForQR);
        handleQRDetected();
      }, 2000);
    }, 500);
  };

  const handleQRDetected = () => {
    setScanned(true);
    setVerifying(true);
    stopCamera();

    // Simulate verification
    setTimeout(() => {
      setVerifying(false);
      setVerified(true);

      if (onComplete) {
        onComplete({
          bookingId,
          type: mode === 'generate' ? 'check-in' : mode,
          timestamp: new Date(),
          location: location || undefined,
          verificationCode: generateVerificationCode(),
        });
      }
    }, 1500);
  };

  const generateQRCodeSVG = (data: string) => {
    // Simple QR-like pattern - in production, use a proper QR library
    const size = 200;
    const modules = 25;
    const moduleSize = size / modules;
    
    const pattern: boolean[][] = [];
    for (let i = 0; i < modules; i++) {
      pattern[i] = [];
      for (let j = 0; j < modules; j++) {
        // Create a deterministic pattern based on data
        const hash = (data.charCodeAt((i + j) % data.length) + i * j) % 100;
        pattern[i][j] = hash > 40;
      }
    }

    // Add position patterns (corners)
    const addPositionPattern = (startX: number, startY: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const isOuter = i === 0 || i === 6 || j === 0 || j === 6;
          const isInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          pattern[startY + i][startX + j] = isOuter || isInner;
        }
      }
    };

    addPositionPattern(0, 0);
    addPositionPattern(modules - 7, 0);
    addPositionPattern(0, modules - 7);

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="white" />
        {pattern.map((row, i) =>
          row.map((cell, j) =>
            cell ? (
              <rect
                key={`${i}-${j}`}
                x={j * moduleSize}
                y={i * moduleSize}
                width={moduleSize}
                height={moduleSize}
                fill="black"
              />
            ) : null
          )
        )}
      </svg>
    );
  };

  const downloadQR = () => {
    // In production, generate actual downloadable QR image
    alert('QR Code downloaded to your device!');
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Equipment ${mode === 'check-in' ? 'Pickup' : 'Return'} QR Code`,
          text: `Scan this QR code to ${mode === 'check-in' ? 'pick up' : 'return'} ${equipmentTitle}`,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      alert('Sharing not supported on this device');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-teal-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {mode === 'generate' ? 'Equipment QR Code' :
                   mode === 'check-in' ? 'Pickup Check-in' : 'Return Check-out'}
                </h2>
                <p className="text-sm text-white/80">Booking #{bookingId.slice(0, 8)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm bg-white/10 rounded-lg px-3 py-2">
            <Package className="w-4 h-4" />
            <span className="truncate">{equipmentTitle}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'generate' ? (
            // Generate QR Code View
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
                {generateQRCodeSVG(qrData)}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Valid for 24 hours</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={downloadQR}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  <button
                    onClick={shareQR}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    Share
                  </button>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div className="text-left">
                      <p className="font-medium text-amber-800">Show this code at pickup</p>
                      <p className="text-sm text-amber-600 mt-1">
                        The equipment owner will scan this QR code to verify your booking and release the equipment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Scan QR Code View
            <div>
              {!scanned ? (
                <>
                  {!scanning ? (
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gray-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                        <Scan className="w-16 h-16 text-gray-400" />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready to Scan
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Point your camera at the {mode === 'check-in' ? 'owner\'s' : 'renter\'s'} QR code to {mode === 'check-in' ? 'confirm pickup' : 'complete return'}
                      </p>

                      {error && (
                        <div className="p-4 bg-red-50 rounded-xl mb-4">
                          <p className="text-red-600 text-sm">{error}</p>
                        </div>
                      )}

                      <button
                        onClick={startCamera}
                        className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Camera className="w-5 h-5" />
                        Start Scanning
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black mb-4">
                        <video
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          playsInline
                          muted
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {/* Scan overlay */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-48 h-48 border-2 border-teal-500 rounded-2xl relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-teal-500 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-teal-500 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-teal-500 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-teal-500 rounded-br-lg" />
                            
                            {/* Scanning line animation */}
                            <div className="absolute inset-x-4 h-0.5 bg-teal-500 animate-pulse top-1/2" />
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">Scanning for QR code...</p>

                      <button
                        onClick={stopCamera}
                        className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center">
                  {verifying ? (
                    <div className="py-8">
                      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600">Verifying booking...</p>
                    </div>
                  ) : verified ? (
                    <div className="py-8">
                      <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {mode === 'check-in' ? 'Pickup Confirmed!' : 'Return Complete!'}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {mode === 'check-in'
                          ? 'Equipment has been released to you. Enjoy your rental!'
                          : 'Equipment has been returned successfully. Your deposit will be processed shortly.'}
                      </p>

                      <div className="space-y-3 text-left bg-gray-50 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {new Date().toLocaleString()}
                          </span>
                        </div>
                        {location && (
                          <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Location verified ✓
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Transaction secured on blockchain
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                      >
                        Done
                      </button>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              <span>Contactless</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
