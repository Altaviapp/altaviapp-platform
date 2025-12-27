"use client";

/**
 * Calendar Trips hooks for Crew App
 *
 * Provides trip data for calendar view.
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";

export interface CalendarTrip {
  _id: string;
  scheduledDate: string;
  status: string;
  routeName: string;
  routeType: "pickup" | "dropoff";
  startTime?: string;
  endTime?: string;
}

/**
 * Get trips for a specific month
 * Used in the calendar view
 */
export function useCalendarTrips(year: number, month: number) {
  const { userId } = useConvexAuth();

  const trips = useQuery(
    api.trips.getTripsForCrewByMonth,
    userId ? { userId, year, month } : "skip"
  ) as CalendarTrip[] | undefined;

  // Group trips by date
  const tripsByDate: Record<string, CalendarTrip[]> = {};
  if (trips) {
    for (const trip of trips) {
      const dateKey = trip.scheduledDate;
      if (!tripsByDate[dateKey]) {
        tripsByDate[dateKey] = [];
      }
      tripsByDate[dateKey]!.push(trip);
    }
  }

  return {
    trips: trips ?? [],
    tripsByDate,
    isLoading: trips === undefined,
    isEmpty: trips !== undefined && trips.length === 0,
  };
}
