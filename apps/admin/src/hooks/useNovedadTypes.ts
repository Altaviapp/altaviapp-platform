"use client";

/**
 * Hook for Novedad Types Management
 *
 * Provides CRUD operations for configurable novedad types.
 * Used in Admin settings to manage institution-specific novedad types.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";
import type { Id } from "../../../../convex/_generated/dataModel";

// Types for form data
export type NovedadTypeCategory =
  | "absence"
  | "pickup_change"
  | "stop_change"
  | "time_change"
  | "location_change"
  | "schedule_change"
  | "route_change"
  | "service_suspension"
  | "other";

export type NovedadTypeDuration =
  | "single_day"
  | "date_range"
  | "permanent"
  | "recurring";

export interface NovedadTypeFormData {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: NovedadTypeCategory;
  durationType: NovedadTypeDuration;
  requiresApproval: boolean;
  affectsTrips: boolean;
  affectsRouteCalculation: boolean;
  evidenceRequired: boolean;
  evidenceOptional: boolean;
  maxEvidenceFiles?: number;
  allowedFileTypes?: string[];
  minAdvanceHours?: number;
  reasonRequired: boolean;
}

/**
 * Fetch all novedad types for the institution
 */
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

/**
 * Fetch a single novedad type by ID
 */
export function useNovedadType(typeId: Id<"novedadTypes"> | undefined) {
  const { userId } = useConvexAuth();

  const type = useQuery(
    api.novedadTypes.getById,
    userId && typeId ? { userId, typeId } : "skip"
  );

  return {
    type,
    isLoading: type === undefined,
  };
}

/**
 * Fetch novedad types by category
 */
export function useNovedadTypesByCategory(category: NovedadTypeCategory) {
  const { userId } = useConvexAuth();

  const types = useQuery(
    api.novedadTypes.getByCategory,
    userId ? { userId, category } : "skip"
  );

  return {
    types: types ?? [],
    isLoading: types === undefined,
  };
}

/**
 * Mutations for novedad types
 */
export function useNovedadTypeMutations() {
  const { userId } = useConvexAuth();

  const createMutation = useMutation(api.novedadTypes.create);
  const updateMutation = useMutation(api.novedadTypes.update);
  const toggleActiveMutation = useMutation(api.novedadTypes.toggleActive);
  const removeMutation = useMutation(api.novedadTypes.remove);
  const reorderMutation = useMutation(api.novedadTypes.reorder);

  const createType = async (data: NovedadTypeFormData) => {
    if (!userId) throw new Error("No autenticado");
    return createMutation({ userId, ...data });
  };

  const updateType = async (
    typeId: Id<"novedadTypes">,
    data: Partial<Omit<NovedadTypeFormData, "code">>
  ) => {
    if (!userId) throw new Error("No autenticado");
    return updateMutation({ userId, typeId, ...data });
  };

  const toggleActive = async (typeId: Id<"novedadTypes">) => {
    if (!userId) throw new Error("No autenticado");
    return toggleActiveMutation({ userId, typeId });
  };

  const removeType = async (typeId: Id<"novedadTypes">) => {
    if (!userId) throw new Error("No autenticado");
    return removeMutation({ userId, typeId });
  };

  const reorderTypes = async (typeIds: Id<"novedadTypes">[]) => {
    if (!userId) throw new Error("No autenticado");
    return reorderMutation({ userId, typeIds });
  };

  return {
    createType,
    updateType,
    toggleActive,
    removeType,
    reorderTypes,
  };
}

// Helper constants for UI
export const CATEGORY_LABELS: Record<NovedadTypeCategory, string> = {
  absence: "Ausencias",
  pickup_change: "Cambio de Recogida",
  stop_change: "Cambio de Parada",
  time_change: "Cambio de Horario",
  location_change: "Cambio de Ubicación",
  schedule_change: "Cambio de Horario Permanente",
  route_change: "Cambio de Ruta",
  service_suspension: "Suspensión de Servicio",
  other: "Otro",
};

export const DURATION_LABELS: Record<NovedadTypeDuration, string> = {
  single_day: "Un día",
  date_range: "Rango de fechas",
  permanent: "Permanente",
  recurring: "Recurrente",
};

export const COLOR_OPTIONS = [
  { value: "red", label: "Rojo", className: "bg-red-500" },
  { value: "blue", label: "Azul", className: "bg-blue-500" },
  { value: "green", label: "Verde", className: "bg-green-500" },
  { value: "yellow", label: "Amarillo", className: "bg-yellow-500" },
  { value: "purple", label: "Morado", className: "bg-purple-500" },
  { value: "orange", label: "Naranja", className: "bg-orange-500" },
  { value: "indigo", label: "Índigo", className: "bg-indigo-500" },
  { value: "gray", label: "Gris", className: "bg-gray-500" },
];

export const ICON_OPTIONS = [
  { value: "UserMinus", label: "Usuario Menos" },
  { value: "Stethoscope", label: "Estetoscopio" },
  { value: "Car", label: "Auto" },
  { value: "UserCheck", label: "Usuario Check" },
  { value: "MapPin", label: "Pin Mapa" },
  { value: "MapPinned", label: "Pin Fijado" },
  { value: "Clock", label: "Reloj" },
  { value: "AlarmClock", label: "Alarma" },
  { value: "Home", label: "Casa" },
  { value: "Calendar", label: "Calendario" },
  { value: "Route", label: "Ruta" },
  { value: "Ban", label: "Prohibido" },
  { value: "Bell", label: "Campana" },
  { value: "AlertTriangle", label: "Alerta" },
  { value: "FileText", label: "Documento" },
];
