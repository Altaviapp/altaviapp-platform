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
  useNovedadTypes,
} from './useTripStudents';

// Profile hooks (for drivers/monitors to manage their professional data)
export {
  useDriverProfile,
  useMonitorProfile,
  useMyProfile,
} from './useProfile';
export type { DriverProfile, MonitorProfile } from './useProfile';

// User profile hook (for basic user data like name, phone)
export { useUserProfile } from './useUserProfile';

// Driver Routes hooks (for lazy trip creation)
export {
  useDriverRoutesToday,
  useNovedadesForRoute,
  useRouteWithStudents,
  useNovedadesForDriverToday,
  useCrewRoutes,
} from './useDriverRoutes';
export type { RouteForToday, NovedadForRoute, NovedadSummary, NovedadForDashboard, CrewRoute } from './useDriverRoutes';

// Novedades Confirmation hook (for trip start flow)
export { useNovedadesConfirmation } from './useNovedadesConfirmation';

// Incidents hooks (for reporting safety issues)
export { useIncidentMutations, useIncidentsByTrip } from './useIncidents';
export type { IncidentType, IncidentSeverity, ReportIncidentInput } from './useIncidents';

// Calendar hooks (for calendar view)
export { useCalendarTrips } from './useCalendarTrips';
export type { CalendarTrip } from './useCalendarTrips';

// Projected trips hooks (for weekly calendar view)
export {
  useCrewProjectedTrips,
  getWeekRange,
  formatWeekRange,
} from './useCrewProjectedTrips';
export type { CrewProjectedTrip } from './useCrewProjectedTrips';

// Notifications hooks
export {
  useNotifications,
  useUnreadCount,
  useNotificationMutations,
  useUnreadNotifications,
} from './useNotifications';

// Navigation hooks (turn-by-turn)
export {
  useNavigation,
  generateNavigationStepsFromStops,
} from './useNavigation';
export type { NavigationStep, Position } from './useNavigation';

// Trip Events (Timeline)
export {
  useTripTimeline,
  useLatestTripEvents,
  useTripEventMutations,
  getEventConfig,
  EVENT_TYPE_CONFIG,
} from './useTripEvents';
export type { TripEventType, ActorRole } from './useTripEvents';

// Stop Actions (arrival, skip, notes)
export { useStopActions } from './useStopActions';

// SOS Emergency
export { useSOS } from './useSOS';

// ActiveTripView adapter hook
export { useActiveTripData } from './useActiveTripData';
export type { UseActiveTripDataOptions, UseActiveTripDataResult } from './useActiveTripData';
