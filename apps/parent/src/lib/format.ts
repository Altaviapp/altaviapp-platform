/**
 * Formatting utilities for Parent app
 * Date, time, and display formatting functions
 */

import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// ============================================
// Date & Time Formatting
// ============================================

/**
 * Format a timestamp to relative time (e.g., "hace 5 minutos")
 */
export function formatTimeAgo(timestamp: number | string | Date): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  return formatDistanceToNow(date, { addSuffix: true, locale: es });
}

/**
 * Format a timestamp to a readable date (e.g., "25/12/2024")
 */
export function formatDate(timestamp: number | string | Date): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  return format(date, 'dd/MM/yyyy', { locale: es });
}

/**
 * Format a timestamp to a readable time (e.g., "14:30")
 */
export function formatTime(timestamp: number | string | Date): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  return format(date, 'HH:mm', { locale: es });
}

/**
 * Format a date relative to today (e.g., "Hoy", "Ayer", "Lunes 23/12")
 */
export function formatRelativeDate(timestamp: number | string | Date): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);

  if (isToday(date)) {
    return 'Hoy';
  }
  if (isYesterday(date)) {
    return 'Ayer';
  }
  return format(date, "EEEE dd/MM", { locale: es });
}

/**
 * Format duration in minutes to readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

/**
 * Format ETA time from minutes
 */
export function formatETA(minutesToAdd: number): string {
  const eta = new Date(Date.now() + minutesToAdd * 60000);
  return format(eta, 'HH:mm');
}

/**
 * Get greeting based on current hour
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos dias';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// ============================================
// Display Formatting
// ============================================

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a full name
 */
export function formatFullName(firstName: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

/**
 * Format distance in meters to readable string
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}
