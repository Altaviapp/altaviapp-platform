/**
 * Parent App Hooks
 *
 * Custom hooks for connecting to Convex backend
 */

// Auth context with typed IDs
export { useConvexAuth } from "./useConvexAuth";
export type { ConvexAuthContext } from "./useConvexAuth";

// Students (Parent's children)
export {
  useMyStudents,
  useStudent,
  useStudentTracking,
  useMyStudentsWithTracking,
  useStudentLocationMutation,
  useMyStudentsWithPhotos,
  useStudentWithPhoto,
  useStudentMutations,
  useTripHistory,
} from "./useMyStudents";

// Aggregated children + trips
export { useAllChildrenTrips } from "./useAllChildrenTrips";

// Weekly schedule
export { useWeeklySchedule } from "./useWeeklySchedule";

// Notifications
export {
  useNotifications,
  useUnreadCount,
  useNotificationMutations,
  useUnreadNotifications,
} from "./useNotifications";

// Novedades (Schedule Exceptions)
export {
  useMyNovedades,
  usePendingNovedadesCount,
  useNovedad,
  useNovedadesMutations,
  useNovedadTypes,
  useEvidenceUpload,
} from "./useNovedades";
export type {
  NovedadType,
  AffectedRouteType,
  CreateNovedadInput,
  NovedadCategory,
  DurationType,
} from "./useNovedades";
