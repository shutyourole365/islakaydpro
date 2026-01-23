import { useState, useEffect } from 'react';
import { Fingerprint, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react';

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

  useEffect(() => {
    checkBiometricCapabilities();
    checkIfRegistered();
  }, [userId]);

  const checkBiometricCapabilities = async () => {
    if (!window.PublicKeyCredential) {
      setCapabilities({ available: false, type: 'unknown', platformAuthenticator: false });
      return;
    }

    try {
      const platformAuth = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
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
  };

  const checkIfRegistered = () => {
    // Check localStorage for registered credentials
    const stored = localStorage.getItem(`biometric_${userId}`);
    setIsRegistered(!!stored);
  };

  const registerBiometric = async () => {
    if (!capabilities?.available || !userId) return;

    setIsRegistering(true);

    try {
      // Generate challenge (in production, this should come from server)
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'Islakayd',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: 'Islakayd User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions,
      }) as PublicKeyCredential;

      if (credential) {
        // Store credential ID (in production, send to server)
        const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
        localStorage.setItem(`biometric_${userId}`, credentialId);
        setIsRegistered(true);
        onSuccess();
      }
    } catch (err) {
      onError('Biometric registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  const authenticateWithBiometric = async () => {
    if (!capabilities?.available || !userId) return;

    setIsAuthenticating(true);

    try {
      const storedCredentialId = localStorage.getItem(`biometric_${userId}`);
      if (!storedCredentialId) {
        onError('No biometric credential found. Please register first.');
        setIsAuthenticating(false);
        return;
      }

      // Generate challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      // Convert stored credential ID back to ArrayBuffer
      const credentialIdArray = Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0));

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: credentialIdArray,
          type: 'public-key',
          transports: ['internal'],
        }],
        userVerification: 'required',
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      });

      if (assertion) {
        onSuccess();
      }
    } catch (err) {
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
      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 text-gray-500">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">Biometric authentication is not available on this device.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl border border-teal-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center text-white">
              {getBiometricIcon()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{getBiometricName()}</h3>
              <p className="text-sm text-gray-600">
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
            className="w-full py-4 bg-white border-2 border-teal-500 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
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

      <div className="flex items-start gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Your biometric data never leaves your device. We only store a secure cryptographic key that verifies your identity.
        </p>
      </div>
    </div>
  );
}
