"use client";

/**
 * Reports Hooks for Admin Dashboard
 *
 * Provides aggregated data for reports and analytics.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// DASHBOARD METRICS
// ============================================

/**
 * Get dashboard metrics for an institution
 */
export function useDashboardMetrics(
  institutionId: Id<"institutions"> | null,
  options?: {
    startDate?: string;
    endDate?: string;
  }
) {
  const { userId } = useConvexAuth();

  const metrics = useQuery(
    api.reports.getDashboardMetrics,
    userId && institutionId
      ? {
          userId,
          institutionId,
          startDate: options?.startDate,
          endDate: options?.endDate,
        }
      : "skip"
  );

  return {
    metrics: metrics ?? null,
    isLoading: metrics === undefined,
  };
}

// ============================================
// DAILY STATISTICS
// ============================================

/**
 * Get daily statistics for charts
 */
export function useDailyStats(
  institutionId: Id<"institutions"> | null,
  days?: number
) {
  const { userId } = useConvexAuth();

  const stats = useQuery(
    api.reports.getDailyStats,
    userId && institutionId
      ? { userId, institutionId, days }
      : "skip"
  );

  return {
    dailyStats: stats?.dailyStats ?? [],
    isLoading: stats === undefined,
  };
}

// ============================================
// TOP ROUTES
// ============================================

/**
 * Get top performing routes
 */
export function useTopRoutes(
  institutionId: Id<"institutions"> | null,
  options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
) {
  const { userId } = useConvexAuth();

  const routes = useQuery(
    api.reports.getTopRoutes,
    userId && institutionId
      ? {
          userId,
          institutionId,
          limit: options?.limit,
          startDate: options?.startDate,
          endDate: options?.endDate,
        }
      : "skip"
  );

  return {
    routes: routes ?? [],
    isLoading: routes === undefined,
  };
}

// ============================================
// TRIP REPORT
// ============================================

export type TripStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

/**
 * Get trip report data
 */
export function useTripReport(
  institutionId: Id<"institutions"> | null,
  options: {
    startDate: string;
    endDate: string;
    status?: TripStatus;
    routeId?: Id<"routes">;
  }
) {
  const { userId } = useConvexAuth();

  const report = useQuery(
    api.reports.getTripReport,
    userId && institutionId
      ? {
          userId,
          institutionId,
          startDate: options.startDate,
          endDate: options.endDate,
          status: options.status,
          routeId: options.routeId,
        }
      : "skip"
  );

  return {
    trips: report ?? [],
    isLoading: report === undefined,
    totalTrips: report?.length ?? 0,
  };
}

// ============================================
// INCIDENT REPORT
// ============================================

export type IncidentType = "accident" | "breakdown" | "behavior" | "emergency" | "other";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

/**
 * Get incident report data
 */
export function useIncidentReport(
  institutionId: Id<"institutions"> | null,
  options: {
    startDate: string;
    endDate: string;
    type?: IncidentType;
    severity?: IncidentSeverity;
  }
) {
  const { userId } = useConvexAuth();

  const report = useQuery(
    api.reports.getIncidentReport,
    userId && institutionId
      ? {
          userId,
          institutionId,
          startDate: options.startDate,
          endDate: options.endDate,
          type: options.type,
          severity: options.severity,
        }
      : "skip"
  );

  return {
    incidents: report ?? [],
    isLoading: report === undefined,
    totalIncidents: report?.length ?? 0,
  };
}

// ============================================
// ATTENDANCE REPORT
// ============================================

/**
 * Get student attendance report
 */
export function useAttendanceReport(
  institutionId: Id<"institutions"> | null,
  options: {
    startDate: string;
    endDate: string;
    grade?: string;
  }
) {
  const { userId } = useConvexAuth();

  const report = useQuery(
    api.reports.getAttendanceReport,
    userId && institutionId
      ? {
          userId,
          institutionId,
          startDate: options.startDate,
          endDate: options.endDate,
          grade: options.grade,
        }
      : "skip"
  );

  return {
    students: report ?? [],
    isLoading: report === undefined,
    totalStudents: report?.length ?? 0,
  };
}

// ============================================
// COMBINED REPORTS HOOK
// ============================================

/**
 * Combined hook for the reports dashboard
 * Fetches all data needed for the main reports page
 */
export function useReportsDashboard(institutionId: Id<"institutions"> | null) {
  const { metrics, isLoading: metricsLoading } = useDashboardMetrics(institutionId);
  const { dailyStats, isLoading: statsLoading } = useDailyStats(institutionId, 7);
  const { routes: topRoutes, isLoading: routesLoading } = useTopRoutes(institutionId, { limit: 5 });

  return {
    metrics,
    dailyStats,
    topRoutes,
    isLoading: metricsLoading || statsLoading || routesLoading,
  };
}
