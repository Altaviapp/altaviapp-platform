/**
 * Route Stops Management Functions
 *
 * CRUD operations for route stops with geofencing.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Create a new route stop
 */
export const createStop = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
    name: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    scheduledTime: v.string(),
    order: v.number(),
    geofenceRadius: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const now = Date.now();
    const stopId = await ctx.db.insert("routeStops", {
      routeId: args.routeId,
      name: args.name,
      address: args.address,
      latitude: args.latitude,
      longitude: args.longitude,
      scheduledTime: args.scheduledTime,
      order: args.order,
      geofenceRadius: args.geofenceRadius || 100, // Default 100 meters
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, stopId };
  },
});

/**
 * Get stop by ID
 */
export const getStop = query({
  args: {
    userId: v.id("users"),
    stopId: v.id("routeStops"),
  },
  handler: async (ctx, args) => {
    const stop = await ctx.db.get(args.stopId);
    if (!stop) {
      throw new Error("Parada no encontrada");
    }

    const route = await ctx.db.get(stop.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Get students assigned to this stop
    const assignments = await ctx.db
      .query("studentRoutes")
      .filter((q) => q.eq(q.field("stopId"), args.stopId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const students = await Promise.all(
      assignments.map(async (a) => {
        const student = await ctx.db.get(a.studentId);
        return student ? {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          grade: student.grade,
        } : null;
      })
    );

    return {
      ...stop,
      students: students.filter(Boolean),
    };
  },
});

/**
 * List stops for a route (ordered)
 */
export const listStops = query({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    let stops = await ctx.db
      .query("routeStops")
      .withIndex("by_order", (q) => q.eq("routeId", args.routeId))
      .collect();

    if (args.isActive !== undefined) {
      stops = stops.filter((s) => s.isActive === args.isActive);
    }

    return stops.sort((a, b) => a.order - b.order);
  },
});

/**
 * Update stop
 */
export const updateStop = mutation({
  args: {
    userId: v.id("users"),
    stopId: v.id("routeStops"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    scheduledTime: v.optional(v.string()),
    order: v.optional(v.number()),
    geofenceRadius: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const stop = await ctx.db.get(args.stopId);
    if (!stop) {
      throw new Error("Parada no encontrada");
    }

    const route = await ctx.db.get(stop.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.name !== undefined) updates.name = args.name;
    if (args.address !== undefined) updates.address = args.address;
    if (args.latitude !== undefined) updates.latitude = args.latitude;
    if (args.longitude !== undefined) updates.longitude = args.longitude;
    if (args.scheduledTime !== undefined) updates.scheduledTime = args.scheduledTime;
    if (args.order !== undefined) updates.order = args.order;
    if (args.geofenceRadius !== undefined) updates.geofenceRadius = args.geofenceRadius;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.stopId, updates);
    return { success: true };
  },
});

/**
 * Reorder stops
 */
export const reorderStops = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
    stops: v.array(v.object({
      id: v.id("routeStops"),
      order: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const now = Date.now();
    for (const stopOrder of args.stops) {
      await ctx.db.patch(stopOrder.id, {
        order: stopOrder.order,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Delete stop
 */
export const deleteStop = mutation({
  args: {
    userId: v.id("users"),
    stopId: v.id("routeStops"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const stop = await ctx.db.get(args.stopId);
    if (!stop) {
      throw new Error("Parada no encontrada");
    }

    const route = await ctx.db.get(stop.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Soft delete
    await ctx.db.patch(args.stopId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Check if a location is within a stop's geofence
 */
export const checkGeofence = query({
  args: {
    userId: v.id("users"),
    stopId: v.id("routeStops"),
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const stop = await ctx.db.get(args.stopId);
    if (!stop) {
      throw new Error("Parada no encontrada");
    }

    // Calculate distance using Haversine formula
    const R = 6371000; // Earth's radius in meters
    const lat1 = args.latitude * Math.PI / 180;
    const lat2 = stop.latitude * Math.PI / 180;
    const deltaLat = (stop.latitude - args.latitude) * Math.PI / 180;
    const deltaLon = (stop.longitude - args.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      withinGeofence: distance <= stop.geofenceRadius,
      distance: Math.round(distance),
      geofenceRadius: stop.geofenceRadius,
    };
  },
});
