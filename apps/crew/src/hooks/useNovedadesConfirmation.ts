"use client";

/**
 * Novedades Confirmation Hook
 *
 * Provides functionality for crew to confirm/acknowledge novedades
 * before starting a trip.
 */

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";
import type { NovedadForRoute } from "./useDriverRoutes";

interface ConfirmationResult {
  success: boolean;
  confirmedCount: number;
  failedCount: number;
  confirmedAt: number;
  results: Array<{ novedadId: string; success: boolean; error?: string }>;
}

export function useNovedadesConfirmation(novedades: NovedadForRoute[]) {
  const { userId } = useConvexAuth();

  // Local state for tracking confirmed novedades
  const [confirmedIds, setConfirmedIds] = useState<Set<string>>(new Set());
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmedAt, setConfirmedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Mutation for bulk acknowledge
  const acknowledgeMultipleMutation = useMutation(api.novedades.acknowledgeMultiple);

  // Confirm a single novedad (locally tracked, sent to backend in bulk)
  const confirmSingle = useCallback((novedadId: string) => {
    setConfirmedIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(novedadId);
      return newSet;
    });
  }, []);

  // Confirm all novedades at once
  const confirmAll = useCallback(() => {
    const allIds = novedades.map((n) => n._id.toString());
    setConfirmedIds(new Set(allIds));
  }, [novedades]);

  // Submit confirmations to backend
  const submitConfirmations = useCallback(async (): Promise<ConfirmationResult | null> => {
    if (!userId || confirmedIds.size === 0) {
      return null;
    }

    setIsConfirming(true);
    setError(null);

    try {
      const novedadIds = Array.from(confirmedIds).map(
        (id) => id as Id<"novedades">
      );

      const result = await acknowledgeMultipleMutation({
        userId,
        novedadIds,
      });

      setConfirmedAt(result.confirmedAt);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al confirmar novedades";
      setError(errorMessage);
      console.error("Error confirming novedades:", err);
      return null;
    } finally {
      setIsConfirming(false);
    }
  }, [userId, confirmedIds, acknowledgeMultipleMutation]);

  // Reset state
  const reset = useCallback(() => {
    setConfirmedIds(new Set());
    setConfirmedAt(null);
    setError(null);
    setIsConfirming(false);
  }, []);

  // Check if all novedades are confirmed
  const allConfirmed = confirmedIds.size === novedades.length && novedades.length > 0;

  // Get array of confirmed IDs (for passing to trip start)
  const confirmedNovedadIds = Array.from(confirmedIds);

  return {
    // State
    confirmedIds,
    confirmedAt,
    isConfirming,
    error,
    allConfirmed,
    confirmedNovedadIds,

    // Actions
    confirmSingle,
    confirmAll,
    submitConfirmations,
    reset,

    // Computed
    confirmedCount: confirmedIds.size,
    totalCount: novedades.length,
    pendingCount: novedades.length - confirmedIds.size,
  };
}
