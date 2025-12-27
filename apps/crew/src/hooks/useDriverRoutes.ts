"use client";

/**
 * Driver Routes hooks for Crew App
 *
 * Provides route management functionality for lazy trip creation.
 * Routes are shown instead of trips, and trips are created on-demand.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface RouteForToday {
  _id: Id<"routes">;
  name: string;
  type: "pickup" | "dropoff";
  scheduledStartTime: string;
  scheduledEndTime: string;
  schoolArrivalTime?: string;
  schoolDepartureTime?: string;
  optimizedPolyline?: string;
  estimatedDuration?: number;
  estimatedDistance?: number;
  vehicle: {
    licensePlate: string;
    brand: string;
    model: string;
  } | null;
  studentCount: number;
  tripStatus: "scheduled" | "in_progress" | "completed" | "cancelled" | null;
  tripId: Id<"trips"> | null;
  canStart: boolean;
}

export interface NovedadForRoute {
  _id: Id<"novedades">;
  studentId: Id<"students">;
  type: "absence" | "parent_pickup" | "stop_change" | "early_pickup" | "late_arrival";
  affectedRouteType: "pickup" | "dropoff" | "both";
  date: string;
  reason: string;
  status: string;
  studentName: string;
  studentGrade: string;
  stopName: string | null;
  stopOrder: number;
  typeLabel: string;
  routeTypeLabel: string;
}

// ============================================
// DRIVER'S ROUTES FOR TODAY
// ============================================

/**
 * Get routes available for the driver to start today
 * Routes are filtered by recurrence and show trip status if exists
 */
export function useDriverRoutesToday() {
  const { userId } = useConvexAuth();

  const routes = useQuery(
    api.trips.listRoutesForDriverToday,
    userId ? { userId } : "skip"
  ) as RouteForToday[] | undefined;

  return {
    routes: routes ?? [],
    isLoading: routes === undefined,
    isEmpty: routes !== undefined && routes.length === 0,
  };
}

// ============================================
// NOVEDADES FOR A ROUTE (PREVIEW)
// ============================================

/**
 * Get novedades for a specific route on a given date
 * Used to preview exceptions before starting a trip
 */
export function useNovedadesForRoute(
  routeId: Id<"routes"> | string | null,
  date?: string
) {
  const { userId } = useConvexAuth();
  const today = date || new Date().toISOString().split("T")[0]!;

  const novedades = useQuery(
    api.novedades.getNovedadesForRoute,
    userId && routeId
      ? { userId, routeId: routeId as Id<"routes">, date: today }
      : "skip"
  ) as NovedadForRoute[] | undefined;

  // Calculate summary
  const summary = {
    total: novedades?.length ?? 0,
    absences: novedades?.filter((n) => n.type === "absence").length ?? 0,
    parentPickups: novedades?.filter((n) => n.type === "parent_pickup").length ?? 0,
    stopChanges: novedades?.filter((n) => n.type === "stop_change").length ?? 0,
    other: novedades?.filter((n) =>
      !["absence", "parent_pickup", "stop_change"].includes(n.type)
    ).length ?? 0,
  };

  return {
    novedades: novedades ?? [],
    summary,
    isLoading: novedades === undefined,
    hasNovedades: (novedades?.length ?? 0) > 0,
  };
}

// ============================================
// ROUTE WITH STUDENTS (for preview page)
// ============================================

/**
 * Get route details with students assigned
 * Used in the route start preview page
 */
export function useRouteWithStudents(routeId: Id<"routes"> | string | null) {
  const { userId } = useConvexAuth();

  const route = useQuery(
    api.routes.getRoute,
    userId && routeId
      ? { userId, routeId: routeId as Id<"routes"> }
      : "skip"
  );

  return {
    route,
    isLoading: route === undefined,
  };
}

// ============================================
// NOVEDADES FOR ALL DRIVER'S ROUTES TODAY
// ============================================

export interface NovedadSummary {
  total: number;
  absences: number;
  parentPickups: number;
  stopChanges: number;
  other: number;
}

export interface NovedadForDashboard {
  _id: string;
  studentName: string;
  type: string;
  routeName: string;
  reason: string;
  affectedRouteType: string;
}

/**
 * Get all novedades for driver's routes today
 * Used in dashboard to show summary of today's exceptions
 */
export function useNovedadesForDriverToday() {
  const { userId } = useConvexAuth();

  const result = useQuery(
    api.novedades.getNovedadesForDriverToday,
    userId ? { userId } : "skip"
  ) as { novedades: NovedadForDashboard[]; summary: NovedadSummary } | undefined;

  return {
    novedades: result?.novedades ?? [],
    summary: result?.summary ?? { total: 0, absences: 0, parentPickups: 0, stopChanges: 0, other: 0 },
    isLoading: result === undefined,
    hasNovedades: (result?.novedades?.length ?? 0) > 0,
  };
}

// ============================================
// ALL ROUTES FOR CREW MEMBER
// ============================================

export interface CrewRoute {
  _id: Id<"routes">;
  name: string;
  type: "pickup" | "dropoff";
  scheduledStartTime: string;
  scheduledEndTime: string;
  schoolArrivalTime?: string;
  schoolDepartureTime?: string;
  estimatedDuration?: number;
  estimatedDistance?: number;
  recurrence?: {
    type: string;
    daysOfWeek?: string[];
    dayOfWeek?: string;
    specificDate?: string;
  };
  vehicle: { licensePlate: string; brand: string; model: string } | null;
  studentCount: number;
  stopsCount: number;
  isDriver: boolean;
  isMonitor: boolean;
}

/**
 * Get all routes assigned to this crew member (driver or monitor)
 * Used in the routes list page
 */
export function useCrewRoutes() {
  const { userId } = useConvexAuth();

  const routes = useQuery(
    api.routes.listRoutesForCrew,
    userId ? { userId } : "skip"
  ) as CrewRoute[] | undefined;

  return {
    routes: routes ?? [],
    isLoading: routes === undefined,
    isEmpty: routes !== undefined && routes.length === 0,
  };
}
