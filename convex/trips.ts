/**
 * Trip Management Functions
 *
 * Manages daily route executions (trips).
 * RBAC: Admin can manage trips, drivers can start/complete their trips.
 *
 * Trip Students Generation:
 * When a trip is created, the system generates tripStudents entries
 * based on studentRoutes, applying any novedades for that date.
 */

import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";
import { Id } from "./_generated/dataModel";
import {
  haversineDistance,
  calculateStopETAs,
  getEffectiveSpeed,
  calculateTripAverageSpeed,
  getDelayStatus,
  type StopForETA,
} from "./lib/eta";

/**
 * Create a scheduled trip
 */
export const createTrip = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
    scheduledDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Check if trip already exists for this route and date
    const existing = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", args.scheduledDate))
      .filter((q) => q.eq(q.field("routeId"), args.routeId))
      .first();

    if (existing) {
      throw new Error("Ya existe un viaje para esta ruta en esta fecha");
    }

    const now = Date.now();
    const tripId = await ctx.db.insert("trips", {
      routeId: args.routeId,
      driverId: route.driverId,
      monitorId: route.monitorId,
      vehicleId: route.vehicleId,
      status: "scheduled",
      scheduledDate: args.scheduledDate,
      createdAt: now,
      updatedAt: now,
    });

    // Generate tripStudents entries based on studentRoutes and novedades
    await generateTripStudents(ctx, tripId, args.routeId, route.type, args.scheduledDate);

    return { success: true, tripId };
  },
});

/**
 * Generate tripStudents entries for a trip
 * Applies novedades (absences, stop changes, etc.) from parents
 */
async function generateTripStudents(
  ctx: any,
  tripId: Id<"trips">,
  routeId: Id<"routes">,
  routeType: string,
  scheduledDate: string
) {
  const now = Date.now();

  // Get all active studentRoutes for this route
  const studentRoutes = await ctx.db
    .query("studentRoutes")
    .withIndex("by_route", (q: any) => q.eq("routeId", routeId))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .collect();

  for (const sr of studentRoutes) {
    // Check for novedades affecting this student on this date
    const novedades = await ctx.db
      .query("novedades")
      .withIndex("by_student_date", (q: any) =>
        q.eq("studentId", sr.studentId).eq("date", scheduledDate)
      )
      .filter((q: any) =>
        q.and(
          // Not cancelled or expired
          q.neq(q.field("status"), "cancelled"),
          q.neq(q.field("status"), "expired"),
          // Affects this route type
          q.or(
            q.eq(q.field("affectedRouteType"), "both"),
            q.eq(q.field("affectedRouteType"), routeType)
          )
        )
      )
      .collect();

    // Determine student status based on novedades
    let status: "scheduled" | "absent" | "parent_pickup" | "stop_changed" = "scheduled";
    let stopId = sr.stopId;
    let originalStopId: Id<"routeStops"> | undefined = undefined;
    let novedadId: Id<"novedades"> | undefined = undefined;

    // Process novedades (priority: absence > parent_pickup > stop_change)
    for (const novedad of novedades) {
      if (novedad.type === "absence") {
        status = "absent";
        novedadId = novedad._id;
        break; // Absence takes priority
      } else if (novedad.type === "parent_pickup") {
        status = "parent_pickup";
        novedadId = novedad._id;
      } else if (novedad.type === "stop_change" && status === "scheduled") {
        status = "stop_changed";
        originalStopId = sr.stopId;
        stopId = novedad.newStopId || sr.stopId;
        novedadId = novedad._id;
      }
    }

    // Create tripStudent entry
    await ctx.db.insert("tripStudents", {
      tripId,
      studentId: sr.studentId,
      stopId,
      status,
      originalStopId,
      novedadId,
      createdAt: now,
      updatedAt: now,
    });

    // Mark novedades as applied
    for (const novedad of novedades) {
      if (novedad.status === "pending" || novedad.status === "acknowledged") {
        await ctx.db.patch(novedad._id, {
          status: "applied",
          tripId,
          updatedAt: now,
        });
      }
    }
  }
}

/**
 * Get trip by ID with full details
 * Includes real-time ETA calculations for all stops
 */
export const getTrip = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Get latest GPS location
    const latestGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .first();

    // Get first GPS location (trip start position)
    const firstGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("asc")
      .first();

    // Get check-ins
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get stops
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get tripStudents for more accurate completion tracking
    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Determine completed stops based on check-ins at each stop
    const checkinsByStop = new Map<string, number>();
    for (const checkin of checkins) {
      const stopId = checkin.stopId.toString();
      checkinsByStop.set(stopId, (checkinsByStop.get(stopId) || 0) + 1);
    }

    // A stop is considered complete if it has check-ins
    const completedStopIds = new Set<string>(
      Array.from(checkinsByStop.keys())
    );

    // Calculate effective speed for ETA
    let effectiveSpeed = 25; // Default urban speed
    if (trip.status === "in_progress" && latestGps && trip.startTime && firstGps) {
      const calculatedAvgSpeed = calculateTripAverageSpeed(
        trip.startTime,
        { lat: firstGps.latitude, lng: firstGps.longitude },
        { lat: latestGps.latitude, lng: latestGps.longitude },
        completedStopIds.size
      );
      effectiveSpeed = getEffectiveSpeed(latestGps.speed, calculatedAvgSpeed);
    }

    // Calculate ETAs for all stops if trip is in progress
    let stopsWithETAs: Array<typeof stops[0] & {
      etaMinutes: number | null;
      etaTime: string | null;
      distanceKm: number | null;
      isCompleted: boolean;
      isNext: boolean;
      delayStatus?: { isDelayed: boolean; delayMinutes: number; status: string };
    }>;

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

      stopsWithETAs = stops.map((stop) => {
        const etaResult = etaResults.find((r) => r.id === stop._id.toString());
        const scheduledTime = stop.scheduledTime || stop.estimatedArrivalTime;
        const delayStatus = etaResult?.etaMinutes
          ? getDelayStatus(etaResult.etaMinutes, scheduledTime)
          : undefined;

        return {
          ...stop,
          etaMinutes: etaResult?.etaMinutes ?? null,
          etaTime: etaResult?.etaTime ?? null,
          distanceKm: etaResult?.distanceKm ?? null,
          isCompleted: etaResult?.isCompleted ?? false,
          isNext: etaResult?.isNext ?? false,
          delayStatus,
        };
      });
    } else {
      // Trip not in progress - no ETAs
      stopsWithETAs = stops.map((stop) => ({
        ...stop,
        etaMinutes: null,
        etaTime: null,
        distanceKm: null,
        isCompleted: completedStopIds.has(stop._id.toString()),
        isNext: false,
      }));
    }

    // Sort by order
    stopsWithETAs.sort((a, b) => a.order - b.order);

    // Enrich checkins with student info
    const enrichedCheckins = await Promise.all(
      checkins.map(async (c) => {
        const student = await ctx.db.get(c.studentId);
        const stop = await ctx.db.get(c.stopId);
        return {
          ...c,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          stopName: stop?.name || "Desconocido",
        };
      })
    );

    // Get vehicle, driver, monitor
    const vehicle = await ctx.db.get(trip.vehicleId);
    const driver = await ctx.db.get(trip.driverId);
    const monitor = trip.monitorId ? await ctx.db.get(trip.monitorId) : null;

    // Get institution for school location
    const institution = await ctx.db.get(route.institutionId);

    // Find the next stop for quick reference
    const nextStop = stopsWithETAs.find((s) => s.isNext);

    return {
      ...trip,
      route: {
        id: route._id,
        name: route.name,
        type: route.type,
        optimizedPolyline: route.optimizedPolyline,
      },
      vehicle: vehicle ? { licensePlate: vehicle.licensePlate } : null,
      driver,
      monitor,
      currentLocation: latestGps,
      checkins: enrichedCheckins,
      stops: stopsWithETAs,
      nextStop: nextStop
        ? {
            id: nextStop._id,
            name: nextStop.name,
            etaMinutes: nextStop.etaMinutes,
            etaTime: nextStop.etaTime,
            distanceKm: nextStop.distanceKm,
            delayStatus: nextStop.delayStatus,
          }
        : null,
      school:
        institution && institution.schoolLatitude && institution.schoolLongitude
          ? {
              name: institution.name,
              lat: institution.schoolLatitude,
              lng: institution.schoolLongitude,
            }
          : null,
      stats: {
        totalStudents: tripStudents.length,
        checkedIn: checkins.length,
        stopsCompleted: completedStopIds.size,
        totalStops: stops.length,
        currentSpeed: latestGps?.speed ?? null,
        avgSpeed: effectiveSpeed,
      },
    };
  },
});

