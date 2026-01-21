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

/**
 * Update route with stops (from wizard edit mode)
 *
 * Replaces all route data including:
 * - Route metadata (name, type, times, optimization data)
 * - Deletes all existing stops and creates new ones
 * - Deletes all existing studentRoutes and creates new ones
 *
 * Future trips will automatically use the new data since
 * trips are created on-demand when driver starts.
 */
export const updateRouteWithStops = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
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
    // Whether route is active
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    // Get existing route
    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    // Verify vehicle belongs to institution
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle || vehicle.institutionId !== route.institutionId) {
      throw new Error("Vehículo no válido para esta institución");
    }

    // Verify driver belongs to institution
    const driver = await ctx.db.get(args.driverId);
    if (!driver || driver.institutionId !== route.institutionId) {
      throw new Error("Conductor no válido para esta institución");
    }

    // Verify monitor if provided
    if (args.monitorId) {
      const monitor = await ctx.db.get(args.monitorId);
      if (!monitor || monitor.institutionId !== route.institutionId) {
        throw new Error("Monitor no válido para esta institución");
      }
    }

    // Verify all students belong to institution
    for (const stop of args.stops) {
      const student = await ctx.db.get(stop.studentId);
      if (!student || student.institutionId !== route.institutionId) {
        throw new Error(`Estudiante inválido: ${stop.studentId}`);
      }
    }

    const now = Date.now();

    // 1. Delete existing stops
    const existingStops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .collect();

    for (const stop of existingStops) {
      await ctx.db.delete(stop._id);
    }

    // 2. Delete existing studentRoutes
    const existingStudentRoutes = await ctx.db
      .query("studentRoutes")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .collect();

    for (const sr of existingStudentRoutes) {
      await ctx.db.delete(sr._id);
    }

    // 3. Update route metadata
    await ctx.db.patch(args.routeId, {
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
      updatedAt: now,
    });

    // 4. Create new route stops
    const stopIds: Map<number, Id<"routeStops">> = new Map();
    for (const stop of args.stops) {
      const stopId = await ctx.db.insert("routeStops", {
        routeId: args.routeId,
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

    // 5. Create new student-route assignments
    for (const stop of args.stops) {
      const stopId = stopIds.get(stop.order);
      if (!stopId) continue;

      await ctx.db.insert("studentRoutes", {
        studentId: stop.studentId,
        routeId: args.routeId,
        stopId,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return {
      success: true,
      routeId: args.routeId,
      stopsUpdated: args.stops.length,
      studentsAssigned: args.stops.length,
    };
  },
});

/**
 * Delete route completely
 *
 * Permanently removes:
 * - The route record
 * - All associated routeStops
 * - All associated studentRoutes
 *
 * Does NOT affect existing trips (they have their own data).
 */
export const deleteRoute = mutation({
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

    // 1. Delete all stops for this route
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .collect();

    for (const stop of stops) {
      await ctx.db.delete(stop._id);
    }

    // 2. Delete all studentRoutes for this route
    const studentRoutes = await ctx.db
      .query("studentRoutes")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .collect();

    for (const sr of studentRoutes) {
      await ctx.db.delete(sr._id);
    }

    // 3. Delete the route itself
    await ctx.db.delete(args.routeId);

    return { success: true };
  },
});

/**
 * List all routes for a crew member (driver or monitor) with enriched data
 * Used in the Crew app routes list page
 */
export const listRoutesForCrew = query({
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

    // Get monitor profile
    const monitor = await ctx.db
      .query("monitors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!driver && !monitor) {
      return [];
    }

    // Get routes where user is driver or monitor
    const routeIds = new Set<string>();
    const routes: Array<{
      _id: Id<"routes">;
      name: string;
      type: "pickup" | "dropoff";
      scheduledStartTime: string;
      scheduledEndTime: string;
      schoolArrivalTime?: string;
      schoolDepartureTime?: string;
      estimatedDuration?: number;
      estimatedDistance?: number;
      recurrence?: {
        type: string;
        daysOfWeek?: string[];
        dayOfWeek?: string;
        specificDate?: string;
      };
      vehicle: { licensePlate: string; brand: string; model: string } | null;
      studentCount: number;
      stopsCount: number;
      isDriver: boolean;
      isMonitor: boolean;
    }> = [];

    if (driver) {
      const driverRoutes = await ctx.db
        .query("routes")
        .withIndex("by_driver", (q) => q.eq("driverId", driver._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const route of driverRoutes) {
        if (routeIds.has(route._id)) continue;
        routeIds.add(route._id);

        // Get vehicle info
        const vehicle = route.vehicleId ? await ctx.db.get(route.vehicleId) : null;

        // Get student count
        const studentRoutes = await ctx.db
          .query("studentRoutes")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        // Get stops count
        const stops = await ctx.db
          .query("routeStops")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        routes.push({
          _id: route._id,
          name: route.name,
          type: route.type,
          scheduledStartTime: route.scheduledStartTime,
          scheduledEndTime: route.scheduledEndTime,
          schoolArrivalTime: route.schoolArrivalTime,
          schoolDepartureTime: route.schoolDepartureTime,
          estimatedDuration: route.estimatedDuration,
          estimatedDistance: route.estimatedDistance,
          recurrence: route.recurrence,
          vehicle: vehicle
            ? { licensePlate: vehicle.licensePlate, brand: vehicle.brand, model: vehicle.model }
            : null,
          studentCount: studentRoutes.length,
          stopsCount: stops.length,
          isDriver: true,
          isMonitor: route.monitorId && monitor ? route.monitorId === monitor._id : false,
        });
      }
    }

    if (monitor) {
      const monitorRoutes = await ctx.db
        .query("routes")
        .withIndex("by_monitor", (q) => q.eq("monitorId", monitor._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const route of monitorRoutes) {
        if (routeIds.has(route._id)) continue;
        routeIds.add(route._id);

        // Get vehicle info
        const vehicle = route.vehicleId ? await ctx.db.get(route.vehicleId) : null;

        // Get student count
        const studentRoutes = await ctx.db
          .query("studentRoutes")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        // Get stops count
        const stops = await ctx.db
          .query("routeStops")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        routes.push({
          _id: route._id,
          name: route.name,
          type: route.type,
          scheduledStartTime: route.scheduledStartTime,
          scheduledEndTime: route.scheduledEndTime,
          schoolArrivalTime: route.schoolArrivalTime,
          schoolDepartureTime: route.schoolDepartureTime,
          estimatedDuration: route.estimatedDuration,
          estimatedDistance: route.estimatedDistance,
          recurrence: route.recurrence,
          vehicle: vehicle
            ? { licensePlate: vehicle.licensePlate, brand: vehicle.brand, model: vehicle.model }
            : null,
          studentCount: studentRoutes.length,
          stopsCount: stops.length,
          isDriver: false,
          isMonitor: true,
        });
      }
    }

    // Sort by type (pickup first) then by name
    routes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "pickup" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

    return routes;
  },
});

/**
 * Get fleet summary for bulk route wizard
 *
 * Returns counts of available resources for route creation:
 * - Active vehicles with valid documents
 * - Active drivers with valid licenses
 * - Active monitors
 * - Students without route assignment for the selected type
 */
export const getBulkWizardFleetSummary = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    routeType: v.union(v.literal("pickup"), v.literal("dropoff")),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // 1. Count active vehicles
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);

    // 2. Count active drivers with valid licenses
    const now = Date.now();
    const drivers = await ctx.db
      .query("drivers")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter drivers with valid license (not expired)
    const driversWithValidLicense = drivers.filter(
      (d) => d.licenseExpiry && d.licenseExpiry > now
    );

    // 3. Count active monitors
    const monitors = await ctx.db
      .query("monitors")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // 4. Count students without route assignment for the selected type
    // Get all active students
    const students = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get all routes of the specified type
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("type"), args.routeType)
        )
      )
      .collect();

    // Get all active studentRoutes for routes of this type
    const studentsWithRoutes = new Set<string>();
    for (const route of routes) {
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const sr of studentRoutes) {
        studentsWithRoutes.add(sr.studentId);
      }
    }

    // Filter students without route assignment
    const studentsWithoutRoute = students.filter(
      (s) => !studentsWithRoutes.has(s._id)
    );

    // Also count students with GPS coordinates
    const studentsWithGps = studentsWithoutRoute.filter(
      (s) => s.homeLatitude !== undefined && s.homeLongitude !== undefined
    );

    return {
      vehicles: {
        count: vehicles.length,
        totalCapacity,
      },
      drivers: {
        count: drivers.length,
        withValidLicense: driversWithValidLicense.length,
      },
      monitors: {
        count: monitors.length,
      },
      students: {
        totalWithoutRoute: studentsWithoutRoute.length,
        withGps: studentsWithGps.length,
        withoutGps: studentsWithoutRoute.length - studentsWithGps.length,
      },
    };
  },
});

