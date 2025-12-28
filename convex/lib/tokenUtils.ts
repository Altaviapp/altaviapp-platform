/**
 * Token Generation Utilities
 *
 * Provides utilities for generating secure tokens for:
 * - Invitation codes (6 digits)
 * - Email verification tokens (6 digits)
 * - Token expiration calculations
 */

/**
 * Generates a 6-digit code for invitations
 * Format: 123456
 *
 * Range: 100,000 to 999,999 (900,000 possible codes)
 */
export function generateInvitationCode(): string {
  const min = 100000; // 100 thousand
  const max = 999999; // 999 thousand
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Generates a 6-digit code for email verification
 * Format: 654321
 *
 * Uses the same format as invitation codes
 */
export function generateEmailVerificationToken(): string {
  return generateInvitationCode(); // Same format, different purpose
}

/**
 * Checks if a token has expired
 *
 * @param expiresAt - Timestamp when token expires
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Calculates expiration timestamp from now
 *
 * @param hours - Number of hours until expiration
 * @returns Timestamp when token will expire
 *
 * Examples:
 * - getTokenExpiration(24) → 24 hours from now (email verification)
 * - getTokenExpiration(168) → 7 days from now (invitation codes)
 */
export function getTokenExpiration(hours: number): number {
  return Date.now() + (hours * 60 * 60 * 1000);
}

/**
 * Validates a 6-digit code format
 *
 * @param code - The code to validate
 * @returns true if code is exactly 6 digits
 */
export function isValidCodeFormat(code: string): boolean {
  return /^\d{6}$/.test(code);
}
