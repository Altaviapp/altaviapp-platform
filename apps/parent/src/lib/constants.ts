/**
 * Centralized constants for Parent app
 * All status, role, type configurations in one place
 */

// Trip status configurations
export const TRIP_STATUS_CONFIG = {
  scheduled: { label: 'Programado', variant: 'default' as const, color: 'bg-gray-100 text-gray-600', dotColor: 'bg-gray-400' },
  in_progress: { label: 'En Ruta', variant: 'info' as const, color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
  completed: { label: 'Completado', variant: 'success' as const, color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  cancelled: { label: 'Cancelado', variant: 'danger' as const, color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
} as const;

// Route type configurations
export const ROUTE_TYPE_CONFIG = {
  pickup: { label: 'Recogida', variant: 'info' as const, color: 'bg-blue-100 text-blue-700', icon: 'ArrowUpCircle' },
  dropoff: { label: 'Entrega', variant: 'warning' as const, color: 'bg-purple-100 text-purple-700', icon: 'ArrowDownCircle' },
} as const;

// Check-in status configurations
export const CHECKIN_STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'default' as const, color: 'bg-gray-100 text-gray-600' },
  onboard: { label: 'A Bordo', variant: 'info' as const, color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Entregado', variant: 'success' as const, color: 'bg-green-100 text-green-700' },
  absent: { label: 'Ausente', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' },
} as const;

// Novedad type configurations (parent-focused)
export const NOVEDAD_TYPE_CONFIG = {
  absence: { label: 'Ausencia', icon: 'UserX', variant: 'default' as const, color: 'bg-gray-100 text-gray-600' },
  parent_pickup: { label: 'Recoge Padre', icon: 'UserCheck', variant: 'info' as const, color: 'bg-blue-100 text-blue-700' },
  stop_change: { label: 'Cambio de Parada', icon: 'MapPin', variant: 'purple' as const, color: 'bg-purple-100 text-purple-700' },
  early_pickup: { label: 'Salida Temprana', icon: 'Clock', variant: 'warning' as const, color: 'bg-orange-100 text-orange-700' },
  late_arrival: { label: 'Llegada Tarde', icon: 'Clock', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' },
} as const;

// Novedad status configurations
export const NOVEDAD_STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Aprobada', variant: 'success' as const, color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazada', variant: 'danger' as const, color: 'bg-red-100 text-red-700' },
  applied: { label: 'Aplicada', variant: 'info' as const, color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelada', variant: 'default' as const, color: 'bg-gray-100 text-gray-600' },
  expired: { label: 'Expirada', variant: 'default' as const, color: 'bg-gray-100 text-gray-600' },
} as const;

// Notification type configurations
export const NOTIFICATION_TYPE_CONFIG = {
  trip_started: { label: 'Viaje Iniciado', variant: 'info' as const, icon: 'Bus' },
  trip_completed: { label: 'Viaje Completado', variant: 'success' as const, icon: 'CheckCircle' },
  checkin: { label: 'Check-in', variant: 'success' as const, icon: 'UserCheck' },
  checkout: { label: 'Check-out', variant: 'info' as const, icon: 'UserMinus' },
  delay: { label: 'Retraso', variant: 'warning' as const, icon: 'Clock' },
  novedad_approved: { label: 'Novedad Aprobada', variant: 'success' as const, icon: 'CheckCircle' },
  novedad_rejected: { label: 'Novedad Rechazada', variant: 'danger' as const, icon: 'XCircle' },
  general: { label: 'General', variant: 'default' as const, icon: 'Bell' },
} as const;

// Day of week configurations
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes', short: 'L' },
  { value: 2, label: 'Martes', short: 'M' },
  { value: 3, label: 'Miercoles', short: 'X' },
  { value: 4, label: 'Jueves', short: 'J' },
  { value: 5, label: 'Viernes', short: 'V' },
  { value: 6, label: 'Sabado', short: 'S' },
  { value: 0, label: 'Domingo', short: 'D' },
] as const;

// Brand colors
export const BRAND_COLORS = {
  primary: '#042940',
  accent: '#DBF227',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

// Type exports
export type TripStatusKey = keyof typeof TRIP_STATUS_CONFIG;
export type RouteTypeKey = keyof typeof ROUTE_TYPE_CONFIG;
export type CheckinStatusKey = keyof typeof CHECKIN_STATUS_CONFIG;
export type NovedadTypeKey = keyof typeof NOVEDAD_TYPE_CONFIG;
export type NovedadStatusKey = keyof typeof NOVEDAD_STATUS_CONFIG;
export type NotificationTypeKey = keyof typeof NOTIFICATION_TYPE_CONFIG;