/**
 * Get unassigned students for bulk route creation (Step 2)
 *
 * Returns paginated list of students without route assignment for the selected type.
 * Supports filtering by:
 * - Name search
 * - Grade
 * - Parent/guardian name
 * - GPS availability
 *
 * PRD Reference: US-005 - Step 2 - Student list with pagination
 * PRD Reference: US-006 - Step 2 - Student filters and search
 */
export const getUnassignedStudents = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    routeType: v.union(v.literal("pickup"), v.literal("dropoff")),
    filters: v.optional(v.object({
      search: v.optional(v.string()),
      grade: v.optional(v.string()),
      parentName: v.optional(v.string()),
      hasGps: v.optional(v.boolean()),
    })),
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const page = args.page || 1;
    const limit = args.limit || 20;
    const offset = (page - 1) * limit;

    // 1. Get all active students
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // 2. Get all routes of the specified type to find students with routes
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("type"), args.routeType)
        )
      )
      .collect();

    // 3. Get all active studentRoutes for routes of this type
    const studentsWithRoutes = new Set<string>();
    for (const route of routes) {
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const sr of studentRoutes) {
        studentsWithRoutes.add(sr.studentId);
      }
    }

    // 4. Filter students without route assignment
    let studentsWithoutRoute = allStudents.filter(
      (s) => !studentsWithRoutes.has(s._id)
    );

    // 5. Apply additional filters
    const filters = args.filters;
    if (filters) {
      // Search by name
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase().trim();
        studentsWithoutRoute = studentsWithoutRoute.filter((s) => {
          const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
          return fullName.includes(searchLower);
        });
      }

      // Filter by grade
      if (filters.grade && filters.grade.trim()) {
        studentsWithoutRoute = studentsWithoutRoute.filter(
          (s) => s.grade === filters.grade
        );
      }

      // Filter by parent/guardian name
      if (filters.parentName && filters.parentName.trim()) {
        studentsWithoutRoute = studentsWithoutRoute.filter(
          (s) => s.parentName === filters.parentName
        );
      }

      // Filter by GPS availability (default: only with GPS)
      if (filters.hasGps !== undefined) {
        if (filters.hasGps) {
          studentsWithoutRoute = studentsWithoutRoute.filter(
            (s) => s.homeLatitude !== undefined && s.homeLongitude !== undefined
          );
        } else {
          // Show all students regardless of GPS
        }
      } else {
        // Default: only students with GPS
        studentsWithoutRoute = studentsWithoutRoute.filter(
          (s) => s.homeLatitude !== undefined && s.homeLongitude !== undefined
        );
      }
    } else {
      // No filters provided - default to GPS-only
      studentsWithoutRoute = studentsWithoutRoute.filter(
        (s) => s.homeLatitude !== undefined && s.homeLongitude !== undefined
      );
    }

    // Sort by name
    studentsWithoutRoute.sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // 6. Calculate total count before pagination
    const totalCount = studentsWithoutRoute.length;
    const totalPages = Math.ceil(totalCount / limit);

    // 7. Apply pagination
    const paginatedStudents = studentsWithoutRoute.slice(offset, offset + limit);

    // 8. Map to response format
    const students = paginatedStudents.map((s) => ({
      id: s._id,
      firstName: s.firstName,
      lastName: s.lastName,
      fullName: `${s.firstName} ${s.lastName}`,
      grade: s.grade,
      address: s.address,
      abbreviatedAddress: s.address.length > 30 ? s.address.substring(0, 30) + "..." : s.address,
      hasGps: s.homeLatitude !== undefined && s.homeLongitude !== undefined,
      homeLatitude: s.homeLatitude,
      homeLongitude: s.homeLongitude,
    }));

    return {
      students,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  },
});

