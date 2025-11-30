/**
 * Monitor Management Functions
 *
 * Monitors (Auxiliares) are responsible for:
 * - Student check-in/check-out
 * - Incident reporting
 * - Student safety during trips
 *
 * RBAC: Admin+ can manage monitors, monitors can view their own profile
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAuth, requireRole, enforceInstitutionScope } from "./auth";
import { Id } from "./_generated/dataModel";

/**
 * Create a new monitor profile
 * Called when a user with role "monitor" is created or when
 * assigning monitor role to an existing user
 */
export const createMonitor = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    idNumber: v.string(),
    phone: v.string(),
    emergencyContact: v.string(),
    firstAidCertified: v.optional(v.boolean()),
    firstAidCertExpiry: v.optional(v.number()),
    childCareCertified: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Require admin or higher
    await requireRole(ctx, "admin");

    // Verify user exists and has monitor role
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    if (user.role !== "monitor") {
      throw new Error("El usuario debe tener rol de monitor para crear un perfil de monitor");
    }

    // Check if monitor profile already exists
    const existingMonitor = await ctx.db
      .query("monitors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existingMonitor) {
      throw new Error("Ya existe un perfil de monitor para este usuario");
    }

    const now = Date.now();

    const monitorId = await ctx.db.insert("monitors", {
      userId: args.userId,
      institutionId: args.institutionId,
      idNumber: args.idNumber,
      phone: args.phone,
      emergencyContact: args.emergencyContact,
      firstAidCertified: args.firstAidCertified ?? false,
      firstAidCertExpiry: args.firstAidCertExpiry,
      childCareCertified: args.childCareCertified ?? false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { monitorId, success: true };
  },
});

/**
 * Get monitor profile by user ID
 */
export const getMonitorByUserId = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);

    const monitor = await ctx.db
      .query("monitors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!monitor) {
      return null;
    }

    // Monitors can view their own profile
    if (currentUser._id === args.userId) {
      return monitor;
    }

    // Admin can view monitors in their institution
    if (currentUser.role === "admin" && currentUser.institutionId === monitor.institutionId) {
      return monitor;
    }

    // Super admin can view all
    if (currentUser.role === "super_admin") {
      return monitor;
    }

    throw new Error("No tienes permiso para ver este perfil de monitor");
  },
});

/**
 * Get monitor profile by monitor ID
 */
export const getMonitorById = query({
  args: {
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);

    const monitor = await ctx.db.get(args.monitorId);

    if (!monitor) {
      return null;
    }

    // Monitors can view their own profile
    if (currentUser._id === monitor.userId) {
      return monitor;
    }

    // Admin can view monitors in their institution
    if (currentUser.role === "admin" && currentUser.institutionId === monitor.institutionId) {
      return monitor;
    }

    // Super admin can view all
    if (currentUser.role === "super_admin") {
      return monitor;
    }

    throw new Error("No tienes permiso para ver este perfil de monitor");
  },
});

/**
 * List all monitors for an institution
 */