/**
 * List trips
 */
export const listTrips = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    date: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    routeId: v.optional(v.id("routes")),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Get routes for this institution
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();
    const routeIds = new Set(routes.map((r) => r._id));

    let trips;
    const date = args.date;

    if (date) {
      trips = await ctx.db
        .query("trips")
        .withIndex("by_date", (q) => q.eq("scheduledDate", date))
        .collect();
    } else {
      trips = await ctx.db.query("trips").collect();
    }

    // Filter by institution routes
    trips = trips.filter((t) => routeIds.has(t.routeId));

    if (args.status) {
      trips = trips.filter((t) => t.status === args.status);
    }

    if (args.routeId) {
      trips = trips.filter((t) => t.routeId === args.routeId);
    }

    // Enrich with route info
    const enriched = await Promise.all(
      trips.map(async (trip) => {
        const route = await ctx.db.get(trip.routeId);
        const vehicle = await ctx.db.get(trip.vehicleId);
        return {
          ...trip,
          routeName: route?.name,
          routeType: route?.type,
          vehiclePlate: vehicle?.licensePlate,
        };
      })
    );

    return enriched;
  },
});

/**
 * List trips for driver (today's trips)
 */
export const listTripsForDriver = query({
  args: {
    userId: v.id("users"),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    // Get driver profile
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!driver) {
      return [];
    }

    const date = args.date || new Date().toISOString().split("T")[0];

    const trips = await ctx.db
      .query("trips")
      .withIndex("by_driver", (q) => q.eq("driverId", driver._id))
      .filter((q) => q.eq(q.field("scheduledDate"), date))
      .collect();

    // Enrich with route info
    const enriched = await Promise.all(
      trips.map(async (trip) => {
        const route = await ctx.db.get(trip.routeId);
        const vehicle = await ctx.db.get(trip.vehicleId);
        return {
          ...trip,
          route: route ? { id: route._id, name: route.name, type: route.type } : null,
          vehicle: vehicle ? { licensePlate: vehicle.licensePlate } : null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get trip history for driver (past completed trips)
 */
export const getDriverTripHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    // Get driver profile
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!driver) {
      return { trips: [], stats: { totalTrips: 0, totalStudents: 0, totalIncidents: 0, avgDuration: 0 } };
    }

    const limit = args.limit || 50;

    // Get completed trips ordered by date (most recent first)
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_driver", (q) => q.eq("driverId", driver._id))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .order("desc")
      .take(limit);

    // Enrich with route info and calculate stats
    let totalStudents = 0;
    let totalDuration = 0;

    const enriched = await Promise.all(
      trips.map(async (trip) => {
        const route = await ctx.db.get(trip.routeId);

        // Get trip students who were scheduled (completed trips mean they were transported)
        const tripStudents = await ctx.db
          .query("tripStudents")
          .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
          .collect();

        // Count students who were scheduled (not absent or parent pickup)
        const boardedCount = tripStudents.filter(ts => ts.status === "scheduled" || ts.status === "stop_changed").length;

        // Calculate duration in minutes
        const duration = trip.startTime && trip.endTime
          ? Math.round((trip.endTime - trip.startTime) / 60000)
          : 0;

        totalStudents += boardedCount;
        totalDuration += duration;

        return {
          _id: trip._id,
          type: route?.type === 'pickup' ? 'ida' : 'vuelta',
          status: trip.status,
          route: route?.name || 'Ruta',
          startTime: trip.startTime ? new Date(trip.startTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          endTime: trip.endTime ? new Date(trip.endTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' }) : '--:--',
          date: trip.scheduledDate,
          duration,
          studentsTransported: boardedCount,
          incidents: 0, // TODO: count incidents when available
        };
      })
    );

    // Group by date
    const groupedByDate: Record<string, typeof enriched> = {};
    enriched.forEach((trip) => {
      if (!groupedByDate[trip.date]) {
        groupedByDate[trip.date] = [];
      }
      groupedByDate[trip.date]!.push(trip);
    });

    // Convert to array format
    const tripsByDate = Object.entries(groupedByDate)
      .map(([date, trips]) => ({
        date,
        trips,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const stats = {
      totalTrips: trips.length,
      totalStudents,
      totalIncidents: 0,
      avgDuration: trips.length > 0 ? Math.round(totalDuration / trips.length) : 0,
    };

    return { tripsByDate, stats };
  },
});

/**
 * Start trip
 */
export const startTrip = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    // Verify user is the driver or admin
    const driver = await ctx.db.get(trip.driverId);
    if (!driver) {
      throw new Error("Conductor no encontrado");
    }

    if (driver.userId !== args.userId && currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      throw new Error("No tienes permiso para iniciar este viaje");
    }

    if (trip.status !== "scheduled") {
      throw new Error("Este viaje no está programado");
    }

    const now = Date.now();

    // Update trip status
    await ctx.db.patch(args.tripId, {
      status: "in_progress",
      startTime: now,
      updatedAt: now,
    });

    // Record initial GPS location
    await ctx.db.insert("gpsTracking", {
      tripId: args.tripId,
      latitude: args.latitude,
      longitude: args.longitude,
      timestamp: now,
    });

    return { success: true };
  },
});

/**
 * Complete trip
 */
export const completeTrip = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    // Verify user is the driver or admin
    const driver = await ctx.db.get(trip.driverId);
    if (!driver) {
      throw new Error("Conductor no encontrado");
    }

    if (driver.userId !== args.userId && currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      throw new Error("No tienes permiso para completar este viaje");
    }

    if (trip.status !== "in_progress") {
      throw new Error("Este viaje no está en progreso");
    }

    const now = Date.now();

    // Record final GPS location
    await ctx.db.insert("gpsTracking", {
      tripId: args.tripId,
      latitude: args.latitude,
      longitude: args.longitude,
      timestamp: now,
    });

    // Get route for planned duration
    const route = await ctx.db.get(trip.routeId);
    const plannedDuration = (route?.estimatedDuration ?? 40) * 60000; // Convert minutes to ms

    // Get trip students to calculate stats
    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get check-ins for this trip
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    const checkedInStudentIds = new Set(checkins.map((c) => c.studentId.toString()));

    const studentsPickedUp = checkins.length;
    const studentsAbsent = tripStudents.filter((ts) => ts.status === "absent" || ts.status === "parent_pickup").length;
    const studentsNoShow = tripStudents.filter((ts) =>
      ts.status === "scheduled" && !checkedInStudentIds.has(ts.studentId.toString())
    ).length;

    // Get stops to calculate stats
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get trip events to count arrived/skipped stops
    const stopEvents = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip_timestamp", (q) => q.eq("tripId", args.tripId))
      .collect();

    const stopsCompleted = stopEvents.filter((e) => e.type === "arrived_at_stop").length;
    const stopsSkipped = stopEvents.filter((e) => e.type === "stop_skipped").length;

    // Count incidents
    const incidents = await ctx.db
      .query("incidents")
      .filter((q) => q.eq(q.field("tripId"), args.tripId))
      .collect();

    // Calculate duration
    const startTime = trip.startTime ?? now;
    const duration = now - startTime;

    // Build stats object
    const stats = {
      duration,
      plannedDuration,
      studentsPickedUp,
      studentsAbsent,
      studentsNoShow,
      incidentsCount: incidents.length,
      stopsCompleted,
      stopsSkipped,
      totalStops: stops.length,
    };

    // Create trip completed event
    await ctx.db.insert("tripEvents", {
      tripId: args.tripId,
      institutionId: route?.institutionId ?? (null as any),
      type: "trip_completed",
      title: "Viaje finalizado",
      description: `${studentsPickedUp} estudiantes ${route?.type === "pickup" ? "recogidos" : "entregados"}, ${stopsCompleted}/${stops.length} paradas`,
      actorId: args.userId,
      actorRole: currentUser.role === "driver" ? "driver" : "monitor",
      latitude: args.latitude,
      longitude: args.longitude,
      metadata: stats,
      timestamp: now,
      createdAt: now,
    });

    // Update trip status with stats
    await ctx.db.patch(args.tripId, {
      status: "completed",
      endTime: now,
      stats,
      updatedAt: now,
    });

    return { success: true, stats };
  },
});

/**
 * Cancel trip
 */
export const cancelTrip = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    if (trip.status === "completed") {
      throw new Error("No se puede cancelar un viaje completado");
    }

    await ctx.db.patch(args.tripId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get active trip for a student (for parent tracking)
 * Returns comprehensive data for real-time tracking including:
 * - Trip status and info
 * - Route with polyline, stops, and times
 * - Vehicle location with speed/heading
 * - Driver and vehicle info
 * - Student's assigned stop with distance-based ETA
 */
export const getActiveTripForStudent = query({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Parents can only view their own children within their institution
    if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
      // Also verify institutionId for multi-tenant isolation
      if (student.institutionId !== currentUser.institutionId) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
    } else {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    // Get student's route assignments with stop info
    const assignments = await ctx.db
      .query("studentRoutes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const routeIds = assignments.map((a) => a.routeId);

    // Find active trip for any of these routes
    const today = new Date().toISOString().split("T")[0] ?? "";
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .collect();

    const activeTrip = trips.find((t) => routeIds.includes(t.routeId));

    if (!activeTrip) {
      return null;
    }

    // Get current location with all tracking data
    const latestGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", activeTrip._id))
      .order("desc")
      .first();

    // Get first GPS location (trip start position)
    const firstGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", activeTrip._id))
      .order("asc")
      .first();

    // Get route details
    const route = await ctx.db.get(activeTrip.routeId);
    if (!route) {
      return null;
    }

    // Get route stops
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", activeTrip.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const sortedStops = stops.sort((a, b) => a.order - b.order);

    // Find student's assigned stop
    const studentAssignment = assignments.find((a) => a.routeId === activeTrip.routeId);
    const studentStopId = studentAssignment?.stopId;
    const studentStop = studentStopId ? await ctx.db.get(studentStopId) : null;

    // Get vehicle info
    const vehicle = await ctx.db.get(activeTrip.vehicleId);

    // Get driver info
    const driver = await ctx.db.get(activeTrip.driverId);
    let driverUser = null;
    if (driver?.userId) {
      driverUser = await ctx.db.get(driver.userId);
    }

    // Get institution for school location
    const institution = await ctx.db.get(student.institutionId);

    // Get check-ins to determine completed stops
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", activeTrip._id))
      .collect();

    // Determine which stops are completed based on check-ins
    const stopsWithCheckins = new Set(checkins.map(c => c.stopId.toString()));
    const completedStopsCount = stopsWithCheckins.size;
    const progressPercentage = sortedStops.length > 0
      ? Math.round((completedStopsCount / sortedStops.length) * 100)
      : 0;

    // Find current stop index (first non-completed stop)
    const currentStopIndex = sortedStops.findIndex(
      (stop) => !stopsWithCheckins.has(stop._id.toString())
    );

    // Calculate effective speed for ETA
    let effectiveSpeed = 25; // Default urban speed
    if (latestGps && activeTrip.startTime && firstGps) {
      const calculatedAvgSpeed = calculateTripAverageSpeed(
        activeTrip.startTime,
        { lat: firstGps.latitude, lng: firstGps.longitude },
        { lat: latestGps.latitude, lng: latestGps.longitude },
        completedStopsCount
      );
      effectiveSpeed = getEffectiveSpeed(latestGps.speed, calculatedAvgSpeed);
    }

    // Calculate distance-based ETA to student's stop
    let etaMinutes: number | null = null;
    let etaTime: string | null = null;
    let distanceKm: number | null = null;
    let delayStatus: { isDelayed: boolean; delayMinutes: number; status: string } | null = null;

    if (studentStop && latestGps) {
      // Check if student's stop is already completed
      const studentStopCompleted = stopsWithCheckins.has(studentStop._id.toString());

      if (!studentStopCompleted) {
        // Calculate stops with ETAs
        const stopsForETA: StopForETA[] = sortedStops.map((s) => ({
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
          stopsWithCheckins,
          effectiveSpeed
        );

        // Find the ETA for student's stop
        const studentStopETA = etaResults.find((r) => r.id === studentStop._id.toString());
        if (studentStopETA) {
          etaMinutes = studentStopETA.etaMinutes;
          etaTime = studentStopETA.etaTime;
          distanceKm = studentStopETA.distanceKm;

          // Calculate delay status
          const scheduledTime = studentStop.scheduledTime || studentStop.estimatedArrivalTime;
          if (etaMinutes !== null && scheduledTime) {
            delayStatus = getDelayStatus(etaMinutes, scheduledTime);
          }
        }
      } else {
        // Student's stop is completed
        etaMinutes = 0;
      }
    }

    // Calculate ETAs for all stops for the map
    let stopsWithETAs = sortedStops.map((stop) => {
      const isCompleted = stopsWithCheckins.has(stop._id.toString());
      const isStudentStop = stop._id.toString() === studentStopId?.toString();

      // Default values
      let stopEtaMinutes: number | null = null;
      let stopEtaTime: string | null = null;

      if (!isCompleted && latestGps) {
        const stopsForETA: StopForETA[] = sortedStops.map((s) => ({
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
          stopsWithCheckins,
          effectiveSpeed
        );

        const stopEtaResult = etaResults.find((r) => r.id === stop._id.toString());
        if (stopEtaResult) {
          stopEtaMinutes = stopEtaResult.etaMinutes;
          stopEtaTime = stopEtaResult.etaTime;
        }
      }

      return {
        id: stop._id,
        name: stop.name,
        address: stop.address,
        lat: stop.latitude,
        lng: stop.longitude,
        order: stop.order,
        scheduledTime: stop.scheduledTime || stop.estimatedArrivalTime,
        completed: isCompleted,
        isStudentStop,
        etaMinutes: stopEtaMinutes,
        etaTime: stopEtaTime,
      };
    });

    return {
      trip: {
        id: activeTrip._id,
        status: activeTrip.status,
        startTime: activeTrip.startTime,
        scheduledDate: activeTrip.scheduledDate,
      },
      route: {
        id: route._id,
        name: route.name,
        type: route.type,
        scheduledStartTime: route.scheduledStartTime,
        scheduledEndTime: route.scheduledEndTime,
        optimizedPolyline: route.optimizedPolyline,
        estimatedDuration: route.estimatedDuration,
        estimatedDistance: route.estimatedDistance,
      },
      stops: stopsWithETAs,
      studentStop: studentStop ? {
        id: studentStop._id,
        name: studentStop.name,
        address: studentStop.address,
        lat: studentStop.latitude,
        lng: studentStop.longitude,
        scheduledTime: studentStop.scheduledTime || studentStop.estimatedArrivalTime,
        order: studentStop.order,
        etaMinutes,
        etaTime,
        distanceKm,
        delayStatus,
      } : null,
      currentLocation: latestGps ? {
        latitude: latestGps.latitude,
        longitude: latestGps.longitude,
        speed: latestGps.speed,
        heading: latestGps.heading,
        timestamp: latestGps.timestamp,
      } : null,
      vehicle: vehicle ? {
        id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        capacity: vehicle.capacity,
      } : null,
      driver: driverUser ? {
        name: driverUser.name,
        phone: driverUser.phone,
      } : null,
      school: institution && institution.schoolLatitude && institution.schoolLongitude ? {
        name: institution.name,
        lat: institution.schoolLatitude,
        lng: institution.schoolLongitude,
      } : null,
      progress: {
        percentage: progressPercentage,
        completedStops: completedStopsCount,
        totalStops: sortedStops.length,
        currentStopIndex: currentStopIndex >= 0 ? currentStopIndex : sortedStops.length,
      },
      etaMinutes,
      etaTime,
      distanceKm,
      delayStatus,
      currentSpeed: latestGps?.speed ?? null,
      lastGPSUpdate: latestGps?.timestamp ?? null,
    };
  },
});

/**
 * Reassign vehicle during active trip (Relay Mode / Modo Relevo)
 * Used when a vehicle needs to be changed mid-trip (breakdown, capacity, etc.)
 */
export const reassignVehicle = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    newVehicleId: v.id("vehicles"),
    newDriverId: v.optional(v.id("drivers")),
    reason: v.union(
      v.literal("breakdown"),
      v.literal("relay"),
      v.literal("capacity"),
      v.literal("other")
    ),
    notes: v.optional(v.string()),
    currentLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // 1. Get and validate trip
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    if (trip.status !== "in_progress") {
      throw new Error("Solo se puede reasignar vehículo en viajes en progreso");
    }

    // 2. Get route for institution check
    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    // 3. Verify permissions (admin, driver, or monitor can initiate relay)
    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";
    const isAssignedDriver = await ctx.db.get(trip.driverId).then((d) => d?.userId === args.userId);
    const isAssignedMonitor = trip.monitorId
      ? await ctx.db.get(trip.monitorId).then((m) => m?.userId === args.userId)
      : false;

    if (!isAdmin && !isAssignedDriver && !isAssignedMonitor) {
      throw new Error("No tienes permiso para reasignar el vehículo");
    }

    if (!isAdmin) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    // 4. Validate new vehicle
    const newVehicle = await ctx.db.get(args.newVehicleId);
    if (!newVehicle) {
      throw new Error("Nuevo vehículo no encontrado");
    }

    if (!newVehicle.isActive || newVehicle.status !== "active") {
      throw new Error("El vehículo seleccionado no está disponible");
    }

    if (newVehicle.institutionId !== route.institutionId) {
      throw new Error("El vehículo no pertenece a esta institución");
    }

    // Check if new vehicle is already in use in another active trip
    const today = new Date().toISOString().split("T")[0]!;
    const conflictingTrip = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .filter((q) =>
        q.and(
          q.eq(q.field("vehicleId"), args.newVehicleId),
          q.eq(q.field("status"), "in_progress"),
          q.neq(q.field("_id"), args.tripId)
        )
      )
      .first();

    if (conflictingTrip) {
      throw new Error("El vehículo ya está en uso en otro viaje activo");
    }

    // 5. Validate new driver if provided
    let newDriverId = args.newDriverId;
    if (newDriverId) {
      const newDriver = await ctx.db.get(newDriverId);
      if (!newDriver || !newDriver.isActive) {
        throw new Error("El conductor seleccionado no está disponible");
      }
      if (newDriver.institutionId !== route.institutionId) {
        throw new Error("El conductor no pertenece a esta institución");
      }
    }

    // 6. Get currently checked-in students
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("checkinType"), "pickup"))
      .collect();

    const studentIds = Array.from(new Set(checkins.map((c) => c.studentId)));

    // 7. Record the vehicle change
    const now = Date.now();
    await ctx.db.insert("tripVehicleChanges", {
      tripId: args.tripId,
      previousVehicleId: trip.vehicleId,
      newVehicleId: args.newVehicleId,
      previousDriverId: trip.driverId,
      newDriverId: newDriverId || trip.driverId,
      changedAt: now,
      changedBy: args.userId,
      reason: args.reason,
      notes: args.notes,
      changeLocation: args.currentLocation,
      studentsTransferred: studentIds,
    });

    // 8. Update trip with new vehicle and driver
    const updates: Record<string, unknown> = {
      vehicleId: args.newVehicleId,
      updatedAt: now,
    };

    if (newDriverId) {
      updates.driverId = newDriverId;
    }

    await ctx.db.patch(args.tripId, updates);

    // 9. Create notification for parents about vehicle change
    for (const studentId of studentIds) {
      const studentDoc = await ctx.db.get(studentId);
      if (studentDoc && 'parentEmail' in studentDoc && 'firstName' in studentDoc) {
        // Find parent user by email
        const parentUser = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", studentDoc.parentEmail.toLowerCase()))
          .first();

        if (parentUser) {
          await ctx.db.insert("notifications", {
            userId: parentUser._id,
            title: "Cambio de vehículo",
            message: `El vehículo de ${studentDoc.firstName} ha cambiado a ${newVehicle.licensePlate} (${newVehicle.brand} ${newVehicle.model}). Razón: ${getReasonLabel(args.reason)}`,
            type: "info",
            read: false,
            createdAt: now,
          });
        }
      }
    }

    return {
      success: true,
      newVehicle: {
        id: newVehicle._id,
        licensePlate: newVehicle.licensePlate,
        gpsSourceType: newVehicle.gpsSourceType || "mobile",
        hasExternalGps: newVehicle.gpsSourceType === "device" || newVehicle.gpsSourceType === "api",
      },
      studentsTransferred: studentIds.length,
    };
  },
});

/**
 * Get vehicle change history for a trip
 */
export const getVehicleChangeHistory = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    const changes = await ctx.db
      .query("tripVehicleChanges")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Enrich with vehicle and user info
    const enriched = await Promise.all(
      changes.map(async (change) => {
        const previousVehicle = await ctx.db.get(change.previousVehicleId);
        const newVehicle = await ctx.db.get(change.newVehicleId);
        const changedByUser = await ctx.db.get(change.changedBy);

        return {
          ...change,
          previousVehiclePlate: previousVehicle?.licensePlate || "Desconocido",
          newVehiclePlate: newVehicle?.licensePlate || "Desconocido",
          changedByName: changedByUser?.name || "Desconocido",
          reasonLabel: getReasonLabel(change.reason),
        };
      })
    );

    return enriched.sort((a, b) => a.changedAt - b.changedAt);
  },
});