/**
 * Get filter options for unassigned students (Step 2)
 *
 * Returns unique grades and parent names from students without route assignment
 * for populating filter dropdowns.
 *
 * PRD Reference: US-006 - Step 2 - Student filters and search
 */
export const getStudentFilterOptions = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    routeType: v.union(v.literal("pickup"), v.literal("dropoff")),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // 1. Get all active students
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // 2. Get all routes of the specified type to find students with routes
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("type"), args.routeType)
        )
      )
      .collect();

    // 3. Get all active studentRoutes for routes of this type
    const studentsWithRoutes = new Set<string>();
    for (const route of routes) {
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const sr of studentRoutes) {
        studentsWithRoutes.add(sr.studentId);
      }
    }

    // 4. Filter students without route assignment
    const studentsWithoutRoute = allStudents.filter(
      (s) => !studentsWithRoutes.has(s._id)
    );

    // 5. Extract unique grades and parent names
    const gradesSet = new Set<string>();
    const parentNamesSet = new Set<string>();

    for (const student of studentsWithoutRoute) {
      if (student.grade) {
        gradesSet.add(student.grade);
      }
      if (student.parentName) {
        parentNamesSet.add(student.parentName);
      }
    }

    // 6. Sort and return
    const grades = Array.from(gradesSet).sort((a, b) => a.localeCompare(b, 'es'));
    const parentNames = Array.from(parentNamesSet).sort((a, b) => a.localeCompare(b, 'es'));

    return {
      grades,
      parentNames,
    };
  },
});

