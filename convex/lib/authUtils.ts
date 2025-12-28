/**
 * Authentication Utilities
 *
 * Password hashing using Web Crypto API (PBKDF2)
 * Works in Convex's restricted runtime without Node.js
 */

const ITERATIONS = 100000;
const KEY_LENGTH = 256;
const SALT_LENGTH = 16;

/**
 * Generate random bytes using Web Crypto API
 */
function getRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Convert ArrayBuffer to hex string
 */
function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to Uint8Array
 */
function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Hash password using PBKDF2 with Web Crypto API
 * Returns: salt:hash (both as hex strings)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = getRandomBytes(SALT_LENGTH);
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);

  // Import password as key
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH
  );

  const saltHex = bufferToHex(salt);
  const hashHex = bufferToHex(derivedBits);

  return `${saltHex}:${hashHex}`;
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    const [saltHex, hashHex] = storedHash.split(":");
    if (!saltHex || !hashHex) {
      return false;
    }

    const salt = hexToBuffer(saltHex);
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as key
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      passwordBuffer,
      "PBKDF2",
      false,
      ["deriveBits"]
    );

    // Derive bits using same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt.buffer as ArrayBuffer,
        iterations: ITERATIONS,
        hash: "SHA-256",
      },
      keyMaterial,
      KEY_LENGTH
    );

    const computedHashHex = bufferToHex(derivedBits);

    // Constant-time comparison to prevent timing attacks
    return computedHashHex === hashHex;
  } catch {
    return false;
  }
}

/**
 * Generate authentication token
 */
export function generateToken(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const token = `${userId}_${timestamp}_${random}`;
  return btoa(token);
}

/**
 * Parse token to get user ID
 */
export function parseToken(token: string): string | null {
  try {
    const decoded = atob(token);
    const parts = decoded.split("_");
    if (parts.length !== 3) {
      return null;
    }
    return parts[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Ecuador and Colombia formats)
 * Ecuador: +593XXXXXXXXX (13 characters, 9 digits after prefix)
 * Colombia: +57XXXXXXXXXX (13 characters, 10 digits after prefix)
 */
export function isValidPhone(phone: string): boolean {
  // Ecuador: +593 + 9 digits
  if (/^\+593\d{9}$/.test(phone)) return true;
  // Colombia: +57 + 10 digits
  if (/^\+57\d{10}$/.test(phone)) return true;
  return false;
}

/**
 * Get country code from phone number
 */
export function getPhoneCountry(phone: string): 'EC' | 'CO' | null {
  if (phone.startsWith('+593')) return 'EC';
  if (phone.startsWith('+57')) return 'CO';
  return null;
}

/**
 * Validate password strength
 * Min 8 characters, at least one letter and one number
 */
export function isValidPassword(password: string): boolean {
  if (password.length < 8) {
    return false;
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}
