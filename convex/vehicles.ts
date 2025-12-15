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

/**
 * Update vehicle GPS configuration
 * Configures the GPS source type and device settings
 */
export const updateGpsConfig = mutation({
  args: {
    userId: v.id("users"),
    vehicleId: v.id("vehicles"),
    gpsSourceType: v.union(
      v.literal("mobile"),
      v.literal("device"),
      v.literal("api")
    ),
    gpsDeviceConfig: v.optional(v.object({
      deviceId: v.string(),
      provider: v.optional(v.string()),
      apiEndpoint: v.optional(v.string()),
      updateIntervalSeconds: v.optional(v.number()),
      fallbackToMobile: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehículo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, vehicle.institutionId);

    // Validate: device/api source requires gpsDeviceConfig
    if ((args.gpsSourceType === "device" || args.gpsSourceType === "api") && !args.gpsDeviceConfig) {
      throw new Error("Se requiere configuración de dispositivo para GPS externo");
    }

    // Validate deviceId uniqueness within institution
    if (args.gpsDeviceConfig?.deviceId) {
      const existingVehicles = await ctx.db
        .query("vehicles")
        .withIndex("by_institution", (q) => q.eq("institutionId", vehicle.institutionId))
        .filter((q) => q.neq(q.field("_id"), args.vehicleId))
        .collect();

      const duplicate = existingVehicles.find(
        (v) => v.gpsDeviceConfig?.deviceId === args.gpsDeviceConfig!.deviceId
      );

      if (duplicate) {
        throw new Error(`El ID de dispositivo ya está asignado al vehículo ${duplicate.licensePlate}`);
      }
    }

    await ctx.db.patch(args.vehicleId, {
      gpsSourceType: args.gpsSourceType,
      gpsDeviceConfig: args.gpsSourceType === "mobile" ? undefined : args.gpsDeviceConfig,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Remove GPS device configuration (reset to mobile)
 */
export const removeGpsConfig = mutation({
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
      gpsSourceType: "mobile",
      gpsDeviceConfig: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get vehicles with external GPS configuration
 */
export const getVehiclesWithExternalGps = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.or(
            q.eq(q.field("gpsSourceType"), "device"),
            q.eq(q.field("gpsSourceType"), "api")
          )
        )
      )
      .collect();

    return vehicles.map((v) => ({
      id: v._id,
      licensePlate: v.licensePlate,
      brand: v.brand,
      model: v.model,
      gpsSourceType: v.gpsSourceType,
      deviceId: v.gpsDeviceConfig?.deviceId,
      provider: v.gpsDeviceConfig?.provider,
      fallbackToMobile: v.gpsDeviceConfig?.fallbackToMobile,
    }));
  },
});
