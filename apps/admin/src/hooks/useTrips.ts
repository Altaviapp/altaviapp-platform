"use client";

/**
 * Trips hooks for Convex
 *
 * Provides trip management functionality
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// LIST TRIPS
// ============================================

export function useTrips(filters?: {
  date?: string;
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  routeId?: Id<"routes">;
}) {
  const { userId, institutionId } = useConvexAuth();

  const trips = useQuery(
    api.trips.listTrips,
    userId && institutionId
      ? { userId, institutionId, ...filters }
      : "skip"
  );

  return {
    trips: trips ?? [],
    isLoading: trips === undefined,
    isEmpty: trips !== undefined && trips.length === 0,
  };
}

// ============================================
// SINGLE TRIP
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
// ACTIVE TRIP FOR STUDENT (Parent tracking)
// ============================================

export function useActiveTripForStudent(studentId: Id<"students"> | null) {
  const { userId } = useConvexAuth();

  const result = useQuery(
    api.trips.getActiveTripForStudent,
    userId && studentId
      ? { userId, studentId }
      : "skip"
  );

  return {
    activeTrip: result,
    isLoading: result === undefined,
    hasActiveTrip: result !== null && result !== undefined,
  };
}

// ============================================
// DRIVER'S TRIPS (Today)
// ============================================

export function useDriverTrips(date?: string) {
  const { userId } = useConvexAuth();

  const trips = useQuery(
    api.trips.listTripsForDriver,
    userId
      ? { userId, date }
      : "skip"
  );

  return {
    trips: trips ?? [],
    isLoading: trips === undefined,
    isEmpty: trips !== undefined && trips.length === 0,
  };
}

// ============================================
// TRIP MUTATIONS
// ============================================

export function useTripMutations() {
  const { userId, institutionId } = useConvexAuth();

  const createTrip = useMutation(api.trips.createTrip);
  const startTrip = useMutation(api.trips.startTrip);
  const completeTrip = useMutation(api.trips.completeTrip);
  const cancelTrip = useMutation(api.trips.cancelTrip);

  return {
    createTrip: async (routeId: Id<"routes">, scheduledDate: string) => {
      if (!userId) throw new Error("Not authenticated");
      return createTrip({ userId, routeId, scheduledDate });
    },

    startTrip: async (tripId: Id<"trips">, latitude: number, longitude: number) => {
      if (!userId) throw new Error("Not authenticated");
      return startTrip({ userId, tripId, latitude, longitude });
    },

    completeTrip: async (tripId: Id<"trips">, latitude: number, longitude: number) => {
      if (!userId) throw new Error("Not authenticated");
      return completeTrip({ userId, tripId, latitude, longitude });
    },

    cancelTrip: async (tripId: Id<"trips">, reason?: string) => {
      if (!userId) throw new Error("Not authenticated");
      return cancelTrip({ userId, tripId, reason });
    },
  };
}

// ============================================
// TODAY'S TRIPS HELPER
// ============================================

export function useTodaysTrips() {
  const today = new Date().toISOString().split("T")[0];
  return useTrips({ date: today });
}

// ============================================
// ACTIVE TRIPS (in_progress)
// ============================================

export function useActiveTrips() {
  return useTrips({ status: "in_progress" });
}
