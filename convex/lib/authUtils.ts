/**
 * Authentication Utilities
 *
 * Simple authentication system for Bubble.io integration
 * - Password hashing using Web Crypto API
 * - Token generation and validation
 * - Session management
 */

/**
 * Hash password using bcrypt
 * SALT_ROUNDS = 10 provides good balance between security and performance
 */
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify password against bcrypt hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
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
