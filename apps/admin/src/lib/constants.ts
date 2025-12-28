/**
 * Centralized constants for Admin app
 * All status, role, type configurations in one place
 */

// Status configurations
export const STATUS_CONFIG = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  inactive: { label: 'Inactivo', color: 'bg-gray-100 text-gray-600', dotColor: 'bg-gray-400' },
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500' },
  maintenance: { label: 'Mantenimiento', color: 'bg-orange-100 text-orange-700', dotColor: 'bg-orange-500' },
  out_of_service: { label: 'Fuera de servicio', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
} as const;

// User role configurations
export const ROLE_CONFIG = {
  super_admin: { label: 'Super Admin', color: 'bg-red-100 text-red-700', level: 1000 },
  admin: { label: 'Administrador', color: 'bg-purple-100 text-purple-700', level: 500 },
  monitor: { label: 'Monitor', color: 'bg-green-100 text-green-700', level: 150 },
  driver: { label: 'Conductor', color: 'bg-blue-100 text-blue-700', level: 100 },
  parent: { label: 'Padre/Tutor', color: 'bg-cyan-100 text-cyan-700', level: 10 },
} as const;

// Incident type configurations
export const INCIDENT_TYPE_CONFIG = {
  accident: { label: 'Accidente', icon: 'AlertTriangle', color: 'bg-red-100 text-red-700' },
  breakdown: { label: 'Avería', icon: 'Wrench', color: 'bg-orange-100 text-orange-700' },
  behavior: { label: 'Comportamiento', icon: 'Users', color: 'bg-yellow-100 text-yellow-700' },
  emergency: { label: 'Emergencia', icon: 'Siren', color: 'bg-red-100 text-red-700' },
  delay: { label: 'Retraso', icon: 'Clock', color: 'bg-blue-100 text-blue-700' },
  route: { label: 'Ruta', icon: 'MapPin', color: 'bg-purple-100 text-purple-700' },
  other: { label: 'Otro', icon: 'HelpCircle', color: 'bg-gray-100 text-gray-600' },
} as const;

// Incident severity configurations
export const SEVERITY_CONFIG = {
  low: { label: 'Baja', color: 'bg-green-100 text-green-700', priority: 1 },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-700', priority: 2 },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700', priority: 3 },
  critical: { label: 'Crítica', color: 'bg-red-100 text-red-700', priority: 4 },
} as const;

// Incident status configurations
export const INCIDENT_STATUS_CONFIG = {
  open: { label: 'Abierto', color: 'bg-red-100 text-red-700' },
  investigating: { label: 'En investigación', color: 'bg-yellow-100 text-yellow-700' },
  resolved: { label: 'Resuelto', color: 'bg-green-100 text-green-700' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-600' },
} as const;

// Novedad type configurations
export const NOVEDAD_TYPE_CONFIG = {
  absence: { label: 'Ausencia', icon: 'UserX', color: 'bg-gray-100 text-gray-600' },
  parent_pickup: { label: 'Recoge padre', icon: 'UserCheck', color: 'bg-blue-100 text-blue-700' },
  stop_change: { label: 'Cambio de parada', icon: 'MapPin', color: 'bg-purple-100 text-purple-700' },
  early_pickup: { label: 'Salida temprana', icon: 'Clock', color: 'bg-orange-100 text-orange-700' },
  late_arrival: { label: 'Llegada tarde', icon: 'Clock', color: 'bg-yellow-100 text-yellow-700' },
} as const;

// Novedad status configurations
export const NOVEDAD_STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Aprobada', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700' },
  applied: { label: 'Aplicada', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-600' },
  expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-600' },
} as const;

// Route type configurations
export const ROUTE_TYPE_CONFIG = {
  pickup: { label: 'Recogida', color: 'bg-blue-100 text-blue-700', icon: 'ArrowUpCircle' },
  dropoff: { label: 'Entrega', color: 'bg-purple-100 text-purple-700', icon: 'ArrowDownCircle' },
} as const;

