/**
 * User Management Functions
 *
 * Handles:
 * - User sync from Clerk
 * - User CRUD operations
 * - User queries with RBAC
 */

import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getCurrentUser, requireAuth, requireRole, enforceInstitutionScope } from "./auth";

/**
 * Get current authenticated user
 */
export const getCurrentUserQuery = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

/**
 * Get user by ID (with permission check)
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);
    const targetUser = await ctx.db.get(args.userId);

    if (!targetUser) {
      throw new Error("User not found");
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

    throw new Error("Access denied. Cannot view this user.");
  },
});

/**
 * List users in institution (with RBAC)
 */
export const listUsers = query({
  args: {
    institutionId: v.optional(v.id("institutions")),
    role: v.optional(v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("driver"),
      v.literal("parent")
    )),
  },
  handler: async (ctx, args) => {
    // Enforce institution scope
    const scopedInstitutionId = await enforceInstitutionScope(ctx, args.institutionId);

    let users;

    // Filter by institution if not super admin viewing all
    if (scopedInstitutionId) {
      users = await ctx.db
        .query("users")
        .withIndex("by_institution", (q) =>
          q.eq("institutionId", scopedInstitutionId)
        )
        .collect();
    } else {
      users = await ctx.db.query("users").collect();
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
    name: v.optional(v.string()),
    role: v.optional(v.union(
      v.literal("super_admin"),
      v.literal("admin"),
      v.literal("driver"),
      v.literal("parent")
    )),
    institutionId: v.optional(v.id("institutions")),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireAuth(ctx);
    const targetUser = await ctx.db.get(args.userId);

    if (!targetUser) {
      throw new Error("User not found");
    }

    // Only super_admin can change roles or assign to institutions
    if (args.role || args.institutionId) {
      await requireRole(ctx, "super_admin");
    }

    // Admin can update users in their institution (except role changes)
    if (currentUser.role === "admin") {
      if (currentUser.institutionId !== targetUser.institutionId) {
        throw new Error("Access denied. Cannot update users from other institutions.");
      }
    }

    // Users can update their own name only
    if (currentUser._id === args.userId && (args.role || args.institutionId || args.isActive)) {
      throw new Error("Access denied. Users can only update their own name.");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.role !== undefined) updates.role = args.role;
    if (args.institutionId !== undefined) updates.institutionId = args.institutionId;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.userId, updates);

    return { success: true };
  },
});

/**
 * Internal mutation to create/update user from Clerk webhook
 * Only callable from HTTP actions (webhooks)
 */
export const syncUserFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    const now = Date.now();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        updatedAt: now,
      });

      return { userId: existingUser._id, created: false };
    } else {
      // Create new user with default role (parent)
      // Admin will need to assign proper role and institution
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        email: args.email,
        name: args.name,
        role: "parent", // Default role
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      return { userId, created: true };
    }
  },
});

/**
 * Internal mutation to delete user from Clerk webhook
 */
export const deleteUserFromClerk = internalMutation({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (user) {
      // Soft delete: mark as inactive
      await ctx.db.patch(user._id, {
        isActive: false,
        updatedAt: Date.now(),
      });

      return { success: true };
    }

    return { success: false, error: "User not found" };
  },
});
