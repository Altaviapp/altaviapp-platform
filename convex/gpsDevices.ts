/**
 * GPS Devices Management
 *
 * CRUD operations for external GPS devices with:
 * - Device registration and configuration
 * - Vehicle assignment with history tracking
 * - Field mapping for webhook parsing
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

// ============================================
// TYPES
// ============================================

const fieldMappingValidator = v.object({
  latitude: v.string(),
  longitude: v.string(),
  speed: v.optional(v.string()),
  heading: v.optional(v.string()),
  timestamp: v.optional(v.string()),
  deviceIdField: v.string(),
});

const deviceStatusValidator = v.union(
  v.literal("pending_config"),
  v.literal("testing"),
  v.literal("active"),
  v.literal("inactive")
);

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new GPS device
 */
export const createDevice = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    deviceId: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Check for duplicate deviceId within institution
    const existingDevice = await ctx.db
      .query("gpsDevices")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("deviceId"), args.deviceId))
      .first();

    if (existingDevice) {
      throw new Error(`Ya existe un dispositivo con ID "${args.deviceId}" en esta institución`);
    }

    const now = Date.now();
    const id = await ctx.db.insert("gpsDevices", {
      institutionId: args.institutionId,
      deviceId: args.deviceId,
      name: args.name,
      status: "pending_config",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, deviceId: id };
  },
});

/**
 * Update GPS device field mapping
 */
