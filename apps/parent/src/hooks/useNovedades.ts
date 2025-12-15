"use client";

/**
 * Novedades (Schedule Exceptions) hooks for Convex
 *
 * Provides functionality for parents to manage novedades for their children
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// Types
export type NovedadType = "absence" | "parent_pickup" | "stop_change" | "early_pickup" | "late_arrival";
export type AffectedRouteType = "pickup" | "dropoff" | "both";

export interface CreateNovedadInput {
  studentId: Id<"students">;
  type: NovedadType;
  affectedRouteType: AffectedRouteType;
  date: string; // YYYY-MM-DD
  newStopId?: Id<"routeStops">;
  time?: string; // HH:mm for early_pickup/late_arrival
  reason: string;
}

// ============================================
// MY NOVEDADES (Parent's novedades)
// ============================================

export function useMyNovedades(options?: { limit?: number }) {
  const { userId } = useConvexAuth();

  const novedades = useQuery(
    api.novedades.getMyNovedades,
    userId ? { userId, limit: options?.limit } : "skip"
  );

  return {
    novedades: novedades ?? [],
    isLoading: novedades === undefined,
    isEmpty: novedades !== undefined && novedades.length === 0,
  };
}

// ============================================
// PENDING NOVEDADES COUNT
// ============================================

export function usePendingNovedadesCount() {
  const { userId } = useConvexAuth();

  const count = useQuery(
    api.novedades.getPendingCount,
    userId ? { userId } : "skip"
  );

  return {
    count: count ?? 0,
    isLoading: count === undefined,
  };
}

// ============================================
// SINGLE NOVEDAD DETAIL
// ============================================

export function useNovedad(novedadId: Id<"novedades"> | null) {
  const { userId } = useConvexAuth();

  const novedad = useQuery(
    api.novedades.getById,
    userId && novedadId ? { userId, novedadId } : "skip"
  );

  return {
    novedad,
    isLoading: novedad === undefined,
  };
}

// ============================================
// NOVEDADES MUTATIONS
// ============================================

export function useNovedadesMutations() {
  const { userId } = useConvexAuth();

  const createMutation = useMutation(api.novedades.create);
  const cancelMutation = useMutation(api.novedades.cancel);

  const createNovedad = async (input: CreateNovedadInput) => {
    if (!userId) throw new Error("No autenticado");

    return createMutation({
      userId,
      ...input,
    });
  };

  const cancelNovedad = async (novedadId: Id<"novedades">) => {
    if (!userId) throw new Error("No autenticado");

    return cancelMutation({
      userId,
      novedadId,
    });
  };

  return {
    createNovedad,
    cancelNovedad,
    isReady: !!userId,
  };
}

// ============================================
// ROUTE CHANGE REQUESTS (Permanent changes)
// ============================================

export function useMyRouteChangeRequests(options?: { limit?: number }) {
  const { userId } = useConvexAuth();

  const requests = useQuery(
    api.routeChangeRequests.getMyRequests,
    userId ? { userId, limit: options?.limit } : "skip"
  );

  return {
    requests: requests ?? [],
    isLoading: requests === undefined,
    isEmpty: requests !== undefined && requests.length === 0,
  };
}

export function useRouteChangeRequestMutations() {
  const { userId } = useConvexAuth();

  const createMutation = useMutation(api.routeChangeRequests.create);
  const cancelMutation = useMutation(api.routeChangeRequests.cancel);

  const createRequest = async (input: {
    studentId: Id<"students">;
    requestType: "schedule_change" | "stop_change" | "route_change" | "service_suspension";
    effectiveFrom: string;
    effectiveUntil?: string;
    reason: string;
    currentRouteId?: Id<"routes">;
    newRouteId?: Id<"routes">;
    currentStopId?: Id<"routeStops">;
    newStopId?: Id<"routeStops">;
    newSchedule?: {
      daysOfWeek: number[];
      affectedRouteTypes: ("pickup" | "dropoff")[];
    };
  }) => {
    if (!userId) throw new Error("No autenticado");

    return createMutation({
      userId,
      ...input,
    });
  };

  const cancelRequest = async (requestId: Id<"routeChangeRequests">) => {
    if (!userId) throw new Error("No autenticado");

    return cancelMutation({
      userId,
      requestId,
    });
  };

  return {
    createRequest,
    cancelRequest,
    isReady: !!userId,
  };
}
