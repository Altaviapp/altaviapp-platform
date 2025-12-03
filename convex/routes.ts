/**
 * Route Management Functions
 *
 * CRUD operations for routes.
 * RBAC: Admin+ can manage routes, drivers/monitors can view assigned routes.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Create a new route
 */
export const createRoute = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    name: v.string(),
    type: v.union(v.literal("pickup"), v.literal("dropoff")),
    vehicleId: v.id("vehicles"),
    driverId: v.id("drivers"),
    monitorId: v.optional(v.id("monitors")),
    scheduledStartTime: v.string(),
    scheduledEndTime: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Verify vehicle belongs to institution
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle || vehicle.institutionId !== args.institutionId) {
      throw new Error("Vehículo no válido para esta institución");
    }

    // Verify driver belongs to institution
    const driver = await ctx.db.get(args.driverId);
    if (!driver || driver.institutionId !== args.institutionId) {
      throw new Error("Conductor no válido para esta institución");
    }

    // Verify monitor if provided
    if (args.monitorId) {
      const monitor = await ctx.db.get(args.monitorId);
      if (!monitor || monitor.institutionId !== args.institutionId) {
        throw new Error("Monitor no válido para esta institución");
      }
    }

    const now = Date.now();
    const routeId = await ctx.db.insert("routes", {
      institutionId: args.institutionId,
      name: args.name,
      type: args.type,
      vehicleId: args.vehicleId,
      driverId: args.driverId,
      monitorId: args.monitorId,
      scheduledStartTime: args.scheduledStartTime,
      scheduledEndTime: args.scheduledEndTime,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, routeId };
  },
});

/**
 * Get route by ID with stops and students
 */
export const getRoute = query({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
  },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Get stops ordered
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_order", (q) => q.eq("routeId", args.routeId))
      .collect();

    // Get assigned students
    const studentRoutes = await ctx.db
      .query("studentRoutes")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const students = await Promise.all(
      studentRoutes.map(async (sr) => {
        const student = await ctx.db.get(sr.studentId);
        return student ? {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          grade: student.grade,
          stopId: sr.stopId,
        } : null;
      })
    );

    // Get vehicle, driver, monitor info
    const vehicle = await ctx.db.get(route.vehicleId);
    const driver = await ctx.db.get(route.driverId);
    const monitor = route.monitorId ? await ctx.db.get(route.monitorId) : null;

    return {
      ...route,
      stops: stops.filter((s) => s.isActive).sort((a, b) => a.order - b.order),
      students: students.filter(Boolean),
      vehicle: vehicle ? { id: vehicle._id, licensePlate: vehicle.licensePlate, capacity: vehicle.capacity } : null,
      driver: driver ? { id: driver._id, phone: driver.phone } : null,
      monitor: monitor ? { id: monitor._id, phone: monitor.phone } : null,
    };
  },
});

/**
 * List routes by institution
 */
export const listRoutes = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    type: v.optional(v.union(v.literal("pickup"), v.literal("dropoff"))),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    if (args.type) {
      routes = routes.filter((r) => r.type === args.type);
    }

    if (args.isActive !== undefined) {
      routes = routes.filter((r) => r.isActive === args.isActive);
    }

    // Enrich with vehicle/driver info
    const enrichedRoutes = await Promise.all(
      routes.map(async (route) => {
        const vehicle = await ctx.db.get(route.vehicleId);
        const driver = await ctx.db.get(route.driverId);
        const stopsCount = await ctx.db
          .query("routeStops")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();
        const studentsCount = await ctx.db
          .query("studentRoutes")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        return {
          ...route,
          vehiclePlate: vehicle?.licensePlate,
          driverName: driver ? await ctx.db.get(driver.userId).then((u) => u?.name) : null,
          stopsCount: stopsCount.length,
          studentsCount: studentsCount.length,
        };
      })
    );

    return enrichedRoutes;
  },
});

/**
 * List routes for a driver
 */
export const listRoutesForDriver = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // Get driver profile
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!driver) {
      return [];
    }

    const routes = await ctx.db
      .query("routes")
      .withIndex("by_driver", (q) => q.eq("driverId", driver._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return routes;
  },
});

/**
 * Update route
 */
export const updateRoute = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("pickup"), v.literal("dropoff"))),
    vehicleId: v.optional(v.id("vehicles")),
    driverId: v.optional(v.id("drivers")),
    monitorId: v.optional(v.id("monitors")),
    scheduledStartTime: v.optional(v.string()),
    scheduledEndTime: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Verify new vehicle if changing
    if (args.vehicleId) {
      const vehicle = await ctx.db.get(args.vehicleId);
      if (!vehicle || vehicle.institutionId !== route.institutionId) {
        throw new Error("Vehículo no válido");
      }
    }

    // Verify new driver if changing
    if (args.driverId) {
      const driver = await ctx.db.get(args.driverId);
      if (!driver || driver.institutionId !== route.institutionId) {
        throw new Error("Conductor no válido");
      }
    }

    // Verify new monitor if changing
    if (args.monitorId) {
      const monitor = await ctx.db.get(args.monitorId);
      if (!monitor || monitor.institutionId !== route.institutionId) {
        throw new Error("Monitor no válido");
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.vehicleId !== undefined) updates.vehicleId = args.vehicleId;
    if (args.driverId !== undefined) updates.driverId = args.driverId;
    if (args.monitorId !== undefined) updates.monitorId = args.monitorId;
    if (args.scheduledStartTime !== undefined) updates.scheduledStartTime = args.scheduledStartTime;
    if (args.scheduledEndTime !== undefined) updates.scheduledEndTime = args.scheduledEndTime;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.routeId, updates);
    return { success: true };
  },
});

/**
 * Deactivate route
 */
export const deactivateRoute = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    await ctx.db.patch(args.routeId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
