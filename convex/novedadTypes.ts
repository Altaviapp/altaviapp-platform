/**
 * Novedad Types - Tipos de novedad configurables por institución
 *
 * Permite a los admins crear/modificar tipos de novedades con diferentes
 * comportamientos, workflows y requerimientos de evidencia.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Validators
const novedadTypeCategory = v.union(
  v.literal("absence"),
  v.literal("pickup_change"),
  v.literal("stop_change"),
  v.literal("time_change"),
  v.literal("location_change"),
  v.literal("schedule_change"),
  v.literal("route_change"),
  v.literal("service_suspension"),
  v.literal("other")
);

const novedadTypeDuration = v.union(
  v.literal("single_day"),
  v.literal("date_range"),
  v.literal("permanent"),
  v.literal("recurring")
);

// ============================================
// QUERIES
// ============================================

/**
 * List all active novedad types for an institution
 * Used by parent app to show available options when creating a novedad
 */
export const list = query({
  args: {
    userId: v.id("users"),
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, { userId, activeOnly = true }) => {
    // Get user and institution
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      return [];
    }

    // Query by institution
    let types;
    if (activeOnly) {
      types = await ctx.db
        .query("novedadTypes")
        .withIndex("by_active", (q) =>
          q.eq("institutionId", user.institutionId!).eq("isActive", true)
        )
        .collect();
    } else {
      types = await ctx.db
        .query("novedadTypes")
        .withIndex("by_institution", (q) =>
          q.eq("institutionId", user.institutionId!)
        )
        .collect();
    }

    // Sort by sortOrder
    return types.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

/**
 * Get a single novedad type by ID
 */
export const getById = query({
  args: {
    userId: v.id("users"),
    typeId: v.id("novedadTypes"),
  },
  handler: async (ctx, { userId, typeId }) => {
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      return null;
    }

    const type = await ctx.db.get(typeId);
    if (!type || type.institutionId !== user.institutionId) {
      return null;
    }

    return type;
  },
});

/**
 * Get a novedad type by code
 * Used internally when creating novedades with legacy type string
 */
export const getByCode = query({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, { userId, code }) => {
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      return null;
    }

    const types = await ctx.db
      .query("novedadTypes")
      .withIndex("by_code", (q) =>
        q.eq("institutionId", user.institutionId!).eq("code", code)
      )
      .first();

    return types;
  },
});

/**
 * Get types by category
 * Useful for filtering types in admin settings
 */
export const getByCategory = query({
  args: {
    userId: v.id("users"),
    category: novedadTypeCategory,
  },
  handler: async (ctx, { userId, category }) => {
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      return [];
    }

    const types = await ctx.db
      .query("novedadTypes")
      .withIndex("by_category", (q) =>
        q.eq("institutionId", user.institutionId!).eq("category", category)
      )
      .collect();

    return types.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new novedad type
 * Only admins can create types
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    color: v.string(),
    category: novedadTypeCategory,
    durationType: novedadTypeDuration,
    requiresApproval: v.boolean(),
    affectsTrips: v.boolean(),
    affectsRouteCalculation: v.boolean(),
    evidenceRequired: v.boolean(),
    evidenceOptional: v.boolean(),
    maxEvidenceFiles: v.optional(v.number()),
    allowedFileTypes: v.optional(v.array(v.string())),
    minAdvanceHours: v.optional(v.number()),
    reasonRequired: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { userId, ...typeData } = args;

    // Verify user is admin
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      throw new Error("Usuario no autenticado");
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Solo administradores pueden crear tipos de novedad");
    }

    // Check if code already exists
    const existing = await ctx.db
      .query("novedadTypes")
      .withIndex("by_code", (q) =>
        q.eq("institutionId", user.institutionId!).eq("code", typeData.code)
      )
      .first();

    if (existing) {
      throw new Error(`Ya existe un tipo con el código "${typeData.code}"`);
    }

    // Get current max sortOrder
    const allTypes = await ctx.db
      .query("novedadTypes")
      .withIndex("by_institution", (q) =>
        q.eq("institutionId", user.institutionId!)
      )
      .collect();

    const maxOrder = allTypes.reduce(
      (max, t) => Math.max(max, t.sortOrder),
      0
    );

    const now = Date.now();

    const typeId = await ctx.db.insert("novedadTypes", {
      institutionId: user.institutionId,
      ...typeData,
      isSystemType: false,
      isActive: true,
      sortOrder: maxOrder + 1,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, typeId };
  },
});

/**
 * Update an existing novedad type
 */
