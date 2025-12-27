/**
 * Crew App Hooks
 *
 * Exports all hooks for the Crew App
 */

// Auth hooks
export { useConvexAuth } from './useConvexAuth';
export type { ConvexAuthContext } from './useConvexAuth';

// Convex data hooks (real-time)
export { useMyTrips, useTrip, useTripOperations, useTodaysTrips, useActiveConvexTrip, useTripHistory } from './useConvexTrips';
export { useTripCheckins, usePendingStudents, useCheckinMutations, useStudentByQR } from './useConvexCheckins';
export { useConvexDashboard } from './useConvexDashboard';

// GPS tracking hooks
export { useGPSTracking, useCurrentPosition } from './useGPSTracking';
export type { GPSPosition, GPSError, GPSTrackingState, GeofenceAlert, UseGPSTrackingReturn, GPSSourceType } from './useGPSTracking';

// Local state hooks (for UI state management)
export { useActiveTrip } from './useActiveTrip';
export type { UseActiveTripReturn } from './useActiveTrip';

export { useElapsedTime } from './useElapsedTime';
export { useChecklistState } from './useChecklistState';
export { useDashboardData } from './useDashboardData';

// Legacy auth hook (for mock data compatibility)
export { useAuth } from './useAuth';

// Trip Students with Novedades
export {
  useTripStudents,
  useTripStudentsSummary,
  useNovedadesForTrip,
  useNovedadesByDate,
  useNovedadesMutations,
} from './useTripStudents';

// Profile hooks (for drivers/monitors to manage their professional data)
export {
  useDriverProfile,
  useMonitorProfile,
  useMyProfile,
} from './useProfile';
export type { DriverProfile, MonitorProfile } from './useProfile';

// Driver Routes hooks (for lazy trip creation)
export {
  useDriverRoutesToday,
  useNovedadesForRoute,
  useRouteWithStudents,
  useNovedadesForDriverToday,
  useCrewRoutes,
} from './useDriverRoutes';
export type { RouteForToday, NovedadForRoute, NovedadSummary, NovedadForDashboard, CrewRoute } from './useDriverRoutes';

// Incidents hooks (for reporting safety issues)
export { useIncidentMutations } from './useIncidents';
export type { IncidentType, IncidentSeverity, ReportIncidentInput } from './useIncidents';

// Calendar hooks (for calendar view)
export { useCalendarTrips } from './useCalendarTrips';
export type { CalendarTrip } from './useCalendarTrips';
