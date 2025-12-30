"use client";

/**
 * Projected Trips Hooks for Parent App
 *
 * Provides access to projected trips for parent's children
 */

import { useQuery } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";
import { useMemo } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

export interface ProjectedTrip {
  date: string;
  scheduledTime: string;
  studentId: Id<"students">;
  studentName: string;
  studentPhoto?: string;
  routeId: Id<"routes">;
  routeName: string;
  routeType: "pickup" | "dropoff";
  stopName: string;
  status: "projected" | "scheduled" | "in_progress" | "completed";
  tripId?: Id<"trips">;
  hasNovedad: boolean;
  novedadStatus?: "pending" | "approved" | "rejected";
}

export interface UpcomingTrip {
  type: "active" | "upcoming";
  studentId: Id<"students">;
  studentName: string;
  studentPhoto?: string;
  date: string;
  scheduledTime: string;
  routeName: string;
  routeType: "pickup" | "dropoff";
  stopName: string;
  driverName: string;
  vehiclePlate: string;
  status: string;
  hasNovedad: boolean;
}

/**
 * Get projected trips for all children in a date range
 * Used for the calendar view
 */
export function useAllChildrenProjectedTrips(startDate: string, endDate: string) {
  const { userId } = useConvexAuth();

  const trips = useQuery(
    api.projectedTrips.getAllChildrenProjectedTrips,
    userId && startDate && endDate
      ? { userId, startDate, endDate }
      : "skip"
  );

  // Group trips by date
  const groupedByDate = useMemo(() => {
    if (!trips) return {};

    const grouped: Record<string, ProjectedTrip[]> = {};
    for (const trip of trips) {
      if (!grouped[trip.date]) {
        grouped[trip.date] = [];
      }
      grouped[trip.date]!.push(trip as ProjectedTrip);
    }
    return grouped;
  }, [trips]);

  return {
    trips: (trips ?? []) as ProjectedTrip[],
    groupedByDate,
    isLoading: trips === undefined,
    isEmpty: trips !== undefined && trips.length === 0,
  };
}

/**
 * Get upcoming trips for all children (for dashboard)
 * Shows active trips + trips in the next N hours
 */
export function useMyChildrenUpcomingTrips(hoursAhead: number = 12) {
  const { userId } = useConvexAuth();

  const trips = useQuery(
    api.projectedTrips.getMyChildrenUpcomingTrips,
    userId ? { userId, hoursAhead } : "skip"
  );

  const activeTrips = useMemo(() => {
    return (trips ?? []).filter((t) => t.type === "active") as UpcomingTrip[];
  }, [trips]);

  const upcomingTrips = useMemo(() => {
    return (trips ?? []).filter((t) => t.type === "upcoming") as UpcomingTrip[];
  }, [trips]);

  return {
    trips: (trips ?? []) as UpcomingTrip[],
    activeTrips,
    upcomingTrips,
    isLoading: trips === undefined,
    isEmpty: trips !== undefined && trips.length === 0,
  };
}

/**
 * Helper to get week start and end dates
 */
export function getWeekRange(weekOffset: number = 0): { startDate: string; endDate: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday

  // Start of current week (Monday)
  const start = new Date(now);
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  start.setDate(now.getDate() - daysToMonday + (weekOffset * 7));
  start.setHours(0, 0, 0, 0);

  // End of week (Sunday)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    startDate: start.toISOString().split("T")[0]!,
    endDate: end.toISOString().split("T")[0]!,
  };
}

/**
 * Format week range for display
 */
export function formatWeekRange(startDate: string, endDate: string): string {
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");

  const startDay = start.getDate();
  const endDay = end.getDate();

  const startMonth = start.toLocaleDateString("es-EC", { month: "short" });
  const endMonth = end.toLocaleDateString("es-EC", { month: "short" });

  if (startMonth === endMonth) {
    return `${startDay} - ${endDay} ${startMonth}`;
  }
  return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
}