// Trip status configurations
export const TRIP_STATUS_CONFIG = {
  scheduled: { label: 'Programado', color: 'bg-gray-100 text-gray-600', dotColor: 'bg-gray-400' },
  in_progress: { label: 'En curso', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
} as const;

// Vehicle status configurations
export const VEHICLE_STATUS_CONFIG = {
  active: { label: 'Activo', color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'En mantenimiento', color: 'bg-yellow-100 text-yellow-700' },
  out_of_service: { label: 'Fuera de servicio', color: 'bg-red-100 text-red-700' },
} as const;

// GPS source type configurations
export const GPS_SOURCE_CONFIG = {
  mobile: { label: 'App Móvil', description: 'GPS del dispositivo del conductor' },
  device: { label: 'Dispositivo GPS', description: 'Dispositivo GPS externo instalado' },
  api: { label: 'API Externa', description: 'Integración con proveedor de GPS' },
} as const;

// License type configurations (Ecuador)
export const LICENSE_TYPE_CONFIG = {
  C: { label: 'Tipo C', description: 'Vehículos livianos hasta 3.5 toneladas' },
  D: { label: 'Tipo D', description: 'Servicio comercial de pasajeros' },
  E: { label: 'Tipo E', description: 'Vehículos pesados y combinaciones' },
} as const;

// Check-in type configurations
export const CHECKIN_TYPE_CONFIG = {
  pickup: { label: 'Recogida', icon: 'ArrowUpCircle', color: 'text-blue-600' },
  dropoff: { label: 'Entrega', icon: 'ArrowDownCircle', color: 'text-purple-600' },
} as const;

// Route change request types
export const ROUTE_CHANGE_REQUEST_TYPE_CONFIG = {
  schedule_change: { label: 'Cambio de horario', icon: 'Clock' },
  stop_change: { label: 'Cambio de parada', icon: 'MapPin' },
  route_change: { label: 'Cambio de ruta', icon: 'Route' },
  service_suspension: { label: 'Suspensión de servicio', icon: 'XCircle' },
} as const;

// Affected route type configurations
export const AFFECTED_ROUTE_TYPE_CONFIG = {
  pickup: { label: 'Recogida' },
  dropoff: { label: 'Entrega' },
  both: { label: 'Ambos' },
} as const;

// Invitation status configurations
export const INVITATION_STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
  accepted: { label: 'Aceptada', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Expirada', color: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
} as const;

// Recurrence type configurations
export const RECURRENCE_TYPE_CONFIG = {
  daily: { label: 'Diario' },
  weekly: { label: 'Semanal' },
  monthly: { label: 'Mensual' },
  one_time: { label: 'Una vez' },
} as const;

// Day of week configurations
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes', short: 'L' },
  { value: 2, label: 'Martes', short: 'M' },
  { value: 3, label: 'Miércoles', short: 'X' },
  { value: 4, label: 'Jueves', short: 'J' },
  { value: 5, label: 'Viernes', short: 'V' },
  { value: 6, label: 'Sábado', short: 'S' },
  { value: 0, label: 'Domingo', short: 'D' },
] as const;

// Grade presets (Ecuador/Colombia)
export const GRADE_PRESETS = [
  'Pre-Kinder',
  'Kinder',
  '1ro Básica',
  '2do Básica',
  '3ro Básica',
  '4to Básica',
  '5to Básica',
  '6to Básica',
  '7mo Básica',
  '8vo Básica',
  '9no Básica',
  '10mo Básica',
  '1ro Bachillerato',
  '2do Bachillerato',
  '3ro Bachillerato',
] as const;

// Timezone configurations
export const TIMEZONE_CONFIG = {
  'America/Guayaquil': { label: 'Ecuador (GMT-5)', offset: -5 },
  'America/Bogota': { label: 'Colombia (GMT-5)', offset: -5 },
  'America/Lima': { label: 'Perú (GMT-5)', offset: -5 },
} as const;

// Brand colors
export const BRAND_COLORS = {
  primary: '#042940',
  accent: '#DBF227',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

// Type exports for TypeScript
export type StatusKey = keyof typeof STATUS_CONFIG;
export type RoleKey = keyof typeof ROLE_CONFIG;
export type IncidentTypeKey = keyof typeof INCIDENT_TYPE_CONFIG;
export type SeverityKey = keyof typeof SEVERITY_CONFIG;
export type IncidentStatusKey = keyof typeof INCIDENT_STATUS_CONFIG;
export type NovedadTypeKey = keyof typeof NOVEDAD_TYPE_CONFIG;
export type NovedadStatusKey = keyof typeof NOVEDAD_STATUS_CONFIG;
export type RouteTypeKey = keyof typeof ROUTE_TYPE_CONFIG;
export type TripStatusKey = keyof typeof TRIP_STATUS_CONFIG;
export type VehicleStatusKey = keyof typeof VEHICLE_STATUS_CONFIG;
export type GpsSourceKey = keyof typeof GPS_SOURCE_CONFIG;
export type LicenseTypeKey = keyof typeof LICENSE_TYPE_CONFIG;
export type CheckinTypeKey = keyof typeof CHECKIN_TYPE_CONFIG;
export type InvitationStatusKey = keyof typeof INVITATION_STATUS_CONFIG;
export type RecurrenceTypeKey = keyof typeof RECURRENCE_TYPE_CONFIG;