export const updateFieldMapping = mutation({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
    fieldMapping: fieldMappingValidator,
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    await ctx.db.patch(args.deviceId, {
      fieldMapping: args.fieldMapping,
      status: device.status === "pending_config" ? "testing" : device.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update device basic info (name, deviceId)
 */
export const updateDevice = mutation({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
    name: v.optional(v.string()),
    externalDeviceId: v.optional(v.string()), // The deviceId field
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    // Check for duplicate deviceId if changing
    if (args.externalDeviceId && args.externalDeviceId !== device.deviceId) {
      const existing = await ctx.db
        .query("gpsDevices")
        .withIndex("by_institution", (q) => q.eq("institutionId", device.institutionId))
        .filter((q) => q.eq(q.field("deviceId"), args.externalDeviceId))
        .first();

      if (existing) {
        throw new Error(`Ya existe un dispositivo con ID "${args.externalDeviceId}"`);
      }
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.externalDeviceId !== undefined) updates.deviceId = args.externalDeviceId;

    await ctx.db.patch(args.deviceId, updates);

    return { success: true };
  },
});

/**
 * Assign device to a vehicle (with history tracking)
 */
export const assignToVehicle = mutation({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
    vehicleId: v.id("vehicles"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehículo no encontrado");
    }

    if (vehicle.institutionId !== device.institutionId) {
      throw new Error("El vehículo pertenece a otra institución");
    }

    const now = Date.now();

    // If device was already assigned, close that assignment
    if (device.vehicleId) {
      // Find the current active assignment and close it
      const currentAssignment = await ctx.db
        .query("gpsDeviceAssignments")
        .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
        .filter((q) => q.eq(q.field("unassignedAt"), undefined))
        .first();

      if (currentAssignment) {
        await ctx.db.patch(currentAssignment._id, {
          unassignedAt: now,
          unassignedBy: args.userId,
        });
      }
    }

    // Create new assignment record
    await ctx.db.insert("gpsDeviceAssignments", {
      deviceId: args.deviceId,
      vehicleId: args.vehicleId,
      institutionId: device.institutionId,
      assignedAt: now,
      assignedBy: args.userId,
      reason: args.reason,
    });

    // Update device with new vehicle
    await ctx.db.patch(args.deviceId, {
      vehicleId: args.vehicleId,
      updatedAt: now,
    });

    // Update vehicle GPS config to use this device
    await ctx.db.patch(args.vehicleId, {
      gpsSourceType: "device",
      gpsDeviceConfig: {
        deviceId: device.deviceId,
        provider: "custom",
        fallbackToMobile: true,
      },
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Unassign device from vehicle
 */
export const unassignFromVehicle = mutation({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    if (!device.vehicleId) {
      throw new Error("El dispositivo no está asignado a ningún vehículo");
    }

    const now = Date.now();

    // Close current assignment
    const currentAssignment = await ctx.db
      .query("gpsDeviceAssignments")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .filter((q) => q.eq(q.field("unassignedAt"), undefined))
      .first();

    if (currentAssignment) {
      await ctx.db.patch(currentAssignment._id, {
        unassignedAt: now,
        unassignedBy: args.userId,
        reason: args.reason || currentAssignment.reason,
      });
    }

    // Reset vehicle to mobile GPS
    await ctx.db.patch(device.vehicleId, {
      gpsSourceType: "mobile",
      gpsDeviceConfig: undefined,
      updatedAt: now,
    });

    // Remove vehicle from device
    await ctx.db.patch(args.deviceId, {
      vehicleId: undefined,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Activate device (move from testing to active)
 */
export const activateDevice = mutation({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    if (!device.fieldMapping) {
      throw new Error("El dispositivo debe tener configuración de campos antes de activarse");
    }

    await ctx.db.patch(args.deviceId, {
      status: "active",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Deactivate device
 */
export const deactivateDevice = mutation({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    await ctx.db.patch(args.deviceId, {
      status: "inactive",
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete device (soft delete)
 */
export const deleteDevice = mutation({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    // If assigned, unassign first
    if (device.vehicleId) {
      const now = Date.now();

      // Close assignment
      const currentAssignment = await ctx.db
        .query("gpsDeviceAssignments")
        .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
        .filter((q) => q.eq(q.field("unassignedAt"), undefined))
        .first();

      if (currentAssignment) {
        await ctx.db.patch(currentAssignment._id, {
          unassignedAt: now,
          unassignedBy: args.userId,
          reason: "Dispositivo eliminado",
        });
      }

      // Reset vehicle
      await ctx.db.patch(device.vehicleId, {
        gpsSourceType: "mobile",
        gpsDeviceConfig: undefined,
        updatedAt: now,
      });
    }

    // Soft delete
    await ctx.db.patch(args.deviceId, {
      isActive: false,
      status: "inactive",
      vehicleId: undefined,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================
// QUERIES
// ============================================

/**
 * List all GPS devices for an institution
 */
export const listDevices = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    status: v.optional(deviceStatusValidator),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let devices = await ctx.db
      .query("gpsDevices")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    // Filter by status
    if (args.status) {
      devices = devices.filter((d) => d.status === args.status);
    }

    // Filter inactive
    if (!args.includeInactive) {
      devices = devices.filter((d) => d.isActive);
    }

    // Enrich with vehicle info
    const enrichedDevices = await Promise.all(
      devices.map(async (device) => {
        let vehicle = null;
        if (device.vehicleId) {
          const v = await ctx.db.get(device.vehicleId);
          if (v) {
            vehicle = {
              id: v._id,
              licensePlate: v.licensePlate,
              brand: v.brand,
              model: v.model,
            };
          }
        }

        return {
          ...device,
          vehicle,
          // Calculate time since last seen
          lastSeenAgo: device.lastSeen
            ? Math.floor((Date.now() - device.lastSeen) / 1000)
            : null,
        };
      })
    );

    return enrichedDevices;
  },
});

/**
 * Get a single GPS device with full details
 */
export const getDevice = query({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
  },
  handler: async (ctx, args) => {
    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    // Get vehicle info
    let vehicle = null;
    if (device.vehicleId) {
      const v = await ctx.db.get(device.vehicleId);
      if (v) {
        vehicle = {
          id: v._id,
          licensePlate: v.licensePlate,
          brand: v.brand,
          model: v.model,
          color: v.color,
        };
      }
    }

    // Get institution for API token
    const institution = await ctx.db.get(device.institutionId);

    return {
      ...device,
      vehicle,
      institutionApiToken: institution?.apiToken,
      lastSeenAgo: device.lastSeen
        ? Math.floor((Date.now() - device.lastSeen) / 1000)
        : null,
    };
  },
});

/**
 * Get device assignment history
 */
export const getDeviceAssignmentHistory = query({
  args: {
    userId: v.id("users"),
    deviceId: v.id("gpsDevices"),
  },
  handler: async (ctx, args) => {
    const device = await ctx.db.get(args.deviceId);
    if (!device) {
      throw new Error("Dispositivo no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, device.institutionId);

    const assignments = await ctx.db
      .query("gpsDeviceAssignments")
      .withIndex("by_device", (q) => q.eq("deviceId", args.deviceId))
      .collect();

    // Sort by assignedAt descending (most recent first)
    assignments.sort((a, b) => b.assignedAt - a.assignedAt);

    // Enrich with vehicle and user info
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const vehicle = await ctx.db.get(assignment.vehicleId);
        const assignedByUser = await ctx.db.get(assignment.assignedBy);
        const unassignedByUser = assignment.unassignedBy
          ? await ctx.db.get(assignment.unassignedBy)
          : null;

        return {
          ...assignment,
          vehicle: vehicle
            ? {
                id: vehicle._id,
                licensePlate: vehicle.licensePlate,
                brand: vehicle.brand,
                model: vehicle.model,
              }
            : null,
          assignedByName: assignedByUser?.name || "Usuario desconocido",
          unassignedByName: unassignedByUser?.name || null,
        };
      })
    );

    return enrichedAssignments;
  },
});

/**
 * Get vehicle's GPS device history
 */
export const getVehicleDeviceHistory = query({
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

    const assignments = await ctx.db
      .query("gpsDeviceAssignments")
      .withIndex("by_vehicle", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();

    // Sort by assignedAt descending
    assignments.sort((a, b) => b.assignedAt - a.assignedAt);

    // Enrich with device info
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        const device = await ctx.db.get(assignment.deviceId);

        return {
          ...assignment,
          device: device
            ? {
                id: device._id,
                deviceId: device.deviceId,
                name: device.name,
              }
            : null,
        };
      })
    );

    return enrichedAssignments;
  },
});

/**
 * Get unassigned devices
 */
export const getUnassignedDevices = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const devices = await ctx.db
      .query("gpsDevices")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("isActive"), true),
          q.eq(q.field("vehicleId"), undefined)
        )
      )
      .collect();

    return devices;
  },
});

/**
 * Get device by external device ID (for webhook processing)
 */
export const getDeviceByExternalId = query({
  args: {
    institutionId: v.id("institutions"),
    externalDeviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const device = await ctx.db
      .query("gpsDevices")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) =>
        q.and(
          q.eq(q.field("deviceId"), args.externalDeviceId),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    return device;
  },
});
