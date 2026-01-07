/**
 * Real-time Monitoring Queries
 *
 * Queries optimized for the admin monitoring dashboard.
 * Provides active trips with GPS positions, timelines, and novedades.
 */

import { query } from "./_generated/server";
import { v } from "convex/values";
import { verifyInstitutionAccess, verifyUser } from "./lib/simpleAuth";
import { Id } from "./_generated/dataModel";
import {
  calculateStopETAs,
  getEffectiveSpeed,
  calculateTripAverageSpeed,
  type StopForETA,
} from "./lib/eta";

// ============================================
// Types
// ============================================

interface ActiveTripWithPosition {
  tripId: Id<"trips">;
  routeId: Id<"routes">;
  routeName: string;
  routeType: "pickup" | "dropoff";
  vehicleId: Id<"vehicles">;
  vehiclePlate: string;
  driverId: Id<"drivers">;
  driverName: string;
  monitorId?: Id<"monitors">;
  monitorName?: string;
  startTime: number | undefined;
  scheduledTime: string;
  gps: {
    latitude: number;
    longitude: number;
    speed: number | null;
    heading: number | null;
    timestamp: number;
  } | null;
  novedadesCount: {
    total: number;
    pending: number;
  };
  studentsSummary: {
    checkedIn: number;
    expectedToBoard: number;
    total: number;
  };
  progress: {
    completedStops: number;
    totalStops: number;
  };
}

// ============================================
// Queries
// ============================================

/**
 * Get all active trips with their latest GPS positions
 * Optimized for monitoring dashboard map view
 */
export const getActiveTripsWithPositions = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args): Promise<ActiveTripWithPosition[]> => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const today = new Date().toISOString().split("T")[0]!;

    // Get all in_progress trips for today
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .collect();

    const results: ActiveTripWithPosition[] = [];

    for (const trip of trips) {
      // Get route info
      const route = await ctx.db.get(trip.routeId);
      if (!route || route.institutionId !== args.institutionId) continue;

      // Get vehicle info
      const vehicle = await ctx.db.get(trip.vehicleId);

      // Get driver info
      const driver = await ctx.db.get(trip.driverId);
      const driverUser = driver?.userId ? await ctx.db.get(driver.userId) : null;

      // Get monitor info
      let monitorName: string | undefined;
      if (trip.monitorId) {
        const monitor = await ctx.db.get(trip.monitorId);
        const monitorUser = monitor?.userId ? await ctx.db.get(monitor.userId) : null;
        monitorName = monitorUser?.name;
      }

      // Get latest GPS
      const latestGps = await ctx.db
        .query("gpsTracking")
        .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
        .order("desc")
        .first();

      // Get tripStudents for summary
      const tripStudents = await ctx.db
        .query("tripStudents")
        .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
        .collect();

      // Get check-ins
      const checkins = await ctx.db
        .query("studentCheckins")
        .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
        .collect();

      const checkedInIds = new Set(checkins.map((c) => c.studentId.toString()));

      // Get stops for progress
      const stops = await ctx.db
        .query("routeStops")
        .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      // Count completed stops (stops that have check-ins)
      const checkinsByStop = new Map<string, number>();
      for (const checkin of checkins) {
        const stopId = checkin.stopId.toString();
        checkinsByStop.set(stopId, (checkinsByStop.get(stopId) || 0) + 1);
      }

      // Get novedades count for students in this trip
      const studentIds = tripStudents.map((ts) => ts.studentId);
      let novedadesTotal = 0;
      let novedadesPending = 0;

      for (const ts of tripStudents) {
        if (ts.novedadId) {
          novedadesTotal++;
          const novedad = await ctx.db.get(ts.novedadId);
          if (novedad?.status === "pending") {
            novedadesPending++;
          }
        }
      }

      // Also check for pending novedades that haven't been applied yet
      const pendingNovedades = await ctx.db
        .query("novedades")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .filter((q) =>
          q.and(
            q.eq(q.field("status"), "pending"),
            q.eq(q.field("date"), today)
          )
        )
        .collect();

      const studentIdSet = new Set(studentIds.map((id) => id.toString()));
      for (const nov of pendingNovedades) {
        if (studentIdSet.has(nov.studentId.toString())) {
          novedadesPending++;
        }
      }

      results.push({
        tripId: trip._id,
        routeId: route._id,
        routeName: route.name,
        routeType: route.type,
        vehicleId: trip.vehicleId,
        vehiclePlate: vehicle?.licensePlate || "Sin placa",
        driverId: trip.driverId,
        driverName: driverUser?.name || "Sin conductor",
        monitorId: trip.monitorId,
        monitorName,
        startTime: trip.startTime,
        scheduledTime: route.scheduledStartTime,
        gps: latestGps
          ? {
              latitude: latestGps.latitude,
              longitude: latestGps.longitude,
              speed: latestGps.speed ?? null,
              heading: latestGps.heading ?? null,
              timestamp: latestGps.timestamp,
            }
          : null,
        novedadesCount: {
          total: novedadesTotal,
          pending: novedadesPending,
        },
        studentsSummary: {
          checkedIn: tripStudents.filter(
            (ts) => checkedInIds.has(ts.studentId.toString()) && ts.status === "scheduled"
          ).length,
          expectedToBoard: tripStudents.filter(
            (ts) => ts.status === "scheduled" || ts.status === "stop_changed"
          ).length,
          total: tripStudents.length,
        },
        progress: {
          completedStops: checkinsByStop.size,
          totalStops: stops.length,
        },
      });
    }

    return results;
  },
});

