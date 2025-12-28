/**
 * Centralized constants for Crew app
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

// Check-in status configurations (for students)
export const CHECKIN_STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'default' as const, color: 'bg-gray-100 text-gray-600' },
  onboard: { label: 'A Bordo', variant: 'info' as const, color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Entregado', variant: 'success' as const, color: 'bg-green-100 text-green-700' },
  absent: { label: 'Ausente', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' },
  absent_notified: { label: 'Ausente (Notificado)', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' },
} as const;

// Vehicle status configurations
export const VEHICLE_STATUS_CONFIG = {
  active: { label: 'Activo', variant: 'success' as const, color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'En Mantenimiento', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' },
  out_of_service: { label: 'Fuera de Servicio', variant: 'danger' as const, color: 'bg-red-100 text-red-700' },
} as const;

// Novedad type configurations
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

// GPS status configurations
export const GPS_STATUS_CONFIG = {
  active: { label: 'Activo', variant: 'success' as const, color: 'text-green-600', dotColor: 'bg-green-500' },
  stale: { label: 'Desactualizado', variant: 'warning' as const, color: 'text-yellow-600', dotColor: 'bg-yellow-500' },
  inactive: { label: 'Inactivo', variant: 'danger' as const, color: 'text-red-600', dotColor: 'bg-red-500' },
  searching: { label: 'Buscando...', variant: 'default' as const, color: 'text-gray-600', dotColor: 'bg-gray-400' },
} as const;

// Incident type configurations
export const INCIDENT_TYPE_CONFIG = {
  accident: { label: 'Accidente', icon: 'AlertTriangle', variant: 'danger' as const, color: 'bg-red-100 text-red-700' },
  breakdown: { label: 'Averia', icon: 'Wrench', variant: 'warning' as const, color: 'bg-orange-100 text-orange-700' },
  behavior: { label: 'Comportamiento', icon: 'Users', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700' },
  emergency: { label: 'Emergencia', icon: 'Siren', variant: 'danger' as const, color: 'bg-red-100 text-red-700' },
  delay: { label: 'Retraso', icon: 'Clock', variant: 'info' as const, color: 'bg-blue-100 text-blue-700' },
  route: { label: 'Ruta', icon: 'MapPin', variant: 'purple' as const, color: 'bg-purple-100 text-purple-700' },
  other: { label: 'Otro', icon: 'HelpCircle', variant: 'default' as const, color: 'bg-gray-100 text-gray-600' },
} as const;

// Incident severity configurations
export const SEVERITY_CONFIG = {
  low: { label: 'Baja', variant: 'success' as const, color: 'bg-green-100 text-green-700', priority: 1 },
  medium: { label: 'Media', variant: 'warning' as const, color: 'bg-yellow-100 text-yellow-700', priority: 2 },
  high: { label: 'Alta', variant: 'warning' as const, color: 'bg-orange-100 text-orange-700', priority: 3 },
  critical: { label: 'Critica', variant: 'danger' as const, color: 'bg-red-100 text-red-700', priority: 4 },
} as const;

// Checklist status configurations
export const CHECKLIST_STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'default' as const, color: 'bg-gray-100 text-gray-600' },
  ok: { label: 'OK', variant: 'success' as const, color: 'bg-green-100 text-green-700' },
  issue: { label: 'Problema', variant: 'danger' as const, color: 'bg-red-100 text-red-700' },
} as const;

// User role configurations (for display)
export const ROLE_CONFIG = {
  driver: { label: 'Conductor', variant: 'info' as const, color: 'bg-blue-100 text-blue-700' },
  monitor: { label: 'Monitor', variant: 'success' as const, color: 'bg-green-100 text-green-700' },
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

// Type exports for TypeScript
export type TripStatusKey = keyof typeof TRIP_STATUS_CONFIG;
export type RouteTypeKey = keyof typeof ROUTE_TYPE_CONFIG;
export type CheckinStatusKey = keyof typeof CHECKIN_STATUS_CONFIG;
export type VehicleStatusKey = keyof typeof VEHICLE_STATUS_CONFIG;
export type NovedadTypeKey = keyof typeof NOVEDAD_TYPE_CONFIG;
export type NovedadStatusKey = keyof typeof NOVEDAD_STATUS_CONFIG;
export type GpsStatusKey = keyof typeof GPS_STATUS_CONFIG;
export type IncidentTypeKey = keyof typeof INCIDENT_TYPE_CONFIG;
export type SeverityKey = keyof typeof SEVERITY_CONFIG;
export type ChecklistStatusKey = keyof typeof CHECKLIST_STATUS_CONFIG;
export type RoleKey = keyof typeof ROLE_CONFIG;