/**
 * Get available vehicles for relay (not in use)
 */
export const getAvailableVehiclesForRelay = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Get all active vehicles in institution
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_institution", (q) => q.eq("institutionId", route.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("status"), "active"),
          q.neq(q.field("_id"), trip.vehicleId) // Exclude current vehicle
        )
      )
      .collect();

    // Get vehicles currently in use
    const today = new Date().toISOString().split("T")[0]!;
    const activeTrips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .collect();

    const vehiclesInUse = new Set(activeTrips.map((t) => t.vehicleId));

    // Filter out vehicles in use
    const availableVehicles = vehicles.filter((v) => !vehiclesInUse.has(v._id));

    return availableVehicles.map((v) => ({
      id: v._id,
      licensePlate: v.licensePlate,
      brand: v.brand,
      model: v.model,
      capacity: v.capacity,
      gpsSourceType: v.gpsSourceType || "mobile",
      hasExternalGps: v.gpsSourceType === "device" || v.gpsSourceType === "api",
    }));
  },
});

// Helper function for reason labels
function getReasonLabel(reason: string): string {
  const labels: Record<string, string> = {
    breakdown: "Falla mecánica",
    relay: "Relevo programado",
    capacity: "Capacidad insuficiente",
    other: "Otra razón",
  };
  return labels[reason] || reason;
}

