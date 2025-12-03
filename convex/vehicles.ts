/**
 * Vehicle Management Functions
 *
 * CRUD operations for vehicles.
 * RBAC: Admin+ can manage vehicles, drivers can view their assigned vehicles.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Create a new vehicle
 */
export const createVehicle = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    licensePlate: v.string(),
    brand: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.string(),
    capacity: v.number(),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("out_of_service")
    )),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Check if license plate already exists
    const existing = await ctx.db
      .query("vehicles")
      .filter((q) => q.eq(q.field("licensePlate"), args.licensePlate.toUpperCase()))
      .first();

    if (existing) {
      throw new Error("Ya existe un vehículo con esta placa");
    }

    const now = Date.now();
    const vehicleId = await ctx.db.insert("vehicles", {
      institutionId: args.institutionId,
      licensePlate: args.licensePlate.toUpperCase(),
      brand: args.brand,
      model: args.model,
      year: args.year,
      color: args.color,
      capacity: args.capacity,
      status: args.status || "active",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, vehicleId };
  },
});

/**
 * Get vehicle by ID
 */
export const getVehicle = query({
  args: {
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehículo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, vehicle.institutionId);
    return vehicle;
  },
});

/**
 * List vehicles by institution
 */
export const listVehicles = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("out_of_service")
    )),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let vehicles;
    const status = args.status;

    if (status) {
      vehicles = await ctx.db
        .query("vehicles")
        .withIndex("by_status", (q) => q.eq("status", status))
        .filter((q) => q.eq(q.field("institutionId"), args.institutionId))
        .collect();
    } else {
      vehicles = await ctx.db
        .query("vehicles")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect();
    }

    if (args.isActive !== undefined) {
      vehicles = vehicles.filter((v) => v.isActive === args.isActive);
    }

    return vehicles;
  },
});

/**
 * Update vehicle
 */
export const updateVehicle = mutation({
  args: {
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    licensePlate: v.optional(v.string()),
    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    color: v.optional(v.string()),
    capacity: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("active"),
      v.literal("maintenance"),
      v.literal("out_of_service")
    )),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehículo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, vehicle.institutionId);

    // Check license plate uniqueness if changing
    if (args.licensePlate && args.licensePlate.toUpperCase() !== vehicle.licensePlate) {
      const existing = await ctx.db
        .query("vehicles")
        .filter((q) => q.eq(q.field("licensePlate"), args.licensePlate!.toUpperCase()))
        .first();
      if (existing) {
        throw new Error("Ya existe un vehículo con esta placa");
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.licensePlate !== undefined) updates.licensePlate = args.licensePlate.toUpperCase();
    if (args.brand !== undefined) updates.brand = args.brand;
    if (args.model !== undefined) updates.model = args.model;
    if (args.year !== undefined) updates.year = args.year;
    if (args.color !== undefined) updates.color = args.color;
    if (args.capacity !== undefined) updates.capacity = args.capacity;
    if (args.status !== undefined) updates.status = args.status;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.vehicleId, updates);
    return { success: true };
  },
});

/**
 * Deactivate vehicle
 */
export const deactivateVehicle = mutation({
  args: {
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehículo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, vehicle.institutionId);

    await ctx.db.patch(args.vehicleId, {
      isActive: false,
      status: "out_of_service",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
