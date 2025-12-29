"use client";

/**
 * Projected Trips hooks for Convex
 *
 * Provides projected trip views for calendar and dashboard
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";
import { useMemo } from "react";

// ============================================
// PROJECTED TRIPS (for Day/Week views)
// ============================================

export function useProjectedTrips(options: {
  startDate: string;
  endDate: string;
  vehicleId?: Id<"vehicles">;
  driverId?: Id<"drivers">;
  studentSearch?: string;
}) {
  const { userId, institutionId } = useConvexAuth();

  const trips = useQuery(
    api.projectedTrips.listProjectedTrips,
    userId && institutionId
      ? {
          userId,
          institutionId,
          startDate: options.startDate,
          endDate: options.endDate,
          vehicleId: options.vehicleId,
          driverId: options.driverId,
          studentSearch: options.studentSearch,
        }
      : "skip"
  );

  // Group trips by date
  const groupedByDate = useMemo(() => {
    if (!trips) return [];

    const groups = new Map<string, typeof trips>();

    for (const trip of trips) {
      const existing = groups.get(trip.date) || [];
      groups.set(trip.date, [...existing, trip]);
    }

    return Array.from(groups.entries())
      .map(([date, dateTrips]) => ({ date, trips: dateTrips }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [trips]);

  return {
    trips: trips ?? [],
    groupedByDate,
    isLoading: trips === undefined,
    isEmpty: trips !== undefined && trips.length === 0,
  };
}

// ============================================
// PROJECTED TRIPS COUNT BY DAY (for Month view)
// ============================================

export function useProjectedTripsCount(year: number, month: number) {
  const { userId, institutionId } = useConvexAuth();

  const counts = useQuery(
    api.projectedTrips.getProjectedTripsCountByDay,
    userId && institutionId
      ? { userId, institutionId, year, month }
      : "skip"
  );

  return {
    countByDay: counts ?? {},
    isLoading: counts === undefined,
  };
}

// ============================================
// ACTIVE AND UPCOMING TRIPS (for Dashboard)
// ============================================

export function useActiveAndUpcomingTrips(hoursAhead: number = 6) {
  const { userId, institutionId } = useConvexAuth();

  const trips = useQuery(
    api.projectedTrips.getActiveAndUpcomingTrips,
    userId && institutionId
      ? { userId, institutionId, hoursAhead }
      : "skip"
  );

  // Separate active and upcoming
  const { activeTrips, upcomingTrips } = useMemo(() => {
    if (!trips) return { activeTrips: [], upcomingTrips: [] };

    return {
      activeTrips: trips.filter((t) => t.type === "active"),
      upcomingTrips: trips.filter((t) => t.type === "upcoming"),
    };
  }, [trips]);

  return {
    trips: trips ?? [],
    activeTrips,
    upcomingTrips,
    isLoading: trips === undefined,
    isEmpty: trips !== undefined && trips.length === 0,
  };
}

// ============================================
// DATE HELPERS
// ============================================

export function getDateRange(
  view: "day" | "week" | "month",
  date: Date
): { startDate: string; endDate: string } {
  const formatDate = (d: Date) => d.toISOString().split("T")[0]!;

  switch (view) {
    case "day":
      return {
        startDate: formatDate(date),
        endDate: formatDate(date),
      };

    case "week": {
      const dayOfWeek = date.getDay();
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - dayOfWeek); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      return {
        startDate: formatDate(startOfWeek),
        endDate: formatDate(endOfWeek),
      };
    }

    case "month": {
      const year = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      return {
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
      };
    }
  }
}

export function formatDateDisplay(dateStr: string, locale: string = "es-EC"): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(dateStr: string, locale: string = "es-EC"): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString(locale, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}
