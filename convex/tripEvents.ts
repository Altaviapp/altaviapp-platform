/**
 * Trip Events - Real-time timeline for trips
 *
 * This module handles the creation and retrieval of trip events,
 * which are used to build a real-time timeline/history of what
 * happens during a trip.
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Event type definitions for type safety
export const tripEventTypes = v.union(
  // Trip lifecycle events
  v.literal("trip_started"),
  v.literal("trip_completed"),
  v.literal("trip_cancelled"),
  // Stop events
  v.literal("arrived_at_stop"),
  v.literal("departed_from_stop"),
  // Student events
  v.literal("student_checkin"),
  v.literal("student_checkout"),
  v.literal("student_absent"),
  // Crew events
  v.literal("checklist_completed"),
  v.literal("relay_mode_activated"),
  v.literal("relay_mode_deactivated"),
  // Incident events
  v.literal("incident_reported"),
  v.literal("incident_resolved"),
  // Novedad events
  v.literal("novedad_reported"),
  v.literal("novedad_approved"),
  v.literal("novedad_rejected"),
  // System events
  v.literal("gps_lost"),
  v.literal("gps_restored"),
  v.literal("geofence_entered"),
  v.literal("geofence_exited")
);

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

// Actor role types
const actorRoleType = v.optional(
  v.union(
    v.literal("driver"),
    v.literal("monitor"),
    v.literal("admin"),
    v.literal("parent"),
    v.literal("system")
  )
);

// ============================================
// MUTATIONS
// ============================================

/**
 * Record a new trip event
 * This is the main mutation for creating timeline entries
 */
export const recordEvent = mutation({
  args: {
    tripId: v.id("trips"),
    type: tripEventTypes,
    title: v.string(),
    description: v.optional(v.string()),
    stopId: v.optional(v.id("routeStops")),
    studentId: v.optional(v.id("students")),
    incidentId: v.optional(v.id("incidents")),
    novedadId: v.optional(v.id("novedades")),
    actorId: v.optional(v.id("users")),
    actorRole: actorRoleType,
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Get trip to get institutionId
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Trip not found");
    }

    // Get route to get institutionId
    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Route not found");
    }

    const now = Date.now();

    const eventId = await ctx.db.insert("tripEvents", {
      tripId: args.tripId,
      institutionId: route.institutionId,
      type: args.type,
      title: args.title,
      description: args.description,
      stopId: args.stopId,
      studentId: args.studentId,
      incidentId: args.incidentId,
      novedadId: args.novedadId,
      actorId: args.actorId,
      actorRole: args.actorRole,
      latitude: args.latitude,
      longitude: args.longitude,
      metadata: args.metadata,
      timestamp: now,
      createdAt: now,
    });

    return { eventId };
  },
});

/**
 * Internal mutation for recording events from other modules
 * This doesn't require authentication and is called internally
 */
export const recordEventInternal = internalMutation({
  args: {
    tripId: v.id("trips"),
    institutionId: v.id("institutions"),
    type: tripEventTypes,
    title: v.string(),
    description: v.optional(v.string()),
    stopId: v.optional(v.id("routeStops")),
    studentId: v.optional(v.id("students")),
    incidentId: v.optional(v.id("incidents")),
    novedadId: v.optional(v.id("novedades")),
    actorId: v.optional(v.id("users")),
    actorRole: actorRoleType,
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const eventId = await ctx.db.insert("tripEvents", {
      tripId: args.tripId,
      institutionId: args.institutionId,
      type: args.type,
      title: args.title,
      description: args.description,
      stopId: args.stopId,
      studentId: args.studentId,
      incidentId: args.incidentId,
      novedadId: args.novedadId,
      actorId: args.actorId,
      actorRole: args.actorRole,
      latitude: args.latitude,
      longitude: args.longitude,
      metadata: args.metadata,
      timestamp: now,
      createdAt: now,
    });

    return { eventId };
  },
});

// ============================================
// QUERIES
// ============================================

/**
 * Get trip timeline - all events for a trip in chronological order
 * This is the main query for displaying the trip history
 */
export const getTripTimeline = query({
  args: {
    tripId: v.id("trips"),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const offset = args.offset ?? 0;

    const events = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip_timestamp", (q) => q.eq("tripId", args.tripId))
      .order("desc") // Most recent first
      .collect();

    // Apply pagination
    const paginatedEvents = events.slice(offset, offset + limit);

    // Enrich events with related entity names
    const enrichedEvents = await Promise.all(
      paginatedEvents.map(async (event) => {
        let stopName: string | undefined;
        let studentName: string | undefined;

        if (event.stopId) {
          const stop = await ctx.db.get(event.stopId);
          stopName = stop?.name;
        }

        if (event.studentId) {
          const student = await ctx.db.get(event.studentId);
          if (student) {
            studentName = `${student.firstName} ${student.lastName}`;
          }
        }

        return {
          ...event,
          stopName,
          studentName,
        };
      })
    );

    return {
      events: enrichedEvents,
      total: events.length,
      hasMore: offset + limit < events.length,
    };
  },
});

/**
 * Get timeline for a specific student within a trip
 * Used for parent view to show only their child's events
 */
