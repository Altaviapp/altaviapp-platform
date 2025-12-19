/**
 * Monitor Management Functions
 *
 * Monitors (Auxiliares) are responsible for:
 * - Student check-in/check-out
 * - Incident reporting
 * - Student safety during trips
 *
 * Monitor profiles are auto-created when a user accepts an invitation with role="monitor".
 * Monitors complete their professional information from the Crew app.
 *
 * RBAC:
 * - Admin+ can list and manage all monitors in their institution
 * - Monitors can view and update their own profile
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Get current user's monitor profile
 * Used by monitors in Crew app to view/complete their profile
 */
export const getMyMonitorProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    if (currentUser.role !== "monitor") {
      throw new Error("Solo monitores pueden acceder a su perfil de monitor");
    }

    const monitor = await ctx.db
      .query("monitors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!monitor) {
      return null;
    }

    return {
      ...monitor,
      user: {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
      },
    };
  },
});

/**
 * Get monitor profile by user ID
 */
export const getMonitorByUserId = query({
  args: {
    userId: v.id("users"), // Current user making the request
    targetUserId: v.id("users"), // User to get monitor profile for
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const monitor = await ctx.db
      .query("monitors")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (!monitor) {
      return null;
    }

    // Monitors can view their own profile
    if (currentUser._id === args.targetUserId) {
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
    userId: v.id("users"), // Current user making the request
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const monitor = await ctx.db.get(args.monitorId);

    if (!monitor) {
      return null;
    }

    // Helper to return monitor with user data
    const enrichWithUser = async () => {
      const user = await ctx.db.get(monitor.userId);
      return {
        ...monitor,
        user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
      };
    };

    // Monitors can view their own profile
    if (currentUser._id === monitor.userId) {
      return enrichWithUser();
    }

    // Admin can view monitors in their institution
    if (currentUser.role === "admin" && currentUser.institutionId === monitor.institutionId) {
      return enrichWithUser();
    }

    // Super admin can view all
    if (currentUser.role === "super_admin") {
      return enrichWithUser();
    }

    throw new Error("No tienes permiso para ver este perfil de monitor");
  },
});

/**
 * List all monitors for an institution
 */
export const listMonitorsByInstitution = query({
  args: {
    userId: v.id("users"), // Current user making the request
    institutionId: v.id("institutions"),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let monitors = await ctx.db
      .query("monitors")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
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
 * Monitors can update their own profile from Crew app
 * Admin can update any monitor in their institution
 */
export const updateMonitor = mutation({
  args: {
    userId: v.id("users"), // Current user making the request
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
    const currentUser = await verifyUser(ctx, args.userId);

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

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.idNumber !== undefined) updates.idNumber = args.idNumber;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.emergencyContact !== undefined) updates.emergencyContact = args.emergencyContact;
    if (args.firstAidCertified !== undefined) updates.firstAidCertified = args.firstAidCertified;
    if (args.firstAidCertExpiry !== undefined) updates.firstAidCertExpiry = args.firstAidCertExpiry;
    if (args.childCareCertified !== undefined) updates.childCareCertified = args.childCareCertified;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    // Calculate profileCompleted based on required professional fields
    const newIdNumber = args.idNumber ?? monitor.idNumber;
    const newPhone = args.phone ?? monitor.phone;
    const newEmergencyContact = args.emergencyContact ?? monitor.emergencyContact;

    updates.profileCompleted = !!(
      newIdNumber &&
      newPhone &&
      newEmergencyContact
    );

    await ctx.db.patch(args.monitorId, updates);

    return { success: true, profileCompleted: updates.profileCompleted };
  },
});

/**
 * Deactivate a monitor
 */
export const deactivateMonitor = mutation({
  args: {
    userId: v.id("users"), // Current user making the request
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

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
    userId: v.id("users"), // Current user making the request
    monitorId: v.id("monitors"),
    routeId: v.id("routes"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

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
    userId: v.id("users"), // Current user making the request
    routeId: v.id("routes"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

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
    userId: v.id("users"), // Current user making the request
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

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
    userId: v.id("users"), // Current user making the request
    monitorId: v.id("monitors"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

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
