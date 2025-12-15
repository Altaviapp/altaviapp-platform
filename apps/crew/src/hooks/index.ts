/**
 * Crew App Hooks
 *
 * Exports all hooks for the Crew App
 */

// Auth hooks
export { useConvexAuth } from './useConvexAuth';
export type { ConvexAuthContext } from './useConvexAuth';

// Convex data hooks (real-time)
export { useMyTrips, useTrip, useTripOperations, useTodaysTrips, useActiveConvexTrip } from './useConvexTrips';
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