/**
 * Migration: Fix route durations that were stored in seconds instead of minutes
 * Only run once per institution to correct existing data
 */
export const fixRouteDurations = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    let fixedCount = 0;
    const now = Date.now();

    for (const route of routes) {
      // If duration is > 180 (3 hours in minutes seems excessive for school routes),
      // it's likely stored in seconds and needs conversion
      if (route.estimatedDuration && route.estimatedDuration > 180) {
        const correctedDuration = Math.round(route.estimatedDuration / 60);
        await ctx.db.patch(route._id, {
          estimatedDuration: correctedDuration,
          updatedAt: now,
        });
        fixedCount++;
      }
    }

    return {
      success: true,
      routesChecked: routes.length,
      routesFixed: fixedCount,
    };
  },
});

/**
 * Get all filtered student IDs for bulk selection (Step 2)
 *
 * Returns all student IDs matching the current filters without pagination.
 * Used for "Seleccionar todos" button functionality.
 *
 * PRD Reference: US-007 - Step 2 - Student selection functionality
 */
export const getAllFilteredStudentIds = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    routeType: v.union(v.literal("pickup"), v.literal("dropoff")),
    filters: v.optional(v.object({
      search: v.optional(v.string()),
      grade: v.optional(v.string()),
      parentName: v.optional(v.string()),
      hasGps: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // 1. Get all active students
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // 2. Get all routes of the specified type to find students with routes
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("type"), args.routeType)
        )
      )
      .collect();

    // 3. Get all active studentRoutes for routes of this type
    const studentsWithRoutes = new Set<string>();
    for (const route of routes) {
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const sr of studentRoutes) {
        studentsWithRoutes.add(sr.studentId);
      }
    }

    // 4. Filter students without route assignment
    let studentsWithoutRoute = allStudents.filter(
      (s) => !studentsWithRoutes.has(s._id)
    );

    // 5. Apply additional filters
    const filters = args.filters;
    if (filters) {
      // Search by name
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase().trim();
        studentsWithoutRoute = studentsWithoutRoute.filter((s) => {
          const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
          return fullName.includes(searchLower);
        });
      }

      // Filter by grade
      if (filters.grade && filters.grade.trim()) {
        studentsWithoutRoute = studentsWithoutRoute.filter(
          (s) => s.grade === filters.grade
        );
      }

      // Filter by parent/guardian name
      if (filters.parentName && filters.parentName.trim()) {
        studentsWithoutRoute = studentsWithoutRoute.filter(
          (s) => s.parentName === filters.parentName
        );
      }

      // Filter by GPS availability (default: only with GPS)
      if (filters.hasGps !== undefined) {
        if (filters.hasGps) {
          studentsWithoutRoute = studentsWithoutRoute.filter(
            (s) => s.homeLatitude !== undefined && s.homeLongitude !== undefined
          );
        }
        // If hasGps is false, show all students regardless of GPS
      } else {
        // Default: only students with GPS
        studentsWithoutRoute = studentsWithoutRoute.filter(
          (s) => s.homeLatitude !== undefined && s.homeLongitude !== undefined
        );
      }
    } else {
      // No filters provided - default to GPS-only
      studentsWithoutRoute = studentsWithoutRoute.filter(
        (s) => s.homeLatitude !== undefined && s.homeLongitude !== undefined
      );
    }

    // Return just the IDs
    return {
      studentIds: studentsWithoutRoute.map((s) => s._id),
      totalCount: studentsWithoutRoute.length,
    };
  },
});

