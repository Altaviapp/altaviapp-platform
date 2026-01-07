"use client";

/**
 * Convex Trips hooks for Crew App
 *
 * Provides trip management functionality for drivers and monitors
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// DRIVER'S TODAY TRIPS
// ============================================

export function useMyTrips(date?: string) {
  const { userId } = useConvexAuth();

  const trips = useQuery(
    api.trips.listTripsForDriver,
    userId ? { userId, date } : "skip"
  );

  return {
    trips: trips ?? [],
    isLoading: trips === undefined,
    isEmpty: trips !== undefined && trips.length === 0,
  };
}

// ============================================
// SINGLE TRIP WITH DETAILS
// ============================================

export function useTrip(tripId: Id<"trips"> | null) {
  const { userId } = useConvexAuth();

  const trip = useQuery(
    api.trips.getTrip,
    userId && tripId
      ? { userId, tripId }
      : "skip"
  );

  return {
    trip,
    isLoading: trip === undefined,
  };
}

// ============================================
// TRIP OPERATIONS (Start, Complete, Cancel)
// ============================================

export function useTripOperations() {
  const { userId } = useConvexAuth();

  const startTripMutation = useMutation(api.trips.startTrip);
  const startTripFromRouteMutation = useMutation(api.trips.startTripFromRoute);
  const completeTripMutation = useMutation(api.trips.completeTrip);
  const cancelTripMutation = useMutation(api.trips.cancelTrip);

  return {
    /**
     * Start an existing scheduled trip (legacy)
     */
    startTrip: async (tripId: Id<"trips">, latitude: number, longitude: number) => {
      if (!userId) throw new Error("Not authenticated");
      return startTripMutation({ userId, tripId, latitude, longitude });
    },

    /**
     * Start a trip from a route (lazy creation)
     * Creates the trip on-demand if not already created
     * Returns the tripId to navigate to
     */
    startTripFromRoute: async (
      routeId: Id<"routes"> | string,
      latitude: number,
      longitude: number,
      checklistData?: {
        completedAt: number;
        items: Array<{
          id: string;
          label: string;
          category: string;
          checked: boolean;
        }>;
        notes?: string;
        allPassed: boolean;
      },
      novedadesConfirmedAt?: number,
      confirmedNovedadIds?: Id<"novedades">[]
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return startTripFromRouteMutation({
        userId,
        routeId: routeId as Id<"routes">,
        latitude,
        longitude,
        ...(checklistData && { checklistData }),
        ...(novedadesConfirmedAt && { novedadesConfirmedAt }),
        ...(confirmedNovedadIds && confirmedNovedadIds.length > 0 && { confirmedNovedadIds }),
      });
    },

    completeTrip: async (tripId: Id<"trips">, latitude: number, longitude: number) => {
      if (!userId) throw new Error("Not authenticated");
      return completeTripMutation({ userId, tripId, latitude, longitude });
    },

    cancelTrip: async (tripId: Id<"trips">, reason?: string) => {
      if (!userId) throw new Error("Not authenticated");
      return cancelTripMutation({ userId, tripId, reason });
    },
  };
}

// ============================================
// TODAY'S TRIPS
// ============================================

export function useTodaysTrips() {
  const today = new Date().toISOString().split("T")[0];
  return useMyTrips(today);
}

// ============================================
// ACTIVE TRIP (in_progress)
// ============================================

export function useActiveConvexTrip() {
  const { trips, isLoading } = useTodaysTrips();

  const activeTrip = trips.find((t) => t.status === "in_progress") ?? null;

  return {
    activeTrip,
    isLoading,
    hasActiveTrip: activeTrip !== null,
  };
}

// ============================================
// TRIP HISTORY (past completed trips)
// ============================================

export function useTripHistory(limit?: number) {
  const { userId } = useConvexAuth();

  const result = useQuery(
    api.trips.getDriverTripHistory,
    userId ? { userId, limit } : "skip"
  );

  const tripsByDate = result?.tripsByDate ?? [];

  return {
    tripsByDate,
    stats: result?.stats ?? { totalTrips: 0, totalStudents: 0, totalIncidents: 0, avgDuration: 0 },
    isLoading: result === undefined,
    isEmpty: result !== undefined && tripsByDate.length === 0,
  };
}
