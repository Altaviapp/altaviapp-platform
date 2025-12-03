/**
 * Trip Management Functions
 *
 * Manages daily route executions (trips).
 * RBAC: Admin can manage trips, drivers can start/complete their trips.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

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

    return { success: true, tripId };
  },
});

/**
 * Get trip by ID with full details
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

    return {
      ...trip,
      route: { id: route._id, name: route.name, type: route.type },
      vehicle: vehicle ? { licensePlate: vehicle.licensePlate } : null,
      driver,
      monitor,
      currentLocation: latestGps,
      checkins: enrichedCheckins,
      stops: stops.sort((a, b) => a.order - b.order),
      stats: {
        totalStudents: await ctx.db
          .query("studentRoutes")
          .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()
          .then((r) => r.length),
        checkedIn: checkins.length,
        stopsCompleted: 0, // Would need stop completion tracking
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

    // Update trip status
    await ctx.db.patch(args.tripId, {
      status: "completed",
      endTime: now,
      updatedAt: now,
    });

    return { success: true };
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

    // Parents can only view their own children
    if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
    } else {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    // Get student's route assignments
    const assignments = await ctx.db
      .query("studentRoutes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const routeIds = assignments.map((a) => a.routeId);

    // Find active trip for any of these routes
    const today = new Date().toISOString().split("T")[0];
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .collect();

    const activeTrip = trips.find((t) => routeIds.includes(t.routeId));

    if (!activeTrip) {
      return null;
    }

    // Get current location
    const latestGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", activeTrip._id))
      .order("desc")
      .first();

    const route = await ctx.db.get(activeTrip.routeId);

    return {
      trip: activeTrip,
      route: route ? { name: route.name, type: route.type } : null,
      currentLocation: latestGps,
    };
  },
});
