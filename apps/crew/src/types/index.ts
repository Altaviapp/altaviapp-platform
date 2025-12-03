/**
 * TypeScript Types para Altaviapp Crew PWA
 * Basado en el schema de Convex
 */

export type UserRole = 'super_admin' | 'admin' | 'monitor' | 'driver' | 'parent';

// UI-friendly role names (Spanish)
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Coordinador',
  monitor: 'Auxiliar',
  driver: 'Conductor',
  parent: 'Padre/Tutor',
};

// Role hierarchy levels (higher = more permissions)
export const ROLE_LEVELS: Record<UserRole, number> = {
  super_admin: 1000,
  admin: 500,
  monitor: 150,
  driver: 100,
  parent: 10,
};

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: string;
  isActive: boolean;
  avatar?: string;
  phone?: string;
  cedula?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  createdAt: string;
}

export interface Vehicle {
  _id: string;
  institutionId: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  capacity: number;
  status: 'active' | 'maintenance' | 'inactive';
  driverId?: string;
  registrationNumber?: string;
  insurancePolicy?: string;
  insuranceExpiry?: string;
  lastTechnicalReview?: string;
  nextTechnicalReview?: string;
  createdAt: string;
}

export interface Monitor {
  _id: string;
  userId: string;
  institutionId: string;
  idNumber: string;
  phone: string;
  emergencyContact: string;
  firstAidCertified?: boolean;
  firstAidCertExpiry?: string;
  childCareCertified?: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated user data
  user?: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface Route {
  _id: string;
  institutionId: string;
  name: string;
  description?: string;
  type: 'inbound' | 'outbound' | 'both';
  vehicleId?: string;
  driverId?: string;
  monitorId?: string; // Optional - routes may not have a monitor
  startTime: string;
  endTime: string;
  daysOfWeek: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday')[];
  isActive: boolean;
  createdAt: string;
}

export interface Stop {
  _id: string;
  routeId: string;
  order: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  estimatedArrivalTime: string;
  students: string[]; // Student IDs
}

export interface Student {
  _id: string;
  institutionId: string;
  firstName: string;
  lastName: string;
  grade: string;
  section: string;
  qrCode: string;
  routeId?: string;
  stopId?: string;
  parentId: string;
  emergencyPhone: string;
  emergencyContact: string;
  emergencyRelationship: string;
  photo?: string;
  isActive: boolean;
  createdAt: string;
}

export type TripStatus =
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Trip {
  _id: string;
  institutionId: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  monitorId?: string; // Optional - trips may not have a monitor
  type: 'inbound' | 'outbound';
  date: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  status: TripStatus;
  studentsAssigned: string[];
  studentsOnBoard: string[];
  studentsAbsent: string[];
  checklistCompleted: boolean;
  checklistData?: ChecklistData;
  currentStopIndex?: number;
  createdAt: string;
}

export interface ChecklistData {
  mechanicalItems: ChecklistItem[];
  lightsItems: ChecklistItem[];
  safetyItems: ChecklistItem[];
  cleanlinessItems: ChecklistItem[];
  observations?: string;
  photo?: string;
  completedAt?: string;
  hasIssues: boolean;
  issues?: string[];
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  hasIssue?: boolean;
  issueDescription?: string;
}

export type CheckInMethod = 'qr' | 'manual';

export interface CheckIn {
  _id: string;
  tripId: string;
  studentId: string;
  stopId: string;
  // Who performed the check-in
  performedById: string;
  performedByRole: 'driver' | 'monitor' | 'admin';
  timestamp: string;
  method: CheckInMethod;
  manualReason?: string;
  manualObservations?: string;
  latitude?: number;
  longitude?: number;
  parentNotified: boolean;
  syncStatus: 'synced' | 'pending';
}

export interface CheckOut {
  _id: string;
  tripId: string;
  studentId: string;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  parentNotified: boolean;
  syncStatus: 'synced' | 'pending';
}

export type IncidentType =
  | 'accident'
  | 'mechanical'
  | 'delay'
  | 'medical'
  | 'student'
  | 'route'
  | 'other';

export type IncidentSeverity = 'minor' | 'moderate' | 'severe';

export interface Incident {
  _id: string;
  tripId: string;
  driverId: string;
  institutionId: string;
  type: IncidentType;
  severity?: IncidentSeverity;
  timestamp: string;
  latitude?: number;
  longitude?: number;
  description: string;
  hasInjuries?: boolean;
  numberOfInjuries?: number;
  studentsInvolved?: string[];
  otherVehiclePlate?: string;
  delayMinutes?: number;
  delayReason?: string;
  photos?: string[];
  notificationsAutocalled911?: boolean;
  notifiedAdmins: boolean;
  notifiedParents: boolean;
  reportNumber?: string;
  status: 'reported' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface GPSLocation {
  _id: string;
  tripId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  timestamp: string;
  syncStatus: 'synced' | 'pending';
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  timestamp: string;
  createdAt: string;
}

// View Models (para la UI)

export interface TripWithDetails extends Trip {
  route: Route;
  vehicle: Vehicle;
  driver: User;
  stops: Stop[];
  students: Student[];
}

export interface StopWithStudents extends Omit<Stop, 'students'> {
  students: Student[];
  checkIns: CheckIn[];
}

export interface DashboardData {
  driver: User;
  vehicle: Vehicle;
  todayTrips: TripWithDetails[];
  weeklyStats: {
    tripsCompleted: number;
    studentsTransported: number;
    punctuality: number;
  };
  recentNotifications: Notification[];
}

export interface TripProgress {
  totalStops: number;
  completedStops: number;
  totalStudents: number;
  studentsOnBoard: number;
  currentSpeed?: number;
  estimatedArrival?: string;
}

// ============================================
// PERMISSION HELPER FUNCTIONS
// ============================================

/**
 * Check if user role meets minimum required role
 */
export function hasMinimumRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

/**
 * Check if user is a crew member (driver or monitor)
 */
export function isCrewMember(role: UserRole): boolean {
  return role === 'driver' || role === 'monitor';
}

/**
 * Check if user can control trip lifecycle (start/end)
 * Only drivers and admins
 */
export function canControlTrip(role: UserRole): boolean {
  return role === 'driver' || hasMinimumRole(role, 'admin');
}

/**
 * Check if user can access vehicle checklist
 * Only drivers and admins
 */
export function canAccessChecklist(role: UserRole): boolean {
  return role === 'driver' || hasMinimumRole(role, 'admin');
}

/**
 * Check if user can perform check-in/out operations
 * Monitors always can, drivers only if no monitor assigned
 */
export function canPerformCheckin(role: UserRole, tripMonitorId?: string | null): boolean {
  // Monitor can always perform check-in
  if (role === 'monitor') return true;

  // Admin and super_admin can always perform check-in
  if (hasMinimumRole(role, 'admin')) return true;

  // Driver can only perform check-in if no monitor is assigned (fallback)
  if (role === 'driver' && !tripMonitorId) return true;

  return false;
}

/**
 * Check if user can report incidents
 * Monitors and admins
 */
export function canReportIncident(role: UserRole): boolean {
  return hasMinimumRole(role, 'monitor');
}

/**
 * Get display name for a role
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role];
}