// ============================================
// TRIP STUDENTS QUERIES
// ============================================

/**
 * Get students for a trip with novedades info
 * Used by crew app to show student list with exceptions
 */
export const getTripStudents = query({
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
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    // Get trip students
    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Enrich with student, stop, and novedad details
    const enriched = await Promise.all(
      tripStudents.map(async (ts) => {
        const student = await ctx.db.get(ts.studentId);
        const stop = await ctx.db.get(ts.stopId);
        const originalStop = ts.originalStopId
          ? await ctx.db.get(ts.originalStopId)
          : null;
        const novedad = ts.novedadId
          ? await ctx.db.get(ts.novedadId)
          : null;

        // Get check-in status for this student in this trip
        const checkin = await ctx.db
          .query("studentCheckins")
          .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
          .filter((q) => q.eq(q.field("studentId"), ts.studentId))
          .first();

        return {
          ...ts,
          student: student
            ? {
                id: student._id,
                firstName: student.firstName,
                lastName: student.lastName,
                grade: student.grade,
              }
            : null,
          stop: stop
            ? {
                id: stop._id,
                name: stop.name,
                address: stop.address,
                order: stop.order,
              }
            : null,
          originalStop: originalStop
            ? {
                id: originalStop._id,
                name: originalStop.name,
              }
            : null,
          novedad: novedad
            ? {
                id: novedad._id,
                type: novedad.type,
                reason: novedad.reason,
                status: novedad.status,
                acknowledgedAt: novedad.acknowledgedAt,
              }
            : null,
          checkedIn: !!checkin,
          checkinTime: checkin?.timestamp,
          statusLabel: getTripStudentStatusLabel(ts.status),
        };
      })
    );

    // Sort by stop order, then by student name
    enriched.sort((a, b) => {
      const orderA = a.stop?.order ?? 999;
      const orderB = b.stop?.order ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      const nameA = a.student ? `${a.student.lastName} ${a.student.firstName}` : "";
      const nameB = b.student ? `${b.student.lastName} ${b.student.firstName}` : "";
      return nameA.localeCompare(nameB);
    });

    return enriched;
  },
});

/**
 * Get trip students summary (counts by status)
 */