/**
 * Get student map data for visualization
 *
 * Returns coordinates and names for selected students to display on the map.
 * Used in Step 2 of bulk route creation wizard.
 *
 * PRD Reference: US-008 - Step 2 - Map visualization of selected students
 */
export const getStudentsMapData = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    studentIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    if (args.studentIds.length === 0) {
      return { students: [] };
    }

    // Fetch all students for this institution
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    // Filter to only selected students and map to required data
    const studentIdSet = new Set(args.studentIds);
    const students = allStudents
      .filter((s) => studentIdSet.has(s._id))
      .map((s) => ({
        id: s._id,
        fullName: `${s.firstName} ${s.lastName}`,
        homeLatitude: s.homeLatitude,
        homeLongitude: s.homeLongitude,
        hasGps: s.homeLatitude !== undefined && s.homeLongitude !== undefined,
      }));

    return { students };
  },
});

/**
 * Get vehicles for bulk route creation (Step 3)
 *
 * Returns active vehicles with valid status for route assignment.
 * Each vehicle shows plate, brand/model, capacity, and status.
 *
 * PRD Reference: US-010 - Step 3 - Layout and vehicle list display
 */
export const getVehiclesForBulkCreation = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Get all active vehicles for the institution
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("status"), "active")
        )
      )
      .collect();

    // Map to required fields for Step 3 display
    return vehicles.map((v) => ({
      id: v._id,
      licensePlate: v.licensePlate,
      brand: v.brand,
      model: v.model,
      capacity: v.capacity,
      status: v.status,
    }));
  },
});

/**
 * Create multiple routes in bulk (from bulk route wizard)
 *
 * Creates multiple routes with stops and student assignments in a single mutation.
 * Handles partial failures: continues creating remaining routes if one fails.
 *
 * PRD Reference: US-026 - Bulk route creation Convex mutation
 */
export const createBulkRoutes = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    // Recurrence settings (applied to all routes)
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
    // Array of routes to create
    routes: v.array(
      v.object({
        name: v.string(),
        type: v.union(v.literal("pickup"), v.literal("dropoff")),
        vehicleId: v.id("vehicles"),
        driverId: v.id("drivers"),
        monitorId: v.optional(v.id("monitors")),
        scheduledStartTime: v.string(),
        scheduledEndTime: v.string(),
        schoolArrivalTime: v.optional(v.string()),
        schoolDepartureTime: v.optional(v.string()),
        optimizedPolyline: v.optional(v.string()),
        estimatedDuration: v.optional(v.number()),
        estimatedDistance: v.optional(v.number()),
        isActive: v.optional(v.boolean()),
        // Stops with student assignments
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
            studentIds: v.array(v.id("students")),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const now = Date.now();
    const errors: Array<{ routeName: string; error: string }> = [];
    let routesCreated = 0;
    let studentsAssigned = 0;
    const createdRouteIds: Id<"routes">[] = [];

    // Process each route
    for (const routeData of args.routes) {
      try {
        // Verify vehicle belongs to institution
        const vehicle = await ctx.db.get(routeData.vehicleId);
        if (!vehicle || vehicle.institutionId !== args.institutionId) {
          errors.push({
            routeName: routeData.name,
            error: "Vehículo no válido para esta institución",
          });
          continue;
        }

        // Verify driver belongs to institution
        const driver = await ctx.db.get(routeData.driverId);
        if (!driver || driver.institutionId !== args.institutionId) {
          errors.push({
            routeName: routeData.name,
            error: "Conductor no válido para esta institución",
          });
          continue;
        }

        // Verify monitor if provided
        if (routeData.monitorId) {
          const monitor = await ctx.db.get(routeData.monitorId);
          if (!monitor || monitor.institutionId !== args.institutionId) {
            errors.push({
              routeName: routeData.name,
              error: "Monitor no válido para esta institución",
            });
            continue;
          }
        }

        // Verify all students belong to institution
        let studentsValid = true;
        for (const stop of routeData.stops) {
          for (const studentId of stop.studentIds) {
            const student = await ctx.db.get(studentId);
            if (!student || student.institutionId !== args.institutionId) {
              errors.push({
                routeName: routeData.name,
                error: `Estudiante inválido: ${studentId}`,
              });
              studentsValid = false;
              break;
            }
          }
          if (!studentsValid) break;
        }
        if (!studentsValid) continue;

        // 1. Create the route
        const routeId = await ctx.db.insert("routes", {
          institutionId: args.institutionId,
          name: routeData.name,
          type: routeData.type,
          vehicleId: routeData.vehicleId,
          driverId: routeData.driverId,
          monitorId: routeData.monitorId,
          scheduledStartTime: routeData.scheduledStartTime,
          scheduledEndTime: routeData.scheduledEndTime,
          schoolArrivalTime: routeData.schoolArrivalTime,
          schoolDepartureTime: routeData.schoolDepartureTime,
          recurrence: args.recurrence,
          optimizedPolyline: routeData.optimizedPolyline,
          estimatedDuration: routeData.estimatedDuration,
          estimatedDistance: routeData.estimatedDistance,
          isActive: routeData.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        });

        createdRouteIds.push(routeId);

        // 2. Create route stops and student assignments
        let routeStudentCount = 0;
        for (const stop of routeData.stops) {
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

          // 3. Create student-route assignments for each student in this stop
          for (const studentId of stop.studentIds) {
            await ctx.db.insert("studentRoutes", {
              studentId,
              routeId,
              stopId,
              isActive: true,
              createdAt: now,
              updatedAt: now,
            });
            routeStudentCount++;
          }
        }

        routesCreated++;
        studentsAssigned += routeStudentCount;
      } catch (error) {
        // Catch any unexpected errors and continue with remaining routes
        errors.push({
          routeName: routeData.name,
          error: error instanceof Error ? error.message : "Error desconocido",
        });
      }
    }

    return {
      success: routesCreated > 0,
      routesCreated,
      studentsAssigned,
      routeIds: createdRouteIds,
      errors,
    };
  },
});