/**
 * Get detailed monitoring info for a single trip
 * Used when a trip is selected in the monitoring sidebar
 */
export const getTripMonitoringDetails = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Get vehicle
    const vehicle = await ctx.db.get(trip.vehicleId);

    // Get driver
    const driver = await ctx.db.get(trip.driverId);
    const driverUser = driver?.userId ? await ctx.db.get(driver.userId) : null;

    // Get monitor
    let monitorName: string | undefined;
    if (trip.monitorId) {
      const monitor = await ctx.db.get(trip.monitorId);
      const monitorUser = monitor?.userId ? await ctx.db.get(monitor.userId) : null;
      monitorName = monitorUser?.name;
    }

    // Get GPS data
    const latestGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .first();

    const firstGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("asc")
      .first();

    // Get stops
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    stops.sort((a, b) => a.order - b.order);

    // Get check-ins
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get tripStudents
    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Completed stops (stops that have check-ins)
    const checkinsByStop = new Map<string, number>();
    for (const checkin of checkins) {
      const stopId = checkin.stopId.toString();
      checkinsByStop.set(stopId, (checkinsByStop.get(stopId) || 0) + 1);
    }
    const completedStopIds = new Set<string>(Array.from(checkinsByStop.keys()));

    // Calculate ETAs if trip is in progress
    let effectiveSpeed = 25;
    if (trip.status === "in_progress" && latestGps && trip.startTime && firstGps) {
      const avgSpeed = calculateTripAverageSpeed(
        trip.startTime,
        { lat: firstGps.latitude, lng: firstGps.longitude },
        { lat: latestGps.latitude, lng: latestGps.longitude },
        completedStopIds.size
      );
      effectiveSpeed = getEffectiveSpeed(latestGps.speed, avgSpeed);
    }

    let stopsWithStatus;
    if (trip.status === "in_progress" && latestGps) {
      const stopsForETA: StopForETA[] = stops.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        address: s.address,
        latitude: s.latitude,
        longitude: s.longitude,
        order: s.order,
        scheduledTime: s.scheduledTime || s.estimatedArrivalTime,
      }));

      const etaResults = calculateStopETAs(
        { lat: latestGps.latitude, lng: latestGps.longitude },
        stopsForETA,
        completedStopIds,
        effectiveSpeed
      );

      stopsWithStatus = stops.map((stop) => {
        const etaResult = etaResults.find((r) => r.id === stop._id.toString());
        const studentsAtStop = tripStudents.filter(
          (ts) => ts.stopId?.toString() === stop._id.toString()
        );
        const checkinsAtStop = checkins.filter(
          (c) => c.stopId.toString() === stop._id.toString()
        );

        return {
          id: stop._id,
          name: stop.name,
          address: stop.address,
          order: stop.order,
          scheduledTime: stop.scheduledTime || stop.estimatedArrivalTime,
          latitude: stop.latitude,
          longitude: stop.longitude,
          status: etaResult?.isCompleted
            ? "completed"
            : etaResult?.isNext
            ? "current"
            : "pending",
          etaMinutes: etaResult?.etaMinutes ?? null,
          etaTime: etaResult?.etaTime ?? null,
          studentsExpected: studentsAtStop.filter(
            (ts) => ts.status === "scheduled" || ts.status === "stop_changed"
          ).length,
          studentsCheckedIn: checkinsAtStop.length,
        };
      });
    } else {
      stopsWithStatus = stops.map((stop) => {
        const studentsAtStop = tripStudents.filter(
          (ts) => ts.stopId?.toString() === stop._id.toString()
        );
        const checkinsAtStop = checkins.filter(
          (c) => c.stopId.toString() === stop._id.toString()
        );

        return {
          id: stop._id,
          name: stop.name,
          address: stop.address,
          order: stop.order,
          scheduledTime: stop.scheduledTime || stop.estimatedArrivalTime,
          latitude: stop.latitude,
          longitude: stop.longitude,
          status: completedStopIds.has(stop._id.toString()) ? "completed" : "pending",
          etaMinutes: null,
          etaTime: null,
          studentsExpected: studentsAtStop.filter(
            (ts) => ts.status === "scheduled" || ts.status === "stop_changed"
          ).length,
          studentsCheckedIn: checkinsAtStop.length,
        };
      });
    }

    // Get route polyline if available (stored as optimizedPolyline)
    const polyline = null; // Decoded polyline not stored, use encoded
    const encodedPolyline = route.optimizedPolyline || null;

    return {
      trip: {
        id: trip._id,
        status: trip.status,
        startTime: trip.startTime,
        scheduledDate: trip.scheduledDate,
      },
      route: {
        id: route._id,
        name: route.name,
        type: route.type,
        scheduledStartTime: route.scheduledStartTime,
      },
      vehicle: {
        id: trip.vehicleId,
        licensePlate: vehicle?.licensePlate || "Sin placa",
      },
      driver: {
        id: trip.driverId,
        name: driverUser?.name || "Sin conductor",
      },
      monitor: trip.monitorId
        ? {
            id: trip.monitorId,
            name: monitorName || "Sin monitor",
          }
        : null,
      currentLocation: latestGps
        ? {
            latitude: latestGps.latitude,
            longitude: latestGps.longitude,
            speed: latestGps.speed ?? null,
            heading: latestGps.heading ?? null,
            timestamp: latestGps.timestamp,
          }
        : null,
      stops: stopsWithStatus,
      polyline,
      encodedPolyline,
      stats: {
        totalStudents: tripStudents.length,
        checkedIn: checkins.length,
        expectedToBoard: tripStudents.filter(
          (ts) => ts.status === "scheduled" || ts.status === "stop_changed"
        ).length,
        completedStops: completedStopIds.size,
        totalStops: stops.length,
      },
    };
  },
});