export const getTripStudentsSummary = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    const checkedInStudentIds = new Set(checkins.map((c) => c.studentId));

    return {
      total: tripStudents.length,
      scheduled: tripStudents.filter((ts) => ts.status === "scheduled").length,
      absent: tripStudents.filter((ts) => ts.status === "absent").length,
      parentPickup: tripStudents.filter((ts) => ts.status === "parent_pickup").length,
      stopChanged: tripStudents.filter((ts) => ts.status === "stop_changed").length,
      checkedIn: tripStudents.filter((ts) =>
        checkedInStudentIds.has(ts.studentId) && ts.status === "scheduled"
      ).length,
      expectedToBoard: tripStudents.filter((ts) =>
        ts.status === "scheduled" || ts.status === "stop_changed"
      ).length,
    };
  },
});

/**
 * Regenerate tripStudents for a scheduled trip
 * Used when novedades are updated after trip creation
 */
export const regenerateTripStudents = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    if (trip.status !== "scheduled") {
      throw new Error("Solo se pueden regenerar estudiantes para viajes programados");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Delete existing tripStudents
    const existingStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    for (const ts of existingStudents) {
      await ctx.db.delete(ts._id);
    }

    // Regenerate with current novedades
    await generateTripStudents(ctx, args.tripId, trip.routeId, route.type, trip.scheduledDate);

    return { success: true };
  },
});

// Helper function for trip student status labels
function getTripStudentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: "Programado",
    absent: "Ausente",
    parent_pickup: "Recoge padre",
    stop_changed: "Cambio de parada",
  };
  return labels[status] || status;
}

// ============================================
// LAZY TRIP CREATION (Start from Route)
// ============================================

/**
 * Helper function to get day name in lowercase
 */
function getDayName(date: Date): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()] || "monday";
}

/**
 * Validate that a route's recurrence is valid for today
 */
function validateRouteForDate(
  recurrence: {
    type: "daily" | "weekly" | "monthly" | "one_time";
    daysOfWeek?: string[];
    dayOfWeek?: string;
    dayOfMonth?: number;
    specificDate?: string;
  } | undefined,
  dateStr: string
): boolean {
  // If no recurrence defined, route runs every day (backwards compatible)
  if (!recurrence) {
    return true;
  }

  const date = new Date(dateStr + "T12:00:00"); // Use noon to avoid timezone issues
  const dayName = getDayName(date);

  switch (recurrence.type) {
    case "daily":
      // If daysOfWeek specified, check if today is included
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        return recurrence.daysOfWeek.includes(dayName);
      }
      // No specific days = every day
      return true;

    case "weekly":
      return recurrence.dayOfWeek === dayName;

    case "monthly":
      return recurrence.dayOfMonth === date.getDate();

    case "one_time":
      return recurrence.specificDate === dateStr;

    default:
      return true;
  }
}

/**
 * Start a trip lazily from a route (creates trip on-demand)
 *
 * This is the preferred way to start trips in the new lazy-creation flow:
 * 1. Validates route recurrence for today
 * 2. Checks no existing trip for this route today
 * 3. Creates the trip with status in_progress
 * 4. Generates tripStudents (respecting excludeDays)
 * 5. Records initial GPS location
 */
export const startTripFromRoute = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
    latitude: v.number(),
    longitude: v.number(),
    checklistData: v.optional(v.object({
      completedAt: v.number(),
      items: v.array(v.object({
        id: v.string(),
        label: v.string(),
        category: v.string(),
        checked: v.boolean(),
      })),
      notes: v.optional(v.string()),
      allPassed: v.boolean(),
    })),
    // Novedades confirmation data (from crew review step)
    novedadesConfirmedAt: v.optional(v.number()),
    confirmedNovedadIds: v.optional(v.array(v.id("novedades"))),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // 1. Get and validate route
    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    if (!route.isActive) {
      throw new Error("Esta ruta no está activa");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // 2. Verify user is the driver or admin
    const driver = await ctx.db.get(route.driverId);
    if (!driver) {
      throw new Error("Conductor no encontrado para esta ruta");
    }

    if (driver.userId !== args.userId && currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      throw new Error("No tienes permiso para iniciar viajes de esta ruta");
    }

    // 3. Validate recurrence for today
    const today = new Date().toISOString().split("T")[0]!;
    const recurrence = route.recurrence as {
      type: "daily" | "weekly" | "monthly" | "one_time";
      daysOfWeek?: string[];
      dayOfWeek?: string;
      dayOfMonth?: number;
      specificDate?: string;
    } | undefined;

    if (!validateRouteForDate(recurrence, today)) {
      throw new Error("Esta ruta no está programada para hoy");
    }

    // 4. Check for existing trip today
    const existingTrip = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .filter((q) =>
        q.and(
          q.eq(q.field("routeId"), args.routeId),
          q.neq(q.field("status"), "cancelled")
        )
      )
      .first();

    if (existingTrip) {
      if (existingTrip.status === "in_progress") {
        // Return the existing trip if already in progress
        return { success: true, tripId: existingTrip._id, alreadyInProgress: true };
      } else if (existingTrip.status === "completed") {
        throw new Error("Ya se completó un viaje para esta ruta hoy");
      } else if (existingTrip.status === "scheduled") {
        // Use the existing scheduled trip
        const now = Date.now();
        await ctx.db.patch(existingTrip._id, {
          status: "in_progress",
          startTime: now,
          updatedAt: now,
          ...(args.checklistData && { checklistData: args.checklistData }),
          ...(args.novedadesConfirmedAt && { novedadesConfirmedAt: args.novedadesConfirmedAt }),
          ...(args.confirmedNovedadIds && { confirmedNovedadIds: args.confirmedNovedadIds }),
        });

        // Record initial GPS location
        await ctx.db.insert("gpsTracking", {
          tripId: existingTrip._id,
          latitude: args.latitude,
          longitude: args.longitude,
          timestamp: now,
        });

        // Notify parents that trip has started
        await notifyParentsOfTripStart(ctx, existingTrip._id, route.name, route.type);

        return { success: true, tripId: existingTrip._id };
      }
    }

    // 5. Create new trip
    const now = Date.now();
    const tripId = await ctx.db.insert("trips", {
      routeId: args.routeId,
      driverId: route.driverId,
      monitorId: route.monitorId,
      vehicleId: route.vehicleId,
      status: "in_progress",
      scheduledDate: today,
      startTime: now,
      createdAt: now,
      updatedAt: now,
      ...(args.checklistData && { checklistData: args.checklistData }),
      ...(args.novedadesConfirmedAt && { novedadesConfirmedAt: args.novedadesConfirmedAt }),
      ...(args.confirmedNovedadIds && { confirmedNovedadIds: args.confirmedNovedadIds }),
    });

    // 6. Generate tripStudents with excludeDays filtering
    await generateTripStudentsWithExclusions(ctx, tripId, args.routeId, route.type, today);

    // 7. Record initial GPS location
    await ctx.db.insert("gpsTracking", {
      tripId,
      latitude: args.latitude,
      longitude: args.longitude,
      timestamp: now,
    });

    // 8. Notify parents that trip has started
    await notifyParentsOfTripStart(ctx, tripId, route.name, route.type);

    return { success: true, tripId };
  },
});

/**
 * Generate tripStudents entries with excludeDays support
 * Enhanced version that filters out students with today excluded
 */