export const update = mutation({
  args: {
    userId: v.id("users"),
    typeId: v.id("novedadTypes"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
    category: v.optional(novedadTypeCategory),
    durationType: v.optional(novedadTypeDuration),
    requiresApproval: v.optional(v.boolean()),
    affectsTrips: v.optional(v.boolean()),
    affectsRouteCalculation: v.optional(v.boolean()),
    evidenceRequired: v.optional(v.boolean()),
    evidenceOptional: v.optional(v.boolean()),
    maxEvidenceFiles: v.optional(v.number()),
    allowedFileTypes: v.optional(v.array(v.string())),
    minAdvanceHours: v.optional(v.number()),
    reasonRequired: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { userId, typeId, ...updates } = args;

    // Verify user is admin
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      throw new Error("Usuario no autenticado");
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Solo administradores pueden modificar tipos de novedad");
    }

    // Get existing type
    const type = await ctx.db.get(typeId);
    if (!type) {
      throw new Error("Tipo de novedad no encontrado");
    }
    if (type.institutionId !== user.institutionId) {
      throw new Error("No tienes permiso para modificar este tipo");
    }

    // Filter out undefined values
    const filteredUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    }

    await ctx.db.patch(typeId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Toggle active status of a novedad type
 */
export const toggleActive = mutation({
  args: {
    userId: v.id("users"),
    typeId: v.id("novedadTypes"),
  },
  handler: async (ctx, { userId, typeId }) => {
    // Verify user is admin
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      throw new Error("Usuario no autenticado");
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Solo administradores pueden modificar tipos de novedad");
    }

    // Get existing type
    const type = await ctx.db.get(typeId);
    if (!type) {
      throw new Error("Tipo de novedad no encontrado");
    }
    if (type.institutionId !== user.institutionId) {
      throw new Error("No tienes permiso para modificar este tipo");
    }

    await ctx.db.patch(typeId, {
      isActive: !type.isActive,
      updatedAt: Date.now(),
    });

    return { success: true, isActive: !type.isActive };
  },
});

/**
 * Delete a novedad type (only if not system type and no novedades use it)
 */
export const remove = mutation({
  args: {
    userId: v.id("users"),
    typeId: v.id("novedadTypes"),
  },
  handler: async (ctx, { userId, typeId }) => {
    // Verify user is admin
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      throw new Error("Usuario no autenticado");
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Solo administradores pueden eliminar tipos de novedad");
    }

    // Get existing type
    const type = await ctx.db.get(typeId);
    if (!type) {
      throw new Error("Tipo de novedad no encontrado");
    }
    if (type.institutionId !== user.institutionId) {
      throw new Error("No tienes permiso para eliminar este tipo");
    }
    if (type.isSystemType) {
      throw new Error("No se pueden eliminar tipos de sistema");
    }

    // Check if any novedades use this type
    const novedadesWithType = await ctx.db
      .query("novedades")
      .withIndex("by_type", (q) => q.eq("typeId", typeId))
      .first();

    if (novedadesWithType) {
      throw new Error(
        "No se puede eliminar: hay novedades usando este tipo. Desactívalo en su lugar."
      );
    }

    await ctx.db.delete(typeId);

    return { success: true };
  },
});

/**
 * Reorder novedad types
 * Receives array of typeIds in new order
 */
export const reorder = mutation({
  args: {
    userId: v.id("users"),
    typeIds: v.array(v.id("novedadTypes")),
  },
  handler: async (ctx, { userId, typeIds }) => {
    // Verify user is admin
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      throw new Error("Usuario no autenticado");
    }
    if (user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Solo administradores pueden reordenar tipos");
    }

    const now = Date.now();

    // Update sortOrder for each type
    for (let i = 0; i < typeIds.length; i++) {
      const typeId = typeIds[i];
      if (!typeId) continue;

      const type = await ctx.db.get(typeId);
      if (type && type.institutionId === user.institutionId) {
        await ctx.db.patch(typeId, {
          sortOrder: i + 1,
          updatedAt: now,
        });
      }
    }

    return { success: true };
  },
});

// ============================================
// INTERNAL HELPERS
// ============================================

/**
 * Get type for novedad creation
 * Handles both new typeId-based and legacy type string
 */
export const getTypeForNovedad = query({
  args: {
    userId: v.id("users"),
    typeId: v.optional(v.id("novedadTypes")),
    legacyType: v.optional(v.string()),
  },
  handler: async (ctx, { userId, typeId, legacyType }) => {
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      return null;
    }

    // If typeId provided, use it directly
    if (typeId) {
      const type = await ctx.db.get(typeId);
      if (type && type.institutionId === user.institutionId) {
        return type;
      }
      return null;
    }

    // If legacy type string, find matching type by code
    if (legacyType) {
      const type = await ctx.db
        .query("novedadTypes")
        .withIndex("by_code", (q) =>
          q.eq("institutionId", user.institutionId!).eq("code", legacyType)
        )
        .first();
      return type;
    }

    return null;
  },
});
