/**
 * Mock Data Central Export
 * Altaviapp Crew PWA
 *
 * Este archivo exporta todos los datos mock para desarrollo y testing.
 * Los datos son realistas y siguen el schema de Convex exactamente.
 */

// Users
export {
  mockDriver,
  mockMonitor,
  mockParent,
  mockAdmin,
} from './users';

// Vehicles
export {
  mockVehicle,
  mockVehicles,
} from './vehicles';

// Routes & Stops
export {
  mockRouteIda,
  mockRouteVuelta,
  mockRoutes,
  mockStopsIda,
  mockStopsVuelta,
  mockStops,
} from './routes';

// Students
export {
  mockStudents,
} from './students';

// Trips
export {
  mockTripIda,
  mockTripVuelta,
  mockTodayTrips,
  mockYesterdayTrip,
  mockTrips,
} from './trips';

// Checklist
export {
  checklistTemplate,
  completedChecklistExample,
  checklistWithIssuesExample,
  getEmptyChecklist,
  getAllChecklistItems,
  getTotalChecklistItems,
  getCompletedChecklistItems,
  isChecklistComplete,
  hasChecklistIssues,
  getChecklistIssues,
} from './checklist';

// Notifications
export {
  mockNotifications,
} from './notifications';

// Incidents
export {
  mockIncidents,
} from './incidents';

// GPS Locations
export type { GPSLocation } from './gpsLocations';
export {
  generateGPSPath,
  generateRouteGPSPath,
  getGPSLocationAtProgress,
  getGPSLocationAtStop,
  updateGPSTimestamp,
  applyGPSDrift,
} from './gpsLocations';

// Active Trips
export type { ActiveTripState } from './activeTrips';
export {
  startTrip,
  getActiveTrip,
  updateElapsedTime,
  simulateGPSUpdate,
  moveToNextStop,
  addStudentOnBoard,
  removeStudentOnBoard,
  finishTrip,
  cancelTrip,
  isTripActive,
  getAllActiveTrips,
  clearAllActiveTrips,
  saveActiveTripToStorage,
  loadActiveTripFromStorage,
  removeActiveTripFromStorage,
} from './activeTrips';

/**
 * Dashboard Data Helper
 * Pre-assembled data for dashboard view
 */
import { mockDriver } from './users';
import { mockVehicle } from './vehicles';
import { mockTodayTrips } from './trips';
import { mockNotifications } from './notifications';
import type { DashboardData } from '@/types';

export const mockDashboardData: DashboardData = {
  driver: mockDriver,
  vehicle: mockVehicle,
  todayTrips: mockTodayTrips,
  weeklyStats: {
    tripsCompleted: 8,
    studentsTransported: 224,
    punctuality: 100, // percentage
  },
  recentNotifications: mockNotifications.slice(0, 3),
};
