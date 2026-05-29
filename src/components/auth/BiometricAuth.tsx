import { useState, useEffect, useCallback } from 'react';
import { Fingerprint, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  isPlatformAuthenticatorAvailable,
  hasRegisteredPasskey,
  registerPasskey,
  authenticatePasskey,
} from '../../utils/webauthn';

interface BiometricAuthProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  userId?: string;
}

interface BiometricCapabilities {
  available: boolean;
  type: 'fingerprint' | 'face' | 'iris' | 'unknown';
  platformAuthenticator: boolean;
}

export default function BiometricAuth({ onSuccess, onError, userId }: BiometricAuthProps) {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const checkBiometricCapabilities = useCallback(async () => {
    const platformAuth = await isPlatformAuthenticatorAvailable();
    if (!platformAuth) {
      setCapabilities({ available: false, type: 'unknown', platformAuthenticator: false });
      return;
    }

    try {
      // Detect biometric type (simplified detection)
      const userAgent = navigator.userAgent.toLowerCase();
      let type: BiometricCapabilities['type'] = 'unknown';
      
      if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        type = 'face'; // Face ID on iOS
      } else if (userAgent.includes('mac')) {
        type = 'fingerprint'; // Touch ID on Mac
      } else if (userAgent.includes('android')) {
        type = 'fingerprint'; // Most Android devices use fingerprint
      } else if (userAgent.includes('windows')) {
        type = 'face'; // Windows Hello can be face or fingerprint
      }

      setCapabilities({
        available: platformAuth,
        type,
        platformAuthenticator: platformAuth,
      });
    } catch {
      setCapabilities({ available: false, type: 'unknown', platformAuthenticator: false });
    }
  }, []);

  const checkIfRegistered = useCallback(() => {
    setIsRegistered(userId ? hasRegisteredPasskey(userId) : false);
  }, [userId]);

  useEffect(() => {
    checkBiometricCapabilities();
    checkIfRegistered();
  }, [checkBiometricCapabilities, checkIfRegistered]);

  const registerBiometric = async () => {
    if (!capabilities?.available || !userId) return;

    setIsRegistering(true);

    try {
      await registerPasskey(userId);
      setIsRegistered(true);
      onSuccess();
    } catch (error) {
      console.error('Biometric registration error:', error);
      onError('Biometric registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const authenticateWithBiometric = async () => {
    if (!capabilities?.available || !userId) return;

    setIsAuthenticating(true);

    try {
      await authenticatePasskey(userId);
      onSuccess();
    } catch (error) {
      console.error('Biometric authentication error:', error);
      onError('Biometric authentication failed. Please try again or use password.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const getBiometricIcon = () => {
    switch (capabilities?.type) {
      case 'face':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="9" cy="10" r="1" fill="currentColor"/>
            <circle cx="15" cy="10" r="1" fill="currentColor"/>
            <path d="M8 15c1.5 2 6.5 2 8 0"/>
          </svg>
        );
      case 'iris':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
            <circle cx="12" cy="12" r="3"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="10"/>
          </svg>
        );
      default:
        return <Fingerprint className="w-8 h-8" />;
    }
  };

  const getBiometricName = () => {
    switch (capabilities?.type) {
      case 'face': return 'Face ID';
      case 'iris': return 'Iris Scan';
      case 'fingerprint': return 'Fingerprint';
      default: return 'Biometric';
    }
  };

  if (!capabilities?.available) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Biometric authentication is not available on this device.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 rounded-2xl border border-teal-100 dark:border-teal-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white">
              {getBiometricIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{getBiometricName()}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isRegistered ? 'Ready to use' : 'Not set up'}
              </p>
            </div>
          </div>
          {isRegistered && (
            <ShieldCheck className="w-6 h-6 text-green-500" />
          )}
        </div>

        {isRegistered ? (
          <button
            onClick={authenticateWithBiometric}
            disabled={isAuthenticating}
            className="w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-3"
           >
            {isAuthenticating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                {getBiometricIcon()}
                <span>Sign in with {getBiometricName()}</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={registerBiometric}
            disabled={isRegistering}
            className="w-full py-4 bg-white dark:bg-gray-800 border-2 border-teal-500 text-teal-600 dark:text-teal-400 font-semibold rounded-xl hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
           >
            {isRegistering ? (
              <>
                <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Smartphone className="w-5 h-5" />
                <span>Set up {getBiometricName()}</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Your biometric data never leaves your device. We only store a secure cryptographic key that verifies your identity.
        </p>
      </div>
    </div>
  );
}
