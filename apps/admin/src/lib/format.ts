/**
 * Formatting utilities for Admin app
 * Date, time, phone, and display formatting functions
 */

import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

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
 * Format a timestamp to date and time (e.g., "25/12/2024 14:30")
 */
export function formatDateTime(timestamp: number | string | Date): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
  return format(date, 'dd/MM/yyyy HH:mm', { locale: es });
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
 * Format a date for display in lists (e.g., "Hoy 14:30" or "25/12 14:30")
 */
export function formatListDate(timestamp: number | string | Date): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);

  if (isToday(date)) {
    return `Hoy ${format(date, 'HH:mm')}`;
  }
  if (isYesterday(date)) {
    return `Ayer ${format(date, 'HH:mm')}`;
  }
  return format(date, 'dd/MM HH:mm', { locale: es });
}

/**
 * Format a phone number for display (Ecuador format)
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Ecuador mobile: 09X XXX XXXX (10 digits)
  if (digits.length === 10 && digits.startsWith('09')) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }

  // Ecuador with country code: +593 9X XXX XXXX
  if (digits.length === 12 && digits.startsWith('593')) {
    return `+593 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
  }

  // Return original if format unknown
  return phone;
}

/**
 * Get initials from a name (e.g., "Juan Pérez" -> "JP")
 */
export function getInitials(firstName: string, lastName?: string): string {
  const first = firstName?.trim().charAt(0).toUpperCase() || '';
  const last = lastName?.trim().charAt(0).toUpperCase() || '';
  return `${first}${last}`;
}

/**
 * Format a full name
 */
export function formatFullName(firstName: string, lastName?: string): string {
  return [firstName, lastName].filter(Boolean).join(' ');
}

/**
 * Format a license plate for display
 */
export function formatLicensePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * Format duration in minutes to readable string (e.g., "1h 30min")
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
 * Format distance in meters to readable string (e.g., "2.5 km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Format a number with thousand separators
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-EC').format(num);
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 3)}...`;
}

/**
 * Capitalize first letter of each word
 */
export function capitalize(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format a scheduled time string (HH:MM) to display format
 */
export function formatScheduledTime(time: string): string {
  // Already in HH:MM format
  if (/^\d{2}:\d{2}$/.test(time)) {
    return time;
  }
  // Try to parse and format
  try {
    const parts = time.split(':').map(Number);
    const hours = parts[0];
    const minutes = parts[1];
    if (hours === undefined || minutes === undefined || isNaN(hours) || isNaN(minutes)) {
      return time;
    }
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch {
    return time;
  }
}

/**
 * Format ETA time from minutes
 */
export function formatETA(date: Date, minutesToAdd: number): string {
  const eta = new Date(date.getTime() + minutesToAdd * 60000);
  return format(eta, 'HH:mm');
}

/**
 * Parse a date string in YYYY-MM-DD format
 */
export function parseDateString(dateString: string): Date {
  return parseISO(dateString);
}

/**
 * Get date string in YYYY-MM-DD format
 */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
