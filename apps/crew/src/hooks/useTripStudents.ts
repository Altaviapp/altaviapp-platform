"use client";

/**
 * Trip Students hooks for Crew App
 *
 * Provides functionality for crew to view students with novedades
 * and acknowledge novedades
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// TRIP STUDENTS WITH NOVEDADES
// ============================================

export function useTripStudents(tripId: Id<"trips"> | string | null) {
  const { userId } = useConvexAuth();

  const students = useQuery(
    api.trips.getTripStudents,
    userId && tripId
      ? { userId, tripId: tripId as Id<"trips"> }
      : "skip"
  );

  return {
    students: students ?? [],
    isLoading: students === undefined,
    isEmpty: students !== undefined && students.length === 0,
  };
}

// ============================================
// TRIP STUDENTS SUMMARY
// ============================================

export function useTripStudentsSummary(tripId: Id<"trips"> | string | null) {
  const { userId } = useConvexAuth();

  const summary = useQuery(
    api.trips.getTripStudentsSummary,
    userId && tripId
      ? { userId, tripId: tripId as Id<"trips"> }
      : "skip"
  );

  return {
    summary: summary ?? {
      total: 0,
      scheduled: 0,
      absent: 0,
      parentPickup: 0,
      stopChanged: 0,
      checkedIn: 0,
      expectedToBoard: 0,
    },
    isLoading: summary === undefined,
  };
}

// ============================================
// NOVEDADES FOR CREW
// ============================================

export function useNovedadesForTrip(tripId: Id<"trips"> | string | null) {
  const { userId } = useConvexAuth();

  const novedades = useQuery(
    api.novedades.getByTrip,
    userId && tripId
      ? { userId, tripId: tripId as Id<"trips"> }
      : "skip"
  );

  return {
    novedades: novedades ?? [],
    isLoading: novedades === undefined,
    hasNovedades: novedades !== undefined && novedades.length > 0,
    pendingCount: (novedades ?? []).filter((n: any) =>
      n.status === "pending" || n.status === "acknowledged"
    ).length,
  };
}

export function useNovedadesByDate(date: string | null) {
  const { userId } = useConvexAuth();

  const novedades = useQuery(
    api.novedades.getByDate,
    userId && date
      ? { userId, date }
      : "skip"
  );

  return {
    novedades: novedades ?? [],
    isLoading: novedades === undefined,
  };
}

// ============================================
// NOVEDADES MUTATIONS FOR CREW
// ============================================

export function useNovedadesMutations() {
  const { userId } = useConvexAuth();

  const acknowledgeMutation = useMutation(api.novedades.acknowledge);

  const acknowledgeNovedad = async (novedadId: Id<"novedades">) => {
    if (!userId) throw new Error("No autenticado");

    return acknowledgeMutation({
      userId,
      novedadId,
    });
  };

  return {
    acknowledgeNovedad,
    isReady: !!userId,
  };
}

// ============================================
// NOVEDAD TYPES (Dynamic configuration)
// ============================================

export function useNovedadTypes(activeOnly: boolean = true) {
  const { userId } = useConvexAuth();

  const types = useQuery(
    api.novedadTypes.list,
    userId ? { userId, activeOnly } : "skip"
  );

  return {
    types: types ?? [],
    isLoading: types === undefined,
  };
}
