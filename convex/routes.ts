/**
 * Route Management Functions
 *
 * CRUD operations for routes.
 * RBAC: Admin+ can manage routes, drivers/monitors can view assigned routes.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
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

    // Get vehicle, driver, monitor info with user names
    const vehicle = await ctx.db.get(route.vehicleId);
    const driver = await ctx.db.get(route.driverId);
    const driverUser = driver ? await ctx.db.get(driver.userId) : null;
    const monitor = route.monitorId ? await ctx.db.get(route.monitorId) : null;
    const monitorUser = monitor ? await ctx.db.get(monitor.userId) : null;

    return {
      ...route,
      stops: stops.filter((s) => s.isActive).sort((a, b) => a.order - b.order),
      students: students.filter(Boolean),
      vehicle: vehicle ? {
        id: vehicle._id,
        licensePlate: vehicle.licensePlate,
        brand: vehicle.brand,
        model: vehicle.model,
        capacity: vehicle.capacity,
      } : null,
      driver: driver ? {
        id: driver._id,
        phone: driver.phone,
        name: driverUser?.name || null,
      } : null,
      monitor: monitor ? {
        id: monitor._id,
        phone: monitor.phone,
        name: monitorUser?.name || null,
      } : null,
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

/**
 * Create route with stops (from wizard)
 *
 * Creates a complete route with:
 * - Route data including recurrence and optimization info
 * - Route stops with ETAs
 * - Student-route assignments
 */
export const createRouteWithStops = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    // Route data
    name: v.string(),
    type: v.union(v.literal("pickup"), v.literal("dropoff")),
    vehicleId: v.id("vehicles"),
    driverId: v.id("drivers"),
    monitorId: v.optional(v.id("monitors")),
    scheduledStartTime: v.string(),
    scheduledEndTime: v.string(),
    // Target times
    schoolArrivalTime: v.optional(v.string()),
    schoolDepartureTime: v.optional(v.string()),
    // Recurrence
    recurrence: v.optional(
      v.object({
        type: v.union(
          v.literal("daily"),
          v.literal("weekly"),
          v.literal("monthly"),
          v.literal("one_time")
        ),
        daysOfWeek: v.optional(v.array(v.string())),
        dayOfWeek: v.optional(v.string()),
        dayOfMonth: v.optional(v.number()),
        specificDate: v.optional(v.string()),
      })
    ),
    // Optimization data
    optimizedPolyline: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
    estimatedDistance: v.optional(v.number()),
    // Stops with students
    stops: v.array(
      v.object({
        name: v.string(),
        address: v.string(),
        latitude: v.number(),
        longitude: v.number(),
        scheduledTime: v.string(),
        estimatedArrivalTime: v.optional(v.string()),
        durationFromPrevious: v.optional(v.number()),
        order: v.number(),
        geofenceRadius: v.optional(v.number()),
        studentId: v.id("students"),
      })
    ),
    // Whether to activate immediately
    isActive: v.optional(v.boolean()),
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

    // Verify all students belong to institution
    for (const stop of args.stops) {
      const student = await ctx.db.get(stop.studentId);
      if (!student || student.institutionId !== args.institutionId) {
        throw new Error(`Estudiante inválido: ${stop.studentId}`);
      }
    }

    const now = Date.now();

    // 1. Create the route
    const routeId = await ctx.db.insert("routes", {
      institutionId: args.institutionId,
      name: args.name,
      type: args.type,
      vehicleId: args.vehicleId,
      driverId: args.driverId,
      monitorId: args.monitorId,
      scheduledStartTime: args.scheduledStartTime,
      scheduledEndTime: args.scheduledEndTime,
      schoolArrivalTime: args.schoolArrivalTime,
      schoolDepartureTime: args.schoolDepartureTime,
      recurrence: args.recurrence,
      optimizedPolyline: args.optimizedPolyline,
      estimatedDuration: args.estimatedDuration,
      estimatedDistance: args.estimatedDistance,
      isActive: args.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create route stops
    const stopIds: Map<number, Id<"routeStops">> = new Map();
    for (const stop of args.stops) {
      const stopId = await ctx.db.insert("routeStops", {
        routeId,
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        scheduledTime: stop.scheduledTime,
        estimatedArrivalTime: stop.estimatedArrivalTime,
        durationFromPrevious: stop.durationFromPrevious,
        order: stop.order,
        geofenceRadius: stop.geofenceRadius ?? 100,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      stopIds.set(stop.order, stopId);
    }

    // 3. Create student-route assignments
    for (const stop of args.stops) {
      const stopId = stopIds.get(stop.order);
      if (!stopId) continue;

      await ctx.db.insert("studentRoutes", {
        studentId: stop.studentId,
        routeId,
        stopId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      routeId,
      stopsCreated: args.stops.length,
      studentsAssigned: args.stops.length,
    };
  },
});