async function generateTripStudentsWithExclusions(
  ctx: any,
  tripId: Id<"trips">,
  routeId: Id<"routes">,
  routeType: string,
  scheduledDate: string
) {
  const now = Date.now();
  const dayName = getDayName(new Date(scheduledDate + "T12:00:00"));

  // Get all active studentRoutes for this route
  const studentRoutes = await ctx.db
    .query("studentRoutes")
    .withIndex("by_route", (q: any) => q.eq("routeId", routeId))
    .filter((q: any) => q.eq(q.field("isActive"), true))
    .collect();

  for (const sr of studentRoutes) {
    // Check excludeDays - skip if today is excluded
    if (sr.excludeDays && Array.isArray(sr.excludeDays)) {
      if (sr.excludeDays.includes(dayName)) {
        // Student is excluded today, skip
        continue;
      }
    }

    // Check for novedades affecting this student on this date
    const novedades = await ctx.db
      .query("novedades")
      .withIndex("by_student_date", (q: any) =>
        q.eq("studentId", sr.studentId).eq("date", scheduledDate)
      )
      .filter((q: any) =>
        q.and(
          // Not cancelled or expired
          q.neq(q.field("status"), "cancelled"),
          q.neq(q.field("status"), "expired"),
          // Affects this route type
          q.or(
            q.eq(q.field("affectedRouteType"), "both"),
            q.eq(q.field("affectedRouteType"), routeType)
          )
        )
      )
      .collect();

    // Determine student status based on novedades
    let status: "scheduled" | "absent" | "parent_pickup" | "stop_changed" = "scheduled";
    let stopId = sr.stopId;
    let originalStopId: Id<"routeStops"> | undefined = undefined;
    let novedadId: Id<"novedades"> | undefined = undefined;

    // Process novedades (priority: absence > parent_pickup > stop_change)
    for (const novedad of novedades) {
      if (novedad.type === "absence") {
        status = "absent";
        novedadId = novedad._id;
        break; // Absence takes priority
      } else if (novedad.type === "parent_pickup") {
        status = "parent_pickup";
        novedadId = novedad._id;
        // Parent pickup is auto-acknowledged in the new flow
      } else if (novedad.type === "stop_change" && status === "scheduled") {
        status = "stop_changed";
        originalStopId = sr.stopId;
        stopId = novedad.newStopId || sr.stopId;
        novedadId = novedad._id;
      }
    }

    // Create tripStudent entry
    await ctx.db.insert("tripStudents", {
      tripId,
      studentId: sr.studentId,
      stopId,
      status,
      originalStopId,
      novedadId,
      createdAt: now,
      updatedAt: now,
    });

    // Mark novedades as applied
    for (const novedad of novedades) {
      if (novedad.status === "pending" || novedad.status === "acknowledged") {
        await ctx.db.patch(novedad._id, {
          status: "applied",
          tripId,
          updatedAt: now,
        });
      }
    }
  }
}

/**
 * Notify parents when a trip starts
 * Sends a notification to all parents of students scheduled for this trip
 */
async function notifyParentsOfTripStart(
  ctx: any,
  tripId: Id<"trips">,
  routeName: string,
  routeType: string
) {
  const now = Date.now();
  const routeTypeLabel = routeType === "pickup" ? "recogida" : "entrega";

  // Get all tripStudents for this trip (excluding absent students)
  const tripStudents = await ctx.db
    .query("tripStudents")
    .withIndex("by_trip", (q: any) => q.eq("tripId", tripId))
    .filter((q: any) => q.neq(q.field("status"), "absent"))
    .collect();

  // Track notified parents to avoid duplicate notifications
  const notifiedEmails = new Set<string>();

  for (const ts of tripStudents) {
    const student = await ctx.db.get(ts.studentId);
    if (!student || !student.parentEmail) continue;

    const parentEmail = student.parentEmail.toLowerCase();

    // Skip if already notified this parent
    if (notifiedEmails.has(parentEmail)) continue;
    notifiedEmails.add(parentEmail);

    // Find parent user by email
    const parentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q: any) => q.eq("email", parentEmail))
      .first();

    if (parentUser) {
      await ctx.db.insert("notifications", {
        userId: parentUser._id,
        title: "Ruta en camino",
        message: `El transporte escolar ha iniciado la ruta de ${routeTypeLabel} "${routeName}". Sigue el viaje en tiempo real.`,
        type: "info",
        category: "trip_update",
        read: false,
        createdAt: now,
      });
    }
  }
}

/**
 * List routes available for the driver to start today
 * Returns routes that:
 * - Are assigned to this driver
 * - Are active
 * - Have valid recurrence for today
 * - Don't have an active/completed trip today
 */
export const listRoutesForDriverToday = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    // Get driver profile
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!driver) {
      return [];
    }

    const today = new Date().toISOString().split("T")[0]!;

    // Get all active routes for this driver
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_driver", (q) => q.eq("driverId", driver._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get today's trips for these routes
    const todayTrips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .collect();

    const tripsByRoute = new Map<string, typeof todayTrips[0]>();
    for (const trip of todayTrips) {
      if (trip.status !== "cancelled") {
        tripsByRoute.set(trip.routeId.toString(), trip);
      }
    }

    // Filter and enrich routes
    const availableRoutes = [];
    for (const route of routes) {
      // Check recurrence
      const recurrence = route.recurrence as {
        type: "daily" | "weekly" | "monthly" | "one_time";
        daysOfWeek?: string[];
        dayOfWeek?: string;
        dayOfMonth?: number;
        specificDate?: string;
      } | undefined;

      if (!validateRouteForDate(recurrence, today)) {
        continue; // Skip routes not scheduled for today
      }

      const existingTrip = tripsByRoute.get(route._id.toString());
      const tripStatus = existingTrip?.status || null;

      // Get vehicle info
      const vehicle = await ctx.db.get(route.vehicleId);

      // Get student count
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      availableRoutes.push({
        _id: route._id,
        name: route.name,
        type: route.type,
        scheduledStartTime: route.scheduledStartTime,
        scheduledEndTime: route.scheduledEndTime,
        schoolArrivalTime: route.schoolArrivalTime,
        schoolDepartureTime: route.schoolDepartureTime,
        optimizedPolyline: route.optimizedPolyline,
        estimatedDuration: route.estimatedDuration,
        estimatedDistance: route.estimatedDistance,
        vehicle: vehicle ? {
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: vehicle.model,
        } : null,
        studentCount: studentRoutes.length,
        // Trip status for today
        tripStatus,
        tripId: existingTrip?._id || null,
        canStart: !existingTrip || existingTrip.status === "scheduled",
      });
    }

    // Sort by type (pickup first) then by start time
    availableRoutes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "pickup" ? -1 : 1;
      }
      return a.scheduledStartTime.localeCompare(b.scheduledStartTime);
    });

    return availableRoutes;
  },
});

/**
 * Get trip history for a student (for parent portal)
 * Returns completed and in_progress trips from the last N days
 */
export const getTripHistoryForStudent = query({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    limit: v.optional(v.number()), // Default 30 days
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Parents can only view their own children
    if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
      if (student.institutionId !== currentUser.institutionId) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
    } else {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    // Get student's route assignments
    const assignments = await ctx.db
      .query("studentRoutes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    if (assignments.length === 0) {
      return [];
    }

    const routeIds = assignments.map((a) => a.routeId);

    // Calculate date range (last N days)
    const daysLimit = args.limit ?? 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysLimit);
    const startDateStr = startDate.toISOString().split("T")[0] ?? "";

    // Get all trips for these routes in the date range
    const allTrips: Array<{
      _id: Id<"trips">;
      routeId: Id<"routes">;
      status: string;
      scheduledDate: string;
      startedAt?: number;
      completedAt?: number;
    }> = [];

    for (const routeId of routeIds) {
      const trips = await ctx.db
        .query("trips")
        .filter((q) =>
          q.and(
            q.eq(q.field("routeId"), routeId),
            q.gte(q.field("scheduledDate"), startDateStr),
            q.or(
              q.eq(q.field("status"), "completed"),
              q.eq(q.field("status"), "in_progress")
            )
          )
        )
        .collect();

      allTrips.push(...trips);
    }

    // Get trip student entries for this student
    const tripStudentEntries = await ctx.db
      .query("tripStudents")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const tripStudentMap = new Map(tripStudentEntries.map((ts) => [ts.tripId, ts]));

    // Build enriched trip history
    const tripHistory = await Promise.all(
      allTrips.map(async (trip) => {
        const route = await ctx.db.get(trip.routeId);
        const tripStudent = tripStudentMap.get(trip._id);

        // Get driver info
        let driverName = "Conductor";
        if (trip.routeId) {
          const routeData = await ctx.db.get(trip.routeId);
          if (routeData?.driverId) {
            const driver = await ctx.db.get(routeData.driverId);
            if (driver?.userId) {
              const user = await ctx.db.get(driver.userId);
              driverName = user?.name ?? "Conductor";
            }
          }
        }

        return {
          tripId: trip._id,
          date: trip.scheduledDate,
          type: route?.type ?? "pickup",
          routeName: route?.name ?? "Ruta",
          status: trip.status,
          driverName,
          studentStatus: tripStudent?.status ?? "scheduled",
          startedAt: trip.startedAt,
          completedAt: trip.completedAt,
        };
      })
    );

    // Sort by date (newest first) then by type
    tripHistory.sort((a, b) => {
      if (a.date !== b.date) {
        return b.date.localeCompare(a.date);
      }
      // Same date: pickup before dropoff
      return a.type === "pickup" ? -1 : 1;
    });

    return tripHistory;
  },
});

