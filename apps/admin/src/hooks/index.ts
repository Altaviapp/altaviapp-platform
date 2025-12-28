/**
 * Admin Hooks
 *
 * Custom hooks for connecting to Convex backend
 */

// Auth context with typed IDs
export { useConvexAuth } from "./useConvexAuth";
export type { ConvexAuthContext } from "./useConvexAuth";

// Routes
export { useRoutes, useRoute, useRouteStops, useRouteMutations } from "./useRoutes";

// Students
export {
  useStudents,
  useStudent,
  useStudentMutations,
  useStudentRouteAssignments,
  useStudentsWithRoutes,
  useValidateStudentImport,
  useStudentImportMutations,
  useParentEmailCheck,
} from "./useStudents";
export type { StudentImportData, ParentEmailStatus } from "./useStudents";

// Fleet (Vehicles, Drivers, Monitors)
export {
  useVehicles,
  useVehicle,
  useVehicleMutations,
  useDrivers,
  useDriver,
  useDriverMutations,
  useMonitors,
  useMonitor,
  useMonitorMutations,
} from "./useFleet";

// Trips
export {
  useTrips,
  useTrip,
  useTripMutations,
  useTodaysTrips,
  useActiveTrips,
  useActiveTripForStudent,
  useDriverTrips,
} from "./useTrips";

// Incidents
export {
  useIncidents,
  useIncident,
  useIncidentMutations,
  useOpenIncidents,
  useCriticalIncidents,
  useIncidentStats,
} from "./useIncidents";
export type { IncidentType, IncidentSeverity, IncidentStatus } from "./useIncidents";

// Reports
export {
  useDashboardMetrics,
  useDailyStats,
  useTopRoutes,
  useTripReport,
  useIncidentReport,
  useAttendanceReport,
  useReportsDashboard,
} from "./useReports";
export type { TripStatus } from "./useReports";

// Novedades (Schedule Exceptions)
export {
  usePendingNovedades,
  useNovedades,
  usePendingNovedadesCount,
  useNovedad,
  useNovedadReviewMutations,
} from "./useNovedades";

// Users
export {
  useUsers,
  useUser,
  useUserMutations,
  useUserStats,
} from "./useUsers";
export type { UserRole } from "./useUsers";

// Invitations
export {
  useInvitations,
  useInvitationMutations,
  useInvitationStats,
} from "./useInvitations";
export type { InvitationRole, InvitationStatus } from "./useInvitations";

// Institution
export {
  useInstitution,
  useSchoolLocationMutation,
  useInstitutionGrades,
  useInstitutionGradesMutation,
} from "./useInstitution";

// Novedad Types (Configurable)
export {
  useNovedadTypes,
  useNovedadType,
  useNovedadTypesByCategory,
  useNovedadTypeMutations,
  CATEGORY_LABELS,
  DURATION_LABELS,
  COLOR_OPTIONS,
  ICON_OPTIONS,
} from "./useNovedadTypes";
export type {
  NovedadTypeCategory,
  NovedadTypeDuration,
  NovedadTypeFormData,
} from "./useNovedadTypes";

// Notifications
export {
  useNotifications,
  useUnreadCount,
  useNotificationMutations,
  useUnreadNotifications,
} from "./useNotifications";
