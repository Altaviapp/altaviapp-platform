/**
 * Institutions API
 *
 * Manages institutions (schools/organizations) within a client.
 * A client can own multiple institutions.
 *
 * Features:
 * - CRUD operations for institutions
 * - List institutions with filters
 * - Multi-tenancy enforcement
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { isValidEmail, isValidPhone } from "./lib/authUtils";
import { verifyRole, verifyClientAccess, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Create new institution
 * Admin or super_admin creates institution under a client
 */
export const createInstitution = mutation({
  args: {
    userId: v.id("users"),
    clientId: v.id("clients"),
    name: v.string(),
    type: v.union(v.literal("school"), v.literal("corporate")),
    address: v.string(),
    city: v.string(),
    phone: v.string(),
    email: v.string(),
    contactPerson: v.string(),
    subscriptionPlan: v.optional(
      v.union(
        v.literal("trial"),
        v.literal("basic"),
        v.literal("professional"),
        v.literal("enterprise")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    await verifyRole(ctx, args.userId, "admin");

    // Verify user has access to this client
    await verifyClientAccess(ctx, args.userId, args.clientId);

    // Validate email
    if (!isValidEmail(args.email)) {
      throw new Error("Formato de email inválido");
    }

    // Validate phone
    if (!isValidPhone(args.phone)) {
      throw new Error("Formato de teléfono inválido. Usa: +593XXXXXXXXX");
    }

    // Check client exists and is active
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }
    if (!client.isActive) {
      throw new Error("Cliente inactivo");
    }

    // Check institution limit
    const existingInstitutions = await ctx.db
      .query("institutions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    if (existingInstitutions.length >= client.maxInstitutions) {
      throw new Error(
        `Límite de instituciones alcanzado (${client.maxInstitutions}). Actualiza tu plan.`
      );
    }

    // Create institution
    const now = Date.now();
    const institutionId = await ctx.db.insert("institutions", {
      clientId: args.clientId,
      name: args.name,
      type: args.type,
      address: args.address,
      city: args.city,
      phone: args.phone,
      email: args.email.toLowerCase(),
      contactPerson: args.contactPerson,
      subscriptionPlan: args.subscriptionPlan || client.subscriptionPlan,
      subscriptionStatus: "active",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      institutionId,
      message: "Institución creada exitosamente",
    };
  },
});

/**
 * Update existing institution
 */
export const updateInstitution = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    name: v.optional(v.string()),
    type: v.optional(v.union(v.literal("school"), v.literal("corporate"))),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    subscriptionPlan: v.optional(
      v.union(
        v.literal("trial"),
        v.literal("basic"),
        v.literal("professional"),
        v.literal("enterprise")
      )
    ),
    subscriptionStatus: v.optional(
      v.union(
        v.literal("active"),
        v.literal("suspended"),
        v.literal("cancelled")
      )
    ),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    await verifyRole(ctx, args.userId, "admin");

    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    // Validate email if provided
    if (args.email && !isValidEmail(args.email)) {
      throw new Error("Formato de email inválido");
    }

    // Validate phone if provided
    if (args.phone && !isValidPhone(args.phone)) {
      throw new Error("Formato de teléfono inválido");
    }

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.type !== undefined) updates.type = args.type;
    if (args.address !== undefined) updates.address = args.address;
    if (args.city !== undefined) updates.city = args.city;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.email !== undefined) updates.email = args.email.toLowerCase();
    if (args.contactPerson !== undefined) updates.contactPerson = args.contactPerson;
    if (args.subscriptionPlan !== undefined) updates.subscriptionPlan = args.subscriptionPlan;
    if (args.subscriptionStatus !== undefined) updates.subscriptionStatus = args.subscriptionStatus;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.institutionId, updates);

    return {
      success: true,
      message: "Institución actualizada exitosamente",
    };
  },
});

/**
 * Get single institution by ID
 */
export const getInstitution = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    // Get client info
    const client = await ctx.db.get(institution.clientId);

    // Count related entities
    const [users, vehicles, students, routes] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect(),
      ctx.db
        .query("vehicles")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect(),
      ctx.db
        .query("students")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect(),
      ctx.db
        .query("routes")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect(),
    ]);

    return {
      ...institution,
      clientName: client?.name,
      stats: {
        usersCount: users.length,
        vehiclesCount: vehicles.length,
        studentsCount: students.length,
        routesCount: routes.length,
      },
    };
  },
});

/**
 * List institutions
 * Super admin sees all, others see only their accessible institutions
 */