export const listMonitorsByInstitution = query({
  args: {
    institutionId: v.optional(v.id("institutions")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Enforce institution scope
    const scopedInstitutionId = await enforceInstitutionScope(ctx, args.institutionId);

    if (!scopedInstitutionId) {
      throw new Error("Se requiere ID de institución");
    }

    let monitors = await ctx.db
      .query("monitors")
      .withIndex("by_institution", (q) => q.eq("institutionId", scopedInstitutionId))
      .collect();

    // Filter by active status if specified
    if (args.isActive !== undefined) {
      monitors = monitors.filter((m) => m.isActive === args.isActive);
    }

    // Enrich with user data
    const enrichedMonitors = await Promise.all(
      monitors.map(async (monitor) => {
        const user = await ctx.db.get(monitor.userId);
        return {
          ...monitor,
          user: user
            ? {
                name: user.name,
                email: user.email,
                phone: user.phone,
              }
            : null,
        };
      })
    );

    return enrichedMonitors;
  },
});

/**
 * Update monitor profile
 */
export const updateMonitor = mutation({
  args: {
    monitorId: v.id("monitors"),
    idNumber: v.optional(v.string()),
    phone: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    firstAidCertified: v.optional(v.boolean()),
    firstAidCertExpiry: v.optional(v.number()),
    childCareCertified: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);

    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) {
      throw new Error("Monitor no encontrado");
    }

    // Admin can update monitors in their institution
    if (currentUser.role === "admin") {
      if (currentUser.institutionId !== monitor.institutionId) {
        throw new Error("No tienes permiso para actualizar monitores de otra institución");
      }
    } else if (currentUser.role !== "super_admin") {
      // Monitors can only update some of their own fields
      if (currentUser._id !== monitor.userId) {
        throw new Error("No tienes permiso para actualizar este perfil");
      }
      // Monitors can't change their own active status
      if (args.isActive !== undefined) {
        throw new Error("No puedes cambiar tu propio estado activo");
      }
    }

    const updates: Record<string, any> = {
      updatedAt: Date.now(),
    };

    if (args.idNumber !== undefined) updates.idNumber = args.idNumber;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.emergencyContact !== undefined) updates.emergencyContact = args.emergencyContact;
    if (args.firstAidCertified !== undefined) updates.firstAidCertified = args.firstAidCertified;
    if (args.firstAidCertExpiry !== undefined) updates.firstAidCertExpiry = args.firstAidCertExpiry;
    if (args.childCareCertified !== undefined) updates.childCareCertified = args.childCareCertified;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.monitorId, updates);

    return { success: true };
  },
});

/**
 * Deactivate a monitor
 */
export const deactivateMonitor = mutation({
  args: {
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");

    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) {
      throw new Error("Monitor no encontrado");
    }

    await ctx.db.patch(args.monitorId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Assign monitor to a route
 */
export const assignMonitorToRoute = mutation({
  args: {
    monitorId: v.id("monitors"),
    routeId: v.id("routes"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");

    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) {
      throw new Error("Monitor no encontrado");
    }

    if (!monitor.isActive) {
      throw new Error("No se puede asignar un monitor inactivo a una ruta");
    }

    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    // Verify same institution
    if (monitor.institutionId !== route.institutionId) {
      throw new Error("El monitor y la ruta deben pertenecer a la misma institución");
    }

    await ctx.db.patch(args.routeId, {
      monitorId: args.monitorId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Remove monitor from a route
 */
export const removeMonitorFromRoute = mutation({
  args: {
    routeId: v.id("routes"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");

    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await ctx.db.patch(args.routeId, {
      monitorId: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get routes assigned to a monitor
 */
export const getMonitorRoutes = query({
  args: {
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);

    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) {
      throw new Error("Monitor no encontrado");
    }

    // Monitors can view their own routes
    if (currentUser._id !== monitor.userId && currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      throw new Error("No tienes permiso para ver estas rutas");
    }

    const routes = await ctx.db
      .query("routes")
      .withIndex("by_monitor", (q) => q.eq("monitorId", args.monitorId))
      .collect();

    return routes;
  },
});

/**
 * Get today's trips for a monitor
 */
export const getMonitorTripsToday = query({
  args: {
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);

    const monitor = await ctx.db.get(args.monitorId);
    if (!monitor) {
      throw new Error("Monitor no encontrado");
    }

    // Monitors can view their own trips
    if (currentUser._id !== monitor.userId && currentUser.role !== "admin" && currentUser.role !== "super_admin") {
      throw new Error("No tienes permiso para ver estos viajes");
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    const trips = await ctx.db
      .query("trips")
      .withIndex("by_monitor", (q) => q.eq("monitorId", args.monitorId))
      .filter((q) => q.eq(q.field("scheduledDate"), today))
      .collect();

    // Enrich with route data
    const enrichedTrips = await Promise.all(
      trips.map(async (trip) => {
        const route = await ctx.db.get(trip.routeId);
        const vehicle = await ctx.db.get(trip.vehicleId);
        return {
          ...trip,
          route: route
            ? {
                name: route.name,
                type: route.type,
              }
            : null,
          vehicle: vehicle
            ? {
                licensePlate: vehicle.licensePlate,
                brand: vehicle.brand,
                model: vehicle.model,
              }
            : null,
        };
      })
    );

    return enrichedTrips;
  },
});