/**
 * Get combined timeline for a trip (check-ins, events, GPS updates)
 * Used for the "Historial" tab in monitoring sidebar
 */
export const getTripTimeline = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const limit = args.limit || 50;
    const events: {
      id: string;
      type: string;
      title: string;
      description?: string;
      timestamp: number;
      icon: string;
      studentName?: string;
      stopName?: string;
    }[] = [];

    // Get tripEvents
    const tripEvents = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip_timestamp", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .take(limit);

    for (const event of tripEvents) {
      let studentName: string | undefined;
      let stopName: string | undefined;

      if (event.studentId) {
        const student = await ctx.db.get(event.studentId);
        studentName = student ? `${student.firstName} ${student.lastName}` : undefined;
      }
      if (event.stopId) {
        const stop = await ctx.db.get(event.stopId);
        stopName = stop?.name;
      }

      events.push({
        id: event._id.toString(),
        type: event.type,
        title: event.title,
        description: event.description,
        timestamp: event.timestamp,
        icon: getEventIcon(event.type),
        studentName,
        stopName,
      });
    }

    // Get check-ins (if not already in tripEvents)
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .take(limit);

    for (const checkin of checkins) {
      const student = await ctx.db.get(checkin.studentId);
      const stop = await ctx.db.get(checkin.stopId);

      // Check if already in events (avoid duplicates)
      const existingEvent = events.find(
        (e) =>
          e.type === "student_checkin" &&
          e.timestamp === checkin.timestamp &&
          e.studentName === (student ? `${student.firstName} ${student.lastName}` : undefined)
      );

      if (!existingEvent) {
        events.push({
          id: `checkin-${checkin._id.toString()}`,
          type: "student_checkin",
          title: checkin.checkinType === "pickup" ? "Estudiante abordó" : "Estudiante bajó",
          description: checkin.qrScanned ? "QR escaneado" : checkin.manualReason || "Manual",
          timestamp: checkin.timestamp,
          icon: checkin.checkinType === "pickup" ? "user-plus" : "user-minus",
          studentName: student ? `${student.firstName} ${student.lastName}` : undefined,
          stopName: stop?.name,
        });
      }
    }

    // Sort by timestamp descending and limit
    events.sort((a, b) => b.timestamp - a.timestamp);
    return events.slice(0, limit);
  },
});

