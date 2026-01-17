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

// Types - Legacy (still supported for backwards compatibility)
export type NovedadType = "absence" | "parent_pickup" | "stop_change" | "early_pickup" | "late_arrival";
export type AffectedRouteType = "pickup" | "dropoff" | "both";

// Category types for dynamic novedad types (simplified 5-category system)
export type NovedadCategory =
  // New simplified categories
  | "absence"              // Ausencia
  | "third_party_pickup"   // Recogida por tercero
  | "temporary_stop_change"// Cambio de parada temporal
  | "address_change"       // Cambio de domicilio permanente
  | "service_suspension"   // Suspensión temporal de servicio
  // Deprecated categories (for backwards compatibility)
  | "pickup_change"
  | "stop_change"
  | "time_change"
  | "location_change"
  | "schedule_change"
  | "route_change"
  | "other";

export type DurationType = "single_day" | "date_range" | "permanent" | "recurring";

export interface CreateNovedadInput {
  studentId: Id<"students">;
  // Legacy fields (still supported for backwards compatibility)
  type?: NovedadType;
  date?: string; // YYYY-MM-DD (legacy)
  // New dynamic type field
  typeId?: Id<"novedadTypes">;
  // Common fields
  affectedRouteType: AffectedRouteType;
  newStopId?: Id<"routeStops">;
  time?: string; // HH:mm for time_change types
  reason: string;
  // New date fields
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (for date_range)
  durationType?: DurationType;
  // Category-specific fields
  authorizedPerson?: {
    name: string;
    phone: string;
    relationship?: string;
  };
  temporaryLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  locationChange?: {
    previousLatitude: number;
    previousLongitude: number;
    previousAddress: string;
    newLatitude: number;
    newLongitude: number;
    newAddress: string;
    distanceChange: number;
  };
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

// ============================================
// EVIDENCE UPLOAD
// ============================================

export function useEvidenceUpload() {
  const { userId } = useConvexAuth();

  const generateUploadUrl = useMutation(api.novedades.generateEvidenceUploadUrl);
  const saveEvidence = useMutation(api.novedades.saveEvidenceFile);

  const uploadEvidence = async (
    novedadId: Id<"novedades">,
    file: File
  ): Promise<void> => {
    if (!userId) throw new Error("No autenticado");

    // Get upload URL for this novedad
    const { uploadUrl } = await generateUploadUrl({ userId, novedadId });

    // Upload file to Convex storage
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!result.ok) {
      throw new Error("Error al subir archivo");
    }

    const { storageId } = await result.json();

    // Save evidence metadata
    await saveEvidence({
      userId,
      novedadId,
      storageId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    });
  };

  return {
    uploadEvidence,
    isReady: !!userId,
  };
}
