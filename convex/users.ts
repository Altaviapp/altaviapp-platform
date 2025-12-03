/**
 * User Management Functions
 *
 * Handles:
 * - User CRUD operations
 * - User queries with RBAC
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Get user by ID (with permission check)
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);
    const targetUser = await ctx.db.get(args.targetUserId);

    if (!targetUser) {
      throw new Error("Usuario no encontrado");
    }

    // Super admin can view all users
    if (currentUser.role === "super_admin") {
      return targetUser;
    }

    // Admin can view users in their institution
    if (currentUser.role === "admin" && currentUser.institutionId === targetUser.institutionId) {
      return targetUser;
    }

    // Users can view their own profile
    if (currentUser._id === targetUser._id) {
      return targetUser;
    }

    throw new Error("Acceso denegado. No puedes ver este usuario.");
  },
});

/**
 * List users in institution (with RBAC)
 */
export const listUsers = query({
  args: {
    userId: v.id("users"),
    institutionId: v.optional(v.id("institutions")),
    role: v.optional(v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("monitor"),
      v.literal("driver"),
      v.literal("parent")
    )),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    let users;

    if (currentUser.role === "super_admin") {
      // Super admin can see all users or filter by institution
      if (args.institutionId) {
        users = await ctx.db
          .query("users")
          .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
          .collect();
      } else {
        users = await ctx.db.query("users").collect();
      }
    } else {
      // Others can only see users in their institution
      if (!currentUser.institutionId) {
        return [];
      }
      users = await ctx.db
        .query("users")
        .withIndex("by_institution", (q) => q.eq("institutionId", currentUser.institutionId))
        .collect();
    }

    // Filter by role if specified
    if (args.role) {
      return users.filter((user) => user.role === args.role);
    }

    return users;
  },
});

/**
 * Update user profile
 */
export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    targetUserId: v.id("users"),
    name: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("monitor"),
      v.literal("driver"),
      v.literal("parent")
    )),
    institutionId: v.optional(v.id("institutions")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);
    const targetUser = await ctx.db.get(args.targetUserId);

    if (!targetUser) {
      throw new Error("Usuario no encontrado");
    }

    // Only super_admin can change roles or assign to institutions
    if (args.role !== undefined || args.institutionId !== undefined) {
      await verifyRole(ctx, args.userId, "super_admin");
    }

    // Admin can update users in their institution (except role changes)
    if (currentUser.role === "admin") {
      if (currentUser.institutionId !== targetUser.institutionId) {
        throw new Error("Acceso denegado. No puedes actualizar usuarios de otra institución.");
      }
    }

    // Regular users can only update their own basic info
    if (currentUser._id === args.targetUserId) {
      if (args.role !== undefined || args.institutionId !== undefined || args.isActive !== undefined) {
        throw new Error("Acceso denegado. Solo puedes actualizar tu nombre y teléfono.");
      }
    } else if (currentUser.role !== "super_admin" && currentUser.role !== "admin") {
      throw new Error("Acceso denegado.");
    }

    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.role !== undefined) updates.role = args.role;
    if (args.institutionId !== undefined) updates.institutionId = args.institutionId;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.targetUserId, updates);

    return { success: true, message: "Usuario actualizado exitosamente" };
  },
});

/**
 * Deactivate user (soft delete)
 */
export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Usuario no encontrado");
    }

    const currentUser = await verifyUser(ctx, args.userId);

    // Admin can only deactivate users in their institution
    if (currentUser.role === "admin" && currentUser.institutionId !== targetUser.institutionId) {
      throw new Error("Acceso denegado. No puedes desactivar usuarios de otra institución.");
    }

    // Cannot deactivate yourself
    if (args.userId === args.targetUserId) {
      throw new Error("No puedes desactivar tu propia cuenta.");
    }

    await ctx.db.patch(args.targetUserId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true, message: "Usuario desactivado exitosamente" };
  },
});

/**
 * Reactivate user
 */
export const reactivateUser = mutation({
  args: {
    userId: v.id("users"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const targetUser = await ctx.db.get(args.targetUserId);
    if (!targetUser) {
      throw new Error("Usuario no encontrado");
    }

    const currentUser = await verifyUser(ctx, args.userId);

    // Admin can only reactivate users in their institution
    if (currentUser.role === "admin" && currentUser.institutionId !== targetUser.institutionId) {
      throw new Error("Acceso denegado. No puedes reactivar usuarios de otra institución.");
    }

    await ctx.db.patch(args.targetUserId, {
      isActive: true,
      updatedAt: Date.now(),
    });

    return { success: true, message: "Usuario reactivado exitosamente" };
  },
});
