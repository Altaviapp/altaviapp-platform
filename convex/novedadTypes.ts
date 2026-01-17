/**
 * Novedad Types - Tipos de novedad configurables por institución
 *
 * Permite a los admins crear/modificar tipos de novedades con diferentes
 * comportamientos, workflows y requerimientos de evidencia.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Validators - 5 categorías principales + deprecadas para backwards compatibility
const novedadTypeCategory = v.union(
  // Nuevas categorías simplificadas
  v.literal("absence"),              // No viaja (ausencia)
  v.literal("third_party_pickup"),   // Tercero autorizado recibe en parada
  v.literal("temporary_stop_change"),// Cambio de parada temporal
  v.literal("address_change"),       // Cambio de domicilio permanente
  v.literal("service_suspension"),   // Suspensión temporal del servicio
  // DEPRECATED - mantener para backwards compatibility
  v.literal("pickup_change"),
  v.literal("stop_change"),
  v.literal("time_change"),
  v.literal("location_change"),
  v.literal("schedule_change"),
  v.literal("route_change"),
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
 * @deprecated Use getById instead. Code field will be removed.
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

    // Search by code if it exists (for backwards compatibility)
    const types = await ctx.db
      .query("novedadTypes")
      .withIndex("by_institution", (q) =>
        q.eq("institutionId", user.institutionId!)
      )
      .filter((q) => q.eq(q.field("code"), code))
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
 * Note: code field is DEPRECATED and optional
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    code: v.optional(v.string()), // DEPRECATED - will be removed
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

    // Check for duplicate name (more user-friendly than code)
    const existingByName = await ctx.db
      .query("novedadTypes")
      .withIndex("by_institution", (q) =>
        q.eq("institutionId", user.institutionId!)
      )
      .filter((q) => q.eq(q.field("name"), typeData.name))
      .first();

    if (existingByName) {
      throw new Error(`Ya existe un tipo con el nombre "${typeData.name}"`);
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
 * Note: legacyType support is deprecated and will be removed
 */
export const getTypeForNovedad = query({
  args: {
    userId: v.id("users"),
    typeId: v.optional(v.id("novedadTypes")),
    legacyType: v.optional(v.string()), // @deprecated
  },
  handler: async (ctx, { userId, typeId, legacyType }) => {
    const user = await ctx.db.get(userId);
    if (!user || !user.institutionId) {
      return null;
    }

    // If typeId provided, use it directly (preferred method)
    if (typeId) {
      const type = await ctx.db.get(typeId);
      if (type && type.institutionId === user.institutionId) {
        return type;
      }
      return null;
    }

    // If legacy type string, find matching type by code (deprecated)
    if (legacyType) {
      const type = await ctx.db
        .query("novedadTypes")
        .withIndex("by_institution", (q) =>
          q.eq("institutionId", user.institutionId!)
        )
        .filter((q) => q.eq(q.field("code"), legacyType))
        .first();
      return type;
    }

    return null;
  },
});

// ============================================
// MIGRATION
// ============================================

// Mapping from old categories to new simplified categories
const CATEGORY_MAPPING: Record<string, string> = {
  // Keep these as-is
  absence: "absence",
  service_suspension: "service_suspension",
  // Rename these
  pickup_change: "third_party_pickup",
  stop_change: "temporary_stop_change",
  location_change: "address_change",
  // These map to absence (no longer supported as separate)
  time_change: "absence",
  schedule_change: "service_suspension",
  route_change: "address_change",
  other: "absence",
};

/**
 * Migrate existing novedadTypes and novedades to new category system
 * Run with: npx convex run novedadTypes:migrateCategories
 */
export const migrateCategories = mutation({
  args: {},
  handler: async (ctx) => {
    console.log("Starting novedadTypes migration...");

    // Migrate novedadTypes first
    const allTypes = await ctx.db.query("novedadTypes").collect();
    let typesUpdated = 0;

    for (const type of allTypes) {
      const newCategory = CATEGORY_MAPPING[type.category];
      if (newCategory && newCategory !== type.category) {
        await ctx.db.patch(type._id, {
          category: newCategory as any,
          updatedAt: Date.now(),
        });
        typesUpdated++;
      }
    }

    console.log(`novedadTypes migration: ${typesUpdated} updated`);

    // Then migrate novedades
    console.log("Starting novedades migration...");
    const allNovedades = await ctx.db.query("novedades").collect();
    let novedadesUpdated = 0;

    for (const novedad of allNovedades) {
      const currentSnapshot = novedad.typeCategorySnapshot;
      let shouldUpdate = false;
      let newSnapshot: string | undefined;

      if (currentSnapshot) {
        newSnapshot = CATEGORY_MAPPING[currentSnapshot];
        if (newSnapshot && newSnapshot !== currentSnapshot) {
          shouldUpdate = true;
        }
      } else if (novedad.type) {
        const legacyMapping: Record<string, string> = {
          absence: "absence",
          parent_pickup: "third_party_pickup",
          stop_change: "temporary_stop_change",
          early_pickup: "absence",
          late_arrival: "absence",
        };
        newSnapshot = legacyMapping[novedad.type];
        if (newSnapshot) {
          shouldUpdate = true;
        }
      }

      if (shouldUpdate && newSnapshot) {
        await ctx.db.patch(novedad._id, {
          typeCategorySnapshot: newSnapshot,
          updatedAt: Date.now(),
        });
        novedadesUpdated++;
      }
    }

    console.log(`novedades migration: ${novedadesUpdated} updated`);
    console.log("Migration complete!");

    return {
      novedadTypesUpdated: typesUpdated,
      novedadesUpdated: novedadesUpdated,
    };
  },
});
