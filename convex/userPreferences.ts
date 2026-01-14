/**
 * User Preferences - Alert Settings for Parent App
 *
 * Manages parent notification preferences per student:
 * - Proximity alerts (when vehicle is near student's stop)
 * - Alert radius configuration
 * - Push notification settings
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ============================================
// QUERIES
// ============================================

/**
 * Get preferences for a specific student
 */
export const getPreferences = query({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify parent has access to this student
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    if (user.role === "parent" && user.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
      throw new Error("No tienes acceso a este estudiante");
    }

    // Get existing preferences
    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_student", (q) =>
        q.eq("userId", args.userId).eq("studentId", args.studentId)
      )
      .first();

    // Return existing or default values
    return preferences ?? {
      alertsEnabled: true,
      alertRadius: 1000, // Default 1km
      pushEnabled: false,
      pushToken: null,
    };
  },
});

/**
 * Get all preferences for a user (all their students)
 */
export const getAllPreferences = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const preferences = await ctx.db
      .query("userPreferences")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return preferences;
  },
});

// ============================================
// MUTATIONS
// ============================================

/**
 * Set or update alert preferences for a student
 */
export const setPreferences = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    alertsEnabled: v.boolean(),
    alertRadius: v.number(), // 500, 1000, or 2000 meters
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify parent has access to this student
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    if (user.role === "parent" && user.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
      throw new Error("No tienes acceso a este estudiante");
    }

    // Validate alert radius
    const validRadii = [500, 1000, 2000];
    if (!validRadii.includes(args.alertRadius)) {
      throw new Error("Radio de alerta inválido. Usa 500, 1000 o 2000 metros.");
    }

    const now = Date.now();

    // Check if preferences already exist
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_student", (q) =>
        q.eq("userId", args.userId).eq("studentId", args.studentId)
      )
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        alertsEnabled: args.alertsEnabled,
        alertRadius: args.alertRadius,
        updatedAt: now,
      });
      return { success: true, action: "updated" };
    } else {
      // Create new
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        studentId: args.studentId,
        institutionId: student.institutionId,
        alertsEnabled: args.alertsEnabled,
        alertRadius: args.alertRadius,
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, action: "created" };
    }
  },
});

/**
 * Toggle alerts on/off for a student
 */
export const toggleAlerts = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify parent has access to this student
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    if (user.role === "parent" && user.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
      throw new Error("No tienes acceso a este estudiante");
    }

    const now = Date.now();

    // Get existing preferences
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_student", (q) =>
        q.eq("userId", args.userId).eq("studentId", args.studentId)
      )
      .first();

    if (existing) {
      // Toggle
      const newValue = !existing.alertsEnabled;
      await ctx.db.patch(existing._id, {
        alertsEnabled: newValue,
        updatedAt: now,
      });
      return { success: true, alertsEnabled: newValue };
    } else {
      // Create with alerts disabled (since default is enabled, toggling means disabling)
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        studentId: args.studentId,
        institutionId: student.institutionId,
        alertsEnabled: false,
        alertRadius: 1000, // Default
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, alertsEnabled: false };
    }
  },
});

/**
 * Update push token for notifications
 */
export const updatePushToken = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    pushToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    const now = Date.now();

    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_student", (q) =>
        q.eq("userId", args.userId).eq("studentId", args.studentId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        pushToken: args.pushToken,
        pushEnabled: true,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("userPreferences", {
        userId: args.userId,
        studentId: args.studentId,
        institutionId: student.institutionId,
        alertsEnabled: true,
        alertRadius: 1000,
        pushToken: args.pushToken,
        pushEnabled: true,
        createdAt: now,
        updatedAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Mark alert as sent (to avoid duplicates)
 */
export const markAlertSent = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userPreferences")
      .withIndex("by_user_student", (q) =>
        q.eq("userId", args.userId).eq("studentId", args.studentId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        lastAlertTripId: args.tripId,
        lastAlertSentAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});
