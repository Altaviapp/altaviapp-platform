import { formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Format a timestamp as relative time (e.g., "hace 2 horas")
 */
export function formatRelativeTime(timestamp: string): string {
  return formatDistance(new Date(timestamp), new Date(), {
    addSuffix: true,
    locale: es,
  });
}

/**
 * Format a date in Spanish (Ecuador format)
 * Example: "viernes, 05/01/2025"
 */
export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format a date short (Ecuador format)
 * Example: "05/01/2025"
 */
export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

/**
 * Format time in 24-hour format
 * Example: "14:30"
 */
export function formatTime(time: string): string {
  // Time is already in HH:mm format
  return time;
}

/**
 * Get greeting based on current hour
 * Returns: "Buenos días", "Buenas tardes", or "Buenas noches"
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Check if a date is today
 */
export function isToday(date: string): boolean {
  return date === getTodayDate();
}
