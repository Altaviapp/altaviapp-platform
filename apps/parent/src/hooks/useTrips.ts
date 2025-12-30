"use client";

/**
 * Trips hooks for Parent App
 *
 * Provides trip fetching functionality for parents
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

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
// ACTIVE TRIP FOR STUDENT
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
