/**
 * Notification Time Formatting
 *
 * Consistent relative time formatting across all apps.
 */

/**
 * Format a timestamp as relative time in Spanish
 */
export function formatRelativeTime(timestamp: number | string): string {
  const date = new Date(
    typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp
  );
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  if (days < 7) return `Hace ${days}d`;

  return date.toLocaleDateString('es-EC', { day: '2-digit', month: '2-digit' });
}
