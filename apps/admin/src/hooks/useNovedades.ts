"use client";

/**
 * Novedades hooks for Admin App
 *
 * Provides functionality for admins to review and approve/reject
 * novedades (schedule exceptions) from parents
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// PENDING NOVEDADES
// ============================================

export function usePendingNovedades() {
  const { userId } = useConvexAuth();

  const novedades = useQuery(
    api.novedades.getPendingForAdmin,
    userId ? { userId } : "skip"
  );

  return {
    novedades: novedades ?? [],
    isLoading: novedades === undefined,
    isEmpty: novedades !== undefined && novedades.length === 0,
  };
}

// ============================================
// ALL NOVEDADES (with filters)
// ============================================

export function useNovedades(options?: {
  status?: "pending" | "approved" | "rejected" | "acknowledged" | "applied" | "cancelled" | "expired";
  fromDate?: string;
  toDate?: string;
  limit?: number;
}) {
  const { userId } = useConvexAuth();

  const novedades = useQuery(
    api.novedades.getForAdmin,
    userId
      ? {
          userId,
          status: options?.status,
          fromDate: options?.fromDate,
          toDate: options?.toDate,
          limit: options?.limit,
        }
      : "skip"
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
    api.novedades.getPendingCountForAdmin,
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

export function useNovedad(novedadId: Id<"novedades"> | string | null) {
  const { userId } = useConvexAuth();

  const novedad = useQuery(
    api.novedades.getById,
    userId && novedadId
      ? { userId, novedadId: novedadId as Id<"novedades"> }
      : "skip"
  );

  return {
    novedad,
    isLoading: novedad === undefined,
  };
}

// ============================================
// REVIEW MUTATIONS
// ============================================

export function useNovedadReviewMutations() {
  const { userId } = useConvexAuth();

  const reviewMutation = useMutation(api.novedades.review);

  const approveNovedad = async (
    novedadId: Id<"novedades">,
    notes?: string
  ) => {
    if (!userId) throw new Error("No autenticado");

    return reviewMutation({
      userId,
      novedadId,
      action: "approve",
      notes,
    });
  };

  const rejectNovedad = async (
    novedadId: Id<"novedades">,
    notes?: string
  ) => {
    if (!userId) throw new Error("No autenticado");

    return reviewMutation({
      userId,
      novedadId,
      action: "reject",
      notes,
    });
  };

  return {
    approveNovedad,
    rejectNovedad,
    isReady: !!userId,
  };
}