/**
 * Get trips for a crew member for a specific month
 * Used in the calendar view
 */
export const getTripsForCrewByMonth = query({
  args: {
    userId: v.id("users"),
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    // Get driver profile
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Get monitor profile
    const monitor = await ctx.db
      .query("monitors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!driver && !monitor) {
      return [];
    }

    // Calculate date range for the month
    const startDate = `${args.year}-${String(args.month).padStart(2, '0')}-01`;
    const lastDay = new Date(args.year, args.month, 0).getDate();
    const endDate = `${args.year}-${String(args.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    // Get all trips in the date range
    const allTrips = await ctx.db
      .query("trips")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledDate"), startDate),
          q.lte(q.field("scheduledDate"), endDate)
        )
      )
      .collect();

    // Filter trips where user is driver or monitor
    const userTrips: Array<{
      _id: string;
      scheduledDate: string;
      status: string;
      routeName: string;
      routeType: "pickup" | "dropoff";
      startTime?: string;
      endTime?: string;
    }> = [];

    for (const trip of allTrips) {
      const route = await ctx.db.get(trip.routeId);
      if (!route) continue;

      // Check if user is assigned to this route
      const isDriverOnRoute = driver && route.driverId === driver._id;
      const isMonitorOnRoute = monitor && route.monitorId === monitor._id;

      if (isDriverOnRoute || isMonitorOnRoute) {
        userTrips.push({
          _id: trip._id,
          scheduledDate: trip.scheduledDate,
          status: trip.status,
          routeName: route.name,
          routeType: route.type,
          startTime: trip.startTime ? new Date(trip.startTime).toISOString() : undefined,
          endTime: trip.endTime ? new Date(trip.endTime).toISOString() : undefined,
        });
      }
    }

    // Sort by date and type
    userTrips.sort((a, b) => {
      if (a.scheduledDate !== b.scheduledDate) {
        return a.scheduledDate.localeCompare(b.scheduledDate);
      }
      return a.routeType === "pickup" ? -1 : 1;
    });

    return userTrips;
  },
});

// ============================================
// STOP ACTIONS - Manual confirmation of arrival/skip
// ============================================

/**
 * Record arrival at a stop
 * Driver manually confirms they've arrived at a stop
 */
export const arriveAtStop = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    stopId: v.id("routeStops"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // Verify trip exists and is in progress
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }
    if (trip.status !== "in_progress") {
      throw new Error("El viaje no está en progreso");
    }

    // Verify stop belongs to trip's route
    const stop = await ctx.db.get(args.stopId);
    if (!stop || stop.routeId !== trip.routeId) {
      throw new Error("Parada no encontrada o no pertenece a esta ruta");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const now = Date.now();

    // Create arrival event
    await ctx.db.insert("tripEvents", {
      tripId: args.tripId,
      institutionId: route.institutionId,
      type: "arrived_at_stop",
      title: `Llegada a ${stop.name}`,
      description: `El conductor confirmó llegada a la parada ${stop.name}`,
      stopId: args.stopId,
      actorId: args.userId,
      actorRole: currentUser.role === "driver" ? "driver" : currentUser.role === "monitor" ? "monitor" : "admin",
      latitude: args.latitude,
      longitude: args.longitude,
      metadata: {
        scheduledTime: stop.estimatedArrivalTime,
        actualTime: new Date(now).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }),
      },
      timestamp: now,
      createdAt: now,
    });

    return { success: true, stopId: args.stopId, arrivedAt: now };
  },
});

/**
 * Skip a stop (no students to pick up/drop off)
 * Marks pending students at this stop as no_show
 */
export const skipStop = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    stopId: v.id("routeStops"),
    reason: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // Verify trip exists and is in progress
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }
    if (trip.status !== "in_progress") {
      throw new Error("El viaje no está en progreso");
    }

    // Verify stop belongs to trip's route
    const stop = await ctx.db.get(args.stopId);
    if (!stop || stop.routeId !== trip.routeId) {
      throw new Error("Parada no encontrada o no pertenece a esta ruta");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const now = Date.now();

    // Get pending students at this stop
    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) =>
        q.and(
          q.eq(q.field("stopId"), args.stopId),
          q.eq(q.field("status"), "scheduled")
        )
      )
      .collect();

    // Get check-ins at this stop
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("stopId"), args.stopId))
      .collect();

    const checkedInStudentIds = new Set(checkins.map((c) => c.studentId));

    // Mark unchecked students as no_show (create student_no_show events)
    const noShowStudents: string[] = [];
    for (const ts of tripStudents) {
      if (!checkedInStudentIds.has(ts.studentId)) {
        // Create no_show event for this student
        const student = await ctx.db.get(ts.studentId);
        if (student) {
          await ctx.db.insert("tripEvents", {
            tripId: args.tripId,
            institutionId: route.institutionId,
            type: "student_no_show",
            title: `No show: ${student.firstName} ${student.lastName}`,
            description: `El estudiante no se presentó en la parada ${stop.name}`,
            stopId: args.stopId,
            studentId: ts.studentId,
            actorId: args.userId,
            actorRole: currentUser.role === "driver" ? "driver" : currentUser.role === "monitor" ? "monitor" : "admin",
            latitude: args.latitude,
            longitude: args.longitude,
            timestamp: now,
            createdAt: now,
          });
          noShowStudents.push(`${student.firstName} ${student.lastName}`);
        }
      }
    }

    // Create stop skipped event
    await ctx.db.insert("tripEvents", {
      tripId: args.tripId,
      institutionId: route.institutionId,
      type: "stop_skipped",
      title: `Parada omitida: ${stop.name}`,
      description: args.reason || `La parada ${stop.name} fue omitida`,
      stopId: args.stopId,
      actorId: args.userId,
      actorRole: currentUser.role === "driver" ? "driver" : currentUser.role === "monitor" ? "monitor" : "admin",
      latitude: args.latitude,
      longitude: args.longitude,
      metadata: {
        reason: args.reason,
        noShowStudents,
        studentsCount: noShowStudents.length,
      },
      timestamp: now,
      createdAt: now,
    });

    return {
      success: true,
      stopId: args.stopId,
      skippedAt: now,
      noShowCount: noShowStudents.length,
    };
  },
});

/**
 * Add a note to a stop (private - only visible to coordinators)
 */
export const addStopNote = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    stopId: v.id("routeStops"),
    note: v.string(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // Verify trip exists
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    // Verify stop belongs to trip's route
    const stop = await ctx.db.get(args.stopId);
    if (!stop || stop.routeId !== trip.routeId) {
      throw new Error("Parada no encontrada o no pertenece a esta ruta");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const now = Date.now();

    // Create note event (private - metadata includes isPrivate flag)
    await ctx.db.insert("tripEvents", {
      tripId: args.tripId,
      institutionId: route.institutionId,
      type: "stop_note_added",
      title: `Nota en ${stop.name}`,
      description: args.note,
      stopId: args.stopId,
      actorId: args.userId,
      actorRole: currentUser.role === "driver" ? "driver" : currentUser.role === "monitor" ? "monitor" : "admin",
      latitude: args.latitude,
      longitude: args.longitude,
      metadata: {
        isPrivate: true, // Only visible to coordinators
        note: args.note,
      },
      timestamp: now,
      createdAt: now,
    });

    return { success: true, stopId: args.stopId, noteAddedAt: now };
  },
});

/**
 * Get stop events for a trip (arrival times, skips, notes)
 */
export const getStopEvents = query({
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
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    // Get stop-related events
    const events = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) =>
        q.or(
          q.eq(q.field("type"), "arrived_at_stop"),
          q.eq(q.field("type"), "stop_skipped"),
          q.eq(q.field("type"), "stop_note_added"),
          q.eq(q.field("type"), "student_no_show")
        )
      )
      .collect();

    // Group by stop
    const byStop: Record<string, {
      arrivedAt?: number;
      skippedAt?: number;
      notes: Array<{ note: string; timestamp: number }>;
      noShowStudents: string[];
    }> = {};

    for (const event of events) {
      if (!event.stopId) continue;
      const stopId = event.stopId.toString();

      if (!byStop[stopId]) {
        byStop[stopId] = { notes: [], noShowStudents: [] };
      }

      if (event.type === "arrived_at_stop") {
        byStop[stopId].arrivedAt = event.timestamp;
      } else if (event.type === "stop_skipped") {
        byStop[stopId].skippedAt = event.timestamp;
      } else if (event.type === "stop_note_added") {
        const metadata = event.metadata as { note?: string } | undefined;
        byStop[stopId].notes.push({
          note: metadata?.note || event.description || "",
          timestamp: event.timestamp,
        });
      } else if (event.type === "student_no_show" && event.studentId) {
        const student = await ctx.db.get(event.studentId);
        if (student) {
          byStop[stopId].noShowStudents.push(`${student.firstName} ${student.lastName}`);
        }
      }
    }

    return byStop;
  },
});

// ============================================
// EMERGENCY SOS
// ============================================

/**
 * Trigger SOS - Emergency button
 * Creates a critical incident and notifies all admins
 */
export const triggerSOS = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    latitude: v.number(),
    longitude: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    const now = Date.now();

    // Create critical incident
    const incidentId = await ctx.db.insert("incidents", {
      institutionId: route.institutionId,
      tripId: args.tripId,
      reportedBy: args.userId,
      type: "emergency",
      severity: "critical",
      title: "🚨 SOS - Emergencia",
      description: args.message || "Botón de emergencia activado",
      location: `${args.latitude}, ${args.longitude}`,
      latitude: args.latitude,
      longitude: args.longitude,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    // Create trip event
    await ctx.db.insert("tripEvents", {
      tripId: args.tripId,
      institutionId: route.institutionId,
      type: "incident_reported",
      title: "🚨 EMERGENCIA - SOS Activado",
      description: args.message || "El conductor activó el botón de emergencia",
      incidentId,
      actorId: args.userId,
      actorRole: currentUser.role === "driver" ? "driver" : "monitor",
      latitude: args.latitude,
      longitude: args.longitude,
      metadata: {
        isSOS: true,
        severity: "critical",
      },
      timestamp: now,
      createdAt: now,
    });

    // Get all admins for this institution to notify
    const admins = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), route.institutionId),
          q.or(
            q.eq(q.field("role"), "admin"),
            q.eq(q.field("role"), "super_admin")
          ),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    // Create notifications for all admins
    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        type: "error", // Critical notification
        category: "incident",
        title: "🚨 EMERGENCIA - SOS Activado",
        message: `${currentUser.name} activó el botón de emergencia en la ruta ${route.name}`,
        relatedEntityType: "incident",
        relatedEntityId: incidentId,
        read: false,
        createdAt: now,
      });
    }

    return {
      success: true,
      incidentId,
      notifiedAdmins: admins.length,
    };
  },
});

/**
 * Get emergency contacts for a trip
 */
export const getEmergencyContacts = query({
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

    const institution = await ctx.db.get(route.institutionId);

    // Get admins as coordinators
    const admins = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), route.institutionId),
          q.or(
            q.eq(q.field("role"), "admin"),
            q.eq(q.field("role"), "super_admin")
          ),
          q.eq(q.field("isActive"), true)
        )
      )
      .take(3);

    return {
      institution: institution
        ? {
            name: institution.name,
            phone: institution.phone,
          }
        : null,
      coordinators: admins.map((a) => ({
        name: a.name,
        phone: a.phone,
        role: a.role,
      })),
      emergencyNumbers: [
        { name: "Emergencias Ecuador", number: "911" },
        { name: "Policía Nacional", number: "101" },
        { name: "Bomberos", number: "102" },
      ],
    };
  },
});

// ============================================
// TRIP COMPLETION WITH STATS
// ============================================

/**
 * Get trip completion statistics (for modal/summary)
 */
export const getTripStats = query({
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
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    // Get trip students
    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get check-ins
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get incidents
    const incidents = await ctx.db
      .query("incidents")
      .filter((q) => q.eq(q.field("tripId"), args.tripId))
      .collect();

    // Get stop events
    const stopEvents = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) =>
        q.or(
          q.eq(q.field("type"), "arrived_at_stop"),
          q.eq(q.field("type"), "stop_skipped")
        )
      )
      .collect();

    const stopsArrived = stopEvents.filter((e) => e.type === "arrived_at_stop").length;
    const stopsSkipped = stopEvents.filter((e) => e.type === "stop_skipped").length;

    // Calculate duration
    const duration = trip.startTime && trip.endTime
      ? trip.endTime - trip.startTime
      : trip.startTime
        ? Date.now() - trip.startTime
        : 0;

    const plannedDuration = route?.estimatedDuration
      ? route.estimatedDuration * 60 * 1000 // Convert minutes to ms
      : 0;

    // Student stats
    const checkedInIds = new Set(checkins.map((c) => c.studentId));
    const studentsCheckedIn = tripStudents.filter((ts) =>
      checkedInIds.has(ts.studentId)
    ).length;
    const studentsAbsent = tripStudents.filter((ts) => ts.status === "absent").length;
    const studentsParentPickup = tripStudents.filter((ts) => ts.status === "parent_pickup").length;
    const studentsNoShow = tripStudents.filter((ts) =>
      ts.status === "scheduled" && !checkedInIds.has(ts.studentId)
    ).length;

    return {
      duration,
      plannedDuration,
      durationDiff: duration - plannedDuration,
      students: {
        total: tripStudents.length,
        checkedIn: studentsCheckedIn,
        absent: studentsAbsent,
        parentPickup: studentsParentPickup,
        noShow: studentsNoShow,
        expected: tripStudents.length - studentsAbsent - studentsParentPickup,
      },
      stops: {
        total: route?.optimizedPolyline ? stopEvents.length : 0,
        arrived: stopsArrived,
        skipped: stopsSkipped,
      },
      incidents: {
        total: incidents.length,
        critical: incidents.filter((i) => i.severity === "critical").length,
        open: incidents.filter((i) => i.status === "open").length,
      },
      trip: {
        status: trip.status,
        startTime: trip.startTime,
        endTime: trip.endTime,
        routeName: route?.name,
        routeType: route?.type,
      },
    };
  },
});

/**
 * Get trip summary with timeline (for summary page)
 */
export const getTripSummary = query({
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
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    // Get all trip events for timeline
    const events = await ctx.db
      .query("tripEvents")
      .withIndex("by_trip_timestamp", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get check-ins with student info
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    const enrichedCheckins = await Promise.all(
      checkins.map(async (c) => {
        const student = await ctx.db.get(c.studentId);
        const stop = await ctx.db.get(c.stopId);
        return {
          ...c,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          stopName: stop?.name || "Desconocido",
        };
      })
    );

    // Get stops with arrival info
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const stopEvents = events.filter(
      (e) => e.type === "arrived_at_stop" || e.type === "stop_skipped"
    );

    const stopsWithStatus = stops
      .sort((a, b) => a.order - b.order)
      .map((stop) => {
        const arrivalEvent = stopEvents.find(
          (e) => e.stopId?.toString() === stop._id.toString() && e.type === "arrived_at_stop"
        );
        const skipEvent = stopEvents.find(
          (e) => e.stopId?.toString() === stop._id.toString() && e.type === "stop_skipped"
        );

        return {
          ...stop,
          arrivedAt: arrivalEvent?.timestamp,
          skippedAt: skipEvent?.timestamp,
          status: arrivalEvent ? "arrived" : skipEvent ? "skipped" : "pending",
        };
      });

    // Get incidents
    const incidents = await ctx.db
      .query("incidents")
      .filter((q) => q.eq(q.field("tripId"), args.tripId))
      .collect();

    // Get vehicle and driver
    const vehicle = await ctx.db.get(trip.vehicleId);
    const driver = await ctx.db.get(trip.driverId);
    const driverUser = driver ? await ctx.db.get(driver.userId) : null;

    // Get institution for school position
    const institution = route ? await ctx.db.get(route.institutionId) : null;
    const schoolPosition = institution?.schoolLatitude && institution?.schoolLongitude
      ? { lat: institution.schoolLatitude, lng: institution.schoolLongitude }
      : null;

    return {
      trip: {
        ...trip,
        routeName: route?.name,
        routeType: route?.type,
      },
      vehicle: vehicle
        ? { licensePlate: vehicle.licensePlate, brand: vehicle.brand }
        : null,
      driver: driverUser
        ? { name: driverUser.name, phone: driverUser.phone }
        : null,
      timeline: events.sort((a, b) => a.timestamp - b.timestamp),
      checkins: enrichedCheckins.sort((a, b) => a.timestamp - b.timestamp),
      stops: stopsWithStatus,
      incidents,
      schoolPosition,
      schoolName: institution?.name,
      routePolyline: route?.optimizedPolyline ?? null,
    };
  },
});
