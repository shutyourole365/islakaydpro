import { useState, useEffect } from 'react';
import {
  Fingerprint,
  Scan,
  Shield,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Key,
  Lock,
  X,
  Loader2,
} from 'lucide-react';

interface BiometricAuthProps {
  onSuccess: () => void;
  onCancel: () => void;
  mode?: 'register' | 'authenticate';
}

export default function BiometricAuth({ onSuccess, onCancel, mode = 'authenticate' }: BiometricAuthProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'face' | 'none'>('none');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  // Check if biometric authentication is available
  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      // Check if WebAuthn is available
      if (window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
        if (available) {
          // Determine the likely biometric type based on platform
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const isApple = /iPhone|iPad|iPod|Mac/i.test(navigator.userAgent);
          setBiometricType(isApple && isMobile ? 'face' : 'fingerprint');
        }
      } else {
        setIsSupported(false);
      }
    } catch {
      setIsSupported(false);
    }
  };

  const startBiometricAuth = async () => {
    setStatus('scanning');
    setErrorMessage(null);

    try {
      // Simulate biometric authentication
      // In production, use WebAuthn API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success (80% success rate for demo)
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        throw new Error('Authentication failed. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const BiometricIcon = biometricType === 'face' ? Scan : Fingerprint;

  return (
    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {mode === 'register' ? 'Set Up Biometrics' : 'Biometric Login'}
              </h2>
              <p className="text-teal-100 text-sm">
                {mode === 'register' ? 'Secure your account with biometrics' : 'Quick and secure authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isSupported === null ? (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking device compatibility...</p>
          </div>
        ) : !isSupported ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Not Supported</h3>
            <p className="text-gray-600 mb-6">
              Biometric authentication is not available on this device. Please use your password to log in.
            </p>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
            >
              Use Password Instead
            </button>
          </div>
        ) : (
          <>
            {/* Biometric Visualization */}
            <div className="text-center py-8">
              <div className={`relative w-32 h-32 mx-auto mb-6 ${status === 'scanning' ? 'animate-pulse' : ''}`}>
                {/* Outer ring */}
                <div className={`absolute inset-0 rounded-full border-4 transition-colors duration-300 ${
                  status === 'idle' ? 'border-gray-200' :
                  status === 'scanning' ? 'border-teal-300 animate-ping' :
                  status === 'success' ? 'border-green-500' :
                  'border-red-500'
                }`} />
                
                {/* Inner circle */}
                <div className={`absolute inset-4 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  status === 'idle' ? 'bg-gray-100' :
                  status === 'scanning' ? 'bg-teal-50' :
                  status === 'success' ? 'bg-green-50' :
                  'bg-red-50'
                }`}>
                  {status === 'success' ? (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  ) : (
                    <BiometricIcon className={`w-12 h-12 ${
                      status === 'scanning' ? 'text-teal-600 animate-pulse' : 'text-gray-400'
                    }`} />
                  )}
                </div>

                {/* Scanning animation rings */}
                {status === 'scanning' && (
                  <>
                    <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-75" style={{ animationDelay: '0s' }} />
                    <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-50" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
              </div>

              {/* Status Text */}
              <h3 className={`text-lg font-semibold mb-2 ${
                status === 'success' ? 'text-green-600' :
                status === 'error' ? 'text-red-600' :
                'text-gray-900'
              }`}>
                {status === 'idle' && (biometricType === 'face' ? 'Face ID Ready' : 'Touch ID Ready')}
                {status === 'scanning' && 'Scanning...'}
                {status === 'success' && 'Authentication Successful!'}
                {status === 'error' && 'Authentication Failed'}
              </h3>

              <p className="text-gray-600 text-sm">
                {status === 'idle' && `Tap the button below to authenticate with ${biometricType === 'face' ? 'Face ID' : 'Touch ID'}`}
                {status === 'scanning' && `Place your ${biometricType === 'face' ? 'face' : 'finger'} on the sensor`}
                {status === 'success' && 'You have been successfully authenticated'}
                {status === 'error' && errorMessage}
              </p>
            </div>

            {/* Actions */}
            {status !== 'success' && (
              <div className="space-y-3">
                <button
                  onClick={startBiometricAuth}
                  disabled={status === 'scanning'}
                  className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all ${
                    status === 'scanning'
                      ? 'bg-teal-100 text-teal-600 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {status === 'scanning' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <BiometricIcon className="w-5 h-5" />
                      {biometricType === 'face' ? 'Use Face ID' : 'Use Touch ID'}
                    </>
                  )}
                </button>

                <button
                  onClick={onCancel}
                  className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium flex items-center justify-center gap-2"
                >
                  <Key className="w-4 h-4" />
                  Use Password Instead
                </button>
              </div>
            )}

            {/* Security Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-teal-600" />
                Security Information
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Your biometric data never leaves your device</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>256-bit end-to-end encryption</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Compliant with FIDO2 security standards</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Device Support Note */}
      <div className="px-6 pb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Smartphone className="w-4 h-4" />
          <span>Supported devices: iPhone (Face ID/Touch ID), iPad, Mac, Windows Hello, Android Fingerprint</span>
        </div>
      </div>
    </div>
  );
}
