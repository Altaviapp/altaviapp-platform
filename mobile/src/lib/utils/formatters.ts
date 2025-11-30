/**
 * Format phone number in Ecuador format
 * Example: +593987654321 → +593 98 765 4321
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // Format as Ecuador phone: +593 98 765 4321
  return cleaned.replace(/(\+\d{3})(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
}

/**
 * Format vehicle plate (uppercase)
 * Example: abc-1234 → ABC-1234
 */
export function formatPlate(plate: string): string {
  if (!plate) return '';
  return plate.toUpperCase();
}

/**
 * Format capacity as fraction
 * Example: (28, 30) → "28/30"
 */
export function formatCapacity(current: number, total: number): string {
  return `${current}/${total}`;
}

/**
 * Format percentage
 * Example: 100 → "100%"
 */
export function formatPercentage(value: number): string {
  return `${value}%`;
}

/**
 * Format number with thousand separators (Spanish format)
 * Example: 1234 → "1.234"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-EC').format(num);
}

/**
 * Get student initials from full name
 * Example: "Juan Pérez" → "JP"
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format duration in minutes to human readable
 * Example: 90 → "1h 30min"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}
