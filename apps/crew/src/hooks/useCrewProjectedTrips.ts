"use client";

/**
 * Projected Trips Hooks for Crew App
 *
 * Provides access to projected trips for crew members (drivers/monitors)
 */

import { useQuery } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";
import { useMemo } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

export interface CrewProjectedTrip {
  date: string;
  scheduledTime: string;
  routeId: Id<"routes">;
  routeName: string;
  routeType: "pickup" | "dropoff";
  vehiclePlate: string;
  status: "projected" | "scheduled" | "in_progress" | "completed" | "cancelled";
  tripId?: Id<"trips">;
  studentCount: number;
  novedadCount: number;
  role: "driver" | "monitor" | "both";
}

/**
 * Get projected trips for crew member in a date range
 * Used for the calendar view
 */
export function useCrewProjectedTrips(startDate: string, endDate: string) {
  const { userId } = useConvexAuth();

  const trips = useQuery(
    api.projectedTrips.getCrewProjectedTrips,
    userId && startDate && endDate
      ? { userId, startDate, endDate }
      : "skip"
  );

  // Group trips by date
  const groupedByDate = useMemo(() => {
    if (!trips) return {};

    const grouped: Record<string, CrewProjectedTrip[]> = {};
    for (const trip of trips) {
      if (!grouped[trip.date]) {
        grouped[trip.date] = [];
      }
      grouped[trip.date]!.push(trip as CrewProjectedTrip);
    }
    return grouped;
  }, [trips]);

  return {
    trips: (trips ?? []) as CrewProjectedTrip[],
    groupedByDate,
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
