"use client";

/**
 * Trip Events hooks for Parent App
 *
 * Provides trip timeline/history functionality for parents
 * Uses the student-filtered timeline query
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

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

// ============================================
// GET STUDENT TRIP TIMELINE
// ============================================

/**
 * Get timeline for a trip filtered to show only events relevant to the student
 * This is the main query for parents - shows their child's events
 */
export function useStudentTripTimeline(
  tripId: Id<"trips"> | null,
  studentId: Id<"students"> | null
) {
  const events = useQuery(
    api.tripEvents.getStudentTripTimeline,
    tripId && studentId
      ? { tripId, studentId }
      : "skip"
  );

  return {
    events: events ?? [],
    isLoading: events === undefined,
    isEmpty: events !== undefined && events.length === 0,
  };
}

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
  student_checkin: { label: "Estudiante abordó", icon: "✅", color: "text-green-600", bgColor: "bg-green-100" },
  student_checkout: { label: "Estudiante bajó", icon: "🚶", color: "text-orange-600", bgColor: "bg-orange-100" },
  student_absent: { label: "Estudiante ausente", icon: "⚠️", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  checklist_completed: { label: "Checklist completado", icon: "📋", color: "text-green-600", bgColor: "bg-green-100" },
  relay_mode_activated: { label: "Modo relevo activado", icon: "🔄", color: "text-purple-600", bgColor: "bg-purple-100" },
  relay_mode_deactivated: { label: "Modo relevo desactivado", icon: "🔄", color: "text-gray-600", bgColor: "bg-gray-100" },
  incident_reported: { label: "Incidente reportado", icon: "🚨", color: "text-red-600", bgColor: "bg-red-100" },
  incident_resolved: { label: "Incidente resuelto", icon: "✅", color: "text-green-600", bgColor: "bg-green-100" },
  novedad_reported: { label: "Novedad reportada", icon: "📝", color: "text-blue-600", bgColor: "bg-blue-100" },
  novedad_approved: { label: "Novedad aprobada", icon: "✅", color: "text-green-600", bgColor: "bg-green-100" },
  novedad_rejected: { label: "Novedad rechazada", icon: "❌", color: "text-red-600", bgColor: "bg-red-100" },
  gps_lost: { label: "Señal GPS perdida", icon: "📡", color: "text-red-600", bgColor: "bg-red-100" },
  gps_restored: { label: "Señal GPS restaurada", icon: "📡", color: "text-green-600", bgColor: "bg-green-100" },
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
