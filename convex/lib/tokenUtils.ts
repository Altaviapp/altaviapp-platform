/**
 * Token Generation Utilities
 *
 * Provides utilities for generating secure tokens for:
 * - Invitation codes (8 digits)
 * - Email verification tokens (8 digits)
 * - Token expiration calculations
 */

/**
 * Generates an 8-digit code for invitations
 * Format: 12345678
 *
 * Range: 10,000,000 to 99,999,999 (90 million possible codes)
 */
export function generateInvitationCode(): string {
  const min = 10000000; // 10 million
  const max = 99999999; // 99 million
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
}

/**
 * Generates an 8-digit code for email verification
 * Format: 87654321
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
 * Validates an 8-digit code format
 *
 * @param code - The code to validate
 * @returns true if code is exactly 8 digits
 */
export function isValidCodeFormat(code: string): boolean {
  return /^\d{8}$/.test(code);
}
