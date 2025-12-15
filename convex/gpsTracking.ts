/**
 * GPS Tracking Functions
 *
 * Real-time GPS location updates and history.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Update GPS location
 */
export const updateLocation = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    latitude: v.number(),
    longitude: v.number(),
    speed: v.optional(v.number()),
    heading: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    // Verify user is the driver
    const driver = await ctx.db.get(trip.driverId);
    if (!driver || driver.userId !== args.userId) {
      if (currentUser.role !== "admin" && currentUser.role !== "super_admin") {
        throw new Error("No tienes permiso para actualizar la ubicación");
      }
    }

    if (trip.status !== "in_progress") {
      throw new Error("El viaje no está en progreso");
    }

    const now = Date.now();

    await ctx.db.insert("gpsTracking", {
      tripId: args.tripId,
      latitude: args.latitude,
      longitude: args.longitude,
      speed: args.speed,
      heading: args.heading,
      timestamp: now,
      source: "mobile", // GPS from crew member's mobile device
    });

    // Check geofences for nearby stops
    const route = await ctx.db.get(trip.routeId);
    const stops = route ? await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", route._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect() : [];

    const alerts = [];
    for (const stop of stops) {
      const distance = calculateDistance(
        args.latitude, args.longitude,
        stop.latitude, stop.longitude
      );
      if (distance <= stop.geofenceRadius) {
        alerts.push({
          stopId: stop._id,
          stopName: stop.name,
          message: "Has llegado a la parada",
        });
      }
    }

    return { success: true, geofenceAlerts: alerts };
  },
});

/**
 * Get current location for a trip
 */
export const getCurrentLocation = query({
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

    const latestGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .first();

    if (!latestGps) {
      return null;
    }

    return {
      latitude: latestGps.latitude,
      longitude: latestGps.longitude,
      speed: latestGps.speed,
      heading: latestGps.heading,
      timestamp: latestGps.timestamp,
    };
  },
});

/**
 * Get location history for a trip
 */
export const getLocationHistory = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    limit: v.optional(v.number()),
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

    const limit = args.limit || 100;

    const points = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("asc")
      .take(limit);

    return {
      points: points.map((p) => ({
        latitude: p.latitude,
        longitude: p.longitude,
        speed: p.speed,
        heading: p.heading,
        timestamp: p.timestamp,
      })),
      total: points.length,
    };
  },
});

/**
 * Subscribe to real-time location updates (for parent tracking)
 */
export const subscribeToLocation = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    // This query will re-run whenever gpsTracking changes
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      return null;
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      return null;
    }

    // Verify access (allow parents with students on this route)
    const currentUser = await verifyUser(ctx, args.userId);

    if (currentUser.role === "parent") {
      // Check if parent has a student on this route (filter by email AND institutionId)
      const students = await ctx.db
        .query("students")
        .filter((q) =>
          q.and(
            q.eq(q.field("parentEmail"), currentUser.email?.toLowerCase() || ""),
            q.eq(q.field("institutionId"), currentUser.institutionId)
          )
        )
        .collect();

      const studentIds = students.map((s) => s._id);
      const hasStudentOnRoute = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect()
        .then((assignments) => assignments.some((a) => studentIds.includes(a.studentId)));

      if (!hasStudentOnRoute) {
        throw new Error("No tienes permiso para ver este viaje");
      }
    } else {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    // Get latest location
    const latestGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .first();

    // Get next stop
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const sortedStops = stops.sort((a, b) => a.order - b.order);

    return {
      trip: {
        id: trip._id,
        status: trip.status,
        startTime: trip.startTime,
      },
      route: {
        name: route.name,
        type: route.type,
      },
      currentLocation: latestGps ? {
        latitude: latestGps.latitude,
        longitude: latestGps.longitude,
        speed: latestGps.speed,
        heading: latestGps.heading,
        timestamp: latestGps.timestamp,
      } : null,
      stops: sortedStops.map((s) => ({
        id: s._id,
        name: s.name,
        scheduledTime: s.scheduledTime,
        order: s.order,
      })),
    };
  },
});

/**
 * Update GPS location from external device
 * Used by external GPS devices/APIs via HTTP endpoint
 */
export const updateLocationFromDevice = mutation({
  args: {
    institutionToken: v.string(),
    deviceId: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    speed: v.optional(v.number()),
    heading: v.optional(v.number()),
    timestamp: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Verify institution by API token
    const institution = await ctx.db
      .query("institutions")
      .withIndex("by_api_token", (q) => q.eq("apiToken", args.institutionToken))
      .first();

    if (!institution) {
      throw new Error("Token de institución inválido");
    }

    if (!institution.isActive) {
      throw new Error("La institución está inactiva");
    }

    // 2. Find vehicle by deviceId in this institution
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_institution", (q) => q.eq("institutionId", institution._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const vehicle = vehicles.find(
      (v) => v.gpsDeviceConfig?.deviceId === args.deviceId
    );

    if (!vehicle) {
      throw new Error(`Dispositivo GPS no encontrado: ${args.deviceId}`);
    }

    // 3. Find active trip for this vehicle
    const activeTrips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", new Date().toISOString().split("T")[0]!))
      .filter((q) =>
        q.and(
          q.eq(q.field("vehicleId"), vehicle._id),
          q.eq(q.field("status"), "in_progress")
        )
      )
      .collect();

    if (activeTrips.length === 0) {
      // No active trip - just acknowledge receipt
      return {
        success: true,
        message: "GPS recibido, pero no hay viaje activo",
        recorded: false,
      };
    }

    const trip = activeTrips[0]!;
    const now = args.timestamp || Date.now();

    // 4. Insert GPS tracking record
    await ctx.db.insert("gpsTracking", {
      tripId: trip._id,
      latitude: args.latitude,
      longitude: args.longitude,
      speed: args.speed,
      heading: args.heading,
      timestamp: now,
      source: "device",
      deviceId: args.deviceId,
    });

    // 5. Check geofences for nearby stops
    const route = await ctx.db.get(trip.routeId);
    const stops = route
      ? await ctx.db
          .query("routeStops")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()
      : [];

    const alerts = [];
    for (const stop of stops) {
      const distance = calculateDistance(
        args.latitude,
        args.longitude,
        stop.latitude,
        stop.longitude
      );
      if (distance <= stop.geofenceRadius) {
        alerts.push({
          stopId: stop._id,
          stopName: stop.name,
          message: "Vehículo llegó a la parada",
        });
      }
    }

    return {
      success: true,
      recorded: true,
      tripId: trip._id,
      geofenceAlerts: alerts,
    };
  },
});

/**
 * Get last GPS update time for a trip (used for fallback detection)
 */
export const getLastGpsUpdate = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const latestGps = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .order("desc")
      .first();

    if (!latestGps) {
      return null;
    }

    return {
      timestamp: latestGps.timestamp,
      source: latestGps.source || "mobile",
      deviceId: latestGps.deviceId,
    };
  },
});

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