export const listInstitutions = query({
  args: {
    userId: v.id("users"),
    clientId: v.optional(v.id("clients")),
    city: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get user to check role
    const user = await ctx.db.get(args.userId);
    if (!user || !user.isActive) {
      throw new Error("Usuario no encontrado o inactivo");
    }

    let institutions;

    if (user.role === "super_admin") {
      // Super admin can see all institutions
      if (args.clientId) {
        const clientId = args.clientId;
        institutions = await ctx.db
          .query("institutions")
          .withIndex("by_client", (q) => q.eq("clientId", clientId))
          .collect();
      } else {
        institutions = await ctx.db.query("institutions").collect();
      }
    } else {
      // Other users see only their accessible institutions
      const accessibleIds = user.accessibleInstitutionIds || [];
      if (accessibleIds.length === 0) {
        return [];
      }

      // Fetch all accessible institutions
      const institutionPromises = accessibleIds.map((id) => ctx.db.get(id));
      const results = await Promise.all(institutionPromises);
      institutions = results.filter((inst): inst is NonNullable<typeof inst> => inst !== null);
    }

    // Apply filters
    if (args.city) {
      institutions = institutions.filter((inst) =>
        inst.city.toLowerCase().includes(args.city!.toLowerCase())
      );
    }

    if (args.isActive !== undefined) {
      institutions = institutions.filter((inst) => inst.isActive === args.isActive);
    }

    // Get stats for each institution
    const institutionsWithStats = await Promise.all(
      institutions.map(async (institution) => {
        const [users, vehicles, students] = await Promise.all([
          ctx.db
            .query("users")
            .withIndex("by_institution", (q) => q.eq("institutionId", institution._id))
            .collect(),
          ctx.db
            .query("vehicles")
            .withIndex("by_institution", (q) => q.eq("institutionId", institution._id))
            .collect(),
          ctx.db
            .query("students")
            .withIndex("by_institution", (q) => q.eq("institutionId", institution._id))
            .collect(),
        ]);

        return {
          ...institution,
          stats: {
            usersCount: users.length,
            vehiclesCount: vehicles.length,
            studentsCount: students.length,
          },
        };
      })
    );

    return institutionsWithStats;
  },
});

/**
 * List institutions by client (for admin dashboard)
 */
export const listInstitutionsByClient = query({
  args: {
    userId: v.id("users"),
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Verify user has access to this client
    await verifyClientAccess(ctx, args.userId, args.clientId);

    const institutions = await ctx.db
      .query("institutions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    return institutions;
  },
});

/**
 * Deactivate institution (soft delete)
 */
export const deactivateInstitution = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    await verifyRole(ctx, args.userId, "admin");

    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    await ctx.db.patch(args.institutionId, {
      isActive: false,
      subscriptionStatus: "cancelled",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Institución desactivada exitosamente",
    };
  },
});

/**
 * Reactivate institution
 */
export const reactivateInstitution = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    await verifyRole(ctx, args.userId, "admin");

    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    // Check client is still active
    const client = await ctx.db.get(institution.clientId);
    if (!client || !client.isActive) {
      throw new Error("No se puede reactivar. El cliente está inactivo.");
    }

    await ctx.db.patch(args.institutionId, {
      isActive: true,
      subscriptionStatus: "active",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Institución reactivada exitosamente",
    };
  },
});

/**
 * Get institution dashboard stats
 */
export const getInstitutionStats = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    // Get all counts in parallel
    const [users, vehicles, students, routes, activeTrips, pendingInvitations] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect(),
      ctx.db
        .query("vehicles")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect(),
      ctx.db
        .query("students")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect(),
      ctx.db
        .query("routes")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect(),
      ctx.db
        .query("trips")
        .filter((q) => q.eq(q.field("status"), "in_progress"))
        .collect(),
      ctx.db
        .query("invitations")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect(),
    ]);

    // Filter active trips by routes that belong to this institution
    const institutionRouteIds = new Set(routes.map((r) => r._id));
    const institutionActiveTrips = activeTrips.filter((t) => institutionRouteIds.has(t.routeId));

    // Count by role
    const usersByRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Active vs inactive counts
    const activeVehicles = vehicles.filter((v) => v.isActive && v.status === "active").length;
    const activeStudents = students.filter((s) => s.isActive).length;
    const activeRoutes = routes.filter((r) => r.isActive).length;

    return {
      institution: {
        id: institution._id,
        name: institution.name,
        type: institution.type,
        subscriptionPlan: institution.subscriptionPlan,
        subscriptionStatus: institution.subscriptionStatus,
      },
      counts: {
        totalUsers: users.length,
        totalVehicles: vehicles.length,
        totalStudents: students.length,
        totalRoutes: routes.length,
        activeTrips: institutionActiveTrips.length,
        pendingInvitations: pendingInvitations.length,
      },
      active: {
        vehicles: activeVehicles,
        students: activeStudents,
        routes: activeRoutes,
      },
      usersByRole,
    };
  },
});

/**
 * Update school location
 *
 * Used for route planning - all routes use this location as
 * the origin (dropoff) or destination (pickup).
 * Admin only.
 */
export const updateSchoolLocation = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    schoolLatitude: v.number(),
    schoolLongitude: v.number(),
    schoolAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    await verifyRole(ctx, args.userId, "admin");

    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    // Update location
    const updates: Record<string, unknown> = {
      schoolLatitude: args.schoolLatitude,
      schoolLongitude: args.schoolLongitude,
      updatedAt: Date.now(),
    };

    // Update address if provided
    if (args.schoolAddress !== undefined) {
      updates.schoolAddress = args.schoolAddress;
    }

    await ctx.db.patch(args.institutionId, updates);

    return {
      success: true,
      message: "Ubicación del colegio actualizada correctamente",
    };
  },
});
