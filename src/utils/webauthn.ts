// Client-side WebAuthn (passkey) helpers. These run the real platform
// authenticator ceremony — Touch ID / Face ID / Windows Hello / Android
// fingerprint — via the browser Credential Management API.
//
// NOTE: For a full security boundary the challenge should be issued and the
// resulting assertion verified server-side. Until a WebAuthn backend exists,
// these provide genuine device-local biometric verification (replacing the
// previous random/mock flow) and persist only the public credential id
// locally. They never fabricate a success result.

const storageKey = (userId: string) => `biometric_${userId}`;

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export function hasRegisteredPasskey(userId: string): boolean {
  try {
    return !!localStorage.getItem(storageKey(userId));
  } catch {
    return false;
  }
}

// No explicit return-type annotation: let TS infer it. `new Uint8Array(32)` is
// ArrayBuffer-backed, which satisfies BufferSource on both older (non-generic
// Uint8Array) and newer (generic Uint8Array<ArrayBuffer>) TypeScript lib versions.
function randomChallenge() {
  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  return challenge;
}

/**
 * Register a platform passkey for the given user. Triggers the real device
 * biometric prompt; resolves only if the authenticator confirms the user.
 */
export async function registerPasskey(userId: string): Promise<void> {
  // WebAuthn caps the user handle at 64 bytes. A Supabase UUID is 36 bytes so
  // this is normally fine, but guard against unexpectedly long ids.
  const userHandle = new TextEncoder().encode(userId);
  if (userHandle.byteLength === 0 || userHandle.byteLength > 64) {
    throw new Error('Cannot register a passkey: invalid user identifier length.');
  }

  const options: PublicKeyCredentialCreationOptions = {
    challenge: randomChallenge(),
    rp: { name: 'Islakayd', id: window.location.hostname },
    user: {
      id: userHandle,
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

  const credential = (await navigator.credentials.create({
    publicKey: options,
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error('Biometric setup was cancelled.');

  const credentialId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  try {
    localStorage.setItem(storageKey(userId), credentialId);
  } catch {
    // A credential was created on the authenticator but we couldn't persist its
    // id (storage full / disabled). Surface it rather than reporting success.
    throw new Error('Biometric setup could not be saved on this device. Please enable storage and try again.');
  }
}

/**
 * Authenticate the given user with their registered platform passkey.
 * Triggers the real device biometric prompt; resolves only on success.
 */
export async function authenticatePasskey(userId: string): Promise<void> {
  const stored = localStorage.getItem(storageKey(userId));
  if (!stored) throw new Error('No passkey is registered on this device.');

  const credentialId = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
  const options: PublicKeyCredentialRequestOptions = {
    challenge: randomChallenge(),
    allowCredentials: [{ id: credentialId, type: 'public-key', transports: ['internal'] }],
    userVerification: 'required',
    timeout: 60000,
  };

  const assertion = await navigator.credentials.get({ publicKey: options });
  if (!assertion) throw new Error('Biometric authentication was cancelled.');
}
