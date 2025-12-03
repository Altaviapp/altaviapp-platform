import type { Trip, TripWithDetails } from '@/types';
import { mockDriver } from './users';
import { mockVehicle } from './vehicles';
import { mockRouteIda, mockRouteVuelta } from './routes';
import { mockStopsIda, mockStopsVuelta } from './routes';
import { mockStudents } from './students';
import { completedChecklistExample } from './checklist';

/**
 * Get date in YYYY-MM-DD format
 */
const getDateString = (date: Date): string => {
  return date.toISOString().slice(0, 10);
};

/**
 * Get today's date in YYYY-MM-DD format (Ecuador timezone)
 */
const getToday = (): string => {
  return getDateString(new Date());
};

/**
 * Mock Trip: Today's Inbound Trip (Ida)
 */
export const mockTripIda: TripWithDetails = {
  _id: 'trip-today-ida',
  institutionId: 'inst-001',
  routeId: 'route-001',
  vehicleId: 'vehicle-001',
  driverId: 'driver-001',
  type: 'inbound',
  date: getToday(),
  scheduledStartTime: '06:30',
  scheduledEndTime: '07:30',
  status: 'scheduled',
  studentsAssigned: mockStudents.map(s => s._id),
  studentsOnBoard: [],
  studentsAbsent: [],
  checklistCompleted: false,
  currentStopIndex: 0,
  createdAt: new Date().toISOString(),
  // Populated fields
  route: mockRouteIda,
  vehicle: mockVehicle,
  driver: mockDriver,
  stops: mockStopsIda,
  students: mockStudents,
};

/**
 * Mock Trip: Today's Outbound Trip (Vuelta)
 */
export const mockTripVuelta: TripWithDetails = {
  _id: 'trip-today-vuelta',
  institutionId: 'inst-001',
  routeId: 'route-002',
  vehicleId: 'vehicle-001',
  driverId: 'driver-001',
  type: 'outbound',
  date: getToday(),
  scheduledStartTime: '14:00',
  scheduledEndTime: '15:00',
  status: 'scheduled',
  studentsAssigned: mockStudents.map(s => s._id),
  studentsOnBoard: [],
  studentsAbsent: [],
  checklistCompleted: false,
  currentStopIndex: 0,
  createdAt: new Date().toISOString(),
  // Populated fields
  route: mockRouteVuelta,
  vehicle: mockVehicle,
  driver: mockDriver,
  stops: mockStopsVuelta,
  students: mockStudents,
};

/**
 * Today's trips (main data for dashboard)
 */
export const mockTodayTrips: TripWithDetails[] = [
  mockTripIda,
  mockTripVuelta,
];

/**
 * Yesterday's completed trip (for historical testing)
 */
export const mockYesterdayTrip: TripWithDetails = {
  _id: 'trip-yesterday-ida',
  institutionId: 'inst-001',
  routeId: 'route-001',
  vehicleId: 'vehicle-001',
  driverId: 'driver-001',
  type: 'inbound',
  date: getDateString(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
  scheduledStartTime: '06:30',
  scheduledEndTime: '07:30',
  actualStartTime: '06:32',
  actualEndTime: '07:28',
  status: 'completed',
  studentsAssigned: mockStudents.map(s => s._id),
  studentsOnBoard: mockStudents.map(s => s._id),
  studentsAbsent: [],
  checklistCompleted: true,
  checklistData: completedChecklistExample,
  createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  // Populated fields
  route: mockRouteIda,
  vehicle: mockVehicle,
  driver: mockDriver,
  stops: mockStopsIda,
  students: mockStudents,
};

/**
 * All mock trips (for history views)
 */
export const mockTrips: TripWithDetails[] = [
  ...mockTodayTrips,
  mockYesterdayTrip,
];
