/**
 * Driver Management Functions
 *
 * CRUD operations for driver profiles.
 * RBAC: Admin+ can manage drivers, drivers can view their own profile.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Create a new driver profile
 */
export const createDriver = mutation({
  args: {
    userId: v.id("users"),
    targetUserId: v.id("users"),
    institutionId: v.id("institutions"),
    licenseNumber: v.string(),
    licenseExpiry: v.number(),
    phone: v.string(),
    emergencyContact: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    // Verify target user exists and has driver role
    const user = await ctx.db.get(args.targetUserId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    if (user.role !== "driver") {
      throw new Error("El usuario debe tener rol de conductor");
    }

    // Check if driver profile already exists
    const existing = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (existing) {
      throw new Error("Ya existe un perfil de conductor para este usuario");
    }

    const now = Date.now();
    const driverId = await ctx.db.insert("drivers", {
      userId: args.targetUserId,
      institutionId: args.institutionId,
      licenseNumber: args.licenseNumber,
      licenseExpiry: args.licenseExpiry,
      phone: args.phone,
      emergencyContact: args.emergencyContact,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, driverId };
  },
});

/**
 * Get driver by user ID
 */
export const getDriverByUserId = query({
  args: {
    userId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", args.targetUserId))
      .first();

    if (!driver) {
      return null;
    }

    // Drivers can view their own profile
    if (currentUser._id === args.targetUserId) {
      return driver;
    }

    // Admin can view drivers in their institution
    if (currentUser.role === "admin" && currentUser.institutionId === driver.institutionId) {
      return driver;
    }

    // Super admin can view all
    if (currentUser.role === "super_admin") {
      return driver;
    }

    throw new Error("No tienes permiso para ver este perfil");
  },
});

/**
 * Get driver by ID
 */
export const getDriverById = query({
  args: {
    userId: v.id("users"),
    driverId: v.id("drivers"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const driver = await ctx.db.get(args.driverId);
    if (!driver) {
      return null;
    }

    // Drivers can view their own profile
    if (currentUser._id === driver.userId) {
      return driver;
    }

    // Admin can view drivers in their institution
    if (currentUser.role === "admin" && currentUser.institutionId === driver.institutionId) {
      return driver;
    }

    // Super admin can view all
    if (currentUser.role === "super_admin") {
      return driver;
    }

    throw new Error("No tienes permiso para ver este perfil");
  },
});

/**
 * List drivers by institution
 */
export const listDriversByInstitution = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let drivers = await ctx.db
      .query("drivers")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    if (args.isActive !== undefined) {
      drivers = drivers.filter((d) => d.isActive === args.isActive);
    }

    // Enrich with user data
    const enrichedDrivers = await Promise.all(
      drivers.map(async (driver) => {
        const user = await ctx.db.get(driver.userId);
        return {
          ...driver,
          user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
        };
      })
    );

    return enrichedDrivers;
  },
});

/**
 * Update driver profile
 */
export const updateDriver = mutation({
  args: {
    userId: v.id("users"),
    driverId: v.id("drivers"),
    licenseNumber: v.optional(v.string()),
    licenseExpiry: v.optional(v.number()),
    phone: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const driver = await ctx.db.get(args.driverId);
    if (!driver) {
      throw new Error("Conductor no encontrado");
    }

    // Admin can update drivers in their institution
    if (currentUser.role === "admin") {
      if (currentUser.institutionId !== driver.institutionId) {
        throw new Error("No tienes permiso para actualizar conductores de otra institución");
      }
    } else if (currentUser.role !== "super_admin") {
      // Drivers can only update some of their own fields
      if (currentUser._id !== driver.userId) {
        throw new Error("No tienes permiso para actualizar este perfil");
      }
      if (args.isActive !== undefined) {
        throw new Error("No puedes cambiar tu propio estado activo");
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.licenseNumber !== undefined) updates.licenseNumber = args.licenseNumber;
    if (args.licenseExpiry !== undefined) updates.licenseExpiry = args.licenseExpiry;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.emergencyContact !== undefined) updates.emergencyContact = args.emergencyContact;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.driverId, updates);
    return { success: true };
  },
});

/**
 * Deactivate driver
 */
export const deactivateDriver = mutation({
  args: {
    userId: v.id("users"),
    driverId: v.id("drivers"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const driver = await ctx.db.get(args.driverId);
    if (!driver) {
      throw new Error("Conductor no encontrado");
    }

    await ctx.db.patch(args.driverId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
