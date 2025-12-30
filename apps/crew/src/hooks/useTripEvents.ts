"use client";

/**
 * Trip Events hooks for Crew App
 *
 * Provides trip timeline/history functionality using real-time events
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// TYPES
// ============================================

export type TripEventType =
  | "trip_started"
  | "trip_completed"
  | "trip_cancelled"
  | "arrived_at_stop"
  | "departed_from_stop"
  | "student_checkin"
  | "student_checkout"
  | "student_absent"
  | "checklist_completed"
  | "relay_mode_activated"
  | "relay_mode_deactivated"
  | "incident_reported"
  | "incident_resolved"
  | "novedad_reported"
  | "novedad_approved"
  | "novedad_rejected"
  | "gps_lost"
  | "gps_restored"
  | "geofence_entered"
  | "geofence_exited";

export type ActorRole = "driver" | "monitor" | "admin" | "parent" | "system";

// ============================================
// GET TRIP TIMELINE
// ============================================

/**
 * Get complete timeline for a trip
 * Shows all events in chronological order
 */
export function useTripTimeline(tripId: Id<"trips"> | null, options?: {
  limit?: number;
  offset?: number;
}) {
  const result = useQuery(
    api.tripEvents.getTripTimeline,
    tripId
      ? { tripId, limit: options?.limit, offset: options?.offset }
      : "skip"
  );

  return {
    events: result?.events ?? [],
    total: result?.total ?? 0,
    hasMore: result?.hasMore ?? false,
    isLoading: result === undefined,
    isEmpty: result !== undefined && result.events.length === 0,
  };
}

// ============================================
// GET LATEST EVENTS (Real-time)
// ============================================

/**
 * Get latest events for a trip (for live updates)
 */
export function useLatestTripEvents(tripId: Id<"trips"> | null, options?: {
  since?: number;
  limit?: number;
}) {
  const events = useQuery(
    api.tripEvents.getLatestEvents,
    tripId
      ? { tripId, since: options?.since, limit: options?.limit }
      : "skip"
  );

  return {
    events: events ?? [],
    isLoading: events === undefined,
  };
}

// ============================================
// RECORD EVENT
// ============================================

/**
 * Record a new event to the trip timeline
 */
export function useTripEventMutations() {
  const { userId } = useConvexAuth();
  const recordEvent = useMutation(api.tripEvents.recordEvent);

  return {
    recordEvent: async (data: {
      tripId: Id<"trips">;
      type: TripEventType;
      title: string;
      description?: string;
      stopId?: Id<"routeStops">;
      studentId?: Id<"students">;
      incidentId?: Id<"incidents">;
      novedadId?: Id<"novedades">;
      actorRole?: ActorRole;
      latitude?: number;
      longitude?: number;
      metadata?: Record<string, unknown>;
    }) => {
      if (!userId) throw new Error("Not authenticated");
      return recordEvent({
        ...data,
        actorId: userId,
        actorRole: data.actorRole ?? "driver",
      });
    },
  };
}

// ============================================
// EVENT DISPLAY HELPERS
// ============================================

export const EVENT_TYPE_CONFIG: Record<TripEventType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  trip_started: { label: "Viaje iniciado", icon: "🚀", color: "text-blue-600", bgColor: "bg-blue-100" },
  trip_completed: { label: "Viaje completado", icon: "🏁", color: "text-green-600", bgColor: "bg-green-100" },
  trip_cancelled: { label: "Viaje cancelado", icon: "❌", color: "text-red-600", bgColor: "bg-red-100" },
  arrived_at_stop: { label: "Llegada a parada", icon: "📍", color: "text-blue-600", bgColor: "bg-blue-100" },
  departed_from_stop: { label: "Salida de parada", icon: "🚗", color: "text-gray-600", bgColor: "bg-gray-100" },
  student_checkin: { label: "Estudiante abordo", icon: "✅", color: "text-green-600", bgColor: "bg-green-100" },
  student_checkout: { label: "Estudiante bajo", icon: "🚶", color: "text-orange-600", bgColor: "bg-orange-100" },
  student_absent: { label: "Estudiante ausente", icon: "⚠️", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  checklist_completed: { label: "Checklist completado", icon: "📋", color: "text-green-600", bgColor: "bg-green-100" },
  relay_mode_activated: { label: "Modo relevo activado", icon: "🔄", color: "text-purple-600", bgColor: "bg-purple-100" },
  relay_mode_deactivated: { label: "Modo relevo desactivado", icon: "🔄", color: "text-gray-600", bgColor: "bg-gray-100" },
  incident_reported: { label: "Incidente reportado", icon: "🚨", color: "text-red-600", bgColor: "bg-red-100" },
  incident_resolved: { label: "Incidente resuelto", icon: "✅", color: "text-green-600", bgColor: "bg-green-100" },
  novedad_reported: { label: "Novedad reportada", icon: "📝", color: "text-blue-600", bgColor: "bg-blue-100" },
  novedad_approved: { label: "Novedad aprobada", icon: "✅", color: "text-green-600", bgColor: "bg-green-100" },
  novedad_rejected: { label: "Novedad rechazada", icon: "❌", color: "text-red-600", bgColor: "bg-red-100" },
  gps_lost: { label: "Senal GPS perdida", icon: "📡", color: "text-red-600", bgColor: "bg-red-100" },
  gps_restored: { label: "Senal GPS restaurada", icon: "📡", color: "text-green-600", bgColor: "bg-green-100" },
  geofence_entered: { label: "Entrando a zona", icon: "🎯", color: "text-blue-600", bgColor: "bg-blue-100" },
  geofence_exited: { label: "Saliendo de zona", icon: "🎯", color: "text-gray-600", bgColor: "bg-gray-100" },
};

export function getEventConfig(type: TripEventType) {
  return EVENT_TYPE_CONFIG[type] || {
    label: type,
    icon: "📌",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  };
}