/**
 * Get unassigned student details for Step 4 of bulk route creation
 *
 * Returns full details for students not assigned to any route,
 * used to display in the unassigned students panel.
 *
 * PRD Reference: US-021 - Step 4 - Unassigned students panel
 */
export const getUnassignedStudentDetails = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    studentIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    if (args.studentIds.length === 0) {
      return { students: [] };
    }

    // Fetch all students for this institution
    const allStudents = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    // Filter to only requested students and map to required data
    const studentIdSet = new Set(args.studentIds);
    const students = allStudents
      .filter((s) => studentIdSet.has(s._id))
      .map((s) => ({
        id: s._id,
        fullName: `${s.firstName} ${s.lastName}`,
        firstName: s.firstName,
        lastName: s.lastName,
        grade: s.grade,
        address: s.address,
        homeLatitude: s.homeLatitude,
        homeLongitude: s.homeLongitude,
        hasGps: s.homeLatitude !== undefined && s.homeLongitude !== undefined,
      }));

    return { students };
  },
});

/**
 * Get drivers and monitors for Step 5 crew assignment
 *
 * Returns available drivers (with valid licenses) and monitors
 * for assigning to generated routes in bulk route creation.
 *
 * PRD Reference: US-023 - Step 5 - Vehicle and personnel assignment
 */
export const getCrewForBulkAssignment = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const now = Date.now();

    // Get all active drivers
    const drivers = await ctx.db
      .query("drivers")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Enrich drivers with user data and license status
    const enrichedDrivers = await Promise.all(
      drivers.map(async (driver) => {
        const user = await ctx.db.get(driver.userId);
        const licenseExpired = driver.licenseExpiry ? driver.licenseExpiry < now : true;
        return {
          id: driver._id,
          userId: driver.userId,
          name: user?.name || "Conductor desconocido",
          phone: driver.phone || user?.phone,
          licenseNumber: driver.licenseNumber,
          licenseExpiry: driver.licenseExpiry,
          licenseExpired,
          hasValidLicense: !licenseExpired && !!driver.licenseNumber,
        };
      })
    );

    // Get all active monitors
    const monitors = await ctx.db
      .query("monitors")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Enrich monitors with user data
    const enrichedMonitors = await Promise.all(
      monitors.map(async (monitor) => {
        const user = await ctx.db.get(monitor.userId);
        return {
          id: monitor._id,
          userId: monitor.userId,
          name: user?.name || "Monitor desconocido",
          phone: monitor.phone || user?.phone,
          firstAidCertified: monitor.firstAidCertified,
        };
      })
    );

    return {
      drivers: enrichedDrivers,
      monitors: enrichedMonitors,
    };
  },
});
