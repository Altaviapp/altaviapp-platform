/**
 * Authentication Utilities
 *
 * Simple authentication system for Bubble.io integration
 * - Password hashing using Web Crypto API
 * - Token generation and validation
 * - Session management
 */

/**
 * Hash password using SHA-256
 * Note: In production, consider using bcrypt or similar
 */
export async function hashPassword(password: string): Promise<string> {
  // Simple hash for development
  // In production, use a proper password hashing library
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "altaviapp_salt_2025");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Generate authentication token
 * Simple token for session management
 */
export function generateToken(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const token = `${userId}_${timestamp}_${random}`;

  // Base64 encode for cleaner token
  return btoa(token);
}

/**
 * Parse token to get user ID
 * Returns null if token is invalid
 */
export function parseToken(token: string): string | null {
  try {
    const decoded = atob(token);
    const parts = decoded.split("_");

    if (parts.length !== 3) {
      return null;
    }

    // parts[0] = userId
    // parts[1] = timestamp
    // parts[2] = random

    return parts[0];
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
 * Validate phone number (Ecuador format)
 * Format: +593XXXXXXXXX (13 characters)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+593\d{9}$/;
  return phoneRegex.test(phone);
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
