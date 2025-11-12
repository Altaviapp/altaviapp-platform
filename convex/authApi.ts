/**
 * Authentication API Functions
 *
 * Handles user registration, login, and session management
 * for Bubble.io integration (without plugins)
 */

import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  parseToken,
  isValidEmail,
  isValidPhone,
  isValidPassword,
} from "./lib/authUtils";

/**
 * Register new user
 * Called from Bubble.io after user signs up
 */
export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("driver"),
        v.literal("parent")
      )
    ),
    institutionId: v.optional(v.id("institutions")),
  },
  handler: async (ctx, args) => {
    // Validate email
    if (!isValidEmail(args.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password
    if (!isValidPassword(args.password)) {
      throw new Error(
        "Password must be at least 8 characters with letters and numbers"
      );
    }

    // Validate phone if provided
    if (args.phone && !isValidPhone(args.phone)) {
      throw new Error("Invalid phone format. Use: +593XXXXXXXXX");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Create user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clerkId: "", // Empty for custom auth (not using Clerk)
      email: args.email.toLowerCase(),
      name: args.name,
      role: args.role || "parent", // Default role
      institutionId: args.institutionId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      // Store password hash in user metadata (not ideal, but works for MVP)
      // TODO: Move to separate auth table in production
    });

    // Store password hash separately (internal table)
    await ctx.db.insert("userPasswords" as any, {
      userId,
      passwordHash,
      createdAt: now,
    });

    // Generate auth token
    const token = generateToken(userId);

    // Store session
    await ctx.db.insert("userSessions" as any, {
      userId,
      token,
      createdAt: now,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
      isActive: true,
    });

    // Get created user
    const user = await ctx.db.get(userId);

    return {
      success: true,
      userId,
      token,
      user: {
        id: user!._id,
        email: user!.email,
        name: user!.name,
        role: user!.role,
        institutionId: user!.institutionId,
      },
    };
  },
});

/**
 * Login user
 * Called from Bubble.io when user logs in
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    // Get password hash
    const passwordRecord = await ctx.db
      .query("userPasswords" as any)
      .filter((q: any) => q.eq(q.field("userId"), user._id))
      .first();

    if (!passwordRecord) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValid = await verifyPassword(
      args.password,
      passwordRecord.passwordHash
    );

    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    // Generate new token
    const token = generateToken(user._id);
    const now = Date.now();

    // Invalidate old sessions
    const oldSessions = await ctx.db
      .query("userSessions" as any)
      .filter((q: any) => q.eq(q.field("userId"), user._id))
      .collect();

    for (const session of oldSessions) {
      await ctx.db.patch(session._id, { isActive: false });
    }

    // Create new session
    await ctx.db.insert("userSessions" as any, {
      userId: user._id,
      token,
      createdAt: now,
      expiresAt: now + 30 * 24 * 60 * 60 * 1000, // 30 days
      isActive: true,
    });

    return {
      success: true,
      userId: user._id,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
      },
    };
  },
});

/**
 * Get current user from token
 * Called from Bubble.io to get user data
 */
export const me = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Parse token to get userId
    const userId = parseToken(args.token);

    if (!userId) {
      throw new Error("Invalid token");
    }

    // Verify session exists and is valid
    const session = await ctx.db
      .query("userSessions" as any)
      .filter((q: any) =>
        q.and(
          q.eq(q.field("token"), args.token),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    if (!session) {
      throw new Error("Session not found or expired");
    }

    // Check if session expired
    if (session.expiresAt < Date.now()) {
      throw new Error("Session expired");
    }

    // Get user
    const user = await ctx.db.get(session.userId as Id<"users">);

    if (!user) {
      throw new Error("User not found");
    }

    if (!user.isActive) {
      throw new Error("User account is inactive");
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        createdAt: user.createdAt,
      },
    };
  },
});

/**
 * Logout user
 * Invalidates current session
 */
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Find and invalidate session
    const session = await ctx.db
      .query("userSessions" as any)
      .filter((q: any) => q.eq(q.field("token"), args.token))
      .first();

    if (session) {
      await ctx.db.patch(session._id, { isActive: false });
    }

    return {
      success: true,
      message: "Logged out successfully",
    };
  },
});
