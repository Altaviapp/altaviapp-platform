/**
 * Notification Management Functions
 *
 * User notifications for trips, check-ins, incidents.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser } from "./lib/simpleAuth";

/**
 * Get notifications for user
 */
export const getNotifications = query({
  args: {
    userId: v.id("users"),
    unreadOnly: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const limit = args.limit || 50;

    let notifications;

    if (args.unreadOnly) {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_unread", (q) => q.eq("userId", args.userId).eq("read", false))
        .order("desc")
        .take(limit);
    } else {
      notifications = await ctx.db
        .query("notifications")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .order("desc")
        .take(limit);
    }

    return notifications;
  },
});

/**
 * Get unread notification count
 */
export const getUnreadCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_unread", (q) => q.eq("userId", args.userId).eq("read", false))
      .collect();

    return { count: unread.length };
  },
});

/**
 * Mark notification as read
 */
export const markAsRead = mutation({
  args: {
    userId: v.id("users"),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notificación no encontrada");
    }

    if (notification.userId !== args.userId) {
      throw new Error("No tienes permiso para modificar esta notificación");
    }

    await ctx.db.patch(args.notificationId, { read: true });

    return { success: true };
  },
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_unread", (q) => q.eq("userId", args.userId).eq("read", false))
      .collect();

    for (const notification of unread) {
      await ctx.db.patch(notification._id, { read: true });
    }

    return { success: true, count: unread.length };
  },
});

/**
 * Delete notification
 */
export const deleteNotification = mutation({
  args: {
    userId: v.id("users"),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notificación no encontrada");
    }

    if (notification.userId !== args.userId) {
      throw new Error("No tienes permiso para eliminar esta notificación");
    }

    await ctx.db.delete(args.notificationId);

    return { success: true };
  },
});

/**
 * Create notification (internal use)
 */
export const createNotification = mutation({
  args: {
    userId: v.id("users"),
    targetUserId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
      v.literal("success")
    ),
  },
  handler: async (ctx, args) => {
    // Verify caller is admin or system
    const currentUser = await verifyUser(ctx, args.userId);
    if (!["admin", "super_admin"].includes(currentUser.role)) {
      throw new Error("Solo administradores pueden crear notificaciones");
    }

    const now = Date.now();

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.targetUserId,
      title: args.title,
      message: args.message,
      type: args.type,
      read: false,
      createdAt: now,
    });

    return { success: true, notificationId };
  },
});

/**
 * Clear old notifications (cleanup)
 */
export const clearOldNotifications = mutation({
  args: {
    userId: v.id("users"),
    olderThanDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const days = args.olderThanDays || 30;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const oldNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.lt(q.field("createdAt"), cutoff))
      .filter((q) => q.eq(q.field("read"), true))
      .collect();

    for (const notification of oldNotifications) {
      await ctx.db.delete(notification._id);
    }

    return { success: true, deleted: oldNotifications.length };
  },
});