/**
 * Get novedades affecting a trip
 * Used for the "Novedades" tab in monitoring sidebar
 */
export const getNovedadesForTrip = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      return [];
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      return [];
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Get all tripStudents with novedades
    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    const novedades = [];

    for (const ts of tripStudents) {
      if (ts.novedadId) {
        const novedad = await ctx.db.get(ts.novedadId);
        if (novedad) {
          const student = await ctx.db.get(ts.studentId);
          const stop = ts.stopId ? await ctx.db.get(ts.stopId) : null;
          const originalStop = ts.originalStopId ? await ctx.db.get(ts.originalStopId) : null;

          novedades.push({
            id: novedad._id,
            type: novedad.type || "other",
            typeLabel: getNovedadTypeLabel(novedad.type || "other"),
            status: novedad.status,
            statusLabel: getNovedadStatusLabel(novedad.status),
            reason: novedad.reason,
            studentId: ts.studentId,
            studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
            tripStudentStatus: ts.status,
            stopName: stop?.name,
            originalStopName: originalStop?.name,
            createdAt: novedad.createdAt,
          });
        }
      }
    }

    // Also get pending novedades for students on this route (not yet applied)
    const today = trip.scheduledDate;
    const studentIds = new Set(tripStudents.map((ts) => ts.studentId.toString()));

    const pendingNovedades = await ctx.db
      .query("novedades")
      .withIndex("by_institution", (q) => q.eq("institutionId", route.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("date"), today)
        )
      )
      .collect();

    for (const nov of pendingNovedades) {
      if (studentIds.has(nov.studentId.toString())) {
        // Check if not already in list
        const existing = novedades.find((n) => n.id.toString() === nov._id.toString());
        if (!existing) {
          const student = await ctx.db.get(nov.studentId);
          novedades.push({
            id: nov._id,
            type: nov.type || "other",
            typeLabel: getNovedadTypeLabel(nov.type || "other"),
            status: nov.status,
            statusLabel: getNovedadStatusLabel(nov.status),
            reason: nov.reason,
            studentId: nov.studentId,
            studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
            tripStudentStatus: null, // Not yet applied
            stopName: undefined,
            originalStopName: undefined,
            createdAt: nov.createdAt,
          });
        }
      }
    }

    // Sort by createdAt descending
    novedades.sort((a, b) => b.createdAt - a.createdAt);

    return novedades;
  },
});

// ============================================
// Helper Functions
// ============================================

function getEventIcon(type: string): string {
  const icons: Record<string, string> = {
    trip_started: "play",
    trip_completed: "check-circle",
    trip_cancelled: "x-circle",
    arrived_at_stop: "map-pin",
    departed_from_stop: "navigation",
    student_checkin: "user-plus",
    student_checkout: "user-minus",
    student_absent: "user-x",
    checklist_completed: "clipboard-check",
    relay_mode_activated: "refresh-cw",
    relay_mode_deactivated: "refresh-cw",
    incident_reported: "alert-triangle",
    incident_resolved: "check",
    novedad_reported: "bell",
    novedad_approved: "check",
    novedad_rejected: "x",
    gps_lost: "wifi-off",
    gps_restored: "wifi",
    geofence_entered: "log-in",
    geofence_exited: "log-out",
  };
  return icons[type] || "circle";
}

function getNovedadTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    absence: "Ausencia",
    parent_pickup: "Recoge padre",
    stop_change: "Cambio de parada",
    late_pickup: "Recogida tarde",
    early_dropoff: "Entrega temprana",
    medical: "Médica",
    other: "Otra",
  };
  return labels[type] || type;
}

function getNovedadStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
    acknowledged: "Confirmada",
    applied: "Aplicada",
    cancelled: "Cancelada",
    expired: "Expirada",
  };
  return labels[status] || status;
}