export const getStudentTripTimeline = query({
  args: {
    tripId: v.id("trips"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip_timestamp", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .collect();

    // Filter to only show events relevant to the student or general trip events
    const studentEvents = events.filter((event) => {
      // Show trip lifecycle events
      if (
        event.type === "trip_started" ||
        event.type === "trip_completed" ||
        event.type === "trip_cancelled"
      ) {
        return true;
      }

      // Show stop events
      if (
        event.type === "arrived_at_stop" ||
        event.type === "departed_from_stop"
      ) {
        return true;
      }

      // Show events specific to this student
      if (event.studentId?.toString() === args.studentId.toString()) {
        return true;
      }

      // Show incident events (important for all parents)
      if (
        event.type === "incident_reported" ||
        event.type === "incident_resolved"
      ) {
        return true;
      }

      return false;
    });

    // Enrich with stop names
    const enrichedEvents = await Promise.all(
      studentEvents.map(async (event) => {
        let stopName: string | undefined;

        if (event.stopId) {
          const stop = await ctx.db.get(event.stopId);
          stopName = stop?.name;
        }

        return {
          ...event,
          stopName,
        };
      })
    );

    return enrichedEvents;
  },
});

/**
 * Get full trip timeline combining tripEvents and studentCheckins
 * Used for comprehensive trip history view
 */
export const getTripFullTimeline = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    // Get trip events
    const events = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip_timestamp", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get student checkins for this trip
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Enrich trip events
    const enrichedEvents = await Promise.all(
      events.map(async (event) => {
        let stopName: string | undefined;
        let studentName: string | undefined;

        if (event.stopId) {
          const stop = await ctx.db.get(event.stopId);
          stopName = stop?.name;
        }

        if (event.studentId) {
          const student = await ctx.db.get(event.studentId);
          if (student) {
            studentName = `${student.firstName} ${student.lastName}`;
          }
        }

        return {
          id: event._id,
          type: event.type,
          title: event.title,
          description: event.description,
          timestamp: event.timestamp,
          stopName,
          studentName,
          actorRole: event.actorRole,
          latitude: event.latitude,
          longitude: event.longitude,
          source: "event" as const,
        };
      })
    );

    // Convert checkins to timeline format (only if not already in events)
    // Since we now record events for checkins, we filter out duplicates
    const checkinTimestamps = new Set(
      events
        .filter((e) => e.type === "student_checkin" || e.type === "student_checkout")
        .map((e) => e.timestamp)
    );

    const enrichedCheckins = await Promise.all(
      checkins
        .filter((c) => !checkinTimestamps.has(c.timestamp)) // Avoid duplicates
        .map(async (checkin) => {
          const student = await ctx.db.get(checkin.studentId);
          const stop = await ctx.db.get(checkin.stopId);

          return {
            id: checkin._id,
            type: checkin.checkinType === "pickup" ? "student_checkin" : "student_checkout",
            title: student
              ? checkin.checkinType === "pickup"
                ? `${student.firstName} ${student.lastName} abordó`
                : `${student.firstName} ${student.lastName} fue entregado`
              : checkin.checkinType === "pickup"
                ? "Estudiante abordó"
                : "Estudiante entregado",
            description: stop ? `Check-in en parada: ${stop.name}` : undefined,
            timestamp: checkin.timestamp,
            stopName: stop?.name,
            studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
            actorRole: checkin.performedByRole,
            latitude: checkin.latitude,
            longitude: checkin.longitude,
            source: "checkin" as const,
          };
        })
    );

    // Combine and sort by timestamp (most recent first)
    const timeline = [...enrichedEvents, ...enrichedCheckins].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    return timeline;
  },
});

/**
 * Get latest events for a trip (real-time updates)
 * Used for live timeline that auto-updates
 */
export const getLatestEvents = query({
  args: {
    tripId: v.id("trips"),
    since: v.optional(v.number()), // Timestamp to get events after
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    let events = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip_timestamp", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .take(limit);

    // Filter by since timestamp if provided
    if (args.since) {
      events = events.filter((e) => e.timestamp > args.since!);
    }

    return events;
  },
});

// ============================================
// HELPER FUNCTIONS FOR EVENT TITLES
// ============================================

/**
 * Generate a human-readable title for an event
 * This can be used when recording events to auto-generate titles
 */
export function generateEventTitle(
  type: TripEventType,
  metadata?: { studentName?: string; stopName?: string; reason?: string }
): string {
  const titles: Record<TripEventType, string> = {
    trip_started: "Viaje iniciado",
    trip_completed: "Viaje completado",
    trip_cancelled: "Viaje cancelado",
    arrived_at_stop: metadata?.stopName
      ? `Llegada a ${metadata.stopName}`
      : "Llegada a parada",
    departed_from_stop: metadata?.stopName
      ? `Salida de ${metadata.stopName}`
      : "Salida de parada",
    student_checkin: metadata?.studentName
      ? `${metadata.studentName} abordó`
      : "Estudiante abordó",
    student_checkout: metadata?.studentName
      ? `${metadata.studentName} bajó`
      : "Estudiante bajó",
    student_absent: metadata?.studentName
      ? `${metadata.studentName} ausente`
      : "Estudiante ausente",
    checklist_completed: "Checklist completado",
    relay_mode_activated: "Modo relevo activado",
    relay_mode_deactivated: "Modo relevo desactivado",
    incident_reported: "Incidente reportado",
    incident_resolved: "Incidente resuelto",
    novedad_reported: metadata?.reason
      ? `Novedad: ${metadata.reason}`
      : "Novedad reportada",
    novedad_approved: "Novedad aprobada",
    novedad_rejected: "Novedad rechazada",
    gps_lost: "Señal GPS perdida",
    gps_restored: "Señal GPS restaurada",
    geofence_entered: metadata?.stopName
      ? `Entrando a zona de ${metadata.stopName}`
      : "Entrando a geofence",
    geofence_exited: metadata?.stopName
      ? `Saliendo de zona de ${metadata.stopName}`
      : "Saliendo de geofence",
  };

  return titles[type] || type;
}
