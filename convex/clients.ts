/**
 * Clients API
 *
 * Manages client organizations (parent of institutions/schools).
 * A client can own multiple institutions.
 *
 * Features:
 * - CRUD operations for clients
 * - List clients with filters
 * - Manage subscription plans
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { isValidEmail, isValidPhone } from "./lib/authUtils";
import { verifyRole, verifyClientAccess } from "./lib/simpleAuth";

/**
 * Create new client
 * Super admin creates client organization
 */
export const createClient = mutation({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    name: v.string(),
    legalName: v.optional(v.string()),
    taxId: v.optional(v.string()),
    contactPerson: v.string(),
    contactEmail: v.string(),
    contactPhone: v.string(),
    address: v.string(),
    city: v.string(),
    province: v.string(),
    country: v.optional(v.string()),
    subscriptionPlan: v.optional(
      v.union(
        v.literal("trial"),
        v.literal("basic"),
        v.literal("professional"),
        v.literal("enterprise")
      )
    ),
    maxInstitutions: v.optional(v.number()),
    maxUsers: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify current user is super_admin
    await verifyRole(ctx, args.userId, "super_admin");

    // Validate email
    if (!isValidEmail(args.contactEmail)) {
      throw new Error("Formato de email inválido");
    }

    // Validate phone
    if (!isValidPhone(args.contactPhone)) {
      throw new Error("Formato de teléfono inválido. Usa: +593XXXXXXXXX");
    }

    // Check if taxId already exists (if provided)
    if (args.taxId) {
      const existingClient = await ctx.db
        .query("clients")
        .withIndex("by_tax_id", (q) => q.eq("taxId", args.taxId))
        .first();

      if (existingClient) {
        throw new Error("Ya existe un cliente con este RUC");
      }
    }

    // Create client
    const now = Date.now();
    const clientId = await ctx.db.insert("clients", {
      name: args.name,
      legalName: args.legalName,
      taxId: args.taxId,
      contactPerson: args.contactPerson,
      contactEmail: args.contactEmail.toLowerCase(),
      contactPhone: args.contactPhone,
      address: args.address,
      city: args.city,
      province: args.province,
      country: args.country || "EC", // Default: Ecuador
      subscriptionPlan: args.subscriptionPlan || "trial",
      subscriptionStatus: "active",
      maxInstitutions: args.maxInstitutions || 3,
      maxUsers: args.maxUsers || 10,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      clientId,
      message: "Cliente creado exitosamente",
    };
  },
});

/**
 * Update existing client
 */
export const updateClient = mutation({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    clientId: v.id("clients"),
    name: v.optional(v.string()),
    legalName: v.optional(v.string()),
    taxId: v.optional(v.string()),
    contactPerson: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    province: v.optional(v.string()),
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
    maxInstitutions: v.optional(v.number()),
    maxUsers: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Verify current user is super_admin
    await verifyRole(ctx, args.userId, "super_admin");

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    // Validate email if provided
    if (args.contactEmail && !isValidEmail(args.contactEmail)) {
      throw new Error("Formato de email inválido");
    }

    // Validate phone if provided
    if (args.contactPhone && !isValidPhone(args.contactPhone)) {
      throw new Error("Formato de teléfono inválido");
    }

    // Check taxId uniqueness if changed
    if (args.taxId && args.taxId !== client.taxId) {
      const existingClient = await ctx.db
        .query("clients")
        .withIndex("by_tax_id", (q) => q.eq("taxId", args.taxId))
        .first();

      if (existingClient && existingClient._id !== args.clientId) {
        throw new Error("Ya existe un cliente con este RUC");
      }
    }

    // Update client
    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.legalName !== undefined) updates.legalName = args.legalName;
    if (args.taxId !== undefined) updates.taxId = args.taxId;
    if (args.contactPerson !== undefined) updates.contactPerson = args.contactPerson;
    if (args.contactEmail !== undefined) updates.contactEmail = args.contactEmail.toLowerCase();
    if (args.contactPhone !== undefined) updates.contactPhone = args.contactPhone;
    if (args.address !== undefined) updates.address = args.address;
    if (args.city !== undefined) updates.city = args.city;
    if (args.province !== undefined) updates.province = args.province;
    if (args.subscriptionPlan !== undefined) updates.subscriptionPlan = args.subscriptionPlan;
    if (args.subscriptionStatus !== undefined) updates.subscriptionStatus = args.subscriptionStatus;
    if (args.maxInstitutions !== undefined) updates.maxInstitutions = args.maxInstitutions;
    if (args.maxUsers !== undefined) updates.maxUsers = args.maxUsers;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.clientId, updates);

    return {
      success: true,
      message: "Cliente actualizado exitosamente",
    };
  },
});

/**
 * Get single client by ID
 */
export const getClient = query({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Verify current user has access to this client
    await verifyClientAccess(ctx, args.userId, args.clientId);

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    // Count institutions
    const institutions = await ctx.db
      .query("institutions")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    // Count users
    const users = await ctx.db
      .query("users")
      .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
      .collect();

    return {
      ...client,
      stats: {
        institutionsCount: institutions.length,
        usersCount: users.length,
      },
    };
  },
});

/**
 * List all clients
 * With optional filters
 */
export const listClients = query({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
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
    // Verify current user is super_admin
    await verifyRole(ctx, args.userId, "super_admin");

    let clients;
    const subscriptionStatus = args.subscriptionStatus;

    if (subscriptionStatus) {
      clients = await ctx.db
        .query("clients")
        .withIndex("by_status", (q) =>
          q.eq("subscriptionStatus", subscriptionStatus)
        )
        .collect();
    } else {
      clients = await ctx.db.query("clients").collect();
    }

    // Filter by isActive if provided
    if (args.isActive !== undefined) {
      clients = clients.filter((c) => c.isActive === args.isActive);
    }

    // Get counts for each client
    const clientsWithStats = await Promise.all(
      clients.map(async (client) => {
        const institutions = await ctx.db
          .query("institutions")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .collect();

        const users = await ctx.db
          .query("users")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .collect();

        return {
          ...client,
          stats: {
            institutionsCount: institutions.length,
            usersCount: users.length,
          },
        };
      })
    );

    return clientsWithStats;
  },
});

/**
 * Deactivate client (soft delete)
 */
export const deactivateClient = mutation({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Verify current user is super_admin
    await verifyRole(ctx, args.userId, "super_admin");

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    await ctx.db.patch(args.clientId, {
      isActive: false,
      subscriptionStatus: "cancelled",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Cliente desactivado exitosamente",
    };
  },
});

/**
 * Reactivate client
 */
export const reactivateClient = mutation({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    clientId: v.id("clients"),
  },
  handler: async (ctx, args) => {
    // Verify current user is super_admin
    await verifyRole(ctx, args.userId, "super_admin");

    const client = await ctx.db.get(args.clientId);
    if (!client) {
      throw new Error("Cliente no encontrado");
    }

    await ctx.db.patch(args.clientId, {
      isActive: true,
      subscriptionStatus: "active",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Cliente reactivado exitosamente",
    };
  },
});
